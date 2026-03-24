import { request } from '@/utils'

/**保存草稿**/
export function httpSaveDraft(body: Omix) {
    return request({
        url: `/api/mail-draft/save`,
        method: 'POST',
        data: body
    })
}

/**获取草稿列表**/
export function httpFetchDrafts() {
    return request({
        url: `/api/mail-draft/list`,
        method: 'POST'
    })
}

/**获取草稿详情**/
export function httpFetchDraftDetail(keyId: number) {
    return request({
        url: `/api/mail-draft/detail`,
        method: 'POST',
        data: { keyId }
    })
}

/**删除草稿**/
export function httpDeleteDraft(keyId: number) {
    return request({
        url: `/api/mail-draft/delete`,
        method: 'POST',
        data: { keyId }
    })
}
