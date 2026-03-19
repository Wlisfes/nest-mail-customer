<script lang="tsx">
import { defineComponent, ref, watch } from 'vue'
import * as Service from '@/api'
import MailAccountModal from './components/mail-account-modal.vue'
import MailSidebar from './components/mail-sidebar.vue'
import MailToolbar from './components/mail-toolbar.vue'
import MailDashboard from './components/mail-dashboard.vue'
import MailInbox from './components/mail-inbox.vue'
import MailDetail from './components/mail-detail.vue'
import MailCompose from './components/mail-compose.vue'

export default defineComponent({
    name: 'Manager',
    components: { MailAccountModal, MailSidebar, MailToolbar, MailDashboard, MailInbox, MailDetail, MailCompose },
    async httpServer({ logger }) {
        logger.info('[Manager.vue]', { title: 'Mail Server Manager', date: Date.now() })
    },
    setup(props) {
        /**状态**/
        const accounts = ref<Array<any>>([])
        const currentAccountId = ref(0)
        const showAddModal = ref(false)
        const loading = ref(false)

        /**视图控制**/
        const viewMode = ref<'dashboard' | 'inbox' | 'detail' | 'compose'>('dashboard')
        const activeFolder = ref('inbox')
        const selectedMail = ref<any>(null)
        const unreadCount = ref(0)

        /**加载邮箱账号列表**/
        async function fetchAccounts() {
            loading.value = true
            try {
                const { data } = (await Service.httpAccountList()) as any
                accounts.value = data || []
                if (accounts.value.length > 0 && !currentAccountId.value) {
                    currentAccountId.value = accounts.value[0].keyId
                }
            } catch (err: any) {
                window.$message?.error(err?.message || '获取邮箱列表失败')
            } finally {
                loading.value = false
            }
        }

        /**删除邮箱**/
        async function fetchDeleteAccount(keyId: number) {
            window.$dialog?.warning({
                title: '确认删除',
                content: '删除邮箱后，关联的邮件缓存也将一并删除，确定要删除吗？',
                positiveText: '确认删除',
                negativeText: '取消',
                onPositiveClick: async () => {
                    try {
                        await Service.httpDeleteAccount({ keyId })
                        window.$message?.success('删除成功')
                        if (currentAccountId.value === keyId) {
                            currentAccountId.value = 0
                            viewMode.value = 'dashboard'
                        }
                        await fetchAccounts()
                    } catch (err: any) {
                        window.$message?.error(err?.message || '删除失败')
                    }
                }
            })
        }

        /**选中邮件**/
        function onSelectMail(msg: any) {
            selectedMail.value = msg
            viewMode.value = 'detail'
        }

        /**返回收件箱**/
        function onBackToInbox() {
            viewMode.value = 'inbox'
            selectedMail.value = null
        }

        /**初始化加载**/
        fetchAccounts()

        /**当前视图活跃类型（用于侧边栏高亮）**/
        function getActiveView() {
            if (viewMode.value === 'dashboard') return 'dashboard'
            return 'folder'
        }

        /**当前选中邮箱的email**/
        function getCurrentEmail() {
            const acc = accounts.value.find((a: any) => a.keyId === currentAccountId.value)
            return acc?.email || ''
        }

        /**主内容区渲染**/
        function renderContent() {
            switch (viewMode.value) {
                case 'dashboard':
                    return <MailDashboard accounts={accounts.value} totalMails={0} unreadMails={unreadCount.value} />
                case 'detail':
                    return (
                        <MailDetail
                            accountId={currentAccountId.value}
                            uid={selectedMail.value?.uid}
                            subject={selectedMail.value?.subject}
                            onBack={onBackToInbox}
                        />
                    )
                case 'compose':
                    return <MailCompose accountId={currentAccountId.value} onBack={onBackToInbox} onSent={onBackToInbox} />
                default:
                    if (!currentAccountId.value) {
                        return (
                            <n-element class="flex flex-col flex-1 items-center justify-center">
                                <n-empty description="请先在左侧添加邮箱账号">
                                    {{
                                        extra: () => (
                                            <n-button
                                                type="primary"
                                                size="small"
                                                onClick={() => {
                                                    showAddModal.value = true
                                                }}
                                            >
                                                添加邮箱
                                            </n-button>
                                        )
                                    }}
                                </n-empty>
                            </n-element>
                        )
                    }
                    return <MailInbox accountId={currentAccountId.value} onSelect={onSelectMail} />
            }
        }

        return () => (
            <n-element class="manager-container">
                {/* 侧边栏 */}
                <div class="manager-sidebar">
                    <MailSidebar
                        accounts={accounts.value}
                        currentAccountId={currentAccountId.value}
                        activeFolder={activeFolder.value}
                        activeView={getActiveView()}
                        unreadCount={unreadCount.value}
                        onCompose={() => {
                            if (currentAccountId.value) {
                                viewMode.value = 'compose'
                            } else {
                                window.$message?.warning('请先添加邮箱账号')
                            }
                        }}
                        onSelectFolder={(folder: string) => {
                            activeFolder.value = folder
                            if (folder === 'inbox') {
                                viewMode.value = 'inbox'
                                selectedMail.value = null
                            }
                            // 其他文件夹暂时也跳转到 inbox
                        }}
                        onSelectAccount={(keyId: number) => {
                            currentAccountId.value = keyId
                            viewMode.value = 'inbox'
                            selectedMail.value = null
                        }}
                        onDeleteAccount={(keyId: number) => fetchDeleteAccount(keyId)}
                        onAddAccount={() => {
                            showAddModal.value = true
                        }}
                        onGoDashboard={() => {
                            viewMode.value = 'dashboard'
                            selectedMail.value = null
                        }}
                    />
                </div>

                {/* 右侧主区域 */}
                <div class="manager-main">
                    {/* 顶部工具栏 */}
                    <MailToolbar userEmail={getCurrentEmail()} />

                    {/* 内容区 */}
                    <div class="manager-content">{renderContent()}</div>
                </div>

                {/* 添加邮箱弹窗 */}
                <MailAccountModal v-model:visible={showAddModal.value} onSuccess={fetchAccounts} />
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.manager-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
}

.manager-sidebar {
    width: 260px;
    flex-shrink: 0;
    border-right: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.12));
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--n-card-color, #fff);
}

.manager-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
}

.manager-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
