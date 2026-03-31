import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_template_category', comment: '邮件模板分类表' })
export class SchemaMailTemplateCategory extends BaseAdapter {
    @ApiProperty({ description: '用户ID' })
    @IsNotEmpty({ message: '用户ID必填' })
    @Column({ name: 'user_id', comment: '关联用户keyId', type: 'int', nullable: false })
    userId: number

    @ApiProperty({ description: '分类名称' })
    @IsNotEmpty({ message: '分类名称必填' })
    @Column({ name: 'name', comment: '分类名称', length: 50, nullable: false })
    name: string

    @ApiProperty({ description: '排序号' })
    @IsOptional()
    @Column({ name: 'sort', comment: '排序号', type: 'int', nullable: false, default: 0 })
    sort: number
}
