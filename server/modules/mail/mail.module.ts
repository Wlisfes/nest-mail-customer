import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CLIENT_TRANSPORT, fetchCreateTransport } from '@server/modules/mail/mail.provider'
import { MailService } from '@server/modules/mail/mail.service'

@Global()
@Module({
    exports: [MailService],
    providers: [
        {
            provide: CLIENT_TRANSPORT,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await fetchCreateTransport({
                    host: config.get('SMTP_HOST'),
                    port: config.get('SMTP_PORT'),
                    secure: config.get('SMTP_SECURE'),
                    user: config.get('SMTP_USER'),
                    password: config.get('SMTP_PASSWORD')
                })
            }
        },
        MailService
    ]
})
export class MailModule {}
