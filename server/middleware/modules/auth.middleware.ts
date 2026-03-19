import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { JwtService } from '@server/modules/jwt/jwt.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(request: Omix<Request>, response: Response, next: NextFunction) {
        const token = request.headers.authorization as string
        if (token) {
            try {
                request.user = await this.jwtService.fetchJwtParser<{ keyId: number; nickname: string; email: string }>(token)
            } catch (e) {
                /**token 无效时不中断请求，交给后续逻辑处理**/
                request.user = undefined
            }
        }
        return next()
    }
}
