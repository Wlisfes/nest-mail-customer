import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty, isNotEmpty } from 'class-validator'
import { compareSync } from 'bcryptjs'
import { pick } from 'lodash'
import { JwtService } from '@server/modules/jwt/jwt.service'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { MailService } from '@server/modules/mail/mail.service'
import { RedisService } from '@server/modules/redis/redis.service'
import * as schema from '@server/modules/database/database.schema'
import * as dto from '@server/interface'

@Injectable()
export class UserService extends Logger {
    constructor(
        private readonly database: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly redisService: RedisService
    ) {
        super()
    }

    /**发送注册验证码**/
    @AutoDescriptor
    public async httpBaseUserCodexRegister(request: dto.OmixRequest, body: dto.UserCodexRegisterOptions) {
        try {
            /**检查邮箱是否已注册**/
            await this.database.builder(this.database.schemaUser, async qb => {
                qb.where(`t.email = :email`, { email: body.email })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`该邮箱已注册`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            return await this.redisService.compose(request, 'codex:register:{email}', { email: body.email }).then(async key => {
                /**生成6位随机验证码**/
                const code = Math.random().toString().slice(-6)
                await this.redisService.setStore(request, { key, data: code, seconds: 5 * 60 })
                /**发送验证码邮件**/
                return await this.mailService.fetchSendCodexTransport(request, {
                    target: 'common',
                    title: '注册验证码',
                    to: body.email,
                    code,
                    ttl: 5
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**用户注册**/
    @AutoDescriptor
    public async httpBaseUserRegister(request: dto.OmixRequest, body: dto.UserRegisterOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.builder(this.database.schemaUser, async qb => {
                qb.where(`t.email = :email`, { email: body.email })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`该邮箱已注册`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.SchemaUser), {
                stack: this.stack,
                request,
                body: body
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**用户登录**/
    @AutoDescriptor
    public async httpBaseUserAuthorization(request: dto.OmixRequest, body: dto.UserAuthorizationOptions) {
        try {
            return await this.database.builder(this.database.schemaUser, async qb => {
                qb.addSelect('t.password')
                qb.where(`t.email = :email`, { email: body.email })
                return await qb.getOne().then(async node => {
                    if (isEmpty(node)) {
                        throw new HttpException(`账号不存在`, HttpStatus.BAD_REQUEST)
                    } else if (!compareSync(body.password, node.password)) {
                        throw new HttpException(`账号密码不正确`, HttpStatus.BAD_REQUEST)
                    }
                    this.logger.info(`用户登录成功: ${node.email}`)
                    return await this.jwtService.fetchJwtSecret(pick(node, ['keyId', 'nickname', 'email']))
                })
            })
        } catch (err) {
            throw new HttpException(err.message ?? '登录失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**登录账户信息**/
    @AutoDescriptor
    public async httpBaseUserResolver(request: dto.OmixRequest) {
        try {
            return await this.database.builder(this.database.schemaUser, async qb => {
                qb.where(`t.keyId = :keyId`, { keyId: 1 })
                return await qb.getOne()
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
