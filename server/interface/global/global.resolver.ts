import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'

/**Request headers类型**/
export interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

/**Response类型**/
export interface OmixResponse extends Omix<Response> {}

/**Request类型**/
export interface OmixRequest extends Omix<Request> {
    headers: OmixHeaders
    user: Omix
    ipv4: string
}

/**jwt解析**/
export interface JwtParserOptions extends Omix {
    message: string
    code: number
}

/**jwt加密**/
export interface JwtSecretOptions extends Omix {
    expires: number
    message: string
    code: number
}
