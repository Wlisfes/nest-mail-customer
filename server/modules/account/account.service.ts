import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty, isNotEmpty } from 'class-validator'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { MAIL_PROVIDER_CONFIG, MailProvider } from '@server/modules/database/database.enums'
import * as schema from '@server/modules/database/database.schema'
import * as dto from '@server/interface'

@Injectable()
export class AccountService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**添加邮箱账号**/
    @AutoDescriptor
    public async httpCreateAccount(request: dto.OmixRequest, body: dto.CreateAccountOptions) {
        const ctx = await this.database.transaction()
        try {
            /**检查邮箱是否已绑定**/
            await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.email = :email`, { email: body.email })
                qb.andWhere(`t.userId = :userId`, { userId: request.user.keyId })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`该邮箱已绑定`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })

            /**根据平台获取默认 IMAP/SMTP 配置**/
            const config = MAIL_PROVIDER_CONFIG[body.provider as MailProvider]
            if (!config) {
                throw new HttpException(`不支持的邮箱平台`, HttpStatus.BAD_REQUEST)
            }

            await this.database.create(ctx.manager.getRepository(schema.SchemaMailAccount), {
                stack: this.stack,
                request,
                body: {
                    userId: request.user.keyId,
                    email: body.email,
                    provider: body.provider,
                    authCode: body.authCode,
                    imapHost: config.imapHost,
                    imapPort: config.imapPort,
                    smtpHost: config.smtpHost,
                    smtpPort: config.smtpPort,
                    status: 0
                }
            })

            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '邮箱添加成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**获取邮箱账号列表**/
    @AutoDescriptor
    public async httpAccountList(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**删除邮箱账号**/
    @AutoDescriptor
    public async httpDeleteAccount(request: dto.OmixRequest, body: dto.DeleteAccountOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证账号所有权**/
            await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                qb.andWhere(`t.userId = :userId`, { userId: request.user.keyId })
                return await qb.getOne().then(async node => {
                    if (isEmpty(node)) {
                        throw new HttpException(`邮箱账号不存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })

            /**删除关联的邮件缓存**/
            await ctx.manager.getRepository(schema.SchemaMailMessage).delete({ accountId: Number(body.keyId) })
            /**删除邮箱账号**/
            await ctx.manager.getRepository(schema.SchemaMailAccount).delete({ keyId: Number(body.keyId) })

            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '邮箱删除成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        } finally {
            await ctx.release()
        }
    }
}
