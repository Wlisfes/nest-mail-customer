import { request } from '@/utils'

/**添加邮箱账号**/
export function httpCreateAccount(body: Omix) {
    return request({
        url: `/api/account/create`,
        method: 'POST',
        data: body
    })
}

/**邮箱账号列表**/
export function httpAccountList() {
    return request({
        url: `/api/account/list`,
        method: 'GET'
    })
}

/**删除邮箱账号**/
export function httpDeleteAccount(body: Omix) {
    return request({
        url: `/api/account/delete`,
        method: 'POST',
        data: body
    })
}
