import { request } from '@/utils'

/**收件箱邮件列表**/
export function httpMailInbox(params: Omix) {
    return request({
        url: `/api/mailbox/inbox`,
        method: 'GET',
        params
    })
}

/**邮件详情**/
export function httpMailDetail(params: Omix) {
    return request({
        url: `/api/mailbox/detail`,
        method: 'GET',
        params
    })
}

/**发送邮件**/
export function httpSendMail(body: Omix) {
    return request({
        url: `/api/mailbox/send`,
        method: 'POST',
        data: body
    })
}
