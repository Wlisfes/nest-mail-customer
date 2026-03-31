<script lang="tsx">
/**
 * 模板编辑器页面 - 三栏布局
 * 左侧组件面板 + 中间画布 + 右侧属性面板
 */
import { defineComponent, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpace, NText, NInput } from 'naive-ui'
import { $message } from '@/utils'
import { httpFetchTemplateDetail, httpSaveTemplate, httpFetchVariables } from '@/api'
import { useState } from '@/hooks'
import { useEditorState } from '../components/template-editor/useEditorState'
import { canvasToMjml } from '../components/template-editor/mjmlCompiler'
import { type MjmlComponentType, createDefaultNode, CONTENT_TYPES } from '../components/template-editor/componentDefs'
import ComponentPanel from '../components/template-editor/ComponentPanel.vue'
import CanvasView from '../components/template-editor/CanvasView.vue'
import PropertyPanel from '../components/template-editor/PropertyPanel.vue'
import PreviewModal from '../components/template-editor/PreviewModal.vue'

export default defineComponent({
    name: 'ManagerTemplateEditor',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const editor = useEditorState()

        const { state, setState } = useState({
            saving: false,
            showPreview: false,
            variables: [] as any[],
            showNameInput: false
        })

        /** 加载模板（编辑模式） */
        async function loadTemplate(id: number) {
            try {
                const res: any = await httpFetchTemplateDetail(id)
                const data = res.data ?? res
                editor.state.templateId = data.keyId
                editor.state.templateName = data.name
                editor.state.categoryId = data.categoryId
                if (data.canvasJson) {
                    editor.loadCanvas(data.canvasJson)
                } else {
                    editor.initBlankCanvas()
                }
            } catch (err: any) {
                $message.error(err?.message ?? '加载模板失败')
                router.back()
            }
        }

        /** 加载变量列表 */
        async function loadVariables() {
            try {
                const res: any = await httpFetchVariables()
                const data = res.data ?? res
                setState({ variables: Array.isArray(data) ? data : (data.list ?? []) })
            } catch (err) {
                console.error(err)
            }
        }

        /** 保存模板 */
        async function handleSave() {
            if (!editor.state.templateName.trim()) {
                setState({ showNameInput: true })
                return
            }
            if (editor.state.canvas.length === 0) {
                $message.warning('请至少添加一个组件')
                return
            }
            await setState({ saving: true })
            try {
                const canvasJson = editor.getCanvasJson()
                const mjmlSource = canvasToMjml(editor.state.canvas)
                await httpSaveTemplate({
                    keyId: editor.state.templateId || undefined,
                    name: editor.state.templateName,
                    categoryId: editor.state.categoryId,
                    canvasJson,
                    mjmlSource
                })
                $message.success('保存成功')
                editor.state.dirty = false
            } catch (err: any) {
                $message.error(err?.message ?? '保存失败')
            } finally {
                await setState({ saving: false })
            }
        }

        /** 画布拖放处理 */
        function handleDrop(payload: { type: MjmlComponentType; parentId?: string; index?: number }) {
            const { type, parentId, index } = payload
            // 内容组件只能放到 column 内
            if (CONTENT_TYPES.includes(type) && !parentId) {
                // 如果拖到顶层，自动包一个 section > column
                const section = createDefaultNode('mj-section')
                const content = createDefaultNode(type)
                section.children[0].children.push(content)
                editor.state.canvas.push(section)
                editor.pushHistory()
                return
            }
            editor.addNode(type, parentId, index)
        }

        /** 选中/删除处理 */
        function handleSelect(idOrAction: string | null) {
            if (idOrAction?.startsWith('delete:')) {
                editor.removeNode(idOrAction.replace('delete:', ''))
            } else {
                editor.selectNode(idOrAction)
            }
        }

        /** 快捷键 */
        function handleKeydown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                editor.undo()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault()
                editor.redo()
            }
            if (e.key === 'Delete' && editor.state.selectedId) {
                editor.removeNode(editor.state.selectedId)
            }
        }

        onMounted(() => {
            const id = route.params.id as string
            if (id) {
                loadTemplate(Number(id))
            } else {
                editor.initBlankCanvas()
            }
            loadVariables()
            window.addEventListener('keydown', handleKeydown)
        })

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeydown)
        })

        return () => (
            <n-element class="template-editor-page">
                {/* 顶部工具栏 */}
                <div class="template-editor-toolbar">
                    <NSpace align="center" size={12}>
                        <NButton text onClick={() => router.back()} style={{ fontSize: '18px' }}>←</NButton>
                        {state.showNameInput || !editor.state.templateName ? (
                            <NInput
                                v-model:value={editor.state.templateName}
                                placeholder="输入模板名称"
                                size="small"
                                style={{ width: '200px' }}
                                onBlur={() => setState({ showNameInput: false })}
                            />
                        ) : (
                            <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setState({ showNameInput: true })}>
                                {editor.state.templateName || '未命名模板'}
                            </span>
                        )}
                    </NSpace>
                    <NSpace align="center" size={8}>
                        <NButton size="small" disabled={!editor.canUndo.value} onClick={() => editor.undo()}>↩ 撤销</NButton>
                        <NButton size="small" disabled={!editor.canRedo.value} onClick={() => editor.redo()}>↪ 重做</NButton>
                        <NButton size="small" onClick={() => setState({ showPreview: true })}>👁 预览</NButton>
                        <NButton type="primary" size="small" loading={state.saving} onClick={handleSave}>💾 保存</NButton>
                    </NSpace>
                </div>

                {/* 三栏编辑区 */}
                <div class="template-editor-body">
                    <div class="template-editor-left">
                        <ComponentPanel />
                    </div>
                    <div class="template-editor-center">
                        <CanvasView
                            canvas={editor.state.canvas}
                            selectedId={editor.state.selectedId}
                            onSelect={handleSelect}
                            onDrop={handleDrop}
                        />
                    </div>
                    <div class="template-editor-right">
                        <PropertyPanel
                            node={editor.selectedNode.value}
                            variables={state.variables}
                            onUpdate={(id: string, props: any) => editor.updateNodeProps(id, props)}
                            onDelete={(id: string) => editor.removeNode(id)}
                            onInsert-variable={(varKey: string) => {
                                if (editor.selectedNode.value && editor.selectedNode.value.type === 'mj-text') {
                                    const content = (editor.selectedNode.value.props.content || '') + `{{${varKey}}}`
                                    editor.updateNodeProps(editor.selectedNode.value.id, { content })
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 底部状态栏 */}
                <div class="template-editor-footer">
                    <NText depth={3} style={{ fontSize: '12px' }}>
                        组件: {editor.state.canvas.length} 个 | {editor.state.dirty ? '已修改' : '已保存'}
                    </NText>
                </div>

                {/* 预览弹窗 */}
                <PreviewModal v-model:show={state.showPreview} canvas={editor.state.canvas} />
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.template-editor-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}
.template-editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--n-border-color, #e5e7eb);
    min-height: 48px;
}
.template-editor-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}
.template-editor-left {
    width: 180px;
    border-right: 1px solid var(--n-border-color, #e5e7eb);
    overflow-y: auto;
}
.template-editor-center {
    flex: 1;
    overflow: hidden;
    display: flex;
}
.template-editor-right {
    width: 280px;
    border-left: 1px solid var(--n-border-color, #e5e7eb);
    overflow-y: auto;
}
.template-editor-footer {
    display: flex;
    align-items: center;
    padding: 4px 16px;
    border-top: 1px solid var(--n-border-color, #e5e7eb);
    min-height: 28px;
}
</style>
