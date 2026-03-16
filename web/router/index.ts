import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import Layout from '@/components/layouts/layout.vue'

export function createRouter(options: Omix<{ ssr: boolean }>) {
    return _createRouter({
        history: options.ssr ? createMemoryHistory() : createWebHistory(),
        routes: [
            {
                path: '/',
                name: Layout.name,
                component: Layout,
                children: [
                    {
                        path: '/',
                        meta: { AUTH: 'NONE' },
                        component: () => import('@/views/home/index.vue')
                    },
                    {
                        path: '/main/login',
                        meta: { AUTH: 'AUTH_NONE' },
                        component: () => import('@/views/main/login/login.vue')
                    },
                    {
                        path: '/main/register',
                        meta: { AUTH: 'AUTH_NONE' },
                        component: () => import('@/views/main/register/register.vue')
                    },
                    {
                        path: '/:pathMatch(.*)*',
                        meta: { AUTH: 'NONE' },
                        component: () => import('@/views/error/404.vue')
                    }
                ]
            }
        ]
    })
}
