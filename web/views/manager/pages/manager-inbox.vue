<script lang="tsx">
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { httpFetchMailList, httpMarkMailSeen, httpSyncAllMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

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

        const syncing = ref(false)
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

        const columns: DataTableColumns = [
            {
                title: '状态',
                key: 'seen',
                width: 60,
                align: 'center',
                render: (row: any) => h('span', {
                    style: {
                        width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block',
                        background: row.seen ? 'transparent' : 'var(--primary-color)',
                        border: row.seen ? '1px solid var(--text-color-3)' : 'none'
                    }
                })
            },
            { title: '发件人', key: 'fromAddress', width: 200, ellipsis: { tooltip: true } },
            {
                title: '主题',
                key: 'subject',
                ellipsis: { tooltip: true },
                render: (row: any) => h('span', { style: { fontWeight: row.seen ? 400 : 700 } }, row.subject)
            },
            {
                title: '附件',
                key: 'hasAttachment',
                width: 60,
                align: 'center',
                render: (row: any) => row.hasAttachment ? h('span', null, '📎') : null
            },
            {
                title: '时间',
                key: 'date',
                width: 160,
                render: (row: any) => row.date ? dayjs(row.date).format('YYYY-MM-DD HH:mm') : ''
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <div class="flex items-center justify-between">
                    <n-text class="text-20" style={{ fontWeight: 700 }}>收件箱</n-text>
                    <div class="flex gap-8">
                        <n-button size="small" type="primary" secondary loading={syncing.value} onClick={handleSync}>
                            {syncing.value ? '同步中...' : '同步邮件'}
                        </n-button>
                        <n-button size="small" secondary onClick={handleMarkAllSeen}>全部标记已读</n-button>
                        <n-button size="small" secondary onClick={() => fetchList()}>刷新</n-button>
                    </div>
                </div>
                <n-data-table
                    columns={columns}
                    data={state.list}
                    row-key={(row: any) => row.keyId}
                    bordered={false}
                    striped
                    flex-height
                    class="flex-1"
                    loading={state.loading}
                />
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
