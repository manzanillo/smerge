import axios, { AxiosInstance } from 'axios';
import Claims from '../models/Claims';

class HttpService {
    private token: string;
    private instance: AxiosInstance;
    private claims: Claims | undefined;
    // private claims: Claims = Claims.getDefault();

    constructor() {
        this.instance = axios.create({
        baseURL: '/acapi', // Replace with your API base URL
        timeout: 10000, // Set a timeout for requests (in milliseconds)
        headers: {
            'Content-Type': 'application/json',
        },
        });

        this.token = ""; // Initialize the token to null
    }

    setToken(token: string) {
        this.token = token; // Set the token
    }

    setClaims(claims: Claims){
        console.log(claims);
        this.claims = claims;
    }

    getClaims(){
        return this.claims;
    }

    clearClaims(){
        this.claims = undefined;
    }

    clearToken() {
        this.token = ""; // Clear the token
    }

    isTokenSet(){
        return this.token != "";
    }

    async get(url: string) {
        try{
            return await this.instance.get(url, this.getAuthConfig());
        } catch (err) {
            return err;
        }
    }

    async post(url: string, data: unknown) {
        return this.instance.post(url, data, this.getAuthConfig());
    }

    async put(url: string, data: unknown) {
        return this.instance.put(url, data, this.getAuthConfig());
    }

    async delete(url: string) {
        return this.instance.delete(url, this.getAuthConfig());
    }

    getAuthConfig() {
        if (this.token != "") {
        return {
            headers: {
            Authorization: `Bearer ${this.token}`,
            },
        };
        }
        return {};
    }
}

// Create an instance of the HttpService class
const httpService = new HttpService();

export default httpService;