import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_draft', comment: '草稿箱表' })
export class SchemaMailDraft extends BaseAdapter {
    @ApiProperty({ description: '邮箱账号ID' })
    @IsNotEmpty({ message: '邮箱账号ID必填' })
    @Column({ name: 'account_id', comment: '关联邮箱账号keyId', type: 'int', nullable: false })
    accountId: number

    @ApiProperty({ description: '收件人地址' })
    @IsOptional()
    @Column({ name: 'to_address', comment: '收件人地址', length: 512, nullable: true })
    toAddress: string

    @ApiProperty({ description: '邮件主题' })
    @IsOptional()
    @Column({ name: 'subject', comment: '邮件主题', length: 512, nullable: true })
    subject: string

    @ApiProperty({ description: '邮件正文 HTML' })
    @IsOptional()
    @Column({ name: 'content', comment: '邮件正文', type: 'text', nullable: true })
    content: string

    @ApiProperty({ description: '附件信息 JSON' })
    @IsOptional()
    @Column({ name: 'attachments', comment: '附件信息JSON', type: 'text', nullable: true })
    attachments: string
}
