import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'

@Injectable()
export class MailDraftService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**保存草稿**/
    @AutoDescriptor
    public async httpSaveDraft(request: dto.OmixRequest, body: dto.SaveDraftOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.create(ctx.manager.getRepository(require('@server/modules/database/database.schema').SchemaMailDraft), {
                stack: this.stack,
                request,
                body
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '草稿保存成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }

    /**获取草稿列表**/
    @AutoDescriptor
    public async httpFetchDrafts(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailDraft, async qb => {
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
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
