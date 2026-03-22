import { Post, Body, Request, Get, Delete, Param } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailBlacklistService } from '@server/modules/mail-blacklist/mail-blacklist.service'
import * as dto from '@server/interface'

@ApifoxController('黑名单模块', '/api/mail-blacklist')
export class MailBlacklistController {
    constructor(private readonly mailBlacklistService: MailBlacklistService) {}

    @ApiServiceDecorator(Post('/'), {
        operation: { summary: '添加黑名单' },
        response: { status: 200, description: 'OK' }
    })
    public async httpAddBlacklist(@Request() request: dto.OmixRequest, @Body() body: dto.AddBlacklistOptions) {
        return await this.mailBlacklistService.httpAddBlacklist(request, body)
    }

    @ApiServiceDecorator(Get('/list'), {
        operation: { summary: '获取黑名单列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchBlacklist(@Request() request: dto.OmixRequest) {
        return await this.mailBlacklistService.httpFetchBlacklist(request)
    }

    @ApiServiceDecorator(Delete('/:keyId'), {
        operation: { summary: '移除黑名单' },
        response: { status: 200, description: 'OK' }
    })
    public async httpRemoveBlacklist(@Request() request: dto.OmixRequest, @Param('keyId') keyId: number) {
        return await this.mailBlacklistService.httpRemoveBlacklist(request, keyId)
    }
}
