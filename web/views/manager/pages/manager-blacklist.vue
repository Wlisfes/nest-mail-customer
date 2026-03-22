<script lang="tsx">
import { defineComponent, h, ref, onMounted } from 'vue'
import { httpFetchBlacklist, httpAddBlacklist, httpRemoveBlacklist } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerBlacklist',
    setup() {
        const showModal = ref(false)

        const { state, setState } = useState({
            list: [] as any[],
            form: {
                email: '',
                reason: ''
            }
        })

        async function fetchList() {
            try {
                const res: any = await httpFetchBlacklist()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error('获取黑名单失败', err)
            }
        }

        async function handleAdd() {
            if (!state.form.email) {
                $message.warning('请输入邮箱地址')
                return false
            }
            try {
                await httpAddBlacklist({ email: state.form.email, reason: state.form.reason })
                showModal.value = false
                $message.success('已添加至黑名单')
                await setState({ form: { email: '', reason: '' } })
                await fetchList()
            } catch (err: any) {
                $message.error(err.message || '添加失败')
                return false
            }
        }

        async function handleRemove(keyId: number) {
            try {
                await httpRemoveBlacklist(keyId)
                $message.success('已移除')
                await fetchList()
            } catch (err) {
                console.error('移除失败', err)
            }
        }

        onMounted(() => fetchList())

        const columns: DataTableColumns = [
            { title: '邮箱地址', key: 'email', ellipsis: { tooltip: true } },
            {
                title: '拉黑原因',
                key: 'reason',
                render: (row: any) => h('n-text', { depth: row.reason ? 1 : 3 }, () => row.reason || '未填写')
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
                width: 80,
                render: (row: any) => h('n-button', {
                    size: 'small', type: 'error', text: true, focusable: false,
                    onClick: () => handleRemove(row.keyId)
                }, () => '移除')
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <div class="flex items-center justify-between">
                    <n-text class="text-20" style={{ fontWeight: 700 }}>黑名单管理</n-text>
                    <n-button type="primary" onClick={() => (showModal.value = true)}>
                        添加黑名单
                    </n-button>
                </div>
                {state.list.length === 0 ? (
                    <n-empty description="暂无黑名单" class="flex-1 justify-center" />
                ) : (
                    <n-data-table
                        columns={columns}
                        data={state.list}
                        row-key={(row: any) => row.keyId}
                        bordered={false}
                        striped
                    />
                )}

                <n-modal
                    v-model:show={showModal.value}
                    preset="dialog"
                    title="添加黑名单"
                    positive-text="确认"
                    negative-text="取消"
                    onPositiveClick={handleAdd}
                >
                    <n-form label-placement="left" label-width={80} class="m-bs-16">
                        <n-form-item label="邮箱地址">
                            <n-input
                                v-model:value={state.form.email}
                                placeholder="请输入要拉黑的邮箱地址"
                            />
                        </n-form-item>
                        <n-form-item label="原因">
                            <n-input
                                v-model:value={state.form.reason}
                                placeholder="可选填拉黑原因"
                            />
                        </n-form-item>
                    </n-form>
                </n-modal>
            </n-element>
        )
    }
})
</script>
