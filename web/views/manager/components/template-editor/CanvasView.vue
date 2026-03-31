<script lang="tsx">
/**
 * 画布视图 - 拖拽编辑区域
 * 支持从左侧面板拖入组件、画布内排序、选中高亮
 */
import { defineComponent, type PropType, h } from 'vue'
import { type CanvasNode, type MjmlComponentType, createDefaultNode, CONTENT_TYPES } from './componentDefs'

export default defineComponent({
    name: 'CanvasView',
    props: {
        canvas: { type: Array as PropType<CanvasNode[]>, required: true },
        selectedId: { type: String as PropType<string | null>, default: null }
    },
    emits: ['select', 'drop', 'update:canvas'],
    setup(props, { emit }) {
        function handleDragOver(e: DragEvent) {
            e.preventDefault()
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
        }

        function handleDrop(e: DragEvent, parentId?: string, index?: number) {
            e.preventDefault()
            e.stopPropagation()
            const type = e.dataTransfer?.getData('componentType') as MjmlComponentType
            if (type) {
                emit('drop', { type, parentId, index })
            }
        }

        function renderNode(node: CanvasNode): any {
            const isSelected = props.selectedId === node.id
            const baseClass = `canvas-node canvas-node--${node.type} ${isSelected ? 'canvas-node--selected' : ''}`

            switch (node.type) {
                case 'mj-section':
                    return (
                        <div
                            class={baseClass}
                            style={{
                                backgroundColor: node.props['background-color'] || '#ffffff',
                                padding: node.props.padding || '20px 0',
                                borderRadius: node.props['border-radius'] || '0'
                            }}
                            onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}
                            onDragover={handleDragOver}
                            onDrop={(e: DragEvent) => handleDrop(e, node.id)}
                        >
                            <div class="canvas-node-label">Section</div>
                            <div class="canvas-section-columns">
                                {node.children.map(child => renderNode(child))}
                            </div>
                            {isSelected && <div class="canvas-node-actions"><span class="canvas-delete" onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', `delete:${node.id}`) }}>✕</span></div>}
                        </div>
                    )
                case 'mj-column':
                    return (
                        <div
                            class={baseClass}
                            style={{ width: node.props.width || '100%', padding: node.props.padding || '0' }}
                            onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}
                            onDragover={handleDragOver}
                            onDrop={(e: DragEvent) => handleDrop(e, node.id)}
                        >
                            {node.children.length === 0 ? (
                                <div class="canvas-column-empty">拖入组件到此处</div>
                            ) : (
                                node.children.map(child => renderNode(child))
                            )}
                        </div>
                    )
                case 'mj-text':
                    return (
                        <div
                            class={baseClass}
                            style={{ fontSize: node.props['font-size'] || '14px', color: node.props.color || '#333', lineHeight: node.props['line-height'] || '1.6', textAlign: node.props.align || 'left', padding: node.props.padding || '10px 25px' }}
                            onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}
                            innerHTML={node.props.content || ''}
                        />
                    )
                case 'mj-image':
                    return (
                        <div class={baseClass} style={{ padding: node.props.padding || '10px 25px' }} onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}>
                            <img src={node.props.src} alt={node.props.alt || ''} style={{ width: node.props.width || '100%', borderRadius: node.props['border-radius'] || '0', display: 'block', maxWidth: '100%' }} />
                        </div>
                    )
                case 'mj-button':
                    return (
                        <div class={baseClass} style={{ padding: node.props.padding || '10px 25px', textAlign: node.props.align || 'center' }} onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}>
                            <span style={{
                                display: 'inline-block',
                                padding: node.props['inner-padding'] || '10px 25px',
                                backgroundColor: node.props['background-color'] || '#4F46E5',
                                color: node.props.color || '#fff',
                                fontSize: node.props['font-size'] || '14px',
                                borderRadius: node.props['border-radius'] || '6px',
                                cursor: 'pointer'
                            }}>
                                {node.props.content || '按钮'}
                            </span>
                        </div>
                    )
                case 'mj-divider':
                    return (
                        <div class={baseClass} style={{ padding: node.props.padding || '10px 25px' }} onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}>
                            <hr style={{ border: 'none', borderTop: `${node.props['border-width'] || '1px'} ${node.props['border-style'] || 'solid'} ${node.props['border-color'] || '#E5E7EB'}`, margin: 0 }} />
                        </div>
                    )
                case 'mj-social':
                    return (
                        <div class={baseClass} style={{ padding: node.props.padding || '10px 25px', textAlign: 'center' }} onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                {(node.props.links || []).map((l: any) => (
                                    <span key={l.name} style={{ fontSize: node.props['icon-size'] || '24px' }}>
                                        {l.name === 'facebook' ? '📘' : l.name === 'twitter' ? '🐦' : l.name === 'linkedin' ? '💼' : '🔗'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                case 'mj-hero':
                    return (
                        <div
                            class={baseClass}
                            style={{
                                backgroundColor: node.props['background-color'] || '#4F46E5',
                                padding: node.props.padding || '40px 20px',
                                minHeight: node.props['background-height'] || '200px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff'
                            }}
                            onClick={(e: MouseEvent) => { e.stopPropagation(); emit('select', node.id) }}
                            innerHTML={node.props.content || ''}
                        />
                    )
                default:
                    return null
            }
        }

        return () => (
            <div
                class="canvas-view"
                onDragover={handleDragOver}
                onDrop={(e: DragEvent) => handleDrop(e)}
                onClick={() => emit('select', null)}
            >
                <div class="canvas-email-wrapper">
                    {props.canvas.length === 0 ? (
                        <div class="canvas-empty">
                            <span style={{ fontSize: '48px', opacity: 0.3 }}>📧</span>
                            <span style={{ opacity: 0.5, fontSize: '14px' }}>从左侧拖入组件开始编辑</span>
                        </div>
                    ) : (
                        props.canvas.map(node => renderNode(node))
                    )}
                </div>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.canvas-view {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--n-color-hover, #f5f5f5);
    display: flex;
    justify-content: center;
}
.canvas-email-wrapper {
    width: 600px;
    min-height: 400px;
    background: #ffffff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    overflow: hidden;
}
.canvas-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 400px;
}
.canvas-node {
    position: relative;
    cursor: pointer;
    transition: outline 0.15s ease;
    &:hover {
        outline: 1px dashed rgba(99, 102, 241, 0.4);
    }
    &--selected {
        outline: 2px solid #4F46E5 !important;
    }
    &-label {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 10px;
        color: #4F46E5;
        opacity: 0.6;
        pointer-events: none;
    }
    &-actions {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 10;
    }
}
.canvas-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #EF4444;
    color: #fff;
    font-size: 10px;
    cursor: pointer;
    &:hover { background: #DC2626; }
}
.canvas-section-columns {
    display: flex;
    gap: 0;
    min-height: 40px;
}
.canvas-node--mj-column {
    flex: 1;
    min-height: 40px;
    border: 1px dashed rgba(99, 102, 241, 0.15);
}
.canvas-column-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    font-size: 12px;
    opacity: 0.4;
    border: 1px dashed rgba(99, 102, 241, 0.3);
    border-radius: 4px;
    margin: 4px;
}
</style>
