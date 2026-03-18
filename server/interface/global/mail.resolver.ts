/**验证码模板名称**/
export type Target = 'common' | 'register' | 'authorize'

/**发送验证码**/
export interface CodexTransportOptions extends Omix {
    /**验证码模板名称**/
    target: Target
    /**邮件标题**/
    title: string
    /**收件人邮箱**/
    to: string
    /**验证码**/
    code: string
    /**验证码过期时间**/
    ttl: number
}
