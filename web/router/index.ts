import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import { useCoutext, AUTH } from '@/hooks'
import MainLayout from '@/components/layouts/main-layout.vue'
import WebLayout from '@/components/layouts/web-layout.vue'
import Layout from '@/components/layouts/layout.vue'

export function createRouter(options: Omix<{ ssr: boolean }>) {
    const router = _createRouter({
        history: options.ssr ? createMemoryHistory() : createWebHistory(),
        routes: [
            {
                path: '/',
                redirect: '/manager/dashboard',
                name: Layout.name,
                component: Layout,
                children: [
                    {
                        path: '/manager/dashboard',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-dashboard.vue')
                    },
                    {
                        path: '/manager/inbox',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-inbox.vue')
                    },
                    {
                        path: '/manager/sent',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-sent.vue')
                    },
                    {
                        path: '/manager/drafts',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-drafts.vue')
                    },
                    {
                        path: '/manager/compose',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-compose.vue')
                    },
                    {
                        path: '/manager/accounts',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-accounts.vue')
                    },
                    {
                        path: '/manager/blacklist',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-blacklist.vue')
                    },
                    {
                        path: '/manager/settings',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-settings.vue')
                    },
                    {
                        path: '/manager/mail/:id',
                        meta: { AUTH: 'AUTH' },
                        component: () => import('@/views/manager/pages/manager-mail-detail.vue')
                    },
                    {
                        path: '/:pathMatch(.*)*',
                        meta: { AUTH: 'NONE' },
                        component: () => import('@/views/error/404.vue')
                    }
                ]
            },
            {
                path: '/web',
                redirect: '/web/client',
                name: WebLayout.name,
                component: WebLayout,
                children: [
                    {
                        path: '/web/client',
                        meta: { AUTH: 'NONE' },
                        component: () => import('@/views/home/index.vue')
                    },
                    {
                        path: '/web/:pathMatch(.*)*',
                        meta: { AUTH: 'NONE' },
                        component: () => import('@/views/error/404.vue')
                    }
                ]
            },
            {
                path: '/main',
                redirect: '/main/login',
                name: MainLayout.name,
                component: MainLayout,
                children: [
                    {
                        path: '/main/login',
                        meta: { AUTH: 'AUTH_NONE' },
                        component: () => import('@/views/main/login/login.vue')
                    },
                    {
                        path: '/main/register',
                        meta: { AUTH: 'AUTH_NONE' },
                        component: () => import('@/views/main/register/register.vue')
                    }
                ]
            }
        ]
    })

    /**路由守卫**/
    router.beforeEach((to, from, next) => {
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
