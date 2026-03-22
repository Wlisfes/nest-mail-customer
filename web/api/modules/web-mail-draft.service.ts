import { request } from '@/utils'

/**保存草稿**/
export function httpSaveDraft(body: Omix) {
    return request({
        url: `/api/mail-draft`,
        method: 'POST',
        data: body
    })
}

/**获取草稿列表**/
export function httpFetchDrafts() {
    return request({
        url: `/api/mail-draft/list`,
        method: 'GET'
    })
}

/**删除草稿**/
export function httpDeleteDraft(keyId: number) {
    return request({
        url: `/api/mail-draft/${keyId}`,
        method: 'DELETE'
    })
}
