import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailMessageService } from '@server/modules/mail-message/mail-message.service'
import * as dto from '@server/interface'

@ApifoxController('邮件消息模块', '/api/mail-message')
export class MailMessageController {
    constructor(private readonly mailMessageService: MailMessageService) {}

    @ApiServiceDecorator(Post('/list'), {
        authorize: true,
        operation: { summary: '邮件列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchMailList(@Request() request: dto.OmixRequest, @Body() body: dto.FetchMailListOptions) {
        return await this.mailMessageService.httpFetchMailList(request, body)
    }

    @ApiServiceDecorator(Post('/send'), {
        authorize: true,
        operation: { summary: '发送邮件' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSendMail(@Request() request: dto.OmixRequest, @Body() body: dto.SendMailOptions) {
        return await this.mailMessageService.httpSendMail(request, body)
    }

    @ApiServiceDecorator(Post('/seen'), {
        authorize: true,
        operation: { summary: '标记已读' },
        response: { status: 200, description: 'OK' }
    })
    public async httpMarkMailSeen(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailMessageService.httpMarkMailSeen(request, body.keyId)
    }
}
