import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@server/modules/config/config.module'
import { UserAgentMiddleware, LoggerMiddleware } from '@server/middleware'
import { AuthGuard } from '@server/guard'
import { TransformInterceptor } from '@server/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@server/filters/http-exception.filter'
import { LoggerModule } from '@server/modules/logger/logger.module'
import { JwtModule } from '@server/modules/jwt/jwt.module'
import { RedisModule } from '@server/modules/redis/redis.module'
import { DatabaseModule } from '@server/modules/database/database.module'
import { MailModule } from '@server/modules/mail/mail.module'
import { UserModule } from '@server/modules/user/user.module'
import { MailAccountModule } from '@server/modules/mail-account/mail-account.module'
import { MailMessageModule } from '@server/modules/mail-message/mail-message.module'
import { MailDraftModule } from '@server/modules/mail-draft/mail-draft.module'
import { MailBlacklistModule } from '@server/modules/mail-blacklist/mail-blacklist.module'
import { MailTemplateModule } from '@server/modules/mail-template/mail-template.module'
import { MailTemplateCategoryModule } from '@server/modules/mail-template-category/mail-template-category.module'
import { MailTemplateVariableModule } from '@server/modules/mail-template-variable/mail-template-variable.module'
import { DashboardModule } from '@server/modules/dashboard/dashboard.module'
import { AttachmentModule } from '@server/modules/attachment/attachment.module'
import { AppController } from '@server/app.controller'

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        JwtModule,
        RedisModule,
        DatabaseModule,
        MailModule,
        UserModule,
        MailAccountModule,
        MailMessageModule,
        MailDraftModule,
        MailBlacklistModule,
        MailTemplateModule,
        MailTemplateCategoryModule,
        MailTemplateVariableModule,
        DashboardModule,
        AttachmentModule
    ],
    controllers: [AppController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter }
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware).forRoutes('*')
        consumer.apply(LoggerMiddleware).forRoutes({ path: 'api/*', method: RequestMethod.ALL })
    }
}
