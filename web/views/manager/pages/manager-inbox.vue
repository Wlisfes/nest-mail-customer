<script lang="tsx">
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { httpFetchMailList, httpMarkMailSeen, httpSyncAllMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { NButton, NTag, type DataTableColumns } from 'naive-ui'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)'
]

function hashColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

export default defineComponent({
    name: 'ManagerInbox',
    setup() {
        const { state, setState } = useState({
            loading: false,
            page: 1,
            size: 20,
            total: 0,
            list: [] as any[]
        })
        const syncing = ref(false)

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchMailList({ folder: 'INBOX', page: state.page, size: state.size })
                const data = res.data ?? res
                await setState({ list: data.list ?? [], total: data.total ?? 0 })
            } catch (err) {
                console.error('获取收件箱失败', err)
            } finally {
                await setState({ loading: false })
            }
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

        onMounted(() => fetchList())
        watch(() => state.page, () => fetchList())

        const unreadCount = () => state.list.filter((m: any) => !m.seen).length

        const columns: DataTableColumns = [
            {
                title: '发件人',
                key: 'fromAddress',
                width: 220,
                render: (row: any) => {
                    const name = row.fromAddress?.split('@')[0] ?? '?'
                    return h('div', { class: 'flex items-center gap-10' }, [
                        h('div', {
                            class: 'mail-sender-avatar',
                            style: { background: hashColor(row.fromAddress ?? '') }
                        }, name.charAt(0).toUpperCase()),
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
                render: (row: any) => row.hasAttachment ? h(NTag, { size: 'small', bordered: false, round: true }, () => '📎') : null
            },
            {
                title: '时间',
                key: 'date',
                width: 140,
                render: (row: any) => row.date ? h('span', { style: { fontSize: '12px', opacity: 0.7 } }, dayjs(row.date).fromNow()) : ''
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>📥 收件箱</n-text>
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
                    <div class="flex gap-8">
                        <n-button size="small" type="primary" secondary round loading={syncing.value} onClick={handleSync}>
                            {syncing.value ? '同步中...' : '🔄 同步'}
                        </n-button>
                        <n-button size="small" secondary round onClick={handleMarkAllSeen}>✅ 全部已读</n-button>
                        <n-button size="small" secondary round onClick={() => fetchList()}>🔃 刷新</n-button>
                    </div>
                </div>
                <div class="mail-table-wrap flex-1 overflow-hidden">
                    <n-data-table
                        columns={columns}
                        data={state.list}
                        row-key={(row: any) => row.keyId}
                        bordered={false}
                        striped
                        flex-height
                        class="flex-1"
                        loading={state.loading}
                        row-class-name={(row: any) => row.seen ? '' : 'font-bold'}
                    />
                </div>
                <div class="flex justify-end">
                    <n-pagination
                        v-model:page={state.page}
                        page-count={Math.ceil(state.total / state.size) || 1}
                        show-quick-jumper
                    />
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
