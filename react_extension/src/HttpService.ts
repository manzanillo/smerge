import { toast } from "react-toastify";

class HttpService {
    private csrftoken: string
    private baseURL: string

    constructor() {
        this.csrftoken = this.getCookie('csrftoken') ?? "";
        this.baseURL = "http://127.0.0.1"

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

    get(endpoint: string, onSuccess: (_:XMLHttpRequest) => void, onFail: (_:XMLHttpRequest) => void, suppressNotificationSuccess= false, suppressNotificationFail= false) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", endpoint, true);
        xhttp.setRequestHeader("X-CSRFToken", this.csrftoken);
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                onSuccess(xhttp);
                if (suppressNotificationSuccess) return;

                // toast.success(`Get ${endpoint} worked (${xhttp.status}).`, {
                //     position: 'top-right',
                //     autoClose: 2000,
                //     hideProgressBar: false,
                // });

            } else {
                onFail(xhttp)
                if (suppressNotificationFail) return;

                // toast.error(`Get ${endpoint} failed (${xhttp.status}).`, {
                //     position: 'top-right',
                //     autoClose: 2000,
                //     hideProgressBar: false,
                // });
            }
        }
    }
}

// Create an instance of the HttpService class
const httpService = new HttpService();
export default httpService;