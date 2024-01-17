//  /api/project/46926613-3cca-439d-a4f3-9897753b9940
import { toast } from 'react-toastify';
import ProjectDto from '../components/models/ProjectDto';
import httpService from './HttpService';


export const getProjectData = async (projectId: string) => {
    const res = await httpService.getAsync<Promise<ProjectDto>>(`api/project/${projectId}`);

    if (res) {
        return res;
    }
}

export const postDeleteProject = async (projectId: string, password:string, onRedirect=()=>{}) => {
    try{
        const res = await httpService.postAsync<string>(`api/delete/project/${projectId}`, {"password": password}, "DELETE", true, true, () => {console.log("Redirect oder so...")});
        console.log(res);
        if (res) {
            toast.success(`Project Deleted.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err){
        if(err.status < 400){
            onRedirect();
            toast.success(`Project Deleted!`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
        } else {
            toast.error(`Wrong Password.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
        }
    }
}

export const postPasswordChange = async (projectId: string, old_password: string, new_password: string) => {
    const passObj = {
        "old-password": old_password,
        "new-password": new_password,
    }
    
    try{
        const res = await httpService.postAsync<string>(`api/update/password/${projectId}`, passObj, "PUT", true, true);

        if (res) {
            toast.success(`Password Changed.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err){
        toast.error(`Wrong Password.`, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
}

export const postProjectSettingsChange = async (projectId: string, project: ProjectDto, password: string) => {
    try{
        const res = await httpService.postAsync<ProjectDto>(`api/update/project/${projectId}`, {...project, "password":password}, "PUT", true, true);

        console.log("In project settings:")
        console.log(res);
        if (res) {
            toast.success(`Project updated.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err){
        toast.error(`Wrong Password.`, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
}