import { App } from 'vue'
import { Request } from 'express'
import { ctx } from '@/hooks'

export function CoutextServer(ssr: boolean, request?: Request) {
    return {
        install(app: App) {
            if (ssr && request) {
                ctx.value = request
            }
        }
    }
}
