import { request } from '@/utils'

/**获取变量列表**/
export function httpFetchVariables() {
    return request({
        url: `/api/mail-template-variable/list`,
        method: 'POST'
    })
}

/**保存变量**/
export function httpSaveVariable(body: Omix) {
    return request({
        url: `/api/mail-template-variable/save`,
        method: 'POST',
        data: body
    })
}

/**删除变量**/
export function httpDeleteVariable(keyId: number) {
    return request({
        url: `/api/mail-template-variable/delete`,
        method: 'POST',
        data: { keyId }
    })
}
