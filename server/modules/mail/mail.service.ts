import { Injectable, Inject, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OmixRequest } from '@server/interface'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { CLIENT_TRANSPORT, ClientTransport, fetchSendMailer } from '@server/modules/mail/mail.provider'

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
    public async fetchSendMailer(request: OmixRequest, options: Parameters<typeof fetchSendMailer>['1']) {
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
}
