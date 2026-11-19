import httpService from "./HttpService";

export interface OpenProjectRequest {
  pin: string;
  password: string;
}

export interface OpenProjectResponse {
  project_id: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  password: string;
  email: string;
  startDescription: string;
  file: File | null;
}

export interface CreateProjectResponse {
  project_id: string;
  pin: string;
  password: string;
}

export interface RestoreInfoRequest {
  email: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  new_password_repeated: string;
}

export interface ResetPasswordResponse {
  detail: string;
  project_id: string;
}

export interface AppSettings {
  inBeta: boolean;
  devAdd: string;
}

export const openProjectPublic = async (
  payload: OpenProjectRequest,
): Promise<OpenProjectResponse> => {
  return httpService.postAsync<OpenProjectResponse>(
    "/api/public/open_project",
    payload,
    "POST",
    true,
    true,
  );
};

export const createProjectPublic = async (
  payload: CreateProjectPayload,
): Promise<CreateProjectResponse> => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("password", payload.password);
  formData.append("email", payload.email);
  formData.append("start_description", payload.startDescription);
  if (payload.file) {
    formData.append("file", payload.file);
  }

  return httpService.postFormAsync<CreateProjectResponse>(
    "/api/public/create_project",
    formData,
    "POST",
  );
};

export const restorePasswordInfo = async (
  payload: RestoreInfoRequest,
): Promise<void> => {
  return httpService.postAsync<void>(
    "/api/public/restore_info",
    payload,
    "POST",
    true,
    true,
  );
};

export const validateResetPasswordToken = async (
  token: string,
): Promise<{ detail: string }> => {
  return httpService.getAsync<{ detail: string }>(
    `/api/public/reset_password/${token}`,
      true, true
  );
};

export const resetPasswordPublic = async (
  token: string,
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  return httpService.postAsync<ResetPasswordResponse>(
    `/api/public/reset_password/${token}`,
    payload,
    "POST",
    true,
    true,
  );
};

export const fetchAppSettings = async (): Promise<AppSettings> => {
  return httpService.getAsync<AppSettings>("/api/public/settings", true, true);
};

