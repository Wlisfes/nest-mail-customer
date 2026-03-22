import { request } from '@/utils'

/**添加黑名单**/
export function httpAddBlacklist(body: Omix) {
    return request({
        url: `/api/mail-blacklist`,
        method: 'POST',
        data: body
    })
}

/**获取黑名单列表**/
export function httpFetchBlacklist() {
    return request({
        url: `/api/mail-blacklist/list`,
        method: 'GET'
    })
}

/**移除黑名单**/
export function httpRemoveBlacklist(keyId: number) {
    return request({
        url: `/api/mail-blacklist/${keyId}`,
        method: 'DELETE'
    })
}
