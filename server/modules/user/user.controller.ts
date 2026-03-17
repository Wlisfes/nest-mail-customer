import { Post, Get, Body, Query, Request, Response } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { UserService } from '@server/modules/user/user.service'

@ApifoxController('用户模块', '/user')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
