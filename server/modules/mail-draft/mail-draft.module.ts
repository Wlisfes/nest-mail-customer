import { Module } from '@nestjs/common'
import { MailDraftService } from '@server/modules/mail-draft/mail-draft.service'
import { MailDraftController } from '@server/modules/mail-draft/mail-draft.controller'

@Module({
    controllers: [MailDraftController],
    providers: [MailDraftService],
    exports: [MailDraftService]
})
export class MailDraftModule {}
