import { request } from '@/utils'

/**获取分类列表**/
export function httpFetchCategories() {
    return request({
        url: `/api/mail-template-category/list`,
        method: 'POST'
    })
}

/**保存分类**/
export function httpSaveCategory(body: Omix) {
    return request({
        url: `/api/mail-template-category/save`,
        method: 'POST',
        data: body
    })
}

/**删除分类**/
export function httpDeleteCategory(keyId: number) {
    return request({
        url: `/api/mail-template-category/delete`,
        method: 'POST',
        data: { keyId }
    })
}
