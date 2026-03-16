import { Enum } from 'enum-plus'

/**产品系列-[状态]**/
export const WeekClassifyStatus = Enum({
    /**禁用**/
    Disable: { value: 'disable', label: '禁用', json: { type: 'error' } },
    /**启用**/
    Enable: { value: 'enable', label: '启用', json: { type: 'success' } }
} as const)
