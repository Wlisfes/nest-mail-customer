<script lang="tsx">
import { defineComponent, h, ref, onMounted } from 'vue'
import { httpFetchMailAccounts, httpCreateMailAccount, httpDeleteMailAccount, httpSyncMailAccount, httpUpdateMailAccount } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'

const providerMeta: Record<string, { label: string; color: string; gradient: string; icon: string }> = {
    qq: { label: 'QQ 邮箱', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '📧' },
    '163': { label: '网易 163', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', icon: '📨' },
    outlook: { label: 'Outlook', color: '#0078d4', gradient: 'linear-gradient(135deg, #0078d4, #4db8ff)', icon: '📬' },
    gmail: { label: 'Gmail', color: '#ea4335', gradient: 'linear-gradient(135deg, #ea4335, #ff6b6b)', icon: '📩' }
}

export default defineComponent({
    name: 'ManagerAccounts',
    setup() {
        const showModal = ref(false)
        const showEditModal = ref(false)
        const syncingIds = ref<Set<number>>(new Set())

        const { state, setState } = useState({
            loading: false,
            list: [] as any[],
            form: { email: '', provider: null as string | null, authCode: '' },
            editForm: { keyId: 0, email: '', authCode: '' }
        })

        const providerOptions = [
            { label: '📧 QQ 邮箱', value: 'qq' },
            { label: '📨 网易 163', value: '163' },
            { label: '📬 Outlook', value: 'outlook' },
            { label: '📩 Gmail', value: 'gmail' }
        ]

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchMailAccounts()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) { console.error(err) }
            finally { await setState({ loading: false }) }
        }

        async function handleAdd() {
            if (!state.form.provider || !state.form.email || !state.form.authCode) {
                $message.warning('请填写完整信息')
                return false
            }
            try {
                await httpCreateMailAccount({
                    email: state.form.email,
                    provider: state.form.provider,
                    authCode: state.form.authCode
                })
                showModal.value = false
                $message.success('🎉 邮箱添加成功')
                await setState({ form: { email: '', provider: null, authCode: '' } })
                await fetchList()
            } catch (err: any) {
                $message.error(err.message || '添加失败')
                return false
            }
        }

        function handleEdit(row: any) {
            setState({ editForm: { keyId: row.keyId, email: row.email, authCode: '' } })
            showEditModal.value = true
        }

        async function handleUpdate() {
            if (!state.editForm.authCode) {
                $message.warning('请输入新的授权码')
                return false
            }
            try {
                await httpUpdateMailAccount(state.editForm.keyId, { authCode: state.editForm.authCode })
                showEditModal.value = false
                $message.success('✅ 授权码更新成功')
                await setState({ editForm: { keyId: 0, email: '', authCode: '' } })
                await fetchList()
            } catch (err: any) {
                $message.error(err.message || '更新失败')
                return false
            }
        }

        async function handleSync(keyId: number) {
            syncingIds.value.add(keyId)
            syncingIds.value = new Set(syncingIds.value)
            try {
                await httpSyncMailAccount(keyId)
                $message.success('同步任务已启动')
                setTimeout(() => fetchList(), 3000)
            } catch (err) {
                $message.error('同步失败')
            } finally {
                syncingIds.value.delete(keyId)
                syncingIds.value = new Set(syncingIds.value)
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteMailAccount(keyId)
                $message.success('删除成功')
                await fetchList()
            } catch (err) { console.error(err) }
        }

        onMounted(fetchList)

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>📪 邮箱账号</n-text>
                        <n-tag size="small" round bordered={false} type="info">
                            {state.list.length} 个账号
                        </n-tag>
                    </div>
                    <n-button type="primary" round onClick={() => (showModal.value = true)} style={{ fontWeight: 600 }}>
                        ➕ 添加邮箱
                    </n-button>
                </div>

                {/* 卡片式邮箱列表 */}
                {state.loading ? (
                    <div class="flex items-center justify-center flex-1"><n-spin /></div>
                ) : state.list.length === 0 ? (
                    <div class="flex flex-col items-center justify-center flex-1 gap-12">
                        <span style={{ fontSize: '56px', opacity: 0.4 }}>📭</span>
                        <n-text depth={3}>还没有添加邮箱账号</n-text>
                        <n-button type="primary" round onClick={() => (showModal.value = true)}>立即添加</n-button>
                    </div>
                ) : (
                    <div class="account-cards-grid">
                        {state.list.map((account: any, index: number) => {
                            const meta = providerMeta[account.provider] ?? { label: account.provider, color: '#666', gradient: 'linear-gradient(135deg, #666, #999)', icon: '📧' }
                            const isSyncing = syncingIds.value.has(account.keyId)
                            return (
                                <n-card
                                    key={account.keyId}
                                    class={['account-card animate-fadeInUp', `animate-stagger-${index + 1}`]}
                                    hoverable
                                    content-class="p-0!"
                                >
                                    {/* 顶部渐变条 */}
                                    <div style={{ height: '4px', background: meta.gradient }}></div>
                                    <div class="p-20">
                                        {/* 头部：图标 + 名称 + 状态 */}
                                        <div class="flex items-center gap-12 m-be-16">
                                            <div
                                                class="flex items-center justify-center"
                                                style={{
                                                    width: '48px', height: '48px', borderRadius: '14px',
                                                    background: `${meta.color}15`, fontSize: '24px'
                                                }}
                                            >
                                                {meta.icon}
                                            </div>
                                            <div class="flex flex-col flex-1">
                                                <div class="flex items-center gap-8">
                                                    <n-text style={{ fontWeight: 700, fontSize: '15px' }}>{meta.label}</n-text>
                                                    <div class={['account-status-dot', account.status === 0 ? 'connected' : 'error']}></div>
                                                </div>
                                                <n-text depth={3} class="text-13">{account.email}</n-text>
                                            </div>
                                        </div>

                                        {/* 配置详情 */}
                                        <div class="flex flex-col gap-6 m-be-16" style={{ fontSize: '12px', opacity: 0.65 }}>
                                            <div class="flex items-center gap-4">
                                                <span>📥</span> IMAP: {account.imapHost}:{account.imapPort}
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span>📤</span> SMTP: {account.smtpHost}:{account.smtpPort}
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span>🕐</span> 添加于 {account.createTime ? dayjs(account.createTime).format('YYYY-MM-DD') : '-'}
                                            </div>
                                        </div>

                                        {/* 操作按钮 */}
                                        <div class="flex gap-8">
                                            <n-button size="small" type="info" secondary round onClick={() => handleEdit(account)} style={{ flex: 1 }}>
                                                ✏️ 编辑
                                            </n-button>
                                            <n-button
                                                size="small" type="warning" secondary round
                                                loading={isSyncing}
                                                onClick={() => handleSync(account.keyId)}
                                                style={{ flex: 1 }}
                                            >
                                                {isSyncing ? '同步中...' : '🔄 同步'}
                                            </n-button>
                                            <n-popconfirm onPositiveClick={() => handleDelete(account.keyId)}>
                                                {{
                                                    trigger: () => (
                                                        <n-button size="small" type="error" secondary round style={{ flex: 1 }}>
                                                            🗑️ 删除
                                                        </n-button>
                                                    ),
                                                    default: () => '确定要删除该邮箱账号吗？'
                                                }}
                                            </n-popconfirm>
                                        </div>
                                    </div>
                                </n-card>
                            )
                        })}
                    </div>
                )}

                {/* 添加邮箱弹窗 */}
                <n-modal v-model:show={showModal.value} preset="dialog" title="添加邮箱账号" positive-text="确认添加" negative-text="取消" onPositiveClick={handleAdd} style={{ borderRadius: '16px' }}>
                    <n-form label-placement="left" label-width={80} class="m-bs-16">
                        <n-form-item label="邮箱平台">
                            <n-select v-model:value={state.form.provider} options={providerOptions} placeholder="请选择邮箱平台" />
                        </n-form-item>
                        <n-form-item label="邮箱地址">
                            <n-input v-model:value={state.form.email} placeholder="请输入邮箱地址" />
                        </n-form-item>
                        <n-form-item label="授权码">
                            <n-input v-model:value={state.form.authCode} type="password" show-password-on="click" placeholder="请输入授权码/应用密码" />
                        </n-form-item>
                        <n-alert type="info" title="提示" class="m-bs-8">
                            选择平台后 IMAP/SMTP 服务器配置将自动填充。授权码可在对应邮箱平台的设置中获取。
                        </n-alert>
                    </n-form>
                </n-modal>

                {/* 编辑授权码弹窗 */}
                <n-modal v-model:show={showEditModal.value} preset="dialog" title="编辑授权码" positive-text="确认更新" negative-text="取消" onPositiveClick={handleUpdate} style={{ borderRadius: '16px' }}>
                    <n-form label-placement="left" label-width={80} class="m-bs-16">
                        <n-form-item label="邮箱地址">
                            <n-input value={state.editForm.email} disabled />
                        </n-form-item>
                        <n-form-item label="新授权码">
                            <n-input v-model:value={state.editForm.authCode} type="password" show-password-on="click" placeholder="请输入新的授权码/应用密码" />
                        </n-form-item>
                        <n-alert type="warning" title="提示" class="m-bs-8">
                            请确保已在邮箱平台开启 IMAP 服务。更新后可点击"同步"测试连接。
                        </n-alert>
                    </n-form>
                </n-modal>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
