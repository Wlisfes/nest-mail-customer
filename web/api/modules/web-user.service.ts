import { request } from '@/utils'

/**账号注册**/
export function httpBaseUserRegister(body: Omix) {
    return request({
        url: `/api/user/register`,
        method: 'POST',
        data: body
    })
}

/**用户登录**/
export function httpBaseUserAuthorization(body: Omix) {
    return request({
        url: `/api/user/login`,
        method: 'POST',
        data: body
    })
}

/**获取用户信息**/
export function httpBaseUserResolver() {
    return request({
        url: `/api/user/resolver`,
        method: 'POST'
    })
}
