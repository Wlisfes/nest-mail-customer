import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export interface AuthOptions {
    /**验证失败是否继续执行**/
    next: boolean
}

@Injectable()
export class AuthGuard implements CanActivate {
    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        return true
    }
}

/**登录守卫、使用ApiGuardReflector守卫的接口会验证登录**/
export const ApiGuardReflector = (options: boolean | AuthOptions) => {
    return SetMetadata(`APP_AUTH_CONTEXT`, options)
}
