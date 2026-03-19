<script lang="tsx">
import { defineComponent, computed } from 'vue'

/**文件夹定义**/
const folders = [
    { key: 'inbox', label: '收件箱', icon: '📥' },
    { key: 'sent', label: '已发送', icon: '📤' },
    { key: 'drafts', label: '草稿箱', icon: '📝' },
    { key: 'starred', label: '星标邮件', icon: '⭐' },
    { key: 'trash', label: '垃圾箱', icon: '🗑️' }
]

export default defineComponent({
    name: 'MailSidebar',
    props: {
        accounts: { type: Array as () => Array<any>, default: () => [] },
        currentAccountId: { type: Number, default: 0 },
        activeFolder: { type: String, default: 'inbox' },
        activeView: { type: String, default: 'dashboard' },
        unreadCount: { type: Number, default: 0 }
    },
    emits: ['compose', 'select-folder', 'select-account', 'delete-account', 'add-account', 'go-dashboard'],
    setup(props, { emit }) {
        /**生成首字母头像**/
        function getAvatar(email: string) {
            return email ? email.charAt(0).toUpperCase() : '?'
        }

        /**头像背景色（基于字符哈希）**/
        function getAvatarColor(email: string) {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
                'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
            ]
            let hash = 0
            for (let i = 0; i < email.length; i++) {
                hash = email.charCodeAt(i) + ((hash << 5) - hash)
            }
            return colors[Math.abs(hash) % colors.length]
        }

        /**Provider 显示名**/
        function getProviderLabel(provider: string) {
            const map: Record<string, string> = { qq: 'QQ', '163': '网易', outlook: 'Outlook', gmail: 'Gmail' }
            return map[provider] || provider
        }

        return () => (
            <div class="mail-sidebar">
                {/* Logo 区域 */}
                <div class="sidebar-logo">
                    <common-global-wrapper name="nest-logo" color="var(--primary-color, #536dfe)" size={28}></common-global-wrapper>
                    <span class="sidebar-logo-text">Mail Server</span>
                </div>

                {/* 写信按钮 */}
                <div class="sidebar-compose">
                    <n-button type="primary" block round size="large" disabled={!props.currentAccountId} onClick={() => emit('compose')}>
                        {{
                            icon: () => <span style={{ marginRight: '6px', fontSize: '16px' }}>✏️</span>,
                            default: () => '写 信'
                        }}
                    </n-button>
                </div>

                {/* 仪表盘入口 */}
                <div class="sidebar-section">
                    <div
                        class={['sidebar-folder-item', props.activeView === 'dashboard' ? 'active' : '']}
                        onClick={() => emit('go-dashboard')}
                    >
                        <span class="folder-icon">📊</span>
                        <span class="folder-label">仪表盘</span>
                    </div>
                </div>

                <n-divider style={{ margin: '4px 0' }} />

                {/* 文件夹导航 */}
                <div class="sidebar-section">
                    <div class="sidebar-section-title">文件夹</div>
                    {folders.map(folder => (
                        <div
                            key={folder.key}
                            class={[
                                'sidebar-folder-item',
                                props.activeView === 'folder' && props.activeFolder === folder.key ? 'active' : ''
                            ]}
                            onClick={() => emit('select-folder', folder.key)}
                        >
                            <span class="folder-icon">{folder.icon}</span>
                            <span class="folder-label">{folder.label}</span>
                            {folder.key === 'inbox' && props.unreadCount > 0 && <n-badge value={props.unreadCount} max={99} type="info" />}
                        </div>
                    ))}
                </div>

                <n-divider style={{ margin: '4px 0' }} />

                {/* 邮箱账号 */}
                <div class="sidebar-section">
                    <div class="sidebar-section-title">
                        <span>我的邮箱</span>
                        <n-button text type="primary" size="tiny" onClick={() => emit('add-account')}>
                            + 添加
                        </n-button>
                    </div>
                    <n-scrollbar style={{ maxHeight: '240px' }}>
                        {props.accounts.length === 0 ? (
                            <div class="sidebar-empty-hint">
                                <n-text depth={3} style={{ fontSize: '12px' }}>
                                    暂无邮箱，请添加
                                </n-text>
                            </div>
                        ) : (
                            props.accounts.map((acc: any) => (
                                <div
                                    key={acc.keyId}
                                    class={['sidebar-account-item', props.currentAccountId === acc.keyId ? 'active' : '']}
                                    onClick={() => emit('select-account', acc.keyId)}
                                >
                                    <div class="account-avatar" style={{ background: getAvatarColor(acc.email) }}>
                                        {getAvatar(acc.email)}
                                    </div>
                                    <div class="account-info">
                                        <n-ellipsis style={{ fontSize: '13px', fontWeight: 500 }}>{acc.email}</n-ellipsis>
                                        <n-text depth={3} style={{ fontSize: '11px' }}>
                                            {getProviderLabel(acc.provider)}
                                        </n-text>
                                    </div>
                                    <n-button
                                        text
                                        type="error"
                                        size="tiny"
                                        class="account-delete"
                                        onClick={(e: Event) => {
                                            e.stopPropagation()
                                            emit('delete-account', acc.keyId)
                                        }}
                                    >
                                        删除
                                    </n-button>
                                </div>
                            ))
                        )}
                    </n-scrollbar>
                </div>

                {/* 底部存储指示 */}
                <div class="sidebar-footer">
                    <n-divider style={{ margin: '4px 0' }} />
                    <div class="storage-info">
                        <div class="storage-header">
                            <n-text depth={3} style={{ fontSize: '11px' }}>
                                存储空间
                            </n-text>
                            <n-text depth={3} style={{ fontSize: '11px' }}>
                                2.4 GB / 15 GB
                            </n-text>
                        </div>
                        <n-progress
                            type="line"
                            percentage={16}
                            show-indicator={false}
                            rail-color="rgba(128,128,128,0.15)"
                            height={4}
                            border-radius={2}
                        />
                    </div>
                </div>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.mail-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    user-select: none;
}

.sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    .sidebar-logo-text {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.5px;
        background: linear-gradient(135deg, #536dfe 0%, #7c4dff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}

.sidebar-compose {
    padding: 4px 16px 12px;
}

.sidebar-section {
    padding: 4px 8px;
}

.sidebar-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--n-text-color-3, rgba(128, 128, 128, 0.8));
}

.sidebar-folder-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 13px;

    &:hover {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.08));
    }

    &.active {
        background: var(--n-color-hover, rgba(83, 109, 254, 0.1));
        color: var(--n-text-color-hover, #536dfe);
        font-weight: 600;
    }

    .folder-icon {
        font-size: 16px;
        width: 24px;
        text-align: center;
        flex-shrink: 0;
    }

    .folder-label {
        flex: 1;
    }

    :deep(.n-badge) {
        .n-badge-sup {
            font-size: 10px;
            height: 16px;
            min-width: 16px;
            padding: 0 4px;
        }
    }
}

.sidebar-account-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.08));
        .account-delete {
            opacity: 1;
        }
    }

    &.active {
        background: var(--n-color-hover, rgba(83, 109, 254, 0.08));
    }

    .account-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        flex-shrink: 0;
    }

    .account-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
    }

    .account-delete {
        opacity: 0;
        transition: opacity 0.2s;
        flex-shrink: 0;
    }
}

.sidebar-empty-hint {
    padding: 12px;
    text-align: center;
}

.sidebar-footer {
    margin-top: auto;
    padding: 0 16px 16px;

    .storage-info {
        padding-top: 8px;
    }

    .storage-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
    }
}
</style>
