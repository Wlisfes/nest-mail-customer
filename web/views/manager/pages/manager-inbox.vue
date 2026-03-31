<script lang="tsx">
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { httpFetchMailList, httpMarkMailSeen, httpSyncAllMailAccounts, httpFetchMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { NButton, NTag, NInput, NSelect, type DataTableColumns } from 'naive-ui'
import { renderMailAvatar } from '../components/mail-avatar.vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default defineComponent({
    name: 'ManagerInbox',
    setup() {
        const router = useRouter()
        const { state, setState } = useState({
            loading: false,
            page: 1,
            size: 20,
            total: 0,
            list: [] as any[],
            keyword: '',
            accountId: null as number | null,
            accounts: [] as Array<{ label: string; value: number }>
        })
        const syncing = ref(false)
        const searchTimer = ref<NodeJS.Timeout | null>(null)

        function handleRowClick(row: any) {
            if (row && row.keyId) {
                router.push({ path: `/manager/mail/${row.keyId}` })
            }
        }

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
                const params: any = { folder: 'INBOX', page: state.page, size: state.size }
                if (state.keyword.trim()) {
                    params.keyword = state.keyword.trim()
                }
                if (state.accountId) {
                    params.accountId = state.accountId
                }
                const res: any = await httpFetchMailList(params)
                const data = res.data ?? res
                await setState({ list: data.list ?? [], total: data.total ?? 0 })
            } catch (err) {
                console.error('获取收件箱失败', err)
            } finally {
                await setState({ loading: false })
            }
        }

        function handleSearch(keyword: string) {
            if (searchTimer.value) {
                clearTimeout(searchTimer.value)
            }
            searchTimer.value = setTimeout(() => {
                setState({ keyword, page: 1 }).then(() => fetchList())
            }, 300)
        }

        async function handleMarkAllSeen() {
            try {
                for (const item of state.list.filter((m: any) => !m.seen)) {
                    await httpMarkMailSeen(item.keyId)
                }
                $message.success('全部标记已读')
                await fetchList()
            } catch (err) {
                console.error('标记失败', err)
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

        const unreadCount = () => state.list.filter((m: any) => !m.seen).length

        const columns: DataTableColumns = [
            {
                title: '发件人',
                key: 'fromAddress',
                width: 280,
                render: (row: any) => {
                    const name = row.fromAddress?.split('@')[0] ?? '?'
                    return h('div', { class: 'flex items-center gap-10' }, [
                        renderMailAvatar(row.fromAddress ?? ''),
                        h('div', { class: 'flex flex-col' }, [
                            h('span', { style: { fontWeight: row.seen ? 400 : 700, fontSize: '13px' } }, name),
                            h('span', { style: { fontSize: '11px', opacity: 0.5 } }, row.fromAddress)
                        ])
                    ])
                }
            },
            {
                title: '主题',
                key: 'subject',
                ellipsis: { tooltip: true },
                render: (row: any) => h('span', { style: { fontWeight: row.seen ? 400 : 700 } }, row.subject || '(无主题)')
            },
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
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>
                            📥 收件箱
                        </n-text>
                        {state.total > 0 && (
                            <n-tag size="small" round bordered={false} type="info">
                                {state.total} 封
                            </n-tag>
                        )}
                        {unreadCount() > 0 && (
                            <n-tag size="small" round bordered={false} type="warning">
                                {unreadCount()} 未读
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
                        <n-input
                            placeholder="搜索邮件..."
                            clearable
                            style={{ width: '240px' }}
                            v-model:value={state.keyword}
                            onUpdate:value={handleSearch}
                        >
                            {{
                                prefix: () => <i class="i-carbon-search text-16 opacity-50"></i>
                            }}
                        </n-input>
                        <n-button size="small" type="primary" secondary round loading={syncing.value} onClick={handleSync}>
                            {syncing.value ? '同步中...' : '🔄 同步'}
                        </n-button>
                        <n-button size="small" secondary round onClick={handleMarkAllSeen}>
                            ✅ 全部已读
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
                    row-class-name={(row: any) => (row.seen ? '' : 'font-bold')}
                    style={{ flex: 1, cursor: 'pointer' }}
                    row-props={(row: any) => ({
                        onClick: () => handleRowClick(row)
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
