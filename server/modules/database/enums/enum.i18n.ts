import { Enum } from 'enum-plus'

/**国际化表-[字段类型]**/
export const WeekI18nType = Enum({
    /**状态码**/
    Code: { value: 1, label: '状态码' },
    /**静态资源**/
    Static: { value: 2, label: '静态资源' }
} as const)
