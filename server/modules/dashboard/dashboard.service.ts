import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'
import dayjs from 'dayjs'

@Injectable()
export class DashboardService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**获取统计卡片数据**/
    @AutoDescriptor
    public async httpFetchDashboardStats(request: dto.OmixRequest) {
        try {
            const userId = request.user.keyId
            /**查询用户所有邮箱账号ID**/
            const accounts = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId })
                return await qb.getMany()
            })
            const accountIds = accounts.map(a => a.keyId)
            if (accountIds.length === 0) {
                return { totalMails: 0, unreadMails: 0, sentToday: 0, attachmentMails: 0 }
            }
            /**统计总邮件数**/
            const totalMails = await this.database.builder(this.database.schemaMailMessage, async qb => {
                qb.where(`t.accountId IN (:...accountIds)`, { accountIds })
                return await qb.getCount()
            })
            /**统计未读邮件**/
            const unreadMails = await this.database.builder(this.database.schemaMailMessage, async qb => {
                qb.where(`t.accountId IN (:...accountIds) AND t.seen = 0`, { accountIds })
                return await qb.getCount()
            })
            /**统计今日发送**/
            const todayStart = dayjs().startOf('day').toDate()
            const sentToday = await this.database.builder(this.database.schemaMailMessage, async qb => {
                qb.where(`t.accountId IN (:...accountIds) AND t.folder = :folder AND t.date >= :todayStart`, {
                    accountIds, folder: 'Sent', todayStart
                })
                return await qb.getCount()
            })
            /**统计附件邮件**/
            const attachmentMails = await this.database.builder(this.database.schemaMailMessage, async qb => {
                qb.where(`t.accountId IN (:...accountIds) AND t.hasAttachment = 1`, { accountIds })
                return await qb.getCount()
            })
            return { totalMails, unreadMails, sentToday, attachmentMails }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取7天趋势数据**/
    @AutoDescriptor
    public async httpFetchDashboardTrend(request: dto.OmixRequest) {
        try {
            const userId = request.user.keyId
            const accounts = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId })
                return await qb.getMany()
            })
            const accountIds = accounts.map(a => a.keyId)
            const days: string[] = []
            const receivedData: number[] = []
            const sentData: number[] = []
            for (let i = 6; i >= 0; i--) {
                const day = dayjs().subtract(i, 'day')
                days.push(day.format('M/D'))
                if (accountIds.length === 0) {
                    receivedData.push(0)
                    sentData.push(0)
                    continue
                }
                const dayStart = day.startOf('day').toDate()
                const dayEnd = day.endOf('day').toDate()
                const received = await this.database.builder(this.database.schemaMailMessage, async qb => {
                    qb.where(`t.accountId IN (:...accountIds) AND t.folder = :folder AND t.date BETWEEN :dayStart AND :dayEnd`, {
                        accountIds, folder: 'INBOX', dayStart, dayEnd
                    })
                    return await qb.getCount()
                })
                const sent = await this.database.builder(this.database.schemaMailMessage, async qb => {
                    qb.where(`t.accountId IN (:...accountIds) AND t.folder = :folder AND t.date BETWEEN :dayStart AND :dayEnd`, {
                        accountIds, folder: 'Sent', dayStart, dayEnd
                    })
                    return await qb.getCount()
                })
                receivedData.push(received)
                sentData.push(sent)
            }
            return { days, receivedData, sentData }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取邮箱分布数据**/
    @AutoDescriptor
    public async httpFetchDashboardDistribution(request: dto.OmixRequest) {
        try {
            const userId = request.user.keyId
            const accounts = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId })
                return await qb.getMany()
            })
            const providerLabels: Record<string, string> = {
                qq: 'QQ 邮箱', '163': '网易 163', outlook: 'Outlook', gmail: 'Gmail'
            }
            const distribution: { name: string; value: number }[] = []
            for (const account of accounts) {
                const count = await this.database.builder(this.database.schemaMailMessage, async qb => {
                    qb.where(`t.accountId = :accountId`, { accountId: account.keyId })
                    return await qb.getCount()
                })
                distribution.push({
                    name: providerLabels[account.provider] ?? account.provider,
                    value: count
                })
            }
            return distribution
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
