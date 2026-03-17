import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail, Length, IsOptional } from 'class-validator'

/**注册入参**/
export class BodyUserRegister {
    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称必填' })
    @Length(2, 32, { message: '昵称必须保持2~32位' })
    nickname: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    email: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    password: string

    @ApiProperty({ description: '邮箱验证码', example: '495673' })
    @IsOptional()
    code: string
}

/**登录入参**/
export class BodyUserLogin {
    @ApiProperty({ description: '用户名或邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '用户名或邮箱必填' })
    email: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    password: string

    @ApiProperty({ description: '安全验证码', example: '1234' })
    @IsOptional()
    code: string
}

/**发送邮箱验证码入参**/
export class BodySendEmailCode {
    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    email: string
}
