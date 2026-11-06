import { pb, checkPocketBaseConnection } from './pocketbase';
import { INITIAL_MOCK_PROJECTS } from './mockData';
import { inspectZipArchive } from './archiveValidator';
import type { Project, SubmitProjectInput, User, Purchase, FileTreeItem } from '@/types';

const LOCAL_STORAGE_KEY = 'scrapyard_custom_projects';
const LOCAL_STORAGE_PURCHASES_KEY = 'scrapyard_custom_purchases';

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

function saveLocalProjects(projects: Project[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}

function getLocalPurchases(): Purchase[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_PURCHASES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalPurchases(purchases: Purchase[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(LOCAL_STORAGE_PURCHASES_KEY, JSON.stringify(purchases));
    return true;
  } catch {
    return false;
  }
}

function toFileList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (typeof value === 'string' && value) return [value];
  return [];
}

function parseFileTree(value: unknown): FileTreeItem[] {
  if (Array.isArray(value)) return value as FileTreeItem[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export interface FetchProjectsQuery {
  search?: string;
  tag?: string;
  listingType?: 'all' | 'free' | 'sale';
  minPrice?: number;
  maxPrice?: number;
}

export async function fetchProjects(query?: FetchProjectsQuery): Promise<Project[]> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline) {
    try {
      const filterParts: string[] = [];
      if (query?.search) {
        const clean = query.search.replace(/['"\\]/g, '');
        filterParts.push(`(title ~ '${clean}' || reason_abandoned ~ '${clean}' || salvageable_code ~ '${clean}')`);
      }
      if (query?.tag && query.tag !== 'All') {
        const cleanTag = query.tag.replace(/['"\\]/g, '');
        filterParts.push(`tags ~ '${cleanTag}'`);
      }
      if (query?.listingType === 'free') {
        filterParts.push(`(is_for_sale = false || price = 0 || price = null)`);
      } else if (query?.listingType === 'sale') {
        filterParts.push(`(is_for_sale = true && price > 0)`);
      }
      if (typeof query?.minPrice === 'number' && !isNaN(query.minPrice)) {
        filterParts.push(`price >= ${query.minPrice}`);
      }
      if (typeof query?.maxPrice === 'number' && !isNaN(query.maxPrice)) {
        filterParts.push(`price <= ${query.maxPrice}`);
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
        github_url: item.github_url || '',
        screenshot: item.screenshot,
        screenshots: toFileList(item.screenshots),
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
        is_for_sale: !!item.is_for_sale,
        price: typeof item.price === 'number' ? item.price : 0,
        archive_file: item.archive_file,
        file_tree: parseFileTree(item.file_tree),
        sold: !!item.sold,
        created: item.created,
        updated: item.updated,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
      }));

      if (pbItems.length > 0 || (query && Object.keys(query).length > 0)) {
        return pbItems;
      }
    } catch {
    }
  }

  const localItems = getLocalProjects();
  let combined = [...localItems, ...INITIAL_MOCK_PROJECTS];

  if (query?.tag && query.tag !== 'All') {
    const targetTag = query.tag.toLowerCase();
    combined = combined.filter((p) => p.tags?.some((t) => t.toLowerCase() === targetTag));
  }

  if (query?.listingType === 'free') {
    combined = combined.filter((p) => !p.is_for_sale || !p.price || p.price === 0);
  } else if (query?.listingType === 'sale') {
    combined = combined.filter((p) => !!p.is_for_sale && (p.price || 0) > 0);
  }

  if (typeof query?.minPrice === 'number' && !isNaN(query.minPrice)) {
    combined = combined.filter((p) => (p.price || 0) >= query.minPrice!);
  }

  if (typeof query?.maxPrice === 'number' && !isNaN(query.maxPrice)) {
    combined = combined.filter((p) => (p.price || 0) <= query.maxPrice!);
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
        github_url: item.github_url || '',
        screenshot: item.screenshot,
        screenshots: toFileList(item.screenshots),
        reason_abandoned: item.reason_abandoned,
        salvageable_code: item.salvageable_code,
        user: item.user,
        expand: {
          user: item.expand?.user,
        },
        tags: Array.isArray(item.tags) ? item.tags : [],
        is_for_sale: !!item.is_for_sale,
        price: typeof item.price === 'number' ? item.price : 0,
        archive_file: item.archive_file,
        file_tree: parseFileTree(item.file_tree),
        sold: !!item.sold,
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

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function createProjectRecord(
  input: SubmitProjectInput,
  currentUser: User
): Promise<{ success: boolean; project?: Project; error?: string }> {
  if (!input.screenshots || input.screenshots.length === 0) {
    return { success: false, error: 'Add at least one image' };
  }

  if (input.listing_type === 'free') {
    if (!input.github_url || !/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/i.test(input.github_url.trim())) {
      return { success: false, error: 'Free listings require a valid public GitHub URL (e.g. https://github.com/user/repo).' };
    }
  } else if (input.listing_type === 'sale') {
    if (!input.price || input.price < 1) {
      return { success: false, error: 'For Sale listings require a price of at least $1 USD.' };
    }
    if (!input.archive_file) {
      return { success: false, error: 'For Sale listings require uploading a source code .zip archive.' };
    }
  }

  let fileTree = input.file_tree;
  if (input.listing_type === 'sale' && input.archive_file && (!fileTree || fileTree.length === 0)) {
    try {
      const inspection = await inspectZipArchive(input.archive_file);
      fileTree = inspection.files;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid zip archive';
      return { success: false, error: msg };
    }
  }

  const isOnline = await checkPocketBaseConnection();

  if (isOnline && pb.authStore.isValid) {
    try {
      const formData = new FormData();
      formData.append('title', input.title);
      formData.append('github_url', input.github_url || '');
      formData.append('reason_abandoned', input.reason_abandoned);
      formData.append('salvageable_code', input.salvageable_code);
      formData.append('user', currentUser.id);
      formData.append('is_for_sale', input.listing_type === 'sale' ? 'true' : 'false');
      formData.append('price', (input.listing_type === 'sale' ? input.price || 0 : 0).toString());

      if (fileTree && fileTree.length > 0) {
        formData.append('file_tree', JSON.stringify(fileTree));
      }

      if (input.archive_file) {
        formData.append('archive_file', input.archive_file);
      }

      if (input.tags && input.tags.length > 0) {
        formData.append('tags', JSON.stringify(input.tags));
      }

      for (const file of input.screenshots) {
        formData.append('screenshots', file);
      }

      const record = await pb.collection('projects').create(formData, {
        expand: 'user',
      });

      const newProject: Project = {
        id: record.id,
        title: record.title,
        github_url: record.github_url || '',
        screenshots: toFileList(record.screenshots),
        reason_abandoned: record.reason_abandoned,
        salvageable_code: record.salvageable_code,
        user: record.user,
        expand: {
          user: currentUser,
        },
        tags: input.tags || [],
        is_for_sale: !!record.is_for_sale,
        price: typeof record.price === 'number' ? record.price : 0,
        archive_file: record.archive_file,
        file_tree: fileTree || [],
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

  const screenshotDataUrls = (await Promise.all(input.screenshots.map(readAsDataUrl))).filter(Boolean);

  if (screenshotDataUrls.length === 0) {
    return { success: false, error: 'Could not read the selected images' };
  }

  const newProject: Project = {
    id: `local-${Date.now()}`,
    title: input.title,
    github_url: input.github_url || '',
    screenshots: screenshotDataUrls,
    reason_abandoned: input.reason_abandoned,
    salvageable_code: input.salvageable_code,
    user: currentUser.id,
    expand: {
      user: currentUser,
    },
    tags: input.tags || [],
    is_for_sale: input.listing_type === 'sale',
    price: input.listing_type === 'sale' ? input.price || 0 : 0,
    archive_file: input.archive_file ? input.archive_file.name : undefined,
    file_tree: fileTree || [],
    created: new Date().toISOString(),
  };

  const existing = getLocalProjects();
  const saved = saveLocalProjects([newProject, ...existing]);

  if (!saved) {
    return {
      success: false,
      error: 'Not enough browser storage for these images in offline mode. Try fewer or smaller images.',
    };
  }

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

export async function fetchUserPurchases(userId: string): Promise<Purchase[]> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline && pb.authStore.isValid) {
    try {
      const res = await pb.collection('purchases').getList(1, 100, {
        filter: `buyer = '${userId}'`,
        expand: 'project,buyer',
        sort: '-created',
        requestKey: null,
      });

      return res.items.map((item) => ({
        id: item.id,
        buyer: item.buyer,
        project: item.project,
        amount: item.amount,
        stripe_session_id: item.stripe_session_id,
        license_type: item.license_type,
        created: item.created,
        updated: item.updated,
        expand: {
          project: item.expand?.project as unknown as Project,
          buyer: item.expand?.buyer as unknown as User,
        },
      }));
    } catch {
    }
  }

  const localPurchases = getLocalPurchases();
  return localPurchases.filter((p) => p.buyer === userId);
}

export async function hasUserPurchasedProject(userId: string, projectId: string): Promise<boolean> {
  if (!userId || !projectId) return false;

  const isOnline = await checkPocketBaseConnection();

  if (isOnline && pb.authStore.isValid) {
    try {
      const res = await pb.collection('purchases').getList(1, 1, {
        filter: `buyer = '${userId}' && project = '${projectId}'`,
        requestKey: null,
      });
      if (res.totalItems > 0) return true;
    } catch {
    }
  }

  const localPurchases = getLocalPurchases();
  return localPurchases.some((p) => p.buyer === userId && p.project === projectId);
}

export async function recordDirectPurchase(
  userId: string,
  projectId: string,
  amount: number,
  sessionId?: string
): Promise<{ success: boolean; purchase?: Purchase; error?: string }> {
  const isOnline = await checkPocketBaseConnection();

  if (isOnline && pb.authStore.isValid) {
    try {
      const record = await pb.collection('purchases').create({
        buyer: userId,
        project: projectId,
        amount,
        stripe_session_id: sessionId || `direct_${Date.now()}`,
        license_type: 'commercial_reuse',
      });

      return {
        success: true,
        purchase: {
          id: record.id,
          buyer: record.buyer,
          project: record.project,
          amount: record.amount,
          stripe_session_id: record.stripe_session_id,
          license_type: record.license_type,
          created: record.created,
        },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to record purchase';
      return { success: false, error: msg };
    }
  }

  const newPurchase: Purchase = {
    id: `local-pur-${Date.now()}`,
    buyer: userId,
    project: projectId,
    amount,
    stripe_session_id: sessionId || `mock_${Date.now()}`,
    license_type: 'commercial_reuse',
    created: new Date().toISOString(),
  };

  const existing = getLocalPurchases();
  saveLocalPurchases([newPurchase, ...existing]);
  return { success: true, purchase: newPurchase };
}
