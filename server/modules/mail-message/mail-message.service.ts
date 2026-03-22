import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'

@Injectable()
export class MailMessageService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**查询邮件列表**/
    @AutoDescriptor
    public async httpFetchMailList(request: dto.OmixRequest, query: dto.FetchMailListOptions) {
        try {
            return await this.database.builder(this.database.schemaMailMessage, async qb => {
                qb.where(`1 = 1`)
                if (query.accountId) {
                    qb.andWhere(`t.accountId = :accountId`, { accountId: query.accountId })
                }
                if (query.folder) {
                    qb.andWhere(`t.folder = :folder`, { folder: query.folder })
                }
                qb.orderBy('t.date', 'DESC')
                qb.skip((query.page - 1) * query.size)
                qb.take(query.size)
                const [list, total] = await qb.getManyAndCount()
                return { list, total, page: query.page, size: query.size }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**发送邮件**/
    @AutoDescriptor
    public async httpSendMail(request: dto.OmixRequest, body: dto.SendMailOptions) {
        try {
            /**查询发件账号**/
            const account = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.keyId = :keyId AND t.userId = :userId`, { keyId: body.accountId, userId: request.user.keyId })
                return await qb.getOne()
            })
            if (!account) {
                throw new HttpException(`邮箱账号不存在`, HttpStatus.BAD_REQUEST)
            }
            /**记录已发送邮件**/
            const ctx = await this.database.transaction()
            try {
                await this.database.create(ctx.manager.getRepository(require('@server/modules/database/database.schema').SchemaMailMessage), {
                    stack: this.stack,
                    request,
                    body: {
                        accountId: account.keyId,
                        folder: 'Sent',
                        subject: body.subject,
                        fromAddress: account.email,
                        toAddress: body.to,
                        date: new Date(),
                        seen: 1,
                        uid: 0
                    }
                })
                await ctx.commitTransaction()
            } catch (err) {
                await ctx.rollbackTransaction()
                throw err
            } finally {
                await ctx.release()
            }
            return await this.fetchResolver({ message: '发送成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**标记已读**/
    @AutoDescriptor
    public async httpMarkMailSeen(request: dto.OmixRequest, keyId: number) {
        try {
            await this.database.schemaMailMessage.update({ keyId } as any, { seen: 1 })
            return await this.fetchResolver({ message: '标记成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
