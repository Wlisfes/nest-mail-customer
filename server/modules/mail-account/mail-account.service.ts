import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { MAIL_PROVIDER_CONFIG } from '@server/modules/database/database.enums'
import { ImapFlow } from 'imapflow'
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
            const account = await this.database.create(
                ctx.manager.getRepository(require('@server/modules/database/database.schema').SchemaMailAccount),
                {
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
                }
            )
            await ctx.commitTransaction()
            /**异步同步邮件，不阻塞响应**/
            this.syncMailFromIMAP(account).catch(err => {
                console.error(`邮箱 ${account.email} 同步失败:`, err.message)
            })
            return await this.fetchResolver({ message: '邮箱添加成功，正在后台同步邮件' })
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
            await this.database.schemaMailAccount.update({ keyId, userId: request.user.keyId } as any, { authCode: body.authCode })
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

    /**手动同步邮件**/
    @AutoDescriptor
    public async httpSyncMailAccount(request: dto.OmixRequest, keyId: number) {
        try {
            const account = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.keyId = :keyId AND t.userId = :userId`, { keyId, userId: request.user.keyId })
                return await qb.getOne()
            })
            if (!account) {
                throw new HttpException(`邮箱账号不存在`, HttpStatus.BAD_REQUEST)
            }
            /**异步同步，不阻塞响应**/
            this.syncMailFromIMAP(account).catch(err => {
                console.error(`邮箱 ${account.email} 同步失败:`, err.message)
            })
            return await this.fetchResolver({ message: '同步任务已启动' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**同步当前用户所有邮箱**/
    @AutoDescriptor
    public async httpSyncAllMailAccounts(request: dto.OmixRequest) {
        try {
            const accounts = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                return await qb.getMany()
            })
            if (accounts.length === 0) {
                throw new HttpException(`暂无邮箱账号，请先添加`, HttpStatus.BAD_REQUEST)
            }
            /**并行异步同步所有账号**/
            for (const account of accounts) {
                this.syncMailFromIMAP(account).catch(err => {
                    console.error(`邮箱 ${account.email} 同步失败:`, err.message)
                })
            }
            return await this.fetchResolver({ message: `已启动 ${accounts.length} 个邮箱的同步任务` })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**IMAP 邮件同步核心逻辑**/
    private async syncMailFromIMAP(account: any) {
        console.log(`[IMAP-SYNC] 开始同步: ${account.email} -> ${account.imapHost}:${account.imapPort}`)
        const client = new ImapFlow({
            host: account.imapHost,
            port: account.imapPort,
            secure: true,
            auth: { user: account.email, pass: account.authCode },
            logger: false
        })
        try {
            console.log(`[IMAP-SYNC] 正在连接 ${account.imapHost}...`)
            await client.connect()
            console.log(`[IMAP-SYNC] 连接成功 ${account.email}`)
            /**更新账号状态为正常**/
            await this.database.schemaMailAccount.update({ keyId: account.keyId } as any, { status: 0 })
            /**同步 INBOX**/
            console.log(`[IMAP-SYNC] 同步 INBOX...`)
            await this.syncFolder(client, account, 'INBOX')
            console.log(`[IMAP-SYNC] INBOX 同步完成`)
            /**同步 Sent 文件夹**/
            const sentFolders = ['Sent', 'INBOX.Sent', 'Sent Messages', '已发送', '&XfJT0ZAB-']
            for (const folder of sentFolders) {
                try {
                    console.log(`[IMAP-SYNC] 尝试同步 ${folder}...`)
                    await this.syncFolder(client, account, folder)
                    console.log(`[IMAP-SYNC] ${folder} 同步完成`)
                    break
                } catch (err) {
                    console.log(`[IMAP-SYNC] ${folder} 不存在或失败: ${err.message}`)
                }
            }
            console.log(`[IMAP-SYNC] 全部同步完成: ${account.email}`)
        } catch (err) {
            console.error(`[IMAP-SYNC] 同步失败 ${account.email}:`, err.message, err.stack)
            /**连接失败，更新状态**/
            await this.database.schemaMailAccount.update({ keyId: account.keyId } as any, { status: 1 })
            throw err
        } finally {
            await client.logout().catch(() => {})
        }
    }

    /**同步单个文件夹**/
    private async syncFolder(client: ImapFlow, account: any, folder: string) {
        const lock = await client.getMailboxLock(folder)
        try {
            const messages = client.fetch('1:*', {
                envelope: true,
                uid: true,
                flags: true,
                bodyStructure: true
            })
            console.log(messages)
            for await (const msg of messages) {
                const messageId = msg.envelope?.messageId ?? ''
                /**检查是否已存在**/
                const exists = await this.database.builder(this.database.schemaMailMessage, async qb => {
                    qb.where(`t.accountId = :accountId AND t.uid = :uid AND t.folder = :folder`, {
                        accountId: account.keyId,
                        uid: msg.uid,
                        folder
                    })
                    return await qb.getCount()
                })
                if (exists > 0) continue
                /**写入数据库**/
                const entity = this.database.schemaMailMessage.create({
                    accountId: account.keyId,
                    messageId,
                    uid: msg.uid,
                    folder,
                    subject: msg.envelope?.subject ?? '(无主题)',
                    fromAddress: msg.envelope?.from?.[0]?.address ?? '',
                    toAddress: msg.envelope?.to?.map(t => t.address).join(', ') ?? '',
                    date: msg.envelope?.date ?? new Date(),
                    seen: msg.flags?.has('\\Seen') ? 1 : 0,
                    hasAttachment: msg.bodyStructure?.childNodes?.length > 1 ? 1 : 0
                } as any)
                await this.database.schemaMailMessage.save(entity)
            }
        } finally {
            lock.release()
        }
    }
}
