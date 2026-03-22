import { Module } from '@nestjs/common'
import { MailBlacklistService } from '@server/modules/mail-blacklist/mail-blacklist.service'
import { MailBlacklistController } from '@server/modules/mail-blacklist/mail-blacklist.controller'

@Module({
    controllers: [MailBlacklistController],
    providers: [MailBlacklistService],
    exports: [MailBlacklistService]
})
export class MailBlacklistModule {}
