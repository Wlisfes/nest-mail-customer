import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**添加邮箱账号**/
export class CreateMailAccountOptions extends PickType(schema.SchemaMailAccount, ['email', 'provider', 'authCode']) {}

/**更新邮箱账号**/
export class UpdateMailAccountOptions extends IntersectionType(
    PickType(OmixPayloadOptions, ['keyId']),
    PickType(schema.SchemaMailAccount, ['authCode'])
) {}

/**删除邮箱账号**/
export class DeleteMailAccountOptions extends PickType(OmixPayloadOptions, ['keyId']) {}
