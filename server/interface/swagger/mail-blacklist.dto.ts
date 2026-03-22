import { PickType } from '@nestjs/swagger'
import { OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**添加黑名单**/
export class AddBlacklistOptions extends PickType(schema.SchemaMailBlacklist, ['email', 'reason']) {}

/**移除黑名单**/
export class RemoveBlacklistOptions extends PickType(OmixPayloadOptions, ['keyId']) {}
