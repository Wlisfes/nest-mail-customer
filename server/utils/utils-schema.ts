import { isNotEmpty } from 'class-validator'

/**枚举文案转换**/
export function fetchEnumProperty<T>(data: Omix<T>) {
    return data.items.map(item => `</br> ${item.label}：${item.value}`)
}

/**枚举描述转换**/
export function fetchEnumComment(name: string, data: Omix) {
    const items = data.items.map(item => `${item.value}-${item.label}`)
    return items.length === 0 ? name : `${name}：${items.join('、')}`
}

/**字段输出控制**/
export function fetchSelection(alias: string, fields: string[]) {
    return (fields ?? []).map(field => (isNotEmpty(alias) ? `${alias}.${field}` : field))
}
