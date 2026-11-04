import PocketBase from 'pocketbase';
import type { User, Project } from '@/types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(apiUrl);

export function getFileUrl(
  record: Pick<Project, 'id' | 'collectionId' | 'collectionName'> | null | undefined,
  filename?: string,
  thumb?: string
): string {
  if (!record || !filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  const collection = record.collectionName || record.collectionId || 'projects';
  const query = thumb ? `?thumb=${thumb}` : '';
  return `${pb.baseUrl}/api/files/${collection}/${record.id}/${filename}${query}`;
}

export function getAvatarUrl(
  user: Pick<User, 'id' | 'collectionId' | 'collectionName' | 'avatar' | 'username'> | null | undefined,
  thumb: string = '100x100'
): string {
  if (!user) return '';
  if (user.avatar) {
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    const collection = user.collectionName || user.collectionId || 'users';
    return `${pb.baseUrl}/api/files/${collection}/${user.id}/${user.avatar}?thumb=${thumb}`;
  }
  const seed = encodeURIComponent(user.username || user.id || 'scrapyard');
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=27272a`;
}

export async function checkPocketBaseConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${pb.baseUrl}/api/health`, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
