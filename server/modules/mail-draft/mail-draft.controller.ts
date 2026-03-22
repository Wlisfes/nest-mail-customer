import { Post, Body, Request, Get, Delete, Param } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailDraftService } from '@server/modules/mail-draft/mail-draft.service'
import * as dto from '@server/interface'

@ApifoxController('草稿箱模块', '/api/mail-draft')
export class MailDraftController {
    constructor(private readonly mailDraftService: MailDraftService) {}

    @ApiServiceDecorator(Post('/'), {
        operation: { summary: '保存草稿' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSaveDraft(@Request() request: dto.OmixRequest, @Body() body: dto.SaveDraftOptions) {
        return await this.mailDraftService.httpSaveDraft(request, body)
    }

    @ApiServiceDecorator(Get('/list'), {
        operation: { summary: '获取草稿列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDrafts(@Request() request: dto.OmixRequest) {
        return await this.mailDraftService.httpFetchDrafts(request)
    }

    @ApiServiceDecorator(Delete('/:keyId'), {
        operation: { summary: '删除草稿' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteDraft(@Request() request: dto.OmixRequest, @Param('keyId') keyId: number) {
        return await this.mailDraftService.httpDeleteDraft(request, keyId)
    }
}
