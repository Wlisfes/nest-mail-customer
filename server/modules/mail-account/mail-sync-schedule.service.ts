import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { MailAccountService } from '@server/modules/mail-account/mail-account.service'

@Injectable()
export class MailSyncScheduleService extends Logger {
    constructor(
        private readonly database: DatabaseService,
        private readonly mailAccountService: MailAccountService
    ) {
        super()
    }

    /**每5分钟自动同步所有邮箱**/
    @Cron(CronExpression.EVERY_5_MINUTES)
    @AutoDescriptor
    public async autoSyncAllAccounts() {
        try {
            this.logger.info('[定时任务] 开始自动同步所有邮箱')
            const accounts = await this.database.schemaMailAccount.find()

            if (accounts.length === 0) {
                this.logger.info('[定时任务] 暂无邮箱账号，跳过同步')
                return
            }

            let successCount = 0
            let failCount = 0

            for (const account of accounts) {
                try {
                    // 使用反射调用私有方法
                    await (this.mailAccountService as any).syncMailFromIMAP(account)
                    successCount++
                } catch (err) {
                    this.logger.error(`[定时任务] 同步失败 ${account.email}: ${err.message}`)
                    failCount++
                }
            }

            this.logger.info(`[定时任务] 同步完成: 成功 ${successCount}, 失败 ${failCount}`)
        } catch (err) {
            this.logger.error(err)
        }
    }

    /**每小时清理30天前的已删除邮件**/
    @Cron(CronExpression.EVERY_HOUR)
    @AutoDescriptor
    public async cleanupOldMails() {
        try {
            this.logger.info('[定时任务] 开始清理旧邮件')
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const result = await this.database.schemaMailMessage
                .createQueryBuilder()
                .delete()
                .where('folder = :folder AND date < :date', {
                    folder: 'Trash',
                    date: thirtyDaysAgo
                })
                .execute()

            this.logger.info(`[定时任务] 清理完成: 删除 ${result.affected} 封旧邮件`)
        } catch (err) {
            this.logger.error(err)
        }
    }
}
