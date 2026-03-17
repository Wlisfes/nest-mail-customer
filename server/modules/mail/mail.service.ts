import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { CLIENT_TRANSPORT, ClientTransport, fetchCreateTransport } from '@server/modules/mail/mail.provider'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'

@Injectable()
export class MailService extends Logger {
    constructor(
        @Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport,
        private readonly configService: ConfigService
    ) {
        super()
    }
}
