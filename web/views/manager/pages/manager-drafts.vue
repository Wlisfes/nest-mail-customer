<script lang="tsx">
import { defineComponent, h, onMounted } from 'vue'
import { httpFetchDrafts, httpDeleteDraft } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { NButton, type DataTableColumns } from 'naive-ui'
import { renderMailAvatar } from '../components/mail-avatar.vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default defineComponent({
    name: 'ManagerDrafts',
    setup() {
        const router = useRouter()
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
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteDraft(keyId)
                $message.success('草稿已删除')
                await fetchList()
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(fetchList)

        const columns: DataTableColumns = [
            {
                title: '收件人',
                key: 'toAddress',
                width: 280,
                render: (row: any) => {
                    const addr = row.toAddress ?? '未指定'
                    return h('div', { class: 'flex items-center gap-10' }, [
                        renderMailAvatar(addr),
                        h('span', { style: { fontWeight: 500 } }, addr)
                    ])
                }
            },
            {
                title: '主题',
                key: 'subject',
                ellipsis: { tooltip: true },
                render: (row: any) => row.subject || '(无主题)'
            },
            {
                title: '保存时间',
                key: 'createTime',
                width: 140,
                render: (row: any) =>
                    row.createTime ? h('span', { style: { fontSize: '12px', opacity: 0.7 } }, dayjs(row.createTime).fromNow()) : ''
            },
            {
                title: '操作',
                key: 'actions',
                width: 180,
                render: (row: any) =>
                    h('div', { class: 'flex gap-6' }, [
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'info',
                                secondary: true,
                                round: true,
                                onClick: () => router.push({ path: '/manager/compose', query: { draftId: row.keyId } })
                            },
                            () => '✏️ 编辑'
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'error',
                                secondary: true,
                                round: true,
                                onClick: () => handleDelete(row.keyId)
                            },
                            () => '🗑️'
                        )
                    ])
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>
                            📝 草稿箱
                        </n-text>
                        <n-tag size="small" round bordered={false} type="warning">
                            {state.list.length} 封
                        </n-tag>
                    </div>
                    <n-button type="primary" round onClick={() => router.push('/manager/compose')} style={{ fontWeight: 600 }}>
                        ✏️ 写邮件
                    </n-button>
                </div>
                {state.list.length === 0 && !state.loading ? (
                    <div class="flex flex-col items-center justify-center flex-1 gap-12">
                        <span style={{ fontSize: '56px', opacity: 0.4 }}>📄</span>
                        <n-text depth={3}>暂无草稿</n-text>
                    </div>
                ) : (
                    <div class="mail-table-wrap flex-1 overflow-hidden">
                        <n-data-table
                            columns={columns}
                            data={state.list}
                            row-key={(row: any) => row.keyId}
                            bordered={false}
                            striped
                            loading={state.loading}
                            style={{ flex: 1 }}
                        />
                    </div>
                )}
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
