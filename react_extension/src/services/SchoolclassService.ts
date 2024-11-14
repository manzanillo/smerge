import { getCurrentUser } from "./TeacherAuthService"
import httpService from "./HttpService";
import SchoolclassDto from "../components/models/SchoolclassDto";
import ProjectDto from "../components/models/ProjectDto";

const API_URL = "api/";

export const getSchoolclassesOfCurrentUser = async () => {
    console.log(getCurrentUser().user_id)
    const result = await httpService.getAsync<SchoolclassDto[]>(API_URL + `teachers/${getCurrentUser().user_id}/schoolclasses`);
    return result ?? [];
}

export const getProjectsOfSchoolclass = async (schoolclass: SchoolclassDto) => {
    const result = await httpService.getAsync<ProjectDto[]>(API_URL + `schoolclasses/${schoolclass.id}/projects`);
    if (result) {
        return result ?? [];
    }
}

export const createSchoolclass = async (name: string) => {
    const result = await httpService.postAsync<SchoolclassDto>(API_URL + `schoolclasses`, {name: name, teacher_id: getCurrentUser().user_id});
    return result ?? null;
}