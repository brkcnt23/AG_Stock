import { BaseApiService } from './baseApiService'

class ProjectsService extends BaseApiService {
  constructor() {
    super('/projects')
  }
}

export const projectsService = new ProjectsService()