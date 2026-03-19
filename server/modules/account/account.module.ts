import { Module } from '@nestjs/common'
import { AccountController } from '@server/modules/account/account.controller'
import { AccountService } from '@server/modules/account/account.service'

@Module({
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService]
})
export class AccountModule {}
