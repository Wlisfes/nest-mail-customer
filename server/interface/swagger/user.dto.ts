import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**账号注册**/
export class UserRegisterOptions extends IntersectionType(
    PickType(schema.SchemaUser, ['nickname', 'email', 'password']),
    PickType(OmixPayloadOptions, ['code'])
) {}

/**账户登录**/
export class UserAuthorizationOptions extends IntersectionType(
    PickType(schema.SchemaUser, ['email', 'password']),
    PickType(OmixPayloadOptions, ['code'])
) {}
