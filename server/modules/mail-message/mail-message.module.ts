import { Module } from '@nestjs/common'
import { MailMessageService } from '@server/modules/mail-message/mail-message.service'
import { MailMessageController } from '@server/modules/mail-message/mail-message.controller'

@Module({
    controllers: [MailMessageController],
    providers: [MailMessageService],
    exports: [MailMessageService]
})
export class MailMessageModule {}
