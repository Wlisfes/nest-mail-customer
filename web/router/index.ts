import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import { useCoutext, AUTH } from '@/hooks'
import Layout from '@/components/layouts/layout.vue'

export function createRouter(options: Omix<{ ssr: boolean }>) {
    const router = _createRouter({
        history: options.ssr ? createMemoryHistory() : createWebHistory(),
        routes: [
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
                        path: '/manager',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/index.vue')
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

    /**路由守卫**/
    router.beforeEach((to, from, next) => {
        /**SSR 模式下跳过 auth guard，避免 hydration mismatch**/
        // if (options.ssr) {
        //     return next()
        // }
        const { cookies } = useCoutext()
        const token = cookies.get(AUTH.APP_NEST_TOKEN)
        const authMode = to.meta?.AUTH as string
        if (authMode === 'AUTH' && !token) {
            /**需要登录但未登录，跳转登录页**/
            return next({ path: '/main/login', replace: true })
        }
        if (authMode === 'AUTH_NONE' && token) {
            /**已登录不可进入登录/注册页，跳转管理页**/
            return next({ path: '/manager', replace: true })
        }
        /**NONE 或其他情况，直接放行**/
        return next()
    })
    return router
}
