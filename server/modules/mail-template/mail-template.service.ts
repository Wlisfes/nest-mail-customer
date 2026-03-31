import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { createTransport } from 'nodemailer'
import * as dto from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

@Injectable()
export class MailTemplateService extends Logger implements OnModuleInit {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    async onModuleInit() {
        await this.initPresetTemplates()
    }

    /**初始化预设模板**/
    private async initPresetTemplates() {
        try {
            const count = await this.database.schemaMailTemplate.count({ where: { isPreset: 1 } as any })
            if (count === 0) {
                const { presetTemplates } = await import('./preset-templates')
                for (const tpl of presetTemplates) {
                    const entity = this.database.schemaMailTemplate.create({
                        ...tpl,
                        userId: 0,
                        isPreset: 1
                    } as any)
                    await this.database.schemaMailTemplate.save(entity)
                }
                this.logger.info(`[MailTemplateService] 初始化 ${presetTemplates.length} 个预设模板`)
            }
        } catch (err) {
            this.logger.error(`[MailTemplateService] 预设模板初始化失败: ${err.message}`)
        }
    }

    /**获取模板列表**/
    @AutoDescriptor
    public async httpFetchTemplates(request: dto.OmixRequest, body: { categoryId?: number }) {
        try {
            return await this.database.builder(this.database.schemaMailTemplate, async qb => {
                qb.where(`(t.userId = :userId OR t.isPreset = 1)`, { userId: request.user.keyId })
                if (body.categoryId) {
                    qb.andWhere(`t.categoryId = :categoryId`, { categoryId: body.categoryId })
                }
                qb.orderBy('t.isPreset', 'DESC')
                qb.addOrderBy('t.modifyTime', 'DESC')
                /**不返回大字段**/
                qb.select([
                    't.keyId', 't.userId', 't.categoryId', 't.name', 't.description',
                    't.thumbnail', 't.isPreset', 't.createTime', 't.modifyTime'
                ])
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取模板详情**/
    @AutoDescriptor
    public async httpFetchTemplateDetail(request: dto.OmixRequest, keyId: number) {
        try {
            return await this.database.builder(this.database.schemaMailTemplate, async qb => {
                qb.where(`t.keyId = :keyId AND (t.userId = :userId OR t.isPreset = 1)`, {
                    keyId,
                    userId: request.user.keyId
                })
                return await qb.getOne().then(async node => {
                    if (!node) {
                        throw new HttpException('模板不存在', HttpStatus.NOT_FOUND)
                    }
                    return node
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**保存模板（新建/更新）**/
    @AutoDescriptor
    public async httpSaveTemplate(request: dto.OmixRequest, body: dto.SaveTemplateOptions) {
        const ctx = await this.database.transaction()
        try {
            /**服务端编译 MJML → HTML**/
            let htmlContent = ''
            if (body.mjmlSource) {
                try {
                    const mjml = require('mjml')
                    const result = mjml(body.mjmlSource, { minify: false })
                    htmlContent = result.html
                } catch (compileErr) {
                    throw new HttpException(`MJML编译失败: ${compileErr.message}`, HttpStatus.BAD_REQUEST)
                }
            }

            if (body.keyId) {
                /**更新**/
                const existing = await this.database.schemaMailTemplate.findOne({
                    where: { keyId: body.keyId, userId: request.user.keyId } as any
                })
                if (!existing) {
                    throw new HttpException('模板不存在', HttpStatus.NOT_FOUND)
                }
                if (existing.isPreset === 1) {
                    throw new HttpException('预设模板不可编辑', HttpStatus.BAD_REQUEST)
                }
                await ctx.manager.getRepository(schema.SchemaMailTemplate).update(
                    { keyId: body.keyId } as any,
                    {
                        name: body.name,
                        description: body.description ?? '',
                        categoryId: body.categoryId ?? null,
                        canvasJson: body.canvasJson ?? '',
                        mjmlSource: body.mjmlSource ?? '',
                        htmlContent
                    }
                )
            } else {
                /**新建**/
                await this.database.create(ctx.manager.getRepository(schema.SchemaMailTemplate), {
                    stack: this.stack,
                    request,
                    body: {
                        userId: request.user.keyId,
                        name: body.name,
                        description: body.description ?? '',
                        categoryId: body.categoryId ?? null,
                        canvasJson: body.canvasJson ?? '',
                        mjmlSource: body.mjmlSource ?? '',
                        htmlContent,
                        isPreset: 0
                    }
                })
            }
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '保存成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }

    /**删除模板**/
    @AutoDescriptor
    public async httpDeleteTemplate(request: dto.OmixRequest, keyId: number) {
        try {
            const tpl = await this.database.schemaMailTemplate.findOne({ where: { keyId } as any })
            if (!tpl) {
                throw new HttpException('模板不存在', HttpStatus.NOT_FOUND)
            }
            if (tpl.isPreset === 1) {
                throw new HttpException('预设模板不可删除', HttpStatus.BAD_REQUEST)
            }
            await this.database.schemaMailTemplate.delete({ keyId, userId: request.user.keyId } as any)
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**复制模板**/
    @AutoDescriptor
    public async httpCopyTemplate(request: dto.OmixRequest, keyId: number) {
        const ctx = await this.database.transaction()
        try {
            const source = await this.database.schemaMailTemplate.findOne({ where: { keyId } as any })
            if (!source) {
                throw new HttpException('模板不存在', HttpStatus.NOT_FOUND)
            }
            await this.database.create(ctx.manager.getRepository(schema.SchemaMailTemplate), {
                stack: this.stack,
                request,
                body: {
                    userId: request.user.keyId,
                    categoryId: source.isPreset === 1 ? null : source.categoryId,
                    name: `${source.name} - 副本`,
                    description: source.description,
                    canvasJson: source.canvasJson,
                    mjmlSource: source.mjmlSource,
                    htmlContent: source.htmlContent,
                    thumbnail: source.thumbnail,
                    isPreset: 0
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '复制成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }

    /**编译 MJML → HTML**/
    @AutoDescriptor
    public async httpCompileTemplate(request: dto.OmixRequest, body: { mjmlSource: string }) {
        try {
            const mjml = require('mjml')
            const result = mjml(body.mjmlSource, { minify: false })
            return await this.fetchResolver({ html: result.html, errors: result.errors })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**模板发送（支持群发）**/
    @AutoDescriptor
    public async httpSendTemplate(request: dto.OmixRequest, body: dto.SendTemplateOptions) {
        try {
            /**查询模板**/
            const template = await this.database.schemaMailTemplate.findOne({ where: { keyId: body.templateId } as any })
            if (!template || !template.htmlContent) {
                throw new HttpException('模板不存在或内容为空', HttpStatus.BAD_REQUEST)
            }
            /**查询发件账号**/
            const account = await this.database.builder(this.database.schemaMailAccount, async qb => {
                qb.where(`t.keyId = :keyId AND t.userId = :userId`, { keyId: body.accountId, userId: request.user.keyId })
                return await qb.getOne()
            })
            if (!account) {
                throw new HttpException('邮箱账号不存在', HttpStatus.BAD_REQUEST)
            }

            const results: Array<{ email: string; status: string; error?: string }> = []
            const transporter = createTransport({
                host: account.smtpHost,
                port: account.smtpPort,
                secure: account.smtpPort === 465,
                auth: { user: account.email, pass: account.authCode }
            })

            for (const recipient of body.recipients) {
                /**替换变量**/
                let html = template.htmlContent
                if (recipient.variables) {
                    for (const [key, value] of Object.entries(recipient.variables)) {
                        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
                    }
                }
                try {
                    await transporter.sendMail({
                        from: account.email,
                        to: recipient.email,
                        subject: body.subject || template.name,
                        html
                    })
                    /**记录到已发送**/
                    const entity = this.database.schemaMailMessage.create({
                        accountId: account.keyId,
                        folder: 'Sent',
                        subject: body.subject || template.name,
                        fromAddress: account.email,
                        toAddress: recipient.email,
                        htmlBody: html,
                        date: new Date(),
                        seen: 1,
                        uid: 0,
                        sendStatus: 0
                    } as any)
                    await this.database.schemaMailMessage.save(entity)
                    results.push({ email: recipient.email, status: 'success' })
                } catch (smtpErr) {
                    results.push({ email: recipient.email, status: 'failed', error: smtpErr.message })
                }
            }

            const success = results.filter(r => r.status === 'success').length
            const failed = results.filter(r => r.status === 'failed').length
            return await this.fetchResolver({ total: results.length, success, failed, results })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
