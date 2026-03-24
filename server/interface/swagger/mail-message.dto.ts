import { PickType, IntersectionType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { OmixColumnOptions, OmixPayloadOptions } from '@server/interface'

/**查询邮件列表**/
export class FetchMailListOptions extends PickType(OmixColumnOptions, ['page', 'size']) {
    @ApiProperty({ description: '邮件文件夹', example: 'INBOX', required: false })
    @IsOptional()
    @IsString({ message: 'folder必须是字符串' })
    folder: string = 'INBOX'

    @ApiProperty({ description: '邮箱账号ID', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'accountId必须是数字' })
    @Type(type => Number)
    accountId: number

    @ApiProperty({ description: '搜索关键词', required: false })
    @IsOptional()
    @IsString({ message: 'keyword必须是字符串' })
    keyword: string
}

/**发送邮件**/
export class SendMailOptions {
    @ApiProperty({ description: '邮箱账号ID' })
    @IsNotEmpty({ message: '邮箱账号ID必填' })
    @IsNumber({}, { message: 'accountId必须是数字' })
    @Type(type => Number)
    accountId: number

    @ApiProperty({ description: '收件人邮箱' })
    @IsNotEmpty({ message: '收件人邮箱必填' })
    to: string

    @ApiProperty({ description: '抄送', required: false })
    @IsOptional()
    @IsString({ message: 'cc必须是字符串' })
    cc: string

    @ApiProperty({ description: '密送', required: false })
    @IsOptional()
    @IsString({ message: 'bcc必须是字符串' })
    bcc: string

    @ApiProperty({ description: '邮件主题' })
    @IsNotEmpty({ message: '邮件主题必填' })
    subject: string

    @ApiProperty({ description: '邮件正文 HTML' })
    @IsNotEmpty({ message: '邮件正文必填' })
    html: string

    @ApiProperty({ description: '附件列表', required: false })
    @IsOptional()
    attachments: Array<{ name: string; size: number }>
}
