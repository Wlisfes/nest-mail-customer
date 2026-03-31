<script lang="tsx">
/**
 * 右侧属性面板
 * 根据选中组件类型动态渲染对应的属性编辑器
 */
import { defineComponent, type PropType, computed, h } from 'vue'
import { NInput, NSelect, NColorPicker, NInputNumber, NFormItem, NButton, NSpace, NText, NDivider } from 'naive-ui'
import { type CanvasNode, type MjmlComponentType, getComponentDef } from './componentDefs'

export default defineComponent({
    name: 'PropertyPanel',
    props: {
        node: { type: Object as PropType<CanvasNode | null>, default: null },
        variables: { type: Array as PropType<Array<{ name: string; varKey: string }>>, default: () => [] }
    },
    emits: ['update', 'delete', 'insert-variable'],
    setup(props, { emit }) {
        function updateProp(key: string, value: any) {
            if (props.node) {
                emit('update', props.node.id, { [key]: value })
            }
        }

        function renderAlignSelect(value: string, propName: string = 'align') {
            return (
                <NSelect
                    value={value || 'left'}
                    onUpdate:value={(v: string) => updateProp(propName, v)}
                    size="small"
                    options={[
                        { label: '左对齐', value: 'left' },
                        { label: '居中', value: 'center' },
                        { label: '右对齐', value: 'right' }
                    ]}
                />
            )
        }

        function renderCommonProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="内边距" size="small">
                        <NInput value={nodeProps.padding || ''} onUpdate:value={(v: string) => updateProp('padding', v)} placeholder="如 10px 25px" size="small" />
                    </NFormItem>
                </>
            )
        }

        function renderSectionProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="背景色" size="small">
                        <NColorPicker value={nodeProps['background-color'] || '#ffffff'} onUpdate:value={(v: string) => updateProp('background-color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="圆角" size="small">
                        <NInput value={nodeProps['border-radius'] || '0px'} onUpdate:value={(v: string) => updateProp('border-radius', v)} placeholder="如 8px" size="small" />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderColumnProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="宽度" size="small">
                        <NInput value={nodeProps.width || '100%'} onUpdate:value={(v: string) => updateProp('width', v)} placeholder="如 50%" size="small" />
                    </NFormItem>
                    <NFormItem label="垂直对齐" size="small">
                        <NSelect
                            value={nodeProps['vertical-align'] || 'top'}
                            onUpdate:value={(v: string) => updateProp('vertical-align', v)}
                            size="small"
                            options={[
                                { label: '顶部', value: 'top' },
                                { label: '居中', value: 'middle' },
                                { label: '底部', value: 'bottom' }
                            ]}
                        />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderTextProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="内容" size="small">
                        <NInput
                            type="textarea"
                            value={nodeProps.content || ''}
                            onUpdate:value={(v: string) => updateProp('content', v)}
                            rows={4}
                            size="small"
                            placeholder="支持 HTML"
                        />
                    </NFormItem>
                    <NFormItem label="字号" size="small">
                        <NInput value={nodeProps['font-size'] || '14px'} onUpdate:value={(v: string) => updateProp('font-size', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="颜色" size="small">
                        <NColorPicker value={nodeProps.color || '#333333'} onUpdate:value={(v: string) => updateProp('color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="行高" size="small">
                        <NInput value={nodeProps['line-height'] || '1.6'} onUpdate:value={(v: string) => updateProp('line-height', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="对齐" size="small">
                        {renderAlignSelect(nodeProps.align)}
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderImageProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="图片URL" size="small">
                        <NInput value={nodeProps.src || ''} onUpdate:value={(v: string) => updateProp('src', v)} placeholder="https://..." size="small" />
                    </NFormItem>
                    <NFormItem label="替代文字" size="small">
                        <NInput value={nodeProps.alt || ''} onUpdate:value={(v: string) => updateProp('alt', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="宽度" size="small">
                        <NInput value={nodeProps.width || '100%'} onUpdate:value={(v: string) => updateProp('width', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="圆角" size="small">
                        <NInput value={nodeProps['border-radius'] || '0px'} onUpdate:value={(v: string) => updateProp('border-radius', v)} size="small" />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderButtonProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="按钮文字" size="small">
                        <NInput value={nodeProps.content || ''} onUpdate:value={(v: string) => updateProp('content', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="链接" size="small">
                        <NInput value={nodeProps.href || '#'} onUpdate:value={(v: string) => updateProp('href', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="背景色" size="small">
                        <NColorPicker value={nodeProps['background-color'] || '#4F46E5'} onUpdate:value={(v: string) => updateProp('background-color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="文字颜色" size="small">
                        <NColorPicker value={nodeProps.color || '#ffffff'} onUpdate:value={(v: string) => updateProp('color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="字号" size="small">
                        <NInput value={nodeProps['font-size'] || '14px'} onUpdate:value={(v: string) => updateProp('font-size', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="圆角" size="small">
                        <NInput value={nodeProps['border-radius'] || '6px'} onUpdate:value={(v: string) => updateProp('border-radius', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="对齐" size="small">
                        {renderAlignSelect(nodeProps.align)}
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderDividerProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="线条颜色" size="small">
                        <NColorPicker value={nodeProps['border-color'] || '#E5E7EB'} onUpdate:value={(v: string) => updateProp('border-color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="线条粗细" size="small">
                        <NInput value={nodeProps['border-width'] || '1px'} onUpdate:value={(v: string) => updateProp('border-width', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="线条样式" size="small">
                        <NSelect
                            value={nodeProps['border-style'] || 'solid'}
                            onUpdate:value={(v: string) => updateProp('border-style', v)}
                            size="small"
                            options={[
                                { label: '实线', value: 'solid' },
                                { label: '虚线', value: 'dashed' },
                                { label: '点线', value: 'dotted' }
                            ]}
                        />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderSocialProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="图标大小" size="small">
                        <NInput value={nodeProps['icon-size'] || '24px'} onUpdate:value={(v: string) => updateProp('icon-size', v)} size="small" />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderHeroProps(nodeProps: Record<string, any>) {
            return (
                <>
                    <NFormItem label="内容" size="small">
                        <NInput type="textarea" value={nodeProps.content || ''} onUpdate:value={(v: string) => updateProp('content', v)} rows={3} size="small" placeholder="支持 HTML" />
                    </NFormItem>
                    <NFormItem label="背景色" size="small">
                        <NColorPicker value={nodeProps['background-color'] || '#4F46E5'} onUpdate:value={(v: string) => updateProp('background-color', v)} size="small" />
                    </NFormItem>
                    <NFormItem label="高度" size="small">
                        <NInput value={nodeProps['background-height'] || '300px'} onUpdate:value={(v: string) => updateProp('background-height', v)} size="small" />
                    </NFormItem>
                    {renderCommonProps(nodeProps)}
                </>
            )
        }

        function renderPropsByType(node: CanvasNode) {
            const p = node.props
            switch (node.type) {
                case 'mj-section': return renderSectionProps(p)
                case 'mj-column': return renderColumnProps(p)
                case 'mj-text': return renderTextProps(p)
                case 'mj-image': return renderImageProps(p)
                case 'mj-button': return renderButtonProps(p)
                case 'mj-divider': return renderDividerProps(p)
                case 'mj-social': return renderSocialProps(p)
                case 'mj-hero': return renderHeroProps(p)
                default: return null
            }
        }

        const defInfo = computed(() => props.node ? getComponentDef(props.node.type) : null)

        return () => (
            <div class="property-panel">
                {props.node ? (
                    <div class="property-panel-content">
                        <div class="property-panel-header">
                            <span>{defInfo.value?.icon} {defInfo.value?.label}</span>
                        </div>
                        <div class="property-panel-form">
                            {renderPropsByType(props.node)}
                        </div>
                        {props.variables.length > 0 && (
                            <>
                                <NDivider style={{ margin: '12px 0' }} />
                                <div class="property-panel-vars">
                                    <NText depth={3} style={{ fontSize: '12px' }}>插入变量</NText>
                                    <div class="flex flex-wrap gap-4" style={{ marginTop: '6px' }}>
                                        {props.variables.map((v: any) => (
                                            <NButton
                                                key={v.varKey}
                                                size="tiny"
                                                secondary
                                                onClick={() => emit('insert-variable', v.varKey)}
                                            >
                                                {`{{${v.varKey}}}`}
                                            </NButton>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <NDivider style={{ margin: '12px 0' }} />
                        <NButton type="error" size="small" block secondary onClick={() => emit('delete', props.node!.id)}>
                            删除组件
                        </NButton>
                    </div>
                ) : (
                    <div class="property-panel-empty">
                        <span style={{ fontSize: '32px', opacity: 0.3 }}>👆</span>
                        <NText depth={3} style={{ fontSize: '13px' }}>
                            点击画布中的组件<br />编辑其属性
                        </NText>
                    </div>
                )}
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.property-panel {
    height: 100%;
    overflow-y: auto;
    &-content {
        padding: 12px;
    }
    &-header {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 12px;
    }
    &-form {
        :deep(.n-form-item) {
            margin-bottom: 8px;
            .n-form-item-label {
                font-size: 12px;
            }
        }
    }
    &-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        height: 100%;
        text-align: center;
    }
}
</style>
