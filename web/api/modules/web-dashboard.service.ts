import { request } from '@/utils'

/**统计卡片数据**/
export function httpFetchDashboardStats() {
    return request({
        url: `/api/dashboard/stats`,
        method: 'POST'
    })
}

/**7天趋势数据**/
export function httpFetchDashboardTrend() {
    return request({
        url: `/api/dashboard/trend`,
        method: 'POST'
    })
}

/**邮箱分布数据**/
export function httpFetchDashboardDistribution() {
    return request({
        url: `/api/dashboard/distribution`,
        method: 'POST'
    })
}
