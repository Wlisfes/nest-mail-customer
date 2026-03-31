import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

@Injectable()
export class MailTemplateVariableService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**获取变量列表**/
    @AutoDescriptor
    public async httpFetchVariables(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailTemplateVariable, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**保存变量（新建/更新）**/
    @AutoDescriptor
    public async httpSaveVariable(request: dto.OmixRequest, body: dto.SaveVariableOptions) {
        const ctx = await this.database.transaction()
        try {
            /**检查 varKey 唯一性**/
            await this.database.builder(this.database.schemaMailTemplateVariable, async qb => {
                qb.where(`t.varKey = :varKey AND t.userId = :userId`, { varKey: body.varKey, userId: request.user.keyId })
                if (body.keyId) {
                    qb.andWhere(`t.keyId != :keyId`, { keyId: body.keyId })
                }
                return await qb.getOne().then(async node => {
                    if (node) {
                        throw new HttpException(`变量键 "${body.varKey}" 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            if (body.keyId) {
                /**更新**/
                await ctx.manager.getRepository(schema.SchemaMailTemplateVariable).update(
                    { keyId: body.keyId, userId: request.user.keyId } as any,
                    { name: body.name, varKey: body.varKey, defaultValue: body.defaultValue ?? '' }
                )
            } else {
                /**新建**/
                await this.database.create(ctx.manager.getRepository(schema.SchemaMailTemplateVariable), {
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

    /**删除变量**/
    @AutoDescriptor
    public async httpDeleteVariable(request: dto.OmixRequest, keyId: number) {
        try {
            await this.database.schemaMailTemplateVariable.delete({ keyId, userId: request.user.keyId } as any)
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
