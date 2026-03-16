import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from '@server/modules/database/database.service'
import * as schema from '@server/modules/database/database.schema'

@Global()
@Module({
    providers: [DatabaseService],
    exports: [DatabaseService],
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    type: 'mysql',
                    host: configService.get('ORM_HOST'),
                    port: configService.get('ORM_PORT'),
                    username: configService.get('ORM_USERNAME'),
                    password: configService.get('ORM_PASSWORD'),
                    database: configService.get('ORM_DATABASE'),
                    charset: configService.get('ORM_CHARSET'),
                    synchronize: configService.get('NODE_ENV') === 'development',
                    entities: Object.values(schema)
                }
            }
        }),
        TypeOrmModule.forFeature(Object.values(schema))
    ]
})
export class DatabaseModule {}
