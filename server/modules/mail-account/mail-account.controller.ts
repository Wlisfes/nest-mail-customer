import { Post, Body, Request, Get, Put, Delete, Param } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailAccountService } from '@server/modules/mail-account/mail-account.service'
import * as dto from '@server/interface'

@ApifoxController('邮箱账号模块', '/api/mail-account')
export class MailAccountController {
    constructor(private readonly mailAccountService: MailAccountService) {}

    @ApiServiceDecorator(Post('/'), {
        operation: { summary: '添加邮箱账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCreateMailAccount(@Request() request: dto.OmixRequest, @Body() body: dto.CreateMailAccountOptions) {
        return await this.mailAccountService.httpCreateMailAccount(request, body)
    }

    @ApiServiceDecorator(Get('/list'), {
        operation: { summary: '获取邮箱账号列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchMailAccounts(@Request() request: dto.OmixRequest) {
        return await this.mailAccountService.httpFetchMailAccounts(request)
    }

    @ApiServiceDecorator(Put('/:keyId'), {
        operation: { summary: '更新邮箱账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpUpdateMailAccount(
        @Request() request: dto.OmixRequest,
        @Param('keyId') keyId: number,
        @Body() body: dto.UpdateMailAccountOptions
    ) {
        return await this.mailAccountService.httpUpdateMailAccount(request, keyId, body)
    }

    @ApiServiceDecorator(Delete('/:keyId'), {
        operation: { summary: '删除邮箱账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteMailAccount(@Request() request: dto.OmixRequest, @Param('keyId') keyId: number) {
        return await this.mailAccountService.httpDeleteMailAccount(request, keyId)
    }
}
