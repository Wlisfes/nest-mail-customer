import { Module } from '@nestjs/common'
import { MailTemplateVariableService } from '@server/modules/mail-template-variable/mail-template-variable.service'
import { MailTemplateVariableController } from '@server/modules/mail-template-variable/mail-template-variable.controller'

@Module({
    controllers: [MailTemplateVariableController],
    providers: [MailTemplateVariableService],
    exports: [MailTemplateVariableService]
})
export class MailTemplateVariableModule {}
