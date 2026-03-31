import { request } from '@/utils'

/**获取模板列表**/
export function httpFetchTemplates(body?: { categoryId?: number }) {
    return request({
        url: `/api/mail-template/list`,
        method: 'POST',
        data: body ?? {}
    })
}

/**获取模板详情**/
export function httpFetchTemplateDetail(keyId: number) {
    return request({
        url: `/api/mail-template/detail`,
        method: 'POST',
        data: { keyId }
    })
}

/**保存模板**/
export function httpSaveTemplate(body: Omix) {
    return request({
        url: `/api/mail-template/save`,
        method: 'POST',
        data: body
    })
}

/**删除模板**/
export function httpDeleteTemplate(keyId: number) {
    return request({
        url: `/api/mail-template/delete`,
        method: 'POST',
        data: { keyId }
    })
}

/**复制模板**/
export function httpCopyTemplate(keyId: number) {
    return request({
        url: `/api/mail-template/copy`,
        method: 'POST',
        data: { keyId }
    })
}

/**编译MJML**/
export function httpCompileTemplate(mjmlSource: string) {
    return request({
        url: `/api/mail-template/compile`,
        method: 'POST',
        data: { mjmlSource }
    })
}

/**模板发送**/
export function httpSendTemplate(body: Omix) {
    return request({
        url: `/api/mail-template/send`,
        method: 'POST',
        data: body
    })
}
