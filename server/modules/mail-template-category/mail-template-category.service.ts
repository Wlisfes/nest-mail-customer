import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

@Injectable()
export class MailTemplateCategoryService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**获取分类列表**/
    @AutoDescriptor
    public async httpFetchCategories(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailTemplateCategory, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.sort', 'ASC')
                qb.addOrderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**保存分类（新建/更新）**/
    @AutoDescriptor
    public async httpSaveCategory(request: dto.OmixRequest, body: dto.SaveCategoryOptions) {
        const ctx = await this.database.transaction()
        try {
            if (body.keyId) {
                /**更新**/
                await ctx.manager.getRepository(schema.SchemaMailTemplateCategory).update(
                    { keyId: body.keyId, userId: request.user.keyId } as any,
                    { name: body.name, sort: body.sort ?? 0 }
                )
            } else {
                /**新建**/
                await this.database.create(ctx.manager.getRepository(schema.SchemaMailTemplateCategory), {
                    stack: this.stack,
                    request,
                    body: { ...body, userId: request.user.keyId }
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

    /**删除分类（模板归入未分类）**/
    @AutoDescriptor
    public async httpDeleteCategory(request: dto.OmixRequest, keyId: number) {
        const ctx = await this.database.transaction()
        try {
            /**将该分类下的模板 categoryId 置 null**/
            await ctx.manager.getRepository(schema.SchemaMailTemplate).update(
                { categoryId: keyId, userId: request.user.keyId } as any,
                { categoryId: null }
            )
            /**删除分类**/
            await ctx.manager.getRepository(schema.SchemaMailTemplateCategory).delete(
                { keyId, userId: request.user.keyId } as any
            )
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '删除成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }
}
