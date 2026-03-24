import { Module } from '@nestjs/common'
import { AttachmentController } from '@server/modules/attachment/attachment.controller'

@Module({
    controllers: [AttachmentController]
})
export class AttachmentModule {}