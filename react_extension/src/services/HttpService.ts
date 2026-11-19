import { toast } from "react-toastify";
import { getCurrentUser } from "./TeacherAuthService";
import i18next from "i18next";

class HttpService {
  public csrftoken: string;
  public baseURL: string;

  constructor() {
    this.csrftoken = this.getCookie("csrftoken") ?? "";
    this.baseURL = window.location.origin;
    // this.baseURL = "http://127.0.0.1:8000";

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

  postAsync<T>(
    endpoint: string,
    data: any,
    method: string = "POST",
    suppressNotificationSuccess = true,
    suppressNotificationFail = false,
    onRedirect = () => {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.post(
        endpoint,
        data,
        method,
        (xHttp) =>
          resolve(
            xHttp.responseText.includes("{")
              ? (JSON.parse(xHttp.responseText) as T)
              : (xHttp.responseText as T)
          ),
        reject,
        (reason: any) => {
          onRedirect();
          reject(reason);
        },
        suppressNotificationSuccess,
        suppressNotificationFail
      );
    });
  }

  post(
    endpoint: string,
    data: any,
    method: string = "POST",
    onSuccess: (_: XMLHttpRequest) => void,
    onFail: (_: XMLHttpRequest) => void,
    onRedirect: (_: XMLHttpRequest) => void,
    suppressNotificationSuccess = false,
    suppressNotificationFail = false
  ) {
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, this.baseURL + endpoint, true);
    xhttp.withCredentials = true;
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    this.setCsrfHeader(xhttp);
    addAuthHeader(xhttp);
    xhttp.send(JSON.stringify(data));

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status <= 299) {
        onSuccess(xhttp);
        if (suppressNotificationSuccess) return;

        toast.success(i18next.t("toast.http.success", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      } else if (xhttp.readyState === 4 && xhttp.status <= 399) {
        onRedirect(xhttp);
      } else if (xhttp.readyState === 4) {
        onFail(xhttp);
        if (suppressNotificationFail) return;

        toast.error(i18next.t("toast.http.error", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      }
    };
  }

  putAsync<T>(
    endpoint: string,
    data: any,
    method: string = "PUT",
    suppressNotificationSuccess = true,
    suppressNotificationFail = false,
    onRedirect = () => {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.put(
        endpoint,
        data,
        method,
        (xHttp) =>
          resolve(
            xHttp.responseText.includes("{")
              ? (JSON.parse(xHttp.responseText) as T)
              : (xHttp.responseText as T)
          ),
        reject,
        (reason: any) => {
          onRedirect();
          reject(reason);
        },
        suppressNotificationSuccess,
        suppressNotificationFail
      );
    });
  }

  put(
    endpoint: string,
    data: any,
    method: string = "PUT",
    onSuccess: (_: XMLHttpRequest) => void,
    onFail: (_: XMLHttpRequest) => void,
    onRedirect: (_: XMLHttpRequest) => void,
    suppressNotificationSuccess = false,
    suppressNotificationFail = false
  ) {
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, this.baseURL + endpoint, true);
    xhttp.withCredentials = true;
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    this.setCsrfHeader(xhttp);
    addAuthHeader(xhttp);
    xhttp.send(JSON.stringify(data));

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status <= 299) {
        onSuccess(xhttp);
        if (suppressNotificationSuccess) return;

        toast.success(i18next.t("toast.http.success", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      } else if (xhttp.readyState === 4 && xhttp.status <= 399) {
        onRedirect(xhttp);
      } else if (xhttp.readyState === 4) {
        onFail(xhttp);
        if (suppressNotificationFail) return;

        toast.error(i18next.t("toast.http.error", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      }
    };
  }

  getAsync<T>(endpoint: string, suppressNotificationSuccess = true, suppressNotificationFail = false): Promise<T> {
    return new Promise((resolve, reject) => {
      this.get(
        endpoint,
        (xHttp) => resolve(JSON.parse(xHttp.responseText) as T),
        reject,
        reject,
        suppressNotificationSuccess,
        suppressNotificationFail
      );
    });
  }

  getAsyncText<T>(endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.get(
        endpoint,
        (xHttp) => resolve(xHttp.responseText as T),
        reject,
        reject,
        true,
        false
      );
    });
  }

  get(
    endpoint: string,
    onSuccess: (_: XMLHttpRequest) => void,
    onFail: (_: XMLHttpRequest) => void,
    onRedirect: (_: XMLHttpRequest) => void,
    suppressNotificationSuccess = false,
    suppressNotificationFail = false
  ) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", this.baseURL + endpoint, true);
    xhttp.withCredentials = true;
    this.setCsrfHeader(xhttp);
    addAuthHeader(xhttp);
    xhttp.send();

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status <= 299) {
        onSuccess(xhttp);
        if (suppressNotificationSuccess) return;

        toast.success(i18next.t("toast.http.success", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      } else if (xhttp.readyState === 4 && xhttp.status <= 399) {
        onRedirect(xhttp);
      } else if (xhttp.readyState === 4) {
        onFail(xhttp);
        if (suppressNotificationFail) return;

        toast.error(i18next.t("toast.http.error", { endpoint, status: xhttp.status }), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      }
    };
  }


  private refreshCsrfToken() {
    this.csrftoken = this.getCookie("csrftoken") ?? "";
    return this.csrftoken;
  }

  private setCsrfHeader(xhttp: XMLHttpRequest) {
    const token = this.refreshCsrfToken();
    if (token) {
      xhttp.setRequestHeader("X-CSRFToken", token);
    }
  }

  postFormAsync<T>(
    endpoint: string,
    formData: FormData,
    method: string = "POST",
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open(method, this.baseURL + endpoint, true);
      xhttp.withCredentials = true;
      this.setCsrfHeader(xhttp);
      addAuthHeader(xhttp);

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status <= 299) {
          resolve(JSON.parse(xhttp.responseText) as T);
        } else if (xhttp.readyState === 4) {
          try {
            const payload = JSON.parse(xhttp.responseText);
            reject(new Error(payload.detail ?? `Request failed (${xhttp.status})`));
          } catch {
            reject(new Error(`Request failed (${xhttp.status})`));
          }
        }
      };

      xhttp.send(formData);
    });
  }
}

function addAuthHeader(xhttp: XMLHttpRequest) : void {
  if (getCurrentUser()) {
    xhttp.setRequestHeader('Authorization', 'Token ' + getCurrentUser().token);
  }
}

// Create an instance of the HttpService class
const httpService = new HttpService();
export default httpService;
