import { Entity, Column, Unique } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Unique(['userId', 'varKey'])
@Entity({ name: 'tb_mail_template_variable', comment: '邮件模板变量表' })
export class SchemaMailTemplateVariable extends BaseAdapter {
    @ApiProperty({ description: '用户ID' })
    @IsNotEmpty({ message: '用户ID必填' })
    @Column({ name: 'user_id', comment: '关联用户keyId', type: 'int', nullable: false })
    userId: number

    @ApiProperty({ description: '变量显示名' })
    @IsNotEmpty({ message: '变量名称必填' })
    @Column({ name: 'name', comment: '变量显示名', length: 50, nullable: false })
    name: string

    @ApiProperty({ description: '变量键' })
    @IsNotEmpty({ message: '变量键必填' })
    @Column({ name: 'var_key', comment: '变量键', length: 50, nullable: false })
    varKey: string

    @ApiProperty({ description: '默认值' })
    @IsOptional()
    @Column({ name: 'default_value', comment: '默认值', length: 500, nullable: true, default: '' })
    defaultValue: string
}
