import { HttpException, HttpStatus } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import { join } from 'path'
import { readFileSync } from 'fs'
import { compile } from 'handlebars'

export const CLIENT_TRANSPORT = Symbol('CLIENT_TRANSPORT')
export type ClientTransport = ReturnType<typeof createTransport>

export interface InitOptions {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
}

export interface SendMailOptions {
    from: string
    to: string
    subject: string
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
export function fetchReadTemplate<T extends Omix>(source: string, options: Omix<T> = {} as Omix<T>) {
    try {
        const route = join(process.cwd(), `./src/services/nodemailer/templates/${source || 'common.html'}`)
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
