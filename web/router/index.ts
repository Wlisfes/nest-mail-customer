import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export function createRouter(options: Omix<{ ssr: boolean }>) {
    return _createRouter({
        history: options.ssr ? createMemoryHistory() : createWebHistory(),
        routes: [
            {
                path: '/',
                meta: { AUTH: 'NONE' },
                component: () => import('@/views/home/index.vue')
            }
        ]
    })
}
