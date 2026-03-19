import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty } from 'class-validator'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as schema from '@server/modules/database/database.schema'
import * as dto from '@server/interface'

@Injectable()
export class MailboxService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**获取邮箱账号并验证所有权**/
    private async getAccount(request: dto.OmixRequest, accountId: number): Promise<schema.SchemaMailAccount> {
        return await this.database.builder(this.database.schemaMailAccount, async qb => {
            qb.where(`t.keyId = :keyId`, { keyId: accountId })
            qb.andWhere(`t.userId = :userId`, { userId: request.user.keyId })
            return await qb.getOne().then(async node => {
                if (isEmpty(node)) {
                    throw new HttpException(`邮箱账号不存在`, HttpStatus.BAD_REQUEST)
                }
                return node
            })
        })
    }

    /**创建 IMAP 连接**/
    private async createImapClient(account: schema.SchemaMailAccount) {
        const { ImapFlow } = await import('imapflow')
        const client = new ImapFlow({
            host: account.imapHost,
            port: account.imapPort,
            secure: true,
            auth: { user: account.email, pass: account.authCode },
            logger: false
        })
        await client.connect()
        return client
    }

    /**收件箱邮件列表**/
    @AutoDescriptor
    public async httpMailInbox(request: dto.OmixRequest, query: dto.InboxQueryOptions) {
        try {
            const account = await this.getAccount(request, query.accountId)
            const client = await this.createImapClient(account)

            try {
                const lock = await client.getMailboxLock('INBOX')
                try {
                    const total = (client.mailbox as any)?.exists || 0
                    const page = query.page ?? 1
                    const size = query.size ?? 20

                    /**计算分页范围（IMAP序号从1开始，倒序取最新邮件）**/
                    const end = Math.max(total - (page - 1) * size, 0)
                    const start = Math.max(end - size + 1, 1)

                    if (end <= 0) {
                        return await this.fetchResolver({ list: [], total, page, size })
                    }

                    const messages = []
                    for await (const msg of client.fetch(`${start}:${end}`, {
                        envelope: true,
                        flags: true,
                        bodyStructure: true
                    })) {
                        messages.push({
                            uid: msg.uid,
                            subject: msg.envelope?.subject || '(无主题)',
                            fromAddress: msg.envelope?.from?.[0]?.address || '',
                            fromName: msg.envelope?.from?.[0]?.name || '',
                            toAddress: msg.envelope?.to?.[0]?.address || '',
                            date: msg.envelope?.date || null,
                            seen: msg.flags?.has('\\Seen') ? 1 : 0,
                            hasAttachment: msg.bodyStructure?.type === 'multipart' ? 1 : 0,
                            messageId: msg.envelope?.messageId || ''
                        })
                    }

                    /**按时间倒序排列**/
                    messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    return await this.fetchResolver({ list: messages, total, page, size })
                } finally {
                    lock.release()
                }
            } finally {
                await client.logout()
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message ?? '获取收件箱失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**邮件详情**/
    @AutoDescriptor
    public async httpMailDetail(request: dto.OmixRequest, query: dto.MailDetailOptions) {
        try {
            const account = await this.getAccount(request, query.accountId)
            const client = await this.createImapClient(account)

            try {
                const lock = await client.getMailboxLock('INBOX')
                try {
                    const message = await client.fetchOne(
                        String(query.uid),
                        {
                            source: true,
                            envelope: true,
                            flags: true
                        },
                        { uid: true }
                    )

                    if (!message) {
                        throw new HttpException(`邮件不存在`, HttpStatus.BAD_REQUEST)
                    }

                    /**使用 postal-mime 解析邮件正文**/
                    const PostalMime = (await import('postal-mime')).default
                    const parser = new PostalMime()
                    const parsed = await parser.parse(message.source)

                    /**标记为已读**/
                    await client.messageFlagsAdd(String(query.uid), ['\\Seen'], { uid: true })

                    return await this.fetchResolver({
                        uid: query.uid,
                        subject: message.envelope?.subject || '(无主题)',
                        from: message.envelope?.from || [],
                        to: message.envelope?.to || [],
                        cc: message.envelope?.cc || [],
                        date: message.envelope?.date || null,
                        html: parsed.html || '',
                        text: parsed.text || '',
                        attachments: (parsed.attachments || []).map(att => ({
                            filename: att.filename,
                            mimeType: att.mimeType,
                            size: typeof att.content !== 'string' ? att.content?.byteLength || 0 : 0
                        }))
                    })
                } finally {
                    lock.release()
                }
            } finally {
                await client.logout()
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message ?? '获取邮件详情失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**发送邮件**/
    @AutoDescriptor
    public async httpSendMail(request: dto.OmixRequest, body: dto.SendMailOptions) {
        try {
            const account = await this.getAccount(request, body.accountId)

            /**使用用户的 SMTP 配置创建 nodemailer transport**/
            const nodemailer = await import('nodemailer')
            const transporter = nodemailer.createTransport({
                host: account.smtpHost,
                port: account.smtpPort,
                secure: account.smtpPort === 465,
                auth: { user: account.email, pass: account.authCode }
            })

            const result = await transporter.sendMail({
                from: `"${request.user.nickname || account.email}" <${account.email}>`,
                to: body.to,
                subject: body.subject,
                html: body.html
            })

            this.logger.info({ message: '邮件发送成功', messageId: result.messageId })
            return await this.fetchResolver({ message: '邮件发送成功', messageId: result.messageId })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message ?? '邮件发送失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
