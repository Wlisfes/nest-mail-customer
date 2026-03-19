import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**添加邮箱账号**/
export class CreateAccountOptions extends PickType(schema.SchemaMailAccount, ['email', 'provider', 'authCode']) {}

/**删除邮箱账号**/
export class DeleteAccountOptions extends PickType(OmixPayloadOptions, ['keyId']) {}
