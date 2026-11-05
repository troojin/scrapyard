import type { Project } from '@/types';

export const MAX_PROJECT_IMAGES = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function getProjectImages(project: Project): string[] {
  if (project.screenshots && project.screenshots.length > 0) return project.screenshots;
  return project.screenshot ? [project.screenshot] : [];
}
