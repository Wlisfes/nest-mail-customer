import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

@Injectable()
export class MailDraftService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**保存草稿**/
    @AutoDescriptor
    public async httpSaveDraft(request: dto.OmixRequest, body: dto.SaveDraftOptions) {
        const draftData: any = {
            userId: request.user.keyId,
            accountId: body.accountId,
            toAddress: body.toAddress,
            ccAddress: body.ccAddress || '',
            bccAddress: body.bccAddress || '',
            subject: body.subject,
            content: body.content,
            attachments: body.attachments ? JSON.stringify(body.attachments) : ''
        }
        try {
            if (body.keyId) {
                await this.database.schemaMailDraft.update({ keyId: body.keyId } as any, draftData)
                return await this.fetchResolver({ message: '草稿保存成功', keyId: body.keyId })
            } else {
                const ctx = await this.database.transaction()
                try {
                    const saved = await ctx.manager.getRepository(schema.SchemaMailDraft).save(draftData)
                    await ctx.commitTransaction()
                    return await this.fetchResolver({ message: '草稿保存成功', keyId: saved.keyId })
                } catch (err) {
                    await ctx.rollbackTransaction()
                    throw err
                } finally {
                    await ctx.release()
                }
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取草稿列表**/
    @AutoDescriptor
    public async httpFetchDrafts(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailDraft, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.createTime', 'DESC')
                const list = await qb.getMany()
                return { list }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取草稿详情**/
    @AutoDescriptor
    public async httpFetchDraftDetail(request: dto.OmixRequest, keyId: number) {
        try {
            const draft = await this.database.schemaMailDraft.findOne({ where: { keyId } as any })
            if (!draft) {
                throw new HttpException('草稿不存在', HttpStatus.NOT_FOUND)
            }
            return await this.fetchResolver(draft as any)
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**删除草稿**/
    @AutoDescriptor
    public async httpDeleteDraft(request: dto.OmixRequest, keyId: number) {
        try {
            await this.database.schemaMailDraft.delete({ keyId } as any)
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
