<script lang="tsx">
import { defineComponent, h, onMounted } from 'vue'
import { httpFetchBlacklist, httpRemoveBlacklist } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import { NButton, NText, NTag, type DataTableColumns } from 'naive-ui'
import { renderMailAvatar } from '../components/mail-avatar.vue'

export default defineComponent({
    name: 'ManagerBlacklist',
    setup() {
        const { state, setState } = useState({
            loading: false,
            list: [] as any[]
        })

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchBlacklist()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleRemove(keyId: number) {
            try {
                await httpRemoveBlacklist(keyId)
                $message.success('已从黑名单移除')
                await fetchList()
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(fetchList)

        const columns: DataTableColumns = [
            {
                title: '邮箱地址',
                key: 'email',
                render: (row: any) =>
                    h('div', { class: 'flex items-center gap-10' }, [
                        renderMailAvatar(row.email ?? '?'),
                        h(NText, { style: { fontWeight: 500 } }, () => row.email)
                    ])
            },
            {
                title: '原因',
                key: 'reason',
                render: (row: any) =>
                    h(NTag, { size: 'small', bordered: false, round: true, type: 'error' }, () => row.reason ?? '手动添加')
            },
            {
                title: '添加时间',
                key: 'createTime',
                width: 140,
                render: (row: any) =>
                    row.createTime
                        ? h('span', { style: { fontSize: '12px', opacity: 0.7 } }, dayjs(row.createTime).format('YYYY-MM-DD'))
                        : ''
            },
            {
                title: '操作',
                key: 'actions',
                width: 100,
                render: (row: any) =>
                    h(
                        NButton,
                        {
                            size: 'small',
                            type: 'warning',
                            secondary: true,
                            round: true,
                            onClick: () => handleRemove(row.keyId)
                        },
                        () => '移除'
                    )
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>
                            🚫 黑名单
                        </n-text>
                        <n-tag size="small" round bordered={false} type="error">
                            {state.list.length} 条
                        </n-tag>
                    </div>
                </div>
                {state.list.length === 0 && !state.loading ? (
                    <div class="flex flex-col items-center justify-center flex-1 gap-12">
                        <span style={{ fontSize: '56px', opacity: 0.4 }}>✅</span>
                        <n-text depth={3} class="text-14">
                            黑名单为空，一切正常
                        </n-text>
                    </div>
                ) : (
                    <div class="mail-table-wrap flex-1 overflow-hidden">
                        <n-data-table
                            columns={columns}
                            data={state.list}
                            row-key={(row: any) => row.keyId}
                            bordered={false}
                            striped
                            flex-height
                            loading={state.loading}
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
