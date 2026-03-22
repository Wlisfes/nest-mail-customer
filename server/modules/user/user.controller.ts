import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { UserService } from '@server/modules/user/user.service'
import * as dto from '@server/interface'

@ApifoxController('用户模块', '/api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiServiceDecorator(Post('/codex/register'), {
        operation: { summary: '发送注册验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserCodexRegister(@Request() request: dto.OmixRequest, @Body() body: dto.UserCodexRegisterOptions) {
        return await this.userService.httpBaseUserCodexRegister(request, body)
    }

    @ApiServiceDecorator(Post('/register'), {
        operation: { summary: '账号注册' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserRegister(@Request() request: dto.OmixRequest, @Body() body: dto.UserRegisterOptions) {
        return await this.userService.httpBaseUserRegister(request, body)
    }

    @ApiServiceDecorator(Post('/login'), {
        operation: { summary: '用户登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserAuthorization(@Request() request: dto.OmixRequest, @Body() body: dto.UserAuthorizationOptions) {
        return await this.userService.httpBaseUserAuthorization(request, body)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        operation: { summary: '用户信息' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserResolver(@Request() request: dto.OmixRequest) {
        return await this.userService.httpBaseUserResolver(request)
    }
}
