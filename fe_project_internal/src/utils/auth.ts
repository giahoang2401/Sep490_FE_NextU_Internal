
import { deleteCookie, getCookie, hasCookie, setCookie } from "cookies-next"
import api from "./axiosConfig"

export const isLogged = () => {
  return !!localStorage.getItem("access_token");
}

export const getAccessToken = () => {
  const accessToken = localStorage.getItem("access_token");
  return {
    access_token: accessToken ?? ''
  }
}

export const saveAccessToken = (access_token: string) => {
  try {
    localStorage.setItem("access_token", access_token);
  } catch (error) {
    console.error('AUTH LOCALSTORAGE SAVE ERROR', error);
  }
}

export const removeAccessToken = () => {
  try {
    localStorage.removeItem("access_token");
  } catch (error) {
    console.error('AUTH LOCALSTORAGE REMOVE ERROR', error);
  }
}

export const logout = async () => {
  try {
    await api.post("/api/auth/logout")
  } catch (err) {
    // ignore error
  }
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("nextu_internal_user")
  deleteCookie("nextu_internal_user")
}