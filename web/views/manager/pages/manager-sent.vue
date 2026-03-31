<script lang="tsx">
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { httpFetchMailList, httpSyncAllMailAccounts, httpResendMail, httpFetchMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { NTag, NSelect, type DataTableColumns } from 'naive-ui'
import { renderMailAvatar } from '../components/mail-avatar.vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default defineComponent({
    name: 'ManagerSent',
    setup() {
        const router = useRouter()
        const { state, setState } = useState({
            loading: false,
            page: 1,
            size: 20,
            total: 0,
            list: [] as any[],
            accountId: null as number | null,
            accounts: [] as Array<{ label: string; value: number }>
        })
        const syncing = ref(false)

        async function fetchAccounts() {
            try {
                const res: any = await httpFetchMailAccounts()
                const data = res.data ?? res
                const list = Array.isArray(data) ? data : (data.list ?? [])
                await setState({
                    accounts: list.map((item: any) => ({ label: item.email, value: item.keyId }))
                })
            } catch (err) {
                console.error('获取邮箱账号失败', err)
            }
        }

        async function fetchList() {
            await setState({ loading: true })
            try {
                const params: any = { folder: 'Sent', page: state.page, size: state.size }
                if (state.accountId) {
                    params.accountId = state.accountId
                }
                const res: any = await httpFetchMailList(params)
                const data = res.data ?? res
                await setState({ list: data.list ?? [], total: data.total ?? 0 })
            } catch (err) {
                console.error('获取已发送失败', err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleSync() {
            syncing.value = true
            try {
                await httpSyncAllMailAccounts()
                $message.success('同步任务已启动，请稍后刷新')
                setTimeout(() => fetchList(), 5000)
            } catch (err: any) {
                $message.error(err.message || '同步失败')
            } finally {
                syncing.value = false
            }
        }

        onMounted(() => {
            fetchAccounts()
            fetchList()
        })
        watch(
            () => state.page,
            () => fetchList()
        )

        const columns: DataTableColumns = [
            {
                title: '收件人',
                key: 'toAddress',
                width: 280,
                render: (row: any) => {
                    const addr = row.toAddress ?? ''
                    const name = addr.split('@')[0] ?? '?'
                    return h('div', { class: 'flex items-center gap-10' }, [
                        renderMailAvatar(addr),
                        h('div', { class: 'flex flex-col' }, [
                            h('span', { style: { fontSize: '13px', fontWeight: 500 } }, name),
                            h('span', { style: { fontSize: '11px', opacity: 0.5 } }, addr)
                        ])
                    ])
                }
            },
            { title: '主题', key: 'subject', ellipsis: { tooltip: true } },
            {
                title: '附件',
                key: 'hasAttachment',
                width: 60,
                align: 'center',
                render: (row: any) => (row.hasAttachment ? h(NTag, { size: 'small', bordered: false, round: true }, () => '📎') : null)
            },
            {
                title: '时间',
                key: 'date',
                width: 140,
                render: (row: any) => (row.date ? h('span', { style: { fontSize: '12px', opacity: 0.7 } }, dayjs(row.date).fromNow()) : '')
            },
            {
                title: '状态',
                key: 'sendStatus',
                width: 90,
                align: 'center',
                render: (row: any) => {
                    if (row.sendStatus === 1) {
                        return h('div', { class: 'flex items-center gap-6' }, [
                            h(NTag, { size: 'small', type: 'error', bordered: false, round: true }, () => '失败'),
                            h(
                                'a',
                                {
                                    style: { fontSize: '12px', cursor: 'pointer', color: 'var(--primary-color)' },
                                    onClick: async (e: Event) => {
                                        e.stopPropagation()
                                        try {
                                            await httpResendMail(row.keyId)
                                            $message.success('重新发送成功')
                                            fetchList()
                                        } catch (err: any) {
                                            $message.error(err.message || '重新发送失败')
                                        }
                                    }
                                },
                                '重试'
                            )
                        ])
                    }
                    if (row.sendStatus === 2)
                        return h(NTag, { size: 'small', type: 'warning', bordered: false, round: true }, () => '发送中')
                    return h(NTag, { size: 'small', type: 'success', bordered: false, round: true }, () => '已发送')
                }
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>
                            📤 已发送
                        </n-text>
                        {state.total > 0 && (
                            <n-tag size="small" round bordered={false} type="success">
                                {state.total} 封
                            </n-tag>
                        )}
                    </div>
                    <div class="flex gap-8 items-center">
                        <n-select
                            v-model:value={state.accountId}
                            options={state.accounts}
                            placeholder="全部邮箱"
                            clearable
                            style={{ width: '200px' }}
                            onUpdate:value={(val: number | null) => {
                                setState({ accountId: val, page: 1 }).then(() => fetchList())
                            }}
                        />
                        <n-button size="small" type="primary" secondary round loading={syncing.value} onClick={handleSync}>
                            {syncing.value ? '同步中...' : '🔄 同步'}
                        </n-button>
                        <n-button size="small" secondary round onClick={() => fetchList()}>
                            🔃 刷新
                        </n-button>
                    </div>
                </div>
                <n-data-table
                    columns={columns}
                    data={state.list}
                    row-key={(row: any) => row.keyId}
                    bordered={false}
                    striped
                    flex-height
                    loading={state.loading}
                    style={{ flex: 1, cursor: 'pointer' }}
                    row-props={(row: any) => ({
                        onClick: () => router.push(`/manager/mail/${row.keyId}`)
                    })}
                />
                <div class="flex justify-end">
                    <n-pagination v-model:page={state.page} page-count={Math.ceil(state.total / state.size) || 1} show-quick-jumper />
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
