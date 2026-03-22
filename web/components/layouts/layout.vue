<script lang="tsx">
import { defineComponent, h, computed, Transition } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { NIcon, type MenuOption } from 'naive-ui'
import { useMouse, useStore } from '@/store'

export default defineComponent({
    name: 'Layout',
    setup(props) {
        const route = useRoute()
        const router = useRouter()
        const { inverted } = useStore(useMouse)

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
            {
                label: '平台配置',
                key: '/manager/settings',
                icon: () => h('span', { style: { fontSize: '18px' } }, '⚙')
            }
        ]

        function handleMenuUpdate(key: string) {
            router.push(key)
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
                        <layout-common-deploy></layout-common-deploy>
                    </n-layout-header>
                    <n-layout-content
                        class="flex-1 overflow-hidden"
                        content-class="min-h-full flex flex-col"
                        native-scrollbar={false}
                        scrollbar-props={{ size: 100, trigger: 'none' }}
                    >
                        <n-element class="flex flex-col flex-1 overflow-hidden">
                            <RouterView>
                                {{
                                    default: ({ Component, route }: any) => (
                                        <Transition name="page-fade" mode="out-in">
                                            <Component key={route.fullPath} />
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
