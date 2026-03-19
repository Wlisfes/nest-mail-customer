import { Post, Body, Request, Get } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { AccountService } from '@server/modules/account/account.service'
import * as dto from '@server/interface'

@ApifoxController('邮箱账号模块', '/api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @ApiServiceDecorator(Post('/create'), {
        operation: { summary: '添加邮箱账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCreateAccount(@Request() request: dto.OmixRequest, @Body() body: dto.CreateAccountOptions) {
        return await this.accountService.httpCreateAccount(request, body)
    }

    @ApiServiceDecorator(Get('/list'), {
        operation: { summary: '邮箱账号列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpAccountList(@Request() request: dto.OmixRequest) {
        return await this.accountService.httpAccountList(request)
    }

    @ApiServiceDecorator(Post('/delete'), {
        operation: { summary: '删除邮箱账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteAccount(@Request() request: dto.OmixRequest, @Body() body: dto.DeleteAccountOptions) {
        return await this.accountService.httpDeleteAccount(request, body)
    }
}
