import { PickType } from '@nestjs/swagger'
import { OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**保存模板分类**/
export class SaveCategoryOptions extends PickType(schema.SchemaMailTemplateCategory, ['name', 'sort']) {
    keyId?: number
}

/**保存模板变量**/
export class SaveVariableOptions extends PickType(schema.SchemaMailTemplateVariable, ['name', 'varKey', 'defaultValue']) {
    keyId?: number
}

/**保存模板**/
export class SaveTemplateOptions extends PickType(schema.SchemaMailTemplate, ['name', 'description', 'canvasJson', 'mjmlSource']) {
    keyId?: number
    categoryId?: number
}

/**模板发送**/
export class SendTemplateOptions {
    templateId: number
    accountId: number
    subject?: string
    recipients: Array<{
        email: string
        variables: Record<string, string>
    }>
}
