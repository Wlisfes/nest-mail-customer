<script lang="tsx">
import { defineComponent, ref, watch } from 'vue'
import * as Service from '@/api'

export default defineComponent({
    name: 'MailInbox',
    props: {
        accountId: { type: Number, default: 0 }
    },
    emits: ['select'],
    setup(props, { emit }) {
        const loading = ref(false)
        const messages = ref<Array<any>>([])
        const pagination = ref({ page: 1, size: 20, total: 0 })
        const selectedIds = ref<Set<number>>(new Set())

        async function fetchInbox(page = 1) {
            if (!props.accountId) return
            loading.value = true
            try {
                const { data } = (await Service.httpMailInbox({
                    accountId: props.accountId,
                    page,
                    size: pagination.value.size
                })) as any
                messages.value = data?.list || []
                pagination.value.total = data?.total || 0
                pagination.value.page = page
                selectedIds.value.clear()
            } catch (err: any) {
                window.$message?.error(err?.message || '获取邮件列表失败')
            } finally {
                loading.value = false
            }
        }

        watch(
            () => props.accountId,
            () => {
                if (props.accountId) {
                    fetchInbox(1)
                }
            },
            { immediate: true }
        )

        function formatDate(date: string) {
            if (!date) return ''
            const d = new Date(date)
            const now = new Date()
            if (d.toDateString() === now.toDateString()) {
                return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            }
            return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
        }

        /**发件人首字母头像**/
        function getAvatar(name: string, address: string) {
            const display = name || address || '?'
            return display.charAt(0).toUpperCase()
        }

        function getAvatarColor(str: string) {
            const colors = ['#536dfe', '#f5576c', '#7c4dff', '#43e97b', '#fa709a', '#4facfe', '#fccb90', '#a18cd1']
            let hash = 0
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash)
            }
            return colors[Math.abs(hash) % colors.length]
        }

        /**全选/取消**/
        function toggleSelectAll() {
            if (selectedIds.value.size === messages.value.length) {
                selectedIds.value.clear()
            } else {
                selectedIds.value = new Set(messages.value.map(m => m.uid))
            }
        }

        /**刷新**/
        function handleRefresh() {
            fetchInbox(pagination.value.page)
        }

        return () => (
            <n-element class="mail-inbox-container">
                {/* 工具栏 */}
                <div class="inbox-toolbar">
                    <div class="toolbar-left">
                        <n-checkbox
                            checked={messages.value.length > 0 && selectedIds.value.size === messages.value.length}
                            indeterminate={selectedIds.value.size > 0 && selectedIds.value.size < messages.value.length}
                            onUpdate:checked={toggleSelectAll}
                        />
                        <n-tooltip trigger="hover">
                            {{
                                trigger: () => (
                                    <n-button text size="small" onClick={handleRefresh}>
                                        <n-icon size={18}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                            </svg>
                                        </n-icon>
                                    </n-button>
                                ),
                                default: () => '刷新'
                            }}
                        </n-tooltip>
                        {selectedIds.value.size > 0 && (
                            <>
                                <n-divider vertical style={{ margin: '0 4px' }} />
                                <n-button text size="small" type="warning">
                                    <n-icon size={16}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 4l2 4H4l2-4h12zm0-2H6l-3 6v2h1v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8h1V8l-3-6zM6 20V10h12v10H6zm4-8H8v6h2v-6zm4 0h-2v6h2v-6z" />
                                        </svg>
                                    </n-icon>
                                </n-button>
                                <n-text depth={3} style={{ fontSize: '12px', marginLeft: '4px' }}>
                                    已选 {selectedIds.value.size} 封
                                </n-text>
                            </>
                        )}
                    </div>
                    <div class="toolbar-right">
                        <n-text depth={3} style={{ fontSize: '12px' }}>
                            共 {pagination.value.total} 封邮件
                        </n-text>
                    </div>
                </div>

                {/* 邮件列表 */}
                <n-spin show={loading.value} class="flex flex-col flex-1 overflow-hidden">
                    {messages.value.length === 0 && !loading.value ? (
                        <n-empty description="收件箱是空的" class="mt-60px">
                            {{
                                icon: () => <span style={{ fontSize: '48px' }}>📭</span>
                            }}
                        </n-empty>
                    ) : (
                        <n-scrollbar class="flex-1">
                            <div class="inbox-list">
                                {messages.value.map(msg => (
                                    <div
                                        key={msg.uid}
                                        class={['inbox-item', selectedIds.value.has(msg.uid) ? 'selected' : '', !msg.seen ? 'unread' : '']}
                                    >
                                        <n-checkbox
                                            checked={selectedIds.value.has(msg.uid)}
                                            onUpdate:checked={(checked: boolean) => {
                                                if (checked) {
                                                    selectedIds.value.add(msg.uid)
                                                } else {
                                                    selectedIds.value.delete(msg.uid)
                                                }
                                                selectedIds.value = new Set(selectedIds.value)
                                            }}
                                            class="inbox-checkbox"
                                            onClick={(e: Event) => e.stopPropagation()}
                                        />
                                        <div class="inbox-item-main" onClick={() => emit('select', msg)}>
                                            <div
                                                class="inbox-avatar"
                                                style={{ backgroundColor: getAvatarColor(msg.fromAddress || msg.fromName || '') }}
                                            >
                                                {getAvatar(msg.fromName, msg.fromAddress)}
                                            </div>
                                            <div class="inbox-item-body">
                                                <div class="inbox-item-header">
                                                    <div class="inbox-sender">
                                                        {!msg.seen && <span class="unread-dot"></span>}
                                                        <n-ellipsis style={{ maxWidth: '200px', fontSize: '13px' }}>
                                                            {msg.fromName || msg.fromAddress || '未知发件人'}
                                                        </n-ellipsis>
                                                    </div>
                                                    <n-text depth={3} style={{ fontSize: '12px', flexShrink: 0 }}>
                                                        {formatDate(msg.date)}
                                                    </n-text>
                                                </div>
                                                <n-ellipsis style={{ fontSize: '14px', fontWeight: msg.seen ? 400 : 600 }}>
                                                    {msg.subject || '(无主题)'}
                                                </n-ellipsis>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </n-scrollbar>
                    )}
                    {pagination.value.total > pagination.value.size && (
                        <div class="inbox-pagination">
                            <n-pagination
                                page={pagination.value.page}
                                page-size={pagination.value.size}
                                item-count={pagination.value.total}
                                onUpdate:page={(p: number) => fetchInbox(p)}
                                simple
                            ></n-pagination>
                        </div>
                    )}
                </n-spin>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.mail-inbox-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.inbox-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.12));
    min-height: 42px;

    .toolbar-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}

.inbox-list {
    display: flex;
    flex-direction: column;
}

.inbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 16px;
    transition: background 0.15s;

    &:hover {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.04));
    }

    &.selected {
        background: rgba(83, 109, 254, 0.06);
    }

    &.unread {
        background: rgba(83, 109, 254, 0.02);
    }

    .inbox-checkbox {
        flex-shrink: 0;
    }
}

.inbox-item-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    padding: 10px 4px;
    cursor: pointer;
    border-bottom: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.06));
}

.inbox-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
}

.inbox-item-body {
    flex: 1;
    min-width: 0;
}

.inbox-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
}

.inbox-sender {
    display: flex;
    align-items: center;
    gap: 6px;

    .unread-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #536dfe;
        flex-shrink: 0;
    }
}

.inbox-pagination {
    display: flex;
    justify-content: center;
    padding: 8px;
    border-top: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.12));
}
</style>
