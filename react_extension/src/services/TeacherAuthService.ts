import axios from "axios";

const API_URL = window.location.href.split("ext")[0] + "api/";

export const register = (username: string, email: string, password: string) => {
  const response =  axios.post(API_URL + "teacher_registration_token", {
    username,
    email,
    password,
  });
  console.log("register response" + response);
  return response
};

export const login = (username: string, password: string) => {
  return axios
    .post(API_URL + "teacher_login_token", {
      username,
      password,
    })
    .then((response) => {
      console.log("login response: " + JSON.stringify(response))
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

export default function authHeader() {
  const userStr = localStorage.getItem("user");
  let user = null;
  if (userStr)
    user = JSON.parse(userStr);

  if (user && user.token) {
    return { Authorization: 'Token ' + user.token};
  } else {
    return { Authorization: '' };
  }
}