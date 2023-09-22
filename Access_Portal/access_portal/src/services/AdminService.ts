import { AxiosResponse } from 'axios';
import httpService from '../shared/HttpService';

export interface SettingDto{
    id: number;
    name: string;
    value: string;
    desc?: string;
}

export interface UserDto{
    id: number;
    username: string;
    isAdmin: boolean;
    activated: boolean;
}

export const getSettings = async () => {
    const res = await httpService.get(`/access/setting`) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data as SettingDto[];
        return settings;
    }
    return null;
}

export const getAllUser = async () => {
    const res = await httpService.get(`/admin/getAll`) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data as UserDto[];
        return settings;
    }
    return null;
}

export const getUserToActivate = async () => {
    const res = await httpService.get(`/admin/userToActivate`) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data as UserDto[];
        return settings;
    }
    return null;
}

export const getActivateUserSwitch = async (username:string) => {
    const res = await httpService.get(`/admin/activateUser/${username}`) as AxiosResponse;
    const text = await res.data

    if(res.status == 200) {
        return {status:true, text: text};
    }
    return {status:false, text: text};
}



export const getSetAdminState = async (username:string, state:boolean) => {
    const res = await httpService.get(`/admin/setAdmin/${username}?state=${state}`) as AxiosResponse;
    const text = await res.data

    if(res.status == 200) {
        return {status:true, text: text};
    }
    return {status:false, text: text};
}