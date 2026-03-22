import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_mail_blacklist', comment: '黑名单表' })
export class SchemaMailBlacklist extends BaseAdapter {
    @ApiProperty({ description: '用户ID' })
    @IsNotEmpty({ message: '用户ID必填' })
    @Column({ name: 'user_id', comment: '关联用户keyId', type: 'int', nullable: false })
    userId: number

    @ApiProperty({ description: '拉黑邮箱地址', example: 'spam@example.com' })
    @IsNotEmpty({ message: '邮箱地址必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ name: 'email', comment: '拉黑邮箱地址', length: 128, nullable: false })
    email: string

    @ApiProperty({ description: '拉黑原因' })
    @IsOptional()
    @Column({ name: 'reason', comment: '拉黑原因', length: 255, nullable: true })
    reason: string
}
