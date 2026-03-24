<script lang="tsx">
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { httpFetchMailList, httpSyncAllMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { NTag, type DataTableColumns } from 'naive-ui'
import { renderMailAvatar } from '../components/mail-avatar.vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default defineComponent({
    name: 'ManagerSent',
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
                const res: any = await httpFetchMailList({ folder: 'Sent', page: state.page, size: state.size })
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

        onMounted(() => fetchList())
        watch(
            () => state.page,
            () => fetchList()
        )

        const columns: DataTableColumns = [
            {
                title: '收件人',
                key: 'toAddress',
                width: 220,
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
                    <div class="flex gap-8">
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
                    style={{ flex: 1 }}
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
