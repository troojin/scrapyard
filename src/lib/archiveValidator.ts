import JSZip from 'jszip';
import type { FileTreeItem } from '@/types';

export interface ArchiveInspectionResult {
  files: FileTreeItem[];
  totalSize: number;
  fileCount: number;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function inspectZipArchive(
  fileOrBuffer: File | Blob | ArrayBuffer
): Promise<ArchiveInspectionResult> {
  const zip = await JSZip.loadAsync(fileOrBuffer);
  const files: FileTreeItem[] = [];
  let totalSize = 0;

  for (const [relativePath, entry] of Object.entries(zip.files)) {
    if (entry.dir || relativePath.endsWith('/')) {
      continue;
    }

    const normalized = relativePath.replace(/\\/g, '/');

    if (
      normalized.includes('node_modules/') ||
      normalized.includes('.git/') ||
      normalized.includes('.next/') ||
      normalized.startsWith('__MACOSX/') ||
      normalized.endsWith('.DS_Store') ||
      normalized.endsWith('Thumbs.db')
    ) {
      continue;
    }

    let uncompressedSize: number;
    const directSize = (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize;
    if (typeof directSize === 'number' && directSize >= 0) {
      uncompressedSize = directSize;
    } else {
      const content = await entry.async('uint8array');
      uncompressedSize = content.byteLength;
    }

    files.push({
      path: normalized,
      size: uncompressedSize,
    });
    totalSize += uncompressedSize;
  }

  if (files.length < 3) {
    throw new Error('Archive must contain at least 3 source files.');
  }

  if (totalSize < 5120) {
    throw new Error('Archive must be at least 5 KB in total uncompressed code.');
  }

  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    files,
    totalSize,
    fileCount: files.length,
  };
}
