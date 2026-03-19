import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'
import { MailProvider } from '@server/modules/database/database.enums'

@Entity({ name: 'tb_mail_account', comment: '邮箱账号表' })
export class SchemaMailAccount extends BaseAdapter {
    @ApiProperty({ description: '用户ID' })
    @IsNotEmpty({ message: '用户ID必填' })
    @Column({ name: 'user_id', comment: '关联用户keyId', type: 'int', nullable: false })
    userId: number

    @ApiProperty({ description: '邮箱地址', example: 'test@qq.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ name: 'email', comment: '邮箱地址', length: 128, nullable: false })
    email: string

    @ApiProperty({ description: '邮箱平台', example: 'qq', enum: MailProvider })
    @IsNotEmpty({ message: '邮箱平台必填' })
    @IsEnum(MailProvider, { message: '不支持的邮箱平台' })
    @Column({ name: 'provider', comment: '邮箱平台', length: 32, nullable: false })
    provider: MailProvider

    @ApiProperty({ description: 'IMAP服务器地址' })
    @Column({ name: 'imap_host', comment: 'IMAP服务器地址', length: 128, nullable: false })
    imapHost: string

    @ApiProperty({ description: 'IMAP端口' })
    @Column({ name: 'imap_port', comment: 'IMAP端口', type: 'int', nullable: false, default: 993 })
    imapPort: number

    @ApiProperty({ description: 'SMTP服务器地址' })
    @Column({ name: 'smtp_host', comment: 'SMTP服务器地址', length: 128, nullable: false })
    smtpHost: string

    @ApiProperty({ description: 'SMTP端口' })
    @Column({ name: 'smtp_port', comment: 'SMTP端口', type: 'int', nullable: false, default: 465 })
    smtpPort: number

    @ApiProperty({ description: '授权码' })
    @IsNotEmpty({ message: '授权码必填' })
    @Column({ name: 'auth_code', comment: '授权码', length: 255, nullable: false })
    authCode: string

    @ApiProperty({ description: '状态 0=正常 1=连接失败' })
    @Column({ name: 'status', comment: '状态 0=正常 1=连接失败', type: 'tinyint', nullable: false, default: 0 })
    status: number
}
