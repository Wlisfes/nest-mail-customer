import { request } from '@/utils'

/**账号注册**/
export function httpBaseUserRegister(body: Omix<{ nickname: string; email: string; password: string; code?: string }>) {
    return request.post('/api/user/register', body)
}

/**用户登录**/
export function httpBaseUserAuthorization(body: Omix<{ email: string; password: string; code?: string }>) {
    return request.post('/api/user/login', body)
}

/**获取用户信息**/
export function httpBaseUserResolver() {
    return request.get('/api/user/resolver')
}
