import { Injectable, Inject, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OmixRequest } from '@server/interface'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { CLIENT_TRANSPORT, ClientTransport, fetchSendMailer, fetchReadTemplate } from '@server/modules/mail/mail.provider'
import * as env from '@server/interface'

@Injectable()
export class MailService extends Logger {
    constructor(
        @Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport,
        private readonly configService: ConfigService
    ) {
        super()
    }

    /**发送邮件**/
    @AutoDescriptor
    public async fetchSendMailTransport(request: OmixRequest, options: Parameters<typeof fetchSendMailer>['1']) {
        try {
            const logger = await this.fetchServiceTransaction(request, { stack: this.stack })
            return await fetchSendMailer(this.client, options).then(async data => {
                // this.logger.info(
                //     [NodemailerService.name, this.httpCustomizeNodemailer.name].join(':'),
                //     divineLogger(headers, { message: '发送邮件成功', data })
                // )
                this.logger.info(`发送邮件成功: ${JSON.stringify(data)}`)
                return await this.fetchResolver(data)
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**发送验证码**/
    @AutoDescriptor
    public async fetchSendCodexTransport(request: OmixRequest, options: env.CodexTransportOptions) {
        try {
            const from = this.configService.get('SMTP_USER')
            return await fetchReadTemplate(options.target, options).then(async html => {
                return await fetchSendMailer(this.client, { from, to: options.to, subject: options.title, html }).then(async data => {
                    this.logger.info(`发送验证码邮件成功: ${JSON.stringify(data)}`)
                    return await this.fetchResolver({ message: '验证码发送成功' })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
