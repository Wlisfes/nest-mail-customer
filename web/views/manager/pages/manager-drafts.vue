<script lang="tsx">
import { defineComponent, h, onMounted } from 'vue'
import { httpFetchDrafts, httpDeleteDraft } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import { NButton, type DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerDrafts',
    setup() {
        const { state, setState } = useState({
            loading: false,
            list: [] as any[]
        })

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchDrafts()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error('获取草稿列表失败', err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteDraft(keyId)
                $message.success('删除成功')
                await fetchList()
            } catch (err) {
                console.error('删除草稿失败', err)
            }
        }

        onMounted(() => fetchList())

        const columns: DataTableColumns = [
            { title: '收件人', key: 'toAddress', width: 200, ellipsis: { tooltip: true } },
            { title: '主题', key: 'subject', ellipsis: { tooltip: true } },
            {
                title: '保存时间',
                key: 'createTime',
                width: 160,
                render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : ''
            },
            {
                title: '操作',
                key: 'actions',
                width: 140,
                render: (row: any) => h('div', { class: 'flex gap-8' }, [
                    h(NButton, { size: 'small', type: 'primary', text: true, focusable: false }, () => '编辑'),
                    h(NButton, {
                        size: 'small', type: 'error', text: true, focusable: false,
                        onClick: () => handleDelete(row.keyId)
                    }, () => '删除')
                ])
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <n-text class="text-20" style={{ fontWeight: 700 }}>草稿箱</n-text>
                {state.list.length === 0 && !state.loading ? (
                    <n-empty description="暂无草稿" class="flex-1 justify-center" />
                ) : (
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
                )}
            </n-element>
        )
    }
})
</script>
