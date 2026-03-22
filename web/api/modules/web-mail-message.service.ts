import { request } from '@/utils'

/**邮件列表**/
export function httpFetchMailList(params: Omix) {
    return request({
        url: `/api/mail-message/list`,
        method: 'GET',
        params
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
        url: `/api/mail-message/seen/${keyId}`,
        method: 'PUT'
    })
}
