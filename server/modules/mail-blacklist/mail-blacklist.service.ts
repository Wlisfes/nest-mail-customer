import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import * as dto from '@server/interface'

@Injectable()
export class MailBlacklistService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**添加黑名单**/
    @AutoDescriptor
    public async httpAddBlacklist(request: dto.OmixRequest, body: dto.AddBlacklistOptions) {
        const ctx = await this.database.transaction()
        try {
            /**检查是否已在黑名单**/
            await this.database.builder(this.database.schemaMailBlacklist, async qb => {
                qb.where(`t.email = :email AND t.userId = :userId`, { email: body.email, userId: request.user.keyId })
                return await qb.getOne().then(async node => {
                    if (node) {
                        throw new HttpException(`该邮箱已在黑名单中`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(require('@server/modules/database/database.schema').SchemaMailBlacklist), {
                stack: this.stack,
                request,
                body: { ...body, userId: request.user.keyId }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '添加成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await ctx.release()
        }
    }

    /**获取黑名单列表**/
    @AutoDescriptor
    public async httpFetchBlacklist(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaMailBlacklist, async qb => {
                qb.where(`t.userId = :userId`, { userId: request.user.keyId })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**移除黑名单**/
    @AutoDescriptor
    public async httpRemoveBlacklist(request: dto.OmixRequest, keyId: number) {
        try {
            await this.database.schemaMailBlacklist.delete({ keyId, userId: request.user.keyId } as any)
            return await this.fetchResolver({ message: '移除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
