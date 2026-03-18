import { App } from 'vue'
import { Request } from 'express'

export function CoutextServer(ssr: boolean, request?: Request) {
    return {
        install(app: App) {
            app.config.globalProperties.$ctx = request
        }
    }
}
