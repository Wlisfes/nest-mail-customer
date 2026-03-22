import { request } from '@/utils'

/**添加邮箱账号**/
export function httpCreateMailAccount(body: Omix) {
    return request({
        url: `/api/mail-account`,
        method: 'POST',
        data: body
    })
}

/**获取邮箱账号列表**/
export function httpFetchMailAccounts() {
    return request({
        url: `/api/mail-account/list`,
        method: 'GET'
    })
}

/**更新邮箱账号**/
export function httpUpdateMailAccount(keyId: number, body: Omix) {
    return request({
        url: `/api/mail-account/${keyId}`,
        method: 'PUT',
        data: body
    })
}

/**删除邮箱账号**/
export function httpDeleteMailAccount(keyId: number) {
    return request({
        url: `/api/mail-account/${keyId}`,
        method: 'DELETE'
    })
}
