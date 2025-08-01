import Axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { getAccessToken } from "@/utils/auth";
import { refreshAccessToken } from "@/utils/refreshAccessToken";
import { Notify, Report } from "notiflix";

export function setupAxios(axios: AxiosInstance) {
  axios.defaults.headers.Accept = "application/json";

  axios.interceptors.request.use(
    (config) => {
      const auth = getAccessToken();
      if (auth) {
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response?.data ? Promise.resolve(response.data) : Promise.resolve(response);
    },
    async (error: AxiosError<any>) => {
      const originalRequest: any = error.config;

      // Nếu bị 401 và chưa thử refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest); // Gửi lại request gốc
        }

        // Nếu refresh fail
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Xử lý lỗi khác như cũ
      const resData = error.response?.data;
      if (resData?.message) {
        if (error.response?.status === 403) {
          Report.failure("Error", resData.message, "Ok", () => window.location.href = "/");
          return Promise.reject(resData);
        }
        if (typeof resData.message === "string") Notify.failure(resData.message);
        if (Array.isArray(resData.message)) Notify.failure(resData.message[0].message);
      }

      if (resData?.errors?.length) {
        return Promise.reject({
          message: resData.errors[0].msg,
          errors: resData.errors,
        });
      }

      return Promise.reject(error);
    }
  );
}

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/bff',
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAxios(api);
export default api;
