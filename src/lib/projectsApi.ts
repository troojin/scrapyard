import { pb, checkPocketBaseConnection } from './pocketbase';
import { INITIAL_MOCK_PROJECTS } from './mockData';
import type { Project, SubmitProjectInput, User } from '@/types';

const LOCAL_STORAGE_KEY = 'scrapyard_custom_projects';

function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export async function fetchProjects(query?: { search?: string; tag?: string }): Promise<Project[]> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline) {
    try {
      const filterParts: string[] = [];
      if (query?.search) {
        const clean = query.search.replace(/['"\\]/g, '');
        filterParts.push(`(title ~ '${clean}' || reason_abandoned ~ '${clean}' || salvageable_code ~ '${clean}')`);
      }
      const filter = filterParts.join(' && ');

      const response = await pb.collection('projects').getList(1, 100, {
        sort: '-created',
        expand: 'user',
        filter: filter || undefined,
        requestKey: null,
      });

      const pbItems: Project[] = response.items.map((item) => ({
        id: item.id,
        title: item.title,
        github_url: item.github_url,
        screenshot: item.screenshot,
        reason_abandoned: item.reason_abandoned,
        salvageable_code: item.salvageable_code,
        user: item.user,
        expand: {
          user: item.expand?.user
            ? {
                id: item.expand.user.id,
                username: item.expand.user.username,
                avatar: item.expand.user.avatar,
                collectionId: item.expand.user.collectionId,
                collectionName: item.expand.user.collectionName,
              }
            : undefined,
        },
        tags: Array.isArray(item.tags) ? item.tags : typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : [],
        created: item.created,
        updated: item.updated,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
      }));

      if (pbItems.length > 0) {
        return pbItems;
      }
    } catch {
    }
  }

  const localItems = getLocalProjects();
  let combined = [...localItems, ...INITIAL_MOCK_PROJECTS];

  if (query?.tag) {
    const targetTag = query.tag.toLowerCase();
    combined = combined.filter((p) => p.tags?.some((t) => t.toLowerCase() === targetTag));
  }

  if (query?.search) {
    const s = query.search.toLowerCase();
    combined = combined.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.reason_abandoned.toLowerCase().includes(s) ||
        p.salvageable_code.toLowerCase().includes(s) ||
        p.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }

  return combined;
}

export async function fetchUserProjects(userId: string): Promise<Project[]> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline) {
    try {
      const response = await pb.collection('projects').getList(1, 100, {
        filter: `user = '${userId}'`,
        sort: '-created',
        expand: 'user',
        requestKey: null,
      });

      return response.items.map((item) => ({
        id: item.id,
        title: item.title,
        github_url: item.github_url,
        screenshot: item.screenshot,
        reason_abandoned: item.reason_abandoned,
        salvageable_code: item.salvageable_code,
        user: item.user,
        expand: {
          user: item.expand?.user,
        },
        tags: Array.isArray(item.tags) ? item.tags : [],
        created: item.created,
        updated: item.updated,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
      }));
    } catch {
    }
  }

  const localItems = getLocalProjects();
  return localItems.filter((p) => p.user === userId);
}

export async function createProjectRecord(
  input: SubmitProjectInput,
  currentUser: User
): Promise<{ success: boolean; project?: Project; error?: string }> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline && pb.authStore.isValid) {
    try {
      const formData = new FormData();
      formData.append('title', input.title);
      formData.append('github_url', input.github_url);
      formData.append('reason_abandoned', input.reason_abandoned);
      formData.append('salvageable_code', input.salvageable_code);
      formData.append('user', currentUser.id);

      if (input.tags && input.tags.length > 0) {
        formData.append('tags', JSON.stringify(input.tags));
      }

      if (input.screenshot) {
        formData.append('screenshot', input.screenshot);
      }

      const record = await pb.collection('projects').create(formData, {
        expand: 'user',
      });

      const newProject: Project = {
        id: record.id,
        title: record.title,
        github_url: record.github_url,
        screenshot: record.screenshot,
        reason_abandoned: record.reason_abandoned,
        salvageable_code: record.salvageable_code,
        user: record.user,
        expand: {
          user: currentUser,
        },
        tags: input.tags || [],
        created: record.created,
        collectionId: record.collectionId,
        collectionName: record.collectionName,
      };

      return { success: true, project: newProject };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish project to PocketBase';
      return { success: false, error: message };
    }
  }

  let screenshotDataUrl: string | undefined = undefined;
  if (input.screenshot) {
    try {
      screenshotDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(input.screenshot as File);
      });
    } catch {
      screenshotDataUrl = undefined;
    }
  }

  const newProject: Project = {
    id: `local-${Date.now()}`,
    title: input.title,
    github_url: input.github_url,
    screenshot: screenshotDataUrl,
    reason_abandoned: input.reason_abandoned,
    salvageable_code: input.salvageable_code,
    user: currentUser.id,
    expand: {
      user: currentUser,
    },
    tags: input.tags || [],
    created: new Date().toISOString(),
  };

  const existing = getLocalProjects();
  saveLocalProjects([newProject, ...existing]);

  return { success: true, project: newProject };
}

export async function deleteProjectRecord(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline && !projectId.startsWith('local-') && !projectId.startsWith('demo-')) {
    try {
      await pb.collection('projects').delete(projectId);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete record';
      return { success: false, error: message };
    }
  }

  const existing = getLocalProjects();
  const filtered = existing.filter((p) => p.id !== projectId);
  saveLocalProjects(filtered);
  return { success: true };
}
