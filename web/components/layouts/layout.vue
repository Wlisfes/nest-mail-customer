<script lang="tsx">
import { defineComponent, h, computed, watch, KeepAlive, Transition } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { NIcon, NDropdown, type MenuOption } from 'naive-ui'
import { useMouse, useStore, useTabs } from '@/store'
import { useCoutext, AUTH } from '@/hooks'

export default defineComponent({
    name: 'Layout',
    setup(props) {
        const route = useRoute()
        const router = useRouter()
        const { inverted } = useStore(useMouse)
        const tabsStore = useTabs()

        const menuValue = computed(() => route.path)

        const menuOptions: MenuOption[] = [
            {
                label: '仪表盘',
                key: '/manager/dashboard',
                icon: () => h('span', { style: { fontSize: '18px' } }, '📊')
            },
            {
                label: '收件箱',
                key: '/manager/inbox',
                icon: () => h('span', { style: { fontSize: '18px' } }, '📥')
            },
            {
                label: '已发送',
                key: '/manager/sent',
                icon: () => h('span', { style: { fontSize: '18px' } }, '📤')
            },
            {
                label: '草稿箱',
                key: '/manager/drafts',
                icon: () => h('span', { style: { fontSize: '18px' } }, '📝')
            },
            {
                label: '写邮件',
                key: '/manager/compose',
                icon: () => h('span', { style: { fontSize: '18px' } }, '✉')
            },
            { type: 'divider', key: 'divider-1' },
            {
                label: '邮箱账号',
                key: '/manager/accounts',
                icon: () => h('span', { style: { fontSize: '18px' } }, '👤')
            },
            {
                label: '黑名单',
                key: '/manager/blacklist',
                icon: () => h('span', { style: { fontSize: '18px' } }, '🚫')
            },
            { type: 'divider', key: 'divider-2' },
            {
                label: '邮件模板',
                key: '/manager/templates',
                icon: () => h('span', { style: { fontSize: '18px' } }, '📧')
            },
            {
                label: '模板变量',
                key: '/manager/template-vars',
                icon: () => h('span', { style: { fontSize: '18px' } }, '🔤')
            },
            { type: 'divider', key: 'divider-3' },
            {
                label: '平台配置',
                key: '/manager/settings',
                icon: () => h('span', { style: { fontSize: '18px' } }, '⚙')
            }
        ]

        function handleMenuUpdate(key: string) {
            router.push(key)
        }

        const { cookies } = useCoutext()

        function handleLogout() {
            cookies.remove(AUTH.APP_NEST_TOKEN)
            router.replace('/main/login')
        }

        const userDropdownOptions = [{ label: '退出登录', key: 'logout', icon: () => h('span', { style: { fontSize: '14px' } }, '🚪') }]

        function handleUserAction(key: string) {
            if (key === 'logout') handleLogout()
        }

        // 路由名称到图标的映射
        const tabIconMap: Record<string, string> = {
            ManagerDashboard: '📊',
            ManagerInbox: '📥',
            ManagerSent: '📤',
            ManagerDrafts: '📝',
            ManagerCompose: '✉',
            ManagerAccounts: '👤',
            ManagerBlacklist: '🚫',
            ManagerSettings: '⚙',
            ManagerMailDetail: '📧',
            ManagerTemplates: '📧',
            ManagerTemplateEditorNew: '✏️',
            ManagerTemplateEditor: '✏️',
            ManagerTemplateSend: '📨',
            ManagerTemplateVars: '🔤',
        }

        // 初始化固定标签（仪表盘）
        tabsStore.addTab({ name: 'ManagerDashboard', path: '/manager/dashboard', title: '仪表盘', icon: '📊', affix: true })

        // 监听路由，自动添加标签
        watch(
            () => route.fullPath,
            () => {
                const name = route.name as string
                // 从路由原始定义中取 title，避免被 SSR SEO 拼接污染 route.meta.title
                const originalRoute = router.getRoutes().find(r => r.name === name)
                const defaultTitle = (originalRoute?.meta?.title as string) || name
                // 优先使用 query 中携带的标签标题（如邮件主题），实现即时显示
                const queryTitle = route.query.tabTitle as string
                const title = queryTitle || defaultTitle
                const affix = (originalRoute?.meta?.affix as boolean) || false
                const icon = tabIconMap[name] || '📄'
                if (name && title && route.meta?.AUTH === 'AUTH') {
                    tabsStore.addTab({ name, path: route.fullPath, title, icon, affix })
                }
            },
            { immediate: true }
        )

        // 关闭标签
        function handleCloseTab(path: string) {
            const currentPath = route.fullPath
            const nextPath = tabsStore.removeTab(path)
            if (nextPath && path === currentPath) {
                router.push(nextPath)
            }
        }

        // 右键菜单选项
        const contextMenuOptions = [
            { label: '关闭其他', key: 'closeOthers' },
            { label: '关闭全部', key: 'closeAll' }
        ]

        function handleContextMenuAction(key: string, tabPath: string) {
            const currentPath = route.fullPath
            if (key === 'closeOthers') {
                tabsStore.removeOtherTabs(tabPath)
                if (currentPath !== tabPath) {
                    const tab = tabsStore.state.tabs.find(t => t.path === tabPath)
                    if (tab) router.push(tab.path)
                }
            } else if (key === 'closeAll') {
                const path = tabsStore.removeAllTabs()
                router.push(path)
            }
        }

        return () => (
            <n-layout class="h-full overflow-hidden" has-sider>
                <n-layout-sider
                    bordered
                    collapse-mode="width"
                    collapsed-width={64}
                    width={220}
                    native-scrollbar={false}
                    show-trigger="bar"
                    inverted={inverted.value}
                    content-class="flex flex-col"
                >
                    <div class="flex items-center gap-8 p-16 p-be-8">
                        <n-text class="text-18" style={{ fontWeight: 700 }}>
                            📧
                        </n-text>
                        <n-text class="text-16" style={{ fontWeight: 600 }}>
                            Mail Server
                        </n-text>
                    </div>
                    <n-menu
                        value={menuValue.value}
                        options={menuOptions}
                        inverted={inverted.value}
                        root-indent={16}
                        indent={24}
                        onUpdate:value={handleMenuUpdate}
                    />
                </n-layout-sider>
                <n-layout content-class="flex flex-col overflow-hidden">
                    <n-layout-header class="w-full h-52 flex items-center justify-between p-inline-20 overflow-hidden" bordered>
                        <n-text class="text-16" style={{ fontWeight: 600 }}>
                            Mail Server
                        </n-text>
                        <div class="flex items-center gap-8">
                            <layout-common-deploy></layout-common-deploy>
                            <n-dropdown options={userDropdownOptions} onSelect={handleUserAction} trigger="click" placement="bottom-end">
                                <n-button text focusable={false} class="flex items-center gap-6" style={{ padding: '4px 8px' }}>
                                    <span style={{ fontSize: '18px' }}>👤</span>
                                    <span style={{ fontSize: '12px' }}>▼</span>
                                </n-button>
                            </n-dropdown>
                        </div>
                    </n-layout-header>
                    {/* 标签栏 */}
                    <div class="layout-tabs-bar">
                        <div class="layout-tabs-scroll">
                            {tabsStore.state.tabs.map(tab => (
                                <n-dropdown
                                    key={tab.path}
                                    trigger="context-menu"
                                    placement="bottom-start"
                                    options={contextMenuOptions}
                                    onSelect={(key: string) => handleContextMenuAction(key, tab.path)}
                                >
                                    <div
                                        class={['layout-tab-item', { active: route.fullPath === tab.path }]}
                                        onClick={() => router.push(tab.path)}
                                    >
                                        <span class="layout-tab-icon">{tab.icon}</span>
                                        <span class="layout-tab-title">{tab.title}</span>
                                        {!tab.affix && (
                                            <span
                                                class="layout-tab-close"
                                                onClick={(e: MouseEvent) => {
                                                    e.stopPropagation()
                                                    handleCloseTab(tab.path)
                                                }}
                                            >
                                                ✕
                                            </span>
                                        )}
                                    </div>
                                </n-dropdown>
                            ))}
                        </div>
                    </div>
                    <n-layout-content
                        class="flex-1 overflow-hidden"
                        content-class="h-full flex flex-col"
                        native-scrollbar={false}
                        scrollbar-props={{ size: 100, trigger: 'none' }}
                    >
                        <n-element class="flex flex-col flex-1 overflow-hidden">
                            <RouterView>
                                {{
                                    default: ({ Component, route: r }: any) => (
                                        <Transition name="page-fade" mode="out-in">
                                        <KeepAlive include={tabsStore.cachedNames}>
                                                <Component key={r.fullPath} />
                                            </KeepAlive>
                                        </Transition>
                                    )
                                }}
                            </RouterView>
                        </n-element>
                    </n-layout-content>
                </n-layout>
            </n-layout>
        )
    }
})
</script>

<style lang="scss" scoped>
.layout-tabs-bar {
    display: flex;
    align-items: center;
    background: var(--n-color, inherit);
    padding: 0 12px;
    min-height: 38px;
    overflow: hidden;
    transition: background-color 0.3s var(--n-bezier);
}

.layout-tabs-scroll {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    flex: 1;
    padding: 5px 0;
    &::-webkit-scrollbar {
        height: 0;
    }
}

.layout-tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 13px;
    transition: all 0.3s var(--n-bezier);
    background: var(--n-color-hover, rgba(255, 255, 255, 0.04));
    border: 1px solid transparent;
    user-select: none;
    opacity: 0.7;

    &:hover {
        opacity: 1;
        background: var(--n-color-hover, rgba(255, 255, 255, 0.06));
    }

    &.active {
        opacity: 1;
        background: var(--primary-color-hover, rgba(99, 102, 241, 0.15));
        color: var(--primary-color);
    }
}

.layout-tab-icon {
    font-size: 12px;
    line-height: 1;
}

.layout-tab-title {
    line-height: 1;
}

.layout-tab-close {
    font-size: 10px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0.5;
    transition: all 0.2s ease;
    &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.15);
    }
}
</style>
