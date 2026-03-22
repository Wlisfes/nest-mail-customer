import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { MAIL_PROVIDER_CONFIG } from '@server/modules/database/database.enums'
import * as dto from '@server/interface'

@Injectable()
export class MailAccountService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**添加邮箱账号**/
    @AutoDescriptor
    public async httpCreateMailAccount(request: dto.OmixRequest, body: dto.CreateMailAccountOptions) {
        const ctx = await this.database.transaction()
        try {
            /**检查邮箱是否已添加**/
            await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.email = :email AND t.userId = :userId`, { email: body.email, userId: request.user.keyId })
                return await qb.getOne().then(async node => {
                    if (node) {
                        throw new HttpException(`该邮箱已添加`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            /**自动填充 IMAP/SMTP 配置**/
            const config = MAIL_PROVIDER_CONFIG[body.provider]
            if (!config) {
                throw new HttpException(`不支持的邮箱平台`, HttpStatus.BAD_REQUEST)
            }
            await this.database.create(ctx.manager.getRepository(require('@server/modules/database/database.schema').SchemaMailAccount), {
                stack: this.stack,
                request,
                body: {
                    ...body,
                    userId: request.user.keyId,
                    imapHost: config.imapHost,
                    imapPort: config.imapPort,
                    smtpHost: config.smtpHost,
                    smtpPort: config.smtpPort
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '邮箱添加成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }

    /**获取用户邮箱列表**/
    @AutoDescriptor
    public async httpFetchMailAccounts(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**更新邮箱账号**/
    @AutoDescriptor
    public async httpUpdateMailAccount(request: dto.OmixRequest, keyId: number, body: dto.UpdateMailAccountOptions) {
        try {
            await this.database.schemaMailAccount.update(
                { keyId, userId: request.user.keyId } as any,
                { authCode: body.authCode }
            )
            return await this.fetchResolver({ message: '更新成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**删除邮箱账号**/
    @AutoDescriptor
    public async httpDeleteMailAccount(request: dto.OmixRequest, keyId: number) {
        try {
            await this.database.schemaMailAccount.delete({ keyId, userId: request.user.keyId } as any)
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
