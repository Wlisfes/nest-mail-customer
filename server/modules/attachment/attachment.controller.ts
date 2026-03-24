import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { createReadStream } from 'fs'
import { join } from 'path'
import { DatabaseService } from '@server/modules/database/database.service'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'

@ApiTags('附件管理')
@Controller('/api/attachment')
export class AttachmentController extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    @Get(':id/download')
    @ApiOperation({ summary: '下载附件' })
    @ApiParam({ name: 'id', description: '附件ID' })
    @ApiResponse({ status: 200, description: '文件流' })
    @ApiResponse({ status: 404, description: '附件不存在' })
    @AutoDescriptor
    async downloadAttachment(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
        const attachment = await this.database.schemaMailAttachment.findOne({
            where: { keyId: parseInt(id) }
        })

        if (!attachment || !attachment.filePath) {
            res.status(404).json({ message: '附件不存在' })
            return
        }

        const file = createReadStream(join(process.cwd(), attachment.filePath))
        res.set({
            'Content-Type': attachment.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
            'Content-Length': attachment.size
        })
        return new StreamableFile(file)
    }

    @Get(':id/view')
    @ApiOperation({ summary: '预览附件' })
    @ApiParam({ name: 'id', description: '附件ID' })
    @ApiResponse({ status: 200, description: '文件流' })
    @ApiResponse({ status: 404, description: '附件不存在' })
    @AutoDescriptor
    async viewAttachment(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
        const attachment = await this.database.schemaMailAttachment.findOne({
            where: { keyId: parseInt(id) }
        })

        if (!attachment || !attachment.filePath) {
            res.status(404).json({ message: '附件不存在' })
            return
        }

        const file = createReadStream(join(process.cwd(), attachment.filePath))
        res.set({
            'Content-Type': attachment.mimeType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.filename)}"`,
            'Content-Length': attachment.size
        })
        return new StreamableFile(file)
    }
}