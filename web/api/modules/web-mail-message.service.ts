import { request } from '@/utils'

/**邮件列表**/
export function httpFetchMailList(body: Omix) {
    return request({
        url: `/api/mail-message/list`,
        method: 'POST',
        data: body
    })
}

/**发送邮件**/
export function httpSendMail(body: Omix) {
    return request({
        url: `/api/mail-message/send`,
        method: 'POST',
        data: body
    })
}

/**标记已读**/
export function httpMarkMailSeen(keyId: number) {
    return request({
        url: `/api/mail-message/seen`,
        method: 'POST',
        data: { keyId }
    })
}

/**获取邮件详情**/
export function httpFetchMailDetail(keyId: string) {
    return request({
        url: `/api/mail-message/detail`,
        method: 'POST',
        data: { keyId }
    })
}

/**删除邮件**/
export function httpDeleteMail(keyId: string) {
    return request({
        url: `/api/mail-message/delete`,
        method: 'POST',
        data: { keyId }
    })
}

/**下载附件**/
export function httpDownloadAttachment(attachmentId: number) {
    return request({
        url: `/api/attachment/${attachmentId}/download`,
        method: 'GET',
        responseType: 'blob'
    })
}

/**预览附件**/
export function httpPreviewAttachment(attachmentId: number) {
    return request({
        url: `/api/attachment/${attachmentId}/view`,
        method: 'GET',
        responseType: 'blob'
    })
}
