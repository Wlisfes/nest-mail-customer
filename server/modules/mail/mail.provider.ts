import { HttpException, HttpStatus } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import { join } from 'path'
import { readFileSync } from 'fs'
import { compile } from 'handlebars'

export const CLIENT_TRANSPORT = Symbol('CLIENT_TRANSPORT')
export type ClientTransport = ReturnType<typeof createTransport>

export interface InitOptions {
    /**邮件服务器地址**/
    host: string
    /**邮件服务器端口**/
    port: number
    /**是否使用SSL**/
    secure: boolean
    /**发件人邮箱**/
    user: string
    /**发件人密码**/
    password: string
}

export interface SendMailOptions {
    /**发件人邮箱**/
    from: string
    /**收件人邮箱**/
    to: string
    /**邮件标题**/
    subject?: string
    /**邮件内容**/
    html: string
}

/**注册Nodemailer实例**/
export async function fetchCreateTransport(options: InitOptions) {
    return createTransport({
        host: options.host,
        port: options.port,
        secure: options.secure ?? false,
        auth: {
            user: options.user,
            pass: options.password
        }
    })
}

/**读取模板**/
export async function fetchReadTemplate<T extends Omix>(target: string, options: Omix<T> = {} as Omix<T>) {
    try {
        const route = join(process.cwd(), `./server/modules/mail/templates/${target || 'common'}.html`)
        const content = readFileSync(route, 'utf8')
        return compile(content)(options)
    } catch (e) {
        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

/**发送邮件**/
export function fetchSendMailer(transporter: ClientTransport, options: SendMailOptions) {
    return new Promise((resolve, reject) => {
        return transporter.sendMail(options, (error, info) => {
            if (error) {
                reject(error)
            } else {
                resolve(info)
            }
        })
    })
}
