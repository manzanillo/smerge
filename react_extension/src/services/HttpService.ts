import { toast } from "react-toastify";

class HttpService {
    private csrftoken: string
    public baseURL: string

    constructor() {
        this.csrftoken = this.getCookie('csrftoken') ?? "";
        this.baseURL = window.location.href.split("ext")[0]

        //     this.instance = axios.create({
        //     baseURL: 'http://127.0.0.1/api', // Replace with your API base URL
        //     timeout: 10000, // Set a timeout for requests (in milliseconds)
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     });

        //     this.token = ""; // Initialize the token to null
    }

    getCookie(key: string) {
        const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
        return b ? b.pop() : "";
    }

    postAsync<T>(endpoint: string, data: any, method: string = "POST", suppressNotificationSuccess = true, suppressNotificationFail = false, onRedirect = () => {}): Promise<T> {
        return new Promise((resolve, reject) => {
            this.post(endpoint, data, method, (xHttp) => resolve((xHttp.responseText.includes("{")?JSON.parse(xHttp.responseText) as T:xHttp.responseText as T)),
                reject, (reason:any)=>{onRedirect(); reject(reason);}, suppressNotificationSuccess, suppressNotificationFail);
        });
    }

    post(endpoint: string, data: any, method: string = "POST", onSuccess: (_: XMLHttpRequest) => void,
        onFail: (_: XMLHttpRequest) => void, onRedirect: (_: XMLHttpRequest) => void, suppressNotificationSuccess = false, suppressNotificationFail = false) {

        const xhttp = new XMLHttpRequest();
        xhttp.open(method, this.baseURL + endpoint, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.setRequestHeader("X-CSRFToken", this.csrftoken);

        xhttp.send(JSON.stringify(data));

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status <= 299) {
                onSuccess(xhttp);
                if (suppressNotificationSuccess) return;
    
                toast.success(`Get ${endpoint} worked (${xhttp.status}).`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                });
    
            } else if (xhttp.readyState === 4 && xhttp.status <= 399 ) {
                onRedirect(xhttp)
            } else if (xhttp.readyState === 4){
                onFail(xhttp)
                if (suppressNotificationFail) return;
    
                toast.error(`Get ${endpoint} failed (${xhttp.status}).`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                });
            }
        }
    }

    getAsync<T>(endpoint: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.get(endpoint, (xHttp) => resolve(JSON.parse(xHttp.responseText) as T), reject, reject, true, false);
        });
    }

    get(endpoint: string, onSuccess: (_: XMLHttpRequest) => void, onFail: (_: XMLHttpRequest) => void, onRedirect: (_: XMLHttpRequest) => void, suppressNotificationSuccess = false, suppressNotificationFail = false) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", this.baseURL + endpoint, true);
        xhttp.setRequestHeader("X-CSRFToken", this.csrftoken);
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status <= 299) {
                onSuccess(xhttp);
                if (suppressNotificationSuccess) return;

                toast.success(`Get ${endpoint} worked (${xhttp.status}).`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                });

            } else if (xhttp.readyState === 4 && xhttp.status <= 399) {
                onRedirect(xhttp)
            } else if (xhttp.readyState === 4) {
                onFail(xhttp)
                if (suppressNotificationFail) return;

                toast.error(`Get ${endpoint} failed (${xhttp.status}).`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                });
            }
        }
    }
}

// Create an instance of the HttpService class
const httpService = new HttpService();
export default httpService;