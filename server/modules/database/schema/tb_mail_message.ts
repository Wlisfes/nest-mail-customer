import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_message', comment: '邮件缓存表' })
export class SchemaMailMessage extends BaseAdapter {
    @ApiProperty({ description: '邮箱账号ID' })
    @IsNotEmpty({ message: '邮箱账号ID必填' })
    @Column({ name: 'account_id', comment: '关联邮箱账号keyId', type: 'int', nullable: false })
    accountId: number

    @ApiProperty({ description: '邮件唯一标识' })
    @Column({ name: 'message_id', comment: '邮件Message-ID', length: 255, nullable: true })
    messageId: string

    @ApiProperty({ description: 'IMAP UID' })
    @Column({ name: 'uid', comment: 'IMAP UID', type: 'int', nullable: false })
    uid: number

    @ApiProperty({ description: '邮件文件夹' })
    @Column({ name: 'folder', comment: '邮件文件夹', length: 64, nullable: false, default: 'INBOX' })
    folder: string

    @ApiProperty({ description: '邮件主题' })
    @Column({ name: 'subject', comment: '邮件主题', length: 512, nullable: true })
    subject: string

    @ApiProperty({ description: '发件人地址' })
    @Column({ name: 'from_address', comment: '发件人地址', length: 255, nullable: true })
    fromAddress: string

    @ApiProperty({ description: '收件人地址' })
    @Column({ name: 'to_address', comment: '收件人地址', length: 512, nullable: true })
    toAddress: string

    @ApiProperty({ description: '邮件时间' })
    @Column({ name: 'date', comment: '邮件时间', type: 'datetime', nullable: true })
    date: Date

    @ApiProperty({ description: '是否已读' })
    @Column({ name: 'seen', comment: '是否已读', type: 'tinyint', nullable: false, default: 0 })
    seen: number

    @ApiProperty({ description: '是否有附件' })
    @Column({ name: 'has_attachment', comment: '是否有附件', type: 'tinyint', nullable: false, default: 0 })
    hasAttachment: number

    @ApiProperty({ description: '邮件摘要' })
    @Column({ name: 'snippet', comment: '邮件摘要', type: 'text', nullable: true })
    snippet: string
}
