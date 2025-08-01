import { getAccessToken } from './auth'
import Axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { Notify, Report } from 'notiflix'

export function setupAxios(axios: AxiosInstance) {
  axios.defaults.headers.Accept = 'application/json'

  axios.interceptors.request.use(
    (config) => {
      const auth = getAccessToken()
      if (auth) {
        config.headers.Authorization = `Bearer ${auth.access_token}`
      }
      return config
    },
    (err) => Promise.reject(err)
  )

  axios.interceptors.response.use(
    function (response: AxiosResponse) {
      if (response && response.data) {
        return Promise.resolve(response)
      }
      return Promise.resolve(response)
    },
    function (error: AxiosError<any>) {
      if (error.response && error.response.data) {
        const resData = error.response.data

        if (resData.message) {
          if (error.response.status === 403) {
            Report.failure('Error', resData.message, 'Ok', () => {
              window.location.href = '/'
            })
            return Promise.reject(resData)
          }

          if (typeof resData.message === 'string' && error.response.status !== 401) {
            Notify.failure(resData.message)
          }

          if (Array.isArray(resData.message)) {
            Notify.failure(resData.message[0].message)
          }
        }

        if (resData.errors && resData.errors.length > 0) {
          return Promise.reject({
            message: resData.errors[0].msg,
            errors: resData.errors,
          })
        }

        return Promise.reject(resData)
      }

      return Promise.reject(error.response)
    }
  )
}

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/bff',
  headers: {
    'Content-Type': 'application/json',
  },
})

setupAxios(api)

export default api
