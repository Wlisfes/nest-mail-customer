import { request } from '@/utils'

/**添加邮箱账号**/
export function httpCreateMailAccount(body: Omix) {
    return request({
        url: `/api/mail-account/create`,
        method: 'POST',
        data: body
    })
}

/**获取邮箱账号列表**/
export function httpFetchMailAccounts() {
    return request({
        url: `/api/mail-account/list`,
        method: 'POST'
    })
}

/**更新邮箱账号**/
export function httpUpdateMailAccount(keyId: number, body: Omix) {
    return request({
        url: `/api/mail-account/update`,
        method: 'POST',
        data: { ...body, keyId }
    })
}

/**删除邮箱账号**/
export function httpDeleteMailAccount(keyId: number) {
    return request({
        url: `/api/mail-account/delete`,
        method: 'POST',
        data: { keyId }
    })
}
