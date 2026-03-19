import { Module } from '@nestjs/common'
import { MailboxController } from '@server/modules/mailbox/mailbox.controller'
import { MailboxService } from '@server/modules/mailbox/mailbox.service'

@Module({
    controllers: [MailboxController],
    providers: [MailboxService],
    exports: [MailboxService]
})
export class MailboxModule {}
