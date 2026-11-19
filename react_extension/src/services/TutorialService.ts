import httpService from './HttpService';

export interface TutorialProjectResponse {
  project_id: string;
  pin: string;
  file_id: number;
  success: boolean;
  error?: string;
}

export interface AddMergeNodeResponse {
  success: boolean;
  file_id?: number;
  project_id?: string;
  error?: string;
}

export interface TutorialCleanupResponse {
  success: boolean;
  error?: string;
}

/**
 * Neues Tutorial-Projekt erstellen
 */
export async function createTutorialProject(): Promise<TutorialProjectResponse | null> {
  try {
    const response = await httpService.postAsync<TutorialProjectResponse>(
      '/api/tutorial/create',
      {},
      'POST',
      true,
      false
    );

    if (response.success) {
      return response;
    } else {
      console.error('Tutorial project creation failed:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error creating tutorial project:', error);
    return null;
  }
}

/**
 * Fügt einen zweiten Node zum Tutorial-Projekt hinzu, damit der Nutzer einen Merge durchführen kann
 */
export async function addTutorialMergeNode(projectId: string): Promise<AddMergeNodeResponse | null> {
  try {
    const response = await httpService.postAsync<AddMergeNodeResponse>(
      `/api/tutorial/project/${projectId}/add_merge_node`,
      {},
      'POST',
      true,
      false
    );

    if (response.success) {
      return response;
    } else {
      console.error('Adding merge node failed:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error adding merge node:', error);
    return null;
  }
}

/**
 * Löscht ein Tutorial-Projekt nach Abschluss oder Abbruch.
 */
export async function cleanupTutorialProject(projectId: string): Promise<TutorialCleanupResponse | null> {
  try {
    const response = await httpService.postAsync<TutorialCleanupResponse>(
      `/api/tutorial/project/${projectId}/cleanup`,
      {},
      'POST',
      true,
      true
    );

    if (response.success) {
      return response;
    }

    console.error('Tutorial cleanup failed:', response.error);
    return null;
  } catch (error) {
    console.error('Error cleaning up tutorial project:', error);
    return null;
  }
}
