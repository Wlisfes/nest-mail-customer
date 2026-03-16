import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail } from 'class-validator'
import { BaseAdapter } from '@server/modules/database/database.adapter'

@Entity({ name: 'tb_user', comment: '用户表' })
export class SchemaUser extends BaseAdapter {
    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称必填' })
    @Length(2, 32, { message: '昵称必须保持2~32位' })
    @Column({ name: 'nickname', comment: '昵称', length: 32, nullable: false })
    nickname: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ name: 'email', comment: '邮箱', length: 128, nullable: false })
    email: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Column({ name: 'avatar', comment: '头像', length: 255, nullable: true })
    avatar: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    @Column({
        name: 'password',
        comment: '密码',
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string
}
