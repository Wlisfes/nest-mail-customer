<script lang="tsx">
import { defineComponent, h, onMounted, watch } from 'vue'
import { httpFetchMailList } from '@/api'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

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

        onMounted(() => fetchList())
        watch(() => state.page, () => fetchList())

        const columns: DataTableColumns = [
            { title: '收件人', key: 'toAddress', width: 200, ellipsis: { tooltip: true } },
            { title: '主题', key: 'subject', ellipsis: { tooltip: true } },
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
                <n-text class="text-20" style={{ fontWeight: 700 }}>已发送</n-text>
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
