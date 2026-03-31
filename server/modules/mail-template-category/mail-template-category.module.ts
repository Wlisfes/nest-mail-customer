import { Module } from '@nestjs/common'
import { MailTemplateCategoryService } from '@server/modules/mail-template-category/mail-template-category.service'
import { MailTemplateCategoryController } from '@server/modules/mail-template-category/mail-template-category.controller'

@Module({
    controllers: [MailTemplateCategoryController],
    providers: [MailTemplateCategoryService],
    exports: [MailTemplateCategoryService]
})
export class MailTemplateCategoryModule {}
