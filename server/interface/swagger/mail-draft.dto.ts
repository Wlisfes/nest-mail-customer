import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { OmixPayloadOptions } from '@server/interface'
import * as schema from '@server/modules/database/database.schema'

/**保存草稿**/
export class SaveDraftOptions extends IntersectionType(
    PickType(schema.SchemaMailDraft, ['accountId', 'toAddress', 'subject', 'content']),
    PartialType(PickType(OmixPayloadOptions, ['keyId']))
) {
    @ApiProperty({ description: '抄送', required: false })
    @IsOptional()
    @IsString({ message: 'ccAddress必须是字符串' })
    ccAddress: string

    @ApiProperty({ description: '密送', required: false })
    @IsOptional()
    @IsString({ message: 'bccAddress必须是字符串' })
    bccAddress: string

    @ApiProperty({ description: '附件列表', required: false })
    @IsOptional()
    attachments: Array<{ name: string; size: number }>
}

/**删除草稿**/
export class DeleteDraftOptions extends PickType(OmixPayloadOptions, ['keyId']) {}
