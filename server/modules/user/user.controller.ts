import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { UserService } from '@server/modules/user/user.service'
import { OmixRequest } from '@server/interface'
import { BodyUserRegister, BodyUserLogin, BodySendEmailCode } from '@server/modules/user/user.dto'

@ApifoxController('用户模块', '/api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiServiceDecorator(Post('/register'), {
        operation: { summary: '注册用户' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserRegister(@Request() request: OmixRequest, @Body() body: BodyUserRegister) {
        return await this.userService.httpBaseUserRegister(request, body)
    }

    @ApiServiceDecorator(Post('/login'), {
        operation: { summary: '用户登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserLogin(@Request() request: OmixRequest, @Body() body: BodyUserLogin) {
        return await this.userService.httpBaseUserLogin(request, body)
    }

    @ApiServiceDecorator(Post('/send-email-code'), {
        operation: { summary: '发送邮箱验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseUserSendEmailCode(@Request() request: OmixRequest, @Body() body: BodySendEmailCode) {
        return await this.userService.httpBaseUserSendEmailCode(request, body)
    }
}
