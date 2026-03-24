import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { createTransport } from 'nodemailer'
import * as dto from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

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
                if (query.keyword) {
                    qb.andWhere(
                        `(t.subject LIKE :keyword OR t.fromAddress LIKE :keyword OR t.toAddress LIKE :keyword OR t.textBody LIKE :keyword)`,
                        { keyword: `%${query.keyword}%` }
                    )
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
            /**先存库，标记发送中**/
            const ctx = await this.database.transaction()
            let savedMail: any
            try {
                savedMail = await this.database.create(ctx.manager.getRepository(schema.SchemaMailMessage), {
                    stack: this.stack,
                    request,
                    body: {
                        accountId: account.keyId,
                        folder: 'Sent',
                        subject: body.subject,
                        fromAddress: account.email,
                        toAddress: body.to,
                        ccAddress: body.cc || '',
                        bccAddress: body.bcc || '',
                        htmlBody: body.html,
                        hasAttachment: body.attachments && body.attachments.length > 0 ? 1 : 0,
                        date: new Date(),
                        seen: 1,
                        uid: 0,
                        sendStatus: 2
                    }
                })
                await ctx.commitTransaction()
            } catch (err) {
                await ctx.rollbackTransaction()
                throw err
            } finally {
                await ctx.release()
            }
            /**SMTP 真实发送**/
            try {
                const result = await this.smtpSend(account, body)
                await this.database.schemaMailMessage.update({ keyId: savedMail.keyId } as any, { sendStatus: 0 })
                return await this.fetchResolver({ message: '发送成功', result })
            } catch (smtpErr) {
                await this.database.schemaMailMessage.update({ keyId: savedMail.keyId } as any, { sendStatus: 1 })
                throw new HttpException(`邮件投递失败: ${smtpErr.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**重新发送失败邮件**/
    @AutoDescriptor
    public async httpResendMail(request: dto.OmixRequest, keyId: number) {
        try {
            const mail = await this.database.schemaMailMessage.findOne({ where: { keyId } as any })
            if (!mail || mail.sendStatus !== 1) {
                throw new HttpException('该邮件不可重发', HttpStatus.BAD_REQUEST)
            }
            const account = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.keyId = :keyId`, { keyId: mail.accountId })
                return await qb.getOne()
            })
            if (!account) {
                throw new HttpException('发件账号不存在', HttpStatus.BAD_REQUEST)
            }
            await this.database.schemaMailMessage.update({ keyId } as any, { sendStatus: 2 })
            try {
                await this.smtpSend(account, {
                    to: mail.toAddress,
                    cc: mail.ccAddress,
                    bcc: mail.bccAddress,
                    subject: mail.subject,
                    html: mail.htmlBody
                })
                await this.database.schemaMailMessage.update({ keyId } as any, { sendStatus: 0 })
                return await this.fetchResolver({ message: '重新发送成功' })
            } catch (smtpErr) {
                await this.database.schemaMailMessage.update({ keyId } as any, { sendStatus: 1 })
                throw new HttpException(`重新发送失败: ${smtpErr.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**SMTP 发送核心**/
    private async smtpSend(account: any, mail: { to: string; cc?: string; bcc?: string; subject: string; html: string }) {
        const transporter = await createTransport({
            host: account.smtpHost,
            port: account.smtpPort,
            secure: account.smtpPort === 465,
            auth: { user: account.email, pass: account.authCode }
        })
        return await transporter.sendMail({
            from: account.email,
            to: mail.to,
            cc: mail.cc || undefined,
            bcc: mail.bcc || undefined,
            subject: mail.subject,
            html: mail.html
        })
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

    /**获取邮件详情**/
    @AutoDescriptor
    public async httpFetchMailDetail(request: dto.OmixRequest, keyId: string) {
        try {
            const mail = await this.database.schemaMailMessage.findOne({
                where: { keyId: parseInt(keyId) }
            })
            if (!mail) {
                throw new HttpException('邮件不存在', HttpStatus.NOT_FOUND)
            }
            // 标记为已读
            if (!mail.seen) {
                await this.database.schemaMailMessage.update({ keyId: parseInt(keyId) } as any, { seen: 1 })
            }
            // 获取附件列表
            const attachments = await this.database.schemaMailAttachment.find({
                where: { messageId: parseInt(keyId) }
            })
            return await this.fetchResolver({
                ...mail,
                attachments: attachments || []
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**删除邮件**/
    @AutoDescriptor
    public async httpDeleteMail(request: dto.OmixRequest, keyId: string) {
        try {
            const result = await this.database.schemaMailMessage.delete({ keyId: parseInt(keyId) } as any)
            if (result.affected === 0) {
                throw new HttpException('邮件不存在', HttpStatus.NOT_FOUND)
            }
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
