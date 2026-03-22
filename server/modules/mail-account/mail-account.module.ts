import { Module } from '@nestjs/common'
import { MailAccountService } from '@server/modules/mail-account/mail-account.service'
import { MailAccountController } from '@server/modules/mail-account/mail-account.controller'

@Module({
    controllers: [MailAccountController],
    providers: [MailAccountService],
    exports: [MailAccountService]
})
export class MailAccountModule {}
