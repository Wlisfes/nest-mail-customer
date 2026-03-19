<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMouse, useStore } from '@/store'
import { useCoutext, AUTH } from '@/hooks'

export default defineComponent({
    name: 'MailToolbar',
    props: {
        userEmail: { type: String, default: '' }
    },
    emits: ['search'],
    setup(props, { emit }) {
        const router = useRouter()
        const { theme, fetchThemeUpdate } = useStore(useMouse)
        const { cookies } = useCoutext()
        const searchQuery = ref('')

        /**退出登录**/
        function handleLogout() {
            window.$dialog?.warning({
                title: '退出登录',
                content: '确定要退出登录吗？',
                positiveText: '确认',
                negativeText: '取消',
                onPositiveClick: () => {
                    cookies.remove(AUTH.APP_NEST_TOKEN)
                    router.replace('/main/login')
                }
            })
        }

        /**搜索**/
        function handleSearch() {
            emit('search', searchQuery.value)
        }

        return () => (
            <div class="mail-toolbar">
                {/* 搜索区域 */}
                <div class="toolbar-search">
                    <n-input
                        v-model:value={searchQuery.value}
                        placeholder="搜索邮件..."
                        clearable
                        round
                        size="small"
                        onKeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                    >
                        {{
                            prefix: () => (
                                <n-icon size={16} style={{ color: 'var(--n-text-color-3)' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                </n-icon>
                            )
                        }}
                    </n-input>
                </div>

                {/* 右侧操作区 */}
                <div class="toolbar-actions">
                    {/* 通知 */}
                    <n-tooltip trigger="hover">
                        {{
                            trigger: () => (
                                <n-button text focusable={false} class="toolbar-btn">
                                    <n-badge dot type="warning" offset={[2, -2]}>
                                        <n-icon size={20}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                                            </svg>
                                        </n-icon>
                                    </n-badge>
                                </n-button>
                            ),
                            default: () => '通知'
                        }}
                    </n-tooltip>

                    {/* 主题切换 */}
                    <n-tooltip trigger="hover">
                        {{
                            trigger: () => (
                                <n-button text focusable={false} class="toolbar-btn" onClick={() => fetchThemeUpdate()}>
                                    {theme.value === 'dark' ? (
                                        <n-icon size={20}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                                            </svg>
                                        </n-icon>
                                    ) : (
                                        <n-icon size={20}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                            </svg>
                                        </n-icon>
                                    )}
                                </n-button>
                            ),
                            default: () => (theme.value === 'dark' ? '切换亮色' : '切换暗色')
                        }}
                    </n-tooltip>

                    {/* 用户下拉 */}
                    <n-dropdown
                        trigger="click"
                        options={[
                            { label: '账号设置', key: 'settings', icon: () => <span style={{ fontSize: '14px' }}>⚙️</span> },
                            { type: 'divider', key: 'd1' },
                            { label: '退出登录', key: 'logout', icon: () => <span style={{ fontSize: '14px' }}>🚪</span> }
                        ]}
                        onSelect={(key: string) => {
                            if (key === 'logout') handleLogout()
                        }}
                    >
                        <div class="toolbar-user">
                            <n-avatar
                                round
                                size={30}
                                style={{ background: 'linear-gradient(135deg, #536dfe, #7c4dff)', cursor: 'pointer' }}
                            >
                                {props.userEmail ? props.userEmail.charAt(0).toUpperCase() : 'U'}
                            </n-avatar>
                        </div>
                    </n-dropdown>
                </div>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.mail-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 24px;
    gap: 16px;
    border-bottom: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.12));
    background: var(--n-color, transparent);
    min-height: 52px;
}

.toolbar-search {
    flex: 1;
    max-width: 480px;

    :deep(.n-input) {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.06));
        .n-input__border,
        .n-input__state-border {
            border: none !important;
        }
        &:focus-within {
            background: var(--n-color, transparent);
            .n-input__border {
                border: 1px solid var(--n-border-color-focus) !important;
            }
        }
    }
}

.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toolbar-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;

    &:hover {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.08));
    }
}

.toolbar-user {
    cursor: pointer;
    margin-left: 4px;
}
</style>
