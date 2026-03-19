import { PickType, IntersectionType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsNumber, IsEmail, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { OmixColumnOptions, OmixPayloadOptions } from '@server/interface'

/**收件箱查询**/
export class InboxQueryOptions extends PickType(OmixColumnOptions, ['page', 'size']) {
    @ApiProperty({ description: '邮箱账号ID', example: 1 })
    @IsNotEmpty({ message: 'accountId必填' })
    @IsNumber({}, { message: 'accountId必须是数字' })
    @Type(type => Number)
    accountId: number
}

/**邮件详情查询**/
export class MailDetailOptions {
    @ApiProperty({ description: '邮箱账号ID', example: 1 })
    @IsNotEmpty({ message: 'accountId必填' })
    @IsNumber({}, { message: 'accountId必须是数字' })
    @Type(type => Number)
    accountId: number

    @ApiProperty({ description: '邮件UID', example: 1 })
    @IsNotEmpty({ message: 'uid必填' })
    @IsNumber({}, { message: 'uid必须是数字' })
    @Type(type => Number)
    uid: number
}

/**发送邮件**/
export class SendMailOptions {
    @ApiProperty({ description: '邮箱账号ID', example: 1 })
    @IsNotEmpty({ message: 'accountId必填' })
    @IsNumber({}, { message: 'accountId必须是数字' })
    @Type(type => Number)
    accountId: number

    @ApiProperty({ description: '收件人邮箱', example: 'test@qq.com' })
    @IsNotEmpty({ message: '收件人邮箱必填' })
    @IsEmail({}, { message: '收件人邮箱格式错误' })
    to: string

    @ApiProperty({ description: '邮件主题', example: '测试邮件' })
    @IsNotEmpty({ message: '邮件主题必填' })
    subject: string

    @ApiProperty({ description: '邮件正文HTML', example: '<p>Hello</p>' })
    @IsNotEmpty({ message: '邮件正文必填' })
    html: string
}
