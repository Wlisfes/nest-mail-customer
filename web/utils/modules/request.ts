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

request.interceptors.response.use(fetchInizeNotice, error => {
    /**HTTP 401 身份验证失败：清空token并重定向到登录页**/
    if (error.response?.status === 401) {
        redirectToLogin()
    }
    return Promise.reject(error)
})

/**清空token并重定向到登录页**/
let isRedirecting = false
function redirectToLogin() {
    if (isRedirecting) return
    if (typeof window !== 'undefined' && window.location.pathname === '/main/login') return
    isRedirecting = true
    const cookies = new Cookies(typeof document !== 'undefined' ? document.cookie : undefined)
    cookies.remove('APP_NEST_TOKEN', { path: '/' })
    if (typeof window !== 'undefined') {
        window.location.href = '/main/login'
    }
}

function fetchInizeNotice(response: AxiosResponse) {
    /**业务层 401 身份验证失败：清空token并重定向到登录页**/
    if (response.data.code === 401) {
        redirectToLogin()
        return Promise.reject(response.data)
    }
    if (response.data.code !== 200) {
        return Promise.reject(response.data)
    }
    return Promise.resolve(response.data)
}
