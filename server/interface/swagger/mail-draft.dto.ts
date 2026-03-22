import { PickType } from '@nestjs/swagger'
import { OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**保存草稿**/
export class SaveDraftOptions extends PickType(schema.SchemaMailDraft, ['accountId', 'toAddress', 'subject', 'content']) {}

/**删除草稿**/
export class DeleteDraftOptions extends PickType(OmixPayloadOptions, ['keyId']) {}
