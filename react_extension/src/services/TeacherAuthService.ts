import axios from "axios";

const API_URL = window.location.origin + "/api/";

async function ensureCsrf() {
    await axios.get(API_URL + "auth/csrf", {withCredentials: true});
}

function getCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return m ? decodeURIComponent(m[2]) : null;
}

function csrfRequestConfig() {
    const csrf = getCookie("csrftoken");
    return {
        withCredentials: true,
        headers: csrf ? {"X-CSRFToken": csrf} : {},
    };
}

export const register = async (username: string, email: string, password: string) => {
    await ensureCsrf();
    const response = await axios.post(
        API_URL + "teacher_registration_token",
        {
            username,
            email,
            password,
        },
        csrfRequestConfig()
    );
    console.log("register response", response);
    return response;
};

export const login = async (username: string, password: string) => {
    await ensureCsrf();

    return axios.post(
        API_URL + "teacher_login_token",
        {
            username,
            password,
        },
        csrfRequestConfig()
    ).then((response) => {
        console.log("login response: " + JSON.stringify(response));
        if (response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    });
};

export const logout = () => {
    localStorage.removeItem("user");
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
};

export interface TeacherTutorialStatusResponse {
    completed_tutorial: boolean;
}

export const getTeacherTutorialStatus = () => {
    return axios
        .get<TeacherTutorialStatusResponse>(API_URL + "teacher/tutorial-status", {
            headers: authHeader(),
        })
        .then((response) => response.data);
};

export const setTeacherTutorialCompleted = (completed = true) => {
    return axios
        .patch<TeacherTutorialStatusResponse>(
            API_URL + "teacher/tutorial-status",
            {completed_tutorial: completed},
            {headers: authHeader()}
        )
        .then((response) => response.data);
};

export default function authHeader() {
    const userStr = localStorage.getItem("user");
    let user = null;
    if (userStr)
        user = JSON.parse(userStr);

    if (user && user.token) {
        return {Authorization: 'Token ' + user.token};
    } else {
        return {Authorization: ''};
    }
}