import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isObject, isBoolean, isNotEmpty } from 'class-validator'
import { JwtService } from '@server/modules/jwt/jwt.service'
import { Reflector } from '@nestjs/core'
import { OmixRequest } from '@server/interface'

export interface AuthOptions {
    /**验证失败是否继续执行**/
    next: boolean
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}

    /**默认配置**/
    public async fetchCtxOptions(context: ExecutionContext, request: OmixRequest) {
        const token = (request.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
        const node = this.reflector.get<boolean | AuthOptions>(`APP_AUTH_CONTEXT`, context.getHandler())
        if (isNotEmpty(node) && isObject(node)) {
            return { check: true, next: node.next, token }
        } else if (isNotEmpty(node) && isBoolean(node)) {
            return { check: true, next: false, token }
        }
        return { check: false, next: false, token }
    }

    /**token解析**/
    public async fetchGuardHandler(request: Omix<OmixRequest>, token: string, options: AuthOptions) {
        try {
            request.user = await this.jwtService.fetchJwtParser(token)
        } catch (err) {
            if (!options.next) {
                throw new HttpException(err.message ?? '身份验证失败', err.status ?? HttpStatus.UNAUTHORIZED)
            }
            return err
        }
    }

    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<OmixRequest>()
        return await this.fetchCtxOptions(context, request).then(async data => {
            if (data.check) {
                await this.fetchGuardHandler(request, data.token, data)
            }
            return true
        })
    }
}

/**登录守卫、使用ApiGuardReflector守卫的接口会验证登录**/
export const ApiGuardReflector = (options: boolean | AuthOptions) => {
    return SetMetadata(`APP_AUTH_CONTEXT`, options)
}
