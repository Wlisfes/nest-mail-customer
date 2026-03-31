<script lang="tsx">
import { defineComponent, onMounted, h } from 'vue'
import { httpFetchCategories, httpSaveCategory, httpDeleteCategory } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import { NButton, NInput, NSpace, NText, NEmpty, NInputNumber } from 'naive-ui'

export default defineComponent({
    name: 'CategoryDialog',
    props: {
        show: { type: Boolean, default: false }
    },
    emits: ['update:show', 'change'],
    setup(props, { emit }) {
        const { state, setState } = useState({
            loading: false,
            list: [] as any[],
            newName: '',
            editId: null as number | null,
            editName: ''
        })

        async function fetchList() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchCategories()
                const data = res.data ?? res
                await setState({ list: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleAdd() {
            if (!state.newName.trim()) return
            try {
                await httpSaveCategory({ name: state.newName.trim(), sort: 0 })
                $message.success('添加成功')
                await setState({ newName: '' })
                emit('change')
                await fetchList()
            } catch (err: any) {
                $message.error(err?.message ?? '添加失败')
            }
        }

        async function handleSaveEdit(item: any) {
            try {
                await httpSaveCategory({ keyId: item.keyId, name: state.editName.trim(), sort: item.sort ?? 0 })
                $message.success('更新成功')
                await setState({ editId: null })
                emit('change')
                await fetchList()
            } catch (err: any) {
                $message.error(err?.message ?? '更新失败')
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteCategory(keyId)
                $message.success('删除成功')
                emit('change')
                await fetchList()
            } catch (err: any) {
                $message.error(err?.message ?? '删除失败')
            }
        }

        onMounted(fetchList)

        return () => (
            <n-modal
                show={props.show}
                onUpdate:show={(v: boolean) => emit('update:show', v)}
                preset="dialog"
                title="管理分类"
                style={{ width: '400px' }}
            >
                <div class="flex flex-col gap-12">
                    <div class="flex gap-8">
                        <NInput
                            v-model:value={state.newName}
                            placeholder="新分类名称"
                            size="small"
                            onKeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleAdd()}
                        />
                        <NButton type="primary" size="small" onClick={handleAdd} disabled={!state.newName.trim()}>
                            添加
                        </NButton>
                    </div>
                    {state.list.length === 0 ? (
                        <NEmpty description="暂无分类" style={{ padding: '20px 0' }} />
                    ) : (
                        <div class="flex flex-col gap-6" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {state.list.map((item: any) => (
                                <div key={item.keyId} class="flex items-center justify-between p-8" style={{ borderRadius: '6px', background: 'var(--n-color-hover, rgba(255,255,255,0.04))' }}>
                                    {state.editId === item.keyId ? (
                                        <NSpace size={8} align="center">
                                            <NInput
                                                v-model:value={state.editName}
                                                size="tiny"
                                                style={{ width: '160px' }}
                                                onKeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleSaveEdit(item)}
                                            />
                                            <NButton size="tiny" type="primary" onClick={() => handleSaveEdit(item)}>确定</NButton>
                                            <NButton size="tiny" onClick={() => setState({ editId: null })}>取消</NButton>
                                        </NSpace>
                                    ) : (
                                        <>
                                            <NText style={{ fontSize: '14px' }}>{item.name}</NText>
                                            <NSpace size={4}>
                                                <NButton size="tiny" text type="primary" onClick={() => setState({ editId: item.keyId, editName: item.name })}>
                                                    编辑
                                                </NButton>
                                                <NButton size="tiny" text type="error" onClick={() => handleDelete(item.keyId)}>
                                                    删除
                                                </NButton>
                                            </NSpace>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </n-modal>
        )
    }
})
</script>
