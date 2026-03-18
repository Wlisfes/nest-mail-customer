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
            return await fetchSendMailer(this.client, options).then(async data => {
                this.logger.info(data)
                return await this.fetchResolver(data)
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**发送验证码**/
    @AutoDescriptor
    public async fetchSendCodexTransport(request: OmixRequest, target: env.CodexTarget, options: env.CodexTransportOptions) {
        try {
            const from = `"Mail Server" <${this.configService.get('SMTP_USER')}>`
            return await fetchReadTemplate(target, options).then(async html => {
                return await fetchSendMailer(this.client, {
                    from,
                    html,
                    to: options.email,
                    subject: this.configService.get('NODE_SEO_TITLE')
                }).then(async data => {
                    this.logger.info(data)
                    return await this.fetchResolver(data)
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
