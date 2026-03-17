import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty } from 'class-validator'
import { compareSync } from 'bcryptjs'
import { pick } from 'lodash-es'
import { Logger, AutoDescriptor } from '@server/modules/logger/logger.service'
import { DatabaseService } from '@server/modules/database/database.service'

@Injectable()
export class UserService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }
}
