import { Post, Body, Request, Get, Query } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailboxService } from '@server/modules/mailbox/mailbox.service'
import * as dto from '@server/interface'

@ApifoxController('邮件收发模块', '/api/mailbox')
export class MailboxController {
    constructor(private readonly mailboxService: MailboxService) {}

    @ApiServiceDecorator(Get('/inbox'), {
        operation: { summary: '收件箱邮件列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpMailInbox(@Request() request: dto.OmixRequest, @Query() query: dto.InboxQueryOptions) {
        return await this.mailboxService.httpMailInbox(request, query)
    }

    @ApiServiceDecorator(Get('/detail'), {
        operation: { summary: '邮件详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpMailDetail(@Request() request: dto.OmixRequest, @Query() query: dto.MailDetailOptions) {
        return await this.mailboxService.httpMailDetail(request, query)
    }

    @ApiServiceDecorator(Post('/send'), {
        operation: { summary: '发送邮件' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSendMail(@Request() request: dto.OmixRequest, @Body() body: dto.SendMailOptions) {
        return await this.mailboxService.httpSendMail(request, body)
    }
}
