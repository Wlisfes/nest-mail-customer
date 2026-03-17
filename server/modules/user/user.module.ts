import { Module } from '@nestjs/common'
import { UserService } from '@server/modules/user/user.service'
import { UserController } from '@server/modules/user/user.controller'

@Module({
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}
