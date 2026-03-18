/**验证码模板名称**/
export type CodexTarget = 'common' | 'register' | 'authorize'

/**发送验证码**/
export interface CodexTransportOptions extends Omix {
    /**邮件标题**/
    title: string
    /**收件人邮箱**/
    email: string
    /**验证码**/
    code: string
    /**验证码过期时间**/
    ttl: number
}
