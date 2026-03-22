/// <reference types="vite/client" />
import { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { ResultResolver } from '@/interface'
import { Request } from 'express'
import { Pinia } from 'pinia'
import { Logger } from 'winston'

/**seo相关配置**/
export interface MateServerOptions extends Omix {
    /**标题**/
    title?: string
    /**关键字**/
    keywords?: string
    /**说明**/
    description?: string
}

/**服务端异步获取数据上下文**/
export interface ContextServerOptions {
    /**路由信息**/
    route: RouteLocationNormalizedLoaded
    /**日志**/
    logger: Logger
    /**状态管理**/
    pinia: Pinia
    /**路由**/
    router: Router
    /**请求**/
    request: Request
    /**环境变量**/
    env: ImportMetaEnv
}

declare global {
    /**axios扩展**/
    interface AxiosRequest extends AxiosInstance {
        <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R & ResultResolver<T>>
        <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R & ResultResolver<T>>
    }
    /**应用启动参数**/
    export interface AppOptions extends Omix {
        /**是否服务端渲染**/
        ssr: boolean
        /**请求**/
        request?: Request
    }
}

declare module 'vue' {
    interface ComponentCustomOptions {
        httpServer?(context: ContextServerOptions): Promise<any>
        httpMetaServer?(context: ContextServerOptions): MateServerOptions | Promise<MateServerOptions>
    }
}

declare module 'vue-router' {
    /**扩展meta字段**/
    interface RouteMeta extends MateServerOptions {
        AUTH: 'NONE' | 'AUTH' | 'AUTH_NONE'
    }
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
