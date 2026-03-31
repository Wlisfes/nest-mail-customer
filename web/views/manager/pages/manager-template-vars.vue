<script lang="tsx">
import { defineComponent, h, onMounted } from 'vue'
import { httpFetchVariables, httpSaveVariable, httpDeleteVariable } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import { NButton, NText, NTag, NInput, NSpace, NModal, NForm, NFormItem, type DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerTemplateVars',
    setup() {
        const { state, setState } = useState({
            loading: false,
            list: [] as any[],
            showModal: false,
            editForm: { keyId: null as number | null, name: '', varKey: '', defaultValue: '' }
        })

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchVariables()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        function openCreate() {
            setState({
                showModal: true,
                editForm: { keyId: null, name: '', varKey: '', defaultValue: '' }
            })
        }

        function openEdit(row: any) {
            setState({
                showModal: true,
                editForm: { keyId: row.keyId, name: row.name, varKey: row.varKey, defaultValue: row.defaultValue ?? '' }
            })
        }

        async function handleSave() {
            if (!state.editForm.name || !state.editForm.varKey) {
                $message.warning('请填写变量名和变量键')
                return
            }
            try {
                await httpSaveVariable(state.editForm)
                $message.success('保存成功')
                await setState({ showModal: false })
                await fetchList()
            } catch (err: any) {
                $message.error(err?.message ?? '保存失败')
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteVariable(keyId)
                $message.success('删除成功')
                await fetchList()
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(fetchList)

        const columns: DataTableColumns = [
            {
                title: '变量名',
                key: 'name',
                render: (row: any) => h(NText, { style: { fontWeight: 500 } }, () => row.name)
            },
            {
                title: '变量键',
                key: 'varKey',
                render: (row: any) => h(NTag, { size: 'small', bordered: false, round: true, type: 'info' }, () => `{{${row.varKey}}}`)
            },
            {
                title: '默认值',
                key: 'defaultValue',
                render: (row: any) => h('span', { style: { color: '#94A3B8', fontSize: '13px' } }, row.defaultValue || '-')
            },
            {
                title: '创建时间',
                key: 'createTime',
                width: 160,
                render: (row: any) =>
                    row.createTime
                        ? h('span', { style: { fontSize: '12px', opacity: 0.7 } }, dayjs(row.createTime).format('YYYY-MM-DD'))
                        : ''
            },
            {
                title: '操作',
                key: 'actions',
                width: 200,
                render: (row: any) =>
                    h(NSpace, { size: 8 }, () => [
                        h(
                            NButton,
                            { size: 'small', type: 'primary', secondary: true, round: true, onClick: () => openEdit(row) },
                            () => '编辑'
                        ),
                        h(
                            NButton,
                            { size: 'small', type: 'error', secondary: true, round: true, onClick: () => handleDelete(row.keyId) },
                            () => '删除'
                        )
                    ])
            }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>
                            🔤 模板变量管理
                        </n-text>
                        <n-tag size="small" round bordered={false} type="info">
                            {state.list.length} 个
                        </n-tag>
                    </div>
                    <n-button type="primary" size="small" round onClick={openCreate}>
                        + 新建变量
                    </n-button>
                </div>
                {state.list.length === 0 && !state.loading ? (
                    <div class="flex flex-col items-center justify-center flex-1 gap-12">
                        <span style={{ fontSize: '56px', opacity: 0.4 }}>🔤</span>
                        <n-text depth={3} class="text-14">
                            暂无变量，点击右上角新建
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
                            loading={state.loading}
                            max-height={500}
                        />
                    </div>
                )}
                <NModal
                    v-model:show={state.showModal}
                    preset="dialog"
                    title={state.editForm.keyId ? '编辑变量' : '新建变量'}
                    positive-text="保存"
                    negative-text="取消"
                    onPositiveClick={handleSave}
                    style={{ width: '440px' }}
                >
                    <NForm labelPlacement="left" labelWidth={80}>
                        <NFormItem label="变量名">
                            <NInput v-model:value={state.editForm.name} placeholder="如：姓名" />
                        </NFormItem>
                        <NFormItem label="变量键">
                            <NInput v-model:value={state.editForm.varKey} placeholder="如：name" disabled={!!state.editForm.keyId} />
                        </NFormItem>
                        <NFormItem label="默认值">
                            <NInput v-model:value={state.editForm.defaultValue} placeholder="可选" />
                        </NFormItem>
                    </NForm>
                </NModal>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
