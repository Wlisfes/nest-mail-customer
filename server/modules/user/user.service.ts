import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { isEmpty } from 'class-validator'
import { compareSync } from 'bcryptjs'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'
import { OmixRequest } from '@server/interface'
import { fetchIntNumber } from '@server/utils/utils-common'
import { BodyUserRegister, BodyUserLogin, BodySendEmailCode } from '@server/modules/user/user.dto'

/**验证码内存存储**/
const emailCodeStore = new Map<string, { code: string; expireAt: number }>()

@Injectable()
export class UserService extends Logger {
    constructor(
        private readonly database: DatabaseService,
        private readonly jwtService: JwtService
    ) {
        super()
    }

    /**生成JWT Token**/
    private async generateToken(user: Omix<{ keyId: number; email: string; nickname: string }>) {
        const payload = { keyId: user.keyId, email: user.email, nickname: user.nickname }
        return { token: await this.jwtService.signAsync(payload) }
    }

    /**发送邮箱验证码**/
    @AutoDescriptor
    public async httpBaseUserSendEmailCode(request: OmixRequest, body: BodySendEmailCode) {
        try {
            const logger = await this.fetchServiceTransaction(request, { stack: this.stack })
            const code = fetchIntNumber({ bit: 6 })
            /**存储验证码, 5分钟过期**/
            emailCodeStore.set(body.email, { code, expireAt: Date.now() + 5 * 60 * 1000 })
            /**日志输出验证码（后续接入SMTP后改为实际发送邮件）**/
            logger.info(`邮箱验证码 [${body.email}]: ${code}`)
            return await this.fetchResolver({ message: '验证码已发送' })
        } catch (err) {
            throw new HttpException(err.message ?? '验证码发送失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**用户注册**/
    @AutoDescriptor
    public async httpBaseUserRegister(request: OmixRequest, body: BodyUserRegister) {
        try {
            const logger = await this.fetchServiceTransaction(request, { stack: this.stack })

            /**校验邮箱是否已注册**/
            const existUser = await this.database.schemaUser.findOne({ where: { email: body.email } })
            if (existUser) {
                throw new HttpException('该邮箱已注册', HttpStatus.BAD_REQUEST)
            }

            /**校验昵称是否已存在**/
            const existNickname = await this.database.schemaUser.findOne({ where: { nickname: body.nickname } })
            if (existNickname) {
                throw new HttpException('该昵称已被使用', HttpStatus.BAD_REQUEST)
            }

            /**创建用户**/
            const user = this.database.schemaUser.create({
                nickname: body.nickname,
                email: body.email,
                password: body.password,
                avatar: ''
            })
            const result = await this.database.schemaUser.save(user)
            logger.info(`用户注册成功: ${result.email}`)

            /**生成token**/
            return await this.generateToken(result)
        } catch (err) {
            throw new HttpException(err.message ?? '注册失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**用户登录**/
    @AutoDescriptor
    public async httpBaseUserLogin(request: OmixRequest, body: BodyUserLogin) {
        try {
            const logger = await this.fetchServiceTransaction(request, { stack: this.stack })

            /**查找用户（含密码字段）**/
            const user = await this.database.schemaUser
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where('user.email = :email OR user.nickname = :email', { email: body.email })
                .getOne()

            if (isEmpty(user)) {
                throw new HttpException('账号不存在', HttpStatus.BAD_REQUEST)
            }

            /**密码校验**/
            const isPasswordValid = compareSync(body.password, user.password)
            if (!isPasswordValid) {
                throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)
            }

            logger.info(`用户登录成功: ${user.email}`)

            /**生成token**/
            return await this.generateToken(user)
        } catch (err) {
            throw new HttpException(err.message ?? '登录失败', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
