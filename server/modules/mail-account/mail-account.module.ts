import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { MailAccountService } from '@server/modules/mail-account/mail-account.service'
import { MailAccountController } from '@server/modules/mail-account/mail-account.controller'
import { MailSyncScheduleService } from '@server/modules/mail-account/mail-sync-schedule.service'

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [MailAccountController],
    providers: [MailAccountService, MailSyncScheduleService],
    exports: [MailAccountService]
})
export class MailAccountModule {}
