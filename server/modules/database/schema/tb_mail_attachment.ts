import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_attachment', comment: '邮件附件表' })
export class SchemaMailAttachment extends BaseAdapter {
    @ApiProperty({ description: '邮件ID' })
    @IsNotEmpty({ message: '邮件ID必填' })
    @Column({ name: 'message_id', comment: '关联邮件keyId', type: 'int', nullable: false })
    messageId: number

    @ApiProperty({ description: '文件名' })
    @Column({ name: 'filename', comment: '文件名', length: 255, nullable: false })
    filename: string

    @ApiProperty({ description: '文件大小' })
    @Column({ name: 'size', comment: '文件大小(字节)', type: 'int', nullable: false })
    size: number

    @ApiProperty({ description: 'MIME类型' })
    @Column({ name: 'mime_type', comment: 'MIME类型', length: 128, nullable: true })
    mimeType: string

    @ApiProperty({ description: '文件路径' })
    @Column({ name: 'file_path', comment: '文件存储路径', length: 512, nullable: true })
    filePath: string

    @ApiProperty({ description: 'IMAP part ID' })
    @Column({ name: 'part_id', comment: 'IMAP part ID', length: 64, nullable: true })
    partId: string
}