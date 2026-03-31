import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_template', comment: '邮件模板表' })
export class SchemaMailTemplate extends BaseAdapter {
    @ApiProperty({ description: '用户ID' })
    @IsNotEmpty({ message: '用户ID必填' })
    @Column({ name: 'user_id', comment: '关联用户keyId', type: 'int', nullable: false })
    userId: number

    @ApiProperty({ description: '分类ID' })
    @IsOptional()
    @Column({ name: 'category_id', comment: '分类ID', type: 'int', nullable: true })
    categoryId: number

    @ApiProperty({ description: '模板名称' })
    @IsNotEmpty({ message: '模板名称必填' })
    @Column({ name: 'name', comment: '模板名称', length: 100, nullable: false })
    name: string

    @ApiProperty({ description: '模板描述' })
    @IsOptional()
    @Column({ name: 'description', comment: '模板描述', length: 500, nullable: true, default: '' })
    description: string

    @ApiProperty({ description: 'MJML源码' })
    @IsOptional()
    @Column({ name: 'mjml_source', comment: 'MJML源码', type: 'mediumtext', nullable: true })
    mjmlSource: string

    @ApiProperty({ description: '编译后HTML' })
    @IsOptional()
    @Column({ name: 'html_content', comment: '编译后HTML', type: 'mediumtext', nullable: true })
    htmlContent: string

    @ApiProperty({ description: '画布组件树JSON' })
    @IsOptional()
    @Column({ name: 'canvas_json', comment: '编辑器画布组件树JSON', type: 'text', nullable: true })
    canvasJson: string

    @ApiProperty({ description: '缩略图URL' })
    @IsOptional()
    @Column({ name: 'thumbnail', comment: '缩略图URL', length: 500, nullable: true, default: '' })
    thumbnail: string

    @ApiProperty({ description: '是否预设模板' })
    @IsOptional()
    @Column({ name: 'is_preset', comment: '0=用户模板 1=预设模板', type: 'tinyint', nullable: false, default: 0 })
    isPreset: number
}
