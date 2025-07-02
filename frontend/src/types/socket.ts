import type { Project } from './projects'

export interface ProjectEventHandler {
  on(event: 'project-created', callback: (project: Project) => void): void;
  on(event: 'project-updated', callback: (project: Project) => void): void;
  on(event: 'project-deleted', callback: (projectId: string) => void): void;
}
