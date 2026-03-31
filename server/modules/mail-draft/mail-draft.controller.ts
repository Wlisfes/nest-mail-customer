import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailDraftService } from '@server/modules/mail-draft/mail-draft.service'
import * as dto from '@server/interface'

@ApifoxController('草稿箱模块', '/api/mail-draft')
export class MailDraftController {
    constructor(private readonly mailDraftService: MailDraftService) {}

    @ApiServiceDecorator(Post('/save'), {
        authorize: true,
        operation: { summary: '保存草稿' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSaveDraft(@Request() request: dto.OmixRequest, @Body() body: dto.SaveDraftOptions) {
        return await this.mailDraftService.httpSaveDraft(request, body)
    }

    @ApiServiceDecorator(Post('/list'), {
        authorize: true,
        operation: { summary: '获取草稿列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDrafts(@Request() request: dto.OmixRequest, @Body() body: { accountId?: number }) {
        return await this.mailDraftService.httpFetchDrafts(request, body)
    }

    @ApiServiceDecorator(Post('/detail'), {
        authorize: true,
        operation: { summary: '获取草稿详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDraftDetail(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailDraftService.httpFetchDraftDetail(request, body.keyId)
    }

    @ApiServiceDecorator(Post('/delete'), {
        authorize: true,
        operation: { summary: '删除草稿' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteDraft(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailDraftService.httpDeleteDraft(request, body.keyId)
    }
}
