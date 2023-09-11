import { AxiosResponse } from 'axios';
import httpService from '../shared/HttpService';
import Claims from '../models/Claims';

// // Set the token when the user logs in
// const userToken = 'your_auth_token';
// httpService.setToken(userToken);

// // Make HTTP requests
// httpService.get('/data/endpoint')
//   .then((response) => {
//     console.log('Data:', response.data);
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });

// // Clear the token when the user logs out
// httpService.clearToken();

export const testToken = async (token: string) => {
    httpService.setToken(token);
    const res = await httpService.get("/token/valid") as AxiosResponse
    if (res.status == 200){
        httpService.setClaims(res.data as Claims);
        return true;
    }
    httpService.clearClaims();
    httpService.clearToken();
    return false;
}

export const getUserAvailable = async (username: string) => {
    if (username == "") return false;
    const res = await httpService.get(`/available/${username}`) as AxiosResponse;

    if(res.status == 200) {
        const text = await res.data as string;
        return text.toLocaleLowerCase() === "false";
    }
    return false;
}

export const postLogin = async (username: string, password: string) => {
    if (username == "") return "";
    const res = await httpService.post(`/login`, {"username":username, "password":password});
    
    if(res.status == 200) {
        return (await res.data) as string;
    }
    return "";
}

export const postRegister = async (username: string, password: string) => {
    if (username == "") return false;
    const res = await httpService.post(`/add`, {"username":username, "password":password});
    
    if(res.status == 200) {
        return await res.data as string;
    }
    return "";
}