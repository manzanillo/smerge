import { AxiosResponse } from 'axios';
import httpService from '../shared/HttpService';

export interface SettingDto{
    id: number;
    name: string;
    value: string;
    desc?: string;
    objectType: "boolean" | "int" | "string";
}

export interface UserDto{
    id: number;
    username: string;
    isAdmin: boolean;
    activated: boolean;
}

export interface UnlockedIpDto{
    expire_date: string;
    id: number;
    ip_address: string;
    username: string;
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

interface AxiosResponseExt extends AxiosResponse{
    response: AxiosResponse;
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

export const postUpdateSetting = async (setting: SettingDto) => {
    const res = await httpService.post(`/access/setting`, setting) as AxiosResponse;
    const text = await res.data 

    if(res.status == 200) {
        return {status:true, text: text};
    }
    return {status:false, text: text};
}

export const getRestartDocker = async () => {
    const res = await httpService.get(`/admin/restart`) as AxiosResponseExt;
    let text;
    if(res.status != 200){
        text = await res.response.data;
    } else {
        text = await res.data 
    }

    if(res.status == 200) {
        return {status:true, text: text};
    }
    return {status:false, text: text};
}

export const getRunCommand = async (commandName: string) => {
    const res = await httpService.get(`/admin/run/${commandName}`) as AxiosResponseExt;
    let resultDto;
    if(res.status != 200){
        resultDto = await res.response.data as {commandOutput: string,text: string}
    } else {
        resultDto = await res.data as {commandOutput: string,text: string}
    }

    if(res.status == 200) {
        return {status:true, text: resultDto.text};
    }
    return {status:false, text: resultDto.text};
}

export const getLastStart = async () => {
    const res = await httpService.get(`/admin/lastStart`) as AxiosResponse;
    const text = await res.data 

    if(res.status == 200) {
        return  new Date(text);
    }
    return new Date();
}

export const getActives = async () => {
    const res = await httpService.get(`/admin/actives`) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data as UnlockedIpDto[];
        return settings;
    }
    return null;
}

export const getLockIp = async (ip: string) => {
    const res = await httpService.post(`/access/lock`, {"ip": ip}) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data;
        return settings;
    }
    return null;
}

export const getLockUsername = async (username: string) => {
    const res = await httpService.post(`/access/lock`, {"name": username}) as AxiosResponse;

    if(res.status == 200) {
        const settings = await res.data;
        return settings;
    }
    return null;
}