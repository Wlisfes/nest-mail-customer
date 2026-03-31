import { Module } from '@nestjs/common'
import { MailTemplateService } from '@server/modules/mail-template/mail-template.service'
import { MailTemplateController } from '@server/modules/mail-template/mail-template.controller'

@Module({
    controllers: [MailTemplateController],
    providers: [MailTemplateService],
    exports: [MailTemplateService]
})
export class MailTemplateModule {}
