import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@server/app.module'
import { createViteServer } from '@server/vite.server'
import { resolve } from 'path'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'

/**文档挂载**/
export async function setupSwagger(app: NestExpressApplication) {
    /**允许跨域**/
    app.enableCors()
    /**解析body参数**/
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    /**全局注册验证管道**/
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    /**初始化文档**/
    const builder = new DocumentBuilder()
        .setTitle(process.env.NODE_SEO_TITLE)
        .setDescription(process.env.NODE_SEO_DESCRIPTION)
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'apiKey', in: 'header', name: 'authorization' }, 'authorization')
        // .addGlobalParameters({ name: 'platform', in: 'header' })
        .build()
    const document = SwaggerModule.createDocument(app, builder)
    return SwaggerModule.setup('/api/swagger', app, document, {
        customSiteTitle: `${process.env.NODE_SEO_TITLE} - ${process.env.NODE_SEO_SUBTITLE}`,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelExpandDepth: 5,
            filter: true,
            docExpansion: 'none'
        }
    })
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true
    })
    if (process.env.NODE_ENV === 'production') {
        app.useStaticAssets(resolve(__dirname, '../build/client'), { index: false })
        app.use(compression())
    } else {
        const vite = await createViteServer()
        await app.use(vite.middlewares)
    }
    return await setupSwagger(app).then(async () => {
        return await app.listen(process.env.NODE_PORT).then(() => {
            console.log(
                `Nest服务启动[${process.env.NODE_ENV}]:`,
                `http://localhost:${process.env.NODE_PORT}`,
                `http://localhost:${process.env.NODE_PORT}/api/swagger`
            )
        })
    })
}
bootstrap()
