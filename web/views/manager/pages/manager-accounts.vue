<script lang="tsx">
import { defineComponent, h, ref, onMounted } from 'vue'
import { httpFetchMailAccounts, httpCreateMailAccount, httpDeleteMailAccount } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerAccounts',
    setup() {
        const showModal = ref(false)

        const { state, setState } = useState({
            loading: false,
            list: [] as any[],
            form: {
                email: '',
                provider: null as string | null,
                authCode: ''
            }
        })

        const providerOptions = [
            { label: 'QQ 邮箱', value: 'qq' },
            { label: '网易 163', value: '163' },
            { label: 'Outlook', value: 'outlook' },
            { label: 'Gmail', value: 'gmail' }
        ]

        const providerLabels: Record<string, string> = {
            qq: 'QQ 邮箱',
            '163': '网易 163',
            outlook: 'Outlook',
            gmail: 'Gmail'
        }

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchMailAccounts()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error('获取邮箱列表失败', err)
            } finally {
                await setState({ loading: false })
            }
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
                $message.success('邮箱添加成功')
                await setState({ form: { email: '', provider: null, authCode: '' } })
                await fetchList()
            } catch (err: any) {
                $message.error(err.message || '添加失败')
                return false
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteMailAccount(keyId)
                $message.success('删除成功')
                await fetchList()
            } catch (err) {
                console.error('删除失败', err)
            }
        }

        onMounted(() => fetchList())

        const columns: DataTableColumns = [
            {
                title: '平台',
                key: 'provider',
                width: 120,
                render: (row: any) => h('n-tag', { type: 'info', size: 'small', bordered: false },
                    () => providerLabels[row.provider] ?? row.provider)
            },
            { title: '邮箱地址', key: 'email', ellipsis: { tooltip: true } },
            { title: 'IMAP', key: 'imapHost', width: 180 },
            { title: 'SMTP', key: 'smtpHost', width: 180 },
            {
                title: '状态',
                key: 'status',
                width: 80,
                align: 'center',
                render: (row: any) => h('n-badge', {
                    dot: true,
                    type: row.status === 0 ? 'success' : 'error',
                    processing: row.status === 0
                })
            },
            {
                title: '添加时间',
                key: 'createTime',
                width: 120,
                render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD') : ''
            },
            {
                title: '操作',
                key: 'actions',
                width: 120,
                render: (row: any) => h('div', { class: 'flex gap-8' }, [
                    h('n-button', { size: 'small', type: 'warning', text: true, focusable: false }, () => '同步'),
                    h('n-button', {
                        size: 'small', type: 'error', text: true, focusable: false,
                        onClick: () => handleDelete(row.keyId)
                    }, () => '删除')
                ])
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <div class="flex items-center justify-between">
                    <n-text class="text-20" style={{ fontWeight: 700 }}>邮箱账号管理</n-text>
                    <n-button type="primary" onClick={() => (showModal.value = true)}>
                        添加邮箱
                    </n-button>
                </div>
                <n-data-table
                    columns={columns}
                    data={state.list}
                    row-key={(row: any) => row.keyId}
                    bordered={false}
                    striped
                    loading={state.loading}
                />

                <n-modal
                    v-model:show={showModal.value}
                    preset="dialog"
                    title="添加邮箱账号"
                    positive-text="确认添加"
                    negative-text="取消"
                    onPositiveClick={handleAdd}
                >
                    <n-form label-placement="left" label-width={80} class="m-bs-16">
                        <n-form-item label="邮箱平台">
                            <n-select
                                v-model:value={state.form.provider}
                                options={providerOptions}
                                placeholder="请选择邮箱平台"
                            />
                        </n-form-item>
                        <n-form-item label="邮箱地址">
                            <n-input
                                v-model:value={state.form.email}
                                placeholder="请输入邮箱地址"
                            />
                        </n-form-item>
                        <n-form-item label="授权码">
                            <n-input
                                v-model:value={state.form.authCode}
                                type="password"
                                show-password-on="click"
                                placeholder="请输入授权码/应用密码"
                            />
                        </n-form-item>
                        <n-alert type="info" title="提示" class="m-bs-8">
                            选择平台后 IMAP/SMTP 服务器配置将自动填充。授权码可在对应邮箱平台的设置中获取。
                        </n-alert>
                    </n-form>
                </n-modal>
            </n-element>
        )
    }
})
</script>
