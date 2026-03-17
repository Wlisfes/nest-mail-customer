//@ts-nocheck
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'universal-cookie'

export const request: AxiosRequest = axios.create({
    baseURL: import.meta.env.NODE_CLIENT_SSR_BASEURL,
    timeout: 90000
})

request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const cookies = new Cookies(typeof document !== 'undefined' ? document.cookie : undefined)
        const token = cookies.get('APP_NEST_TOKEN')
        if (token) {
            config.headers.Authorization = token
        }
        return config
    },
    error => Promise.reject(error)
)

request.interceptors.response.use(fetchInizeNotice, error => Promise.reject(error))

function fetchInizeNotice(response: AxiosResponse) {
    if (response.data.code !== 200) {
        return Promise.reject(response.data)
    }
    return Promise.resolve(response.data)
}
