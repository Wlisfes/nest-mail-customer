<script lang="tsx">
import { defineComponent, h, computed } from 'vue'
import { componentDefs, type MjmlComponentType, type ComponentDef } from './componentDefs'

export default defineComponent({
    name: 'ComponentPanel',
    emits: ['drag-start'],
    setup(_, { emit }) {
        const layoutComponents = computed(() => componentDefs.filter(d => d.group === 'layout'))
        const contentComponents = computed(() => componentDefs.filter(d => d.group === 'content'))

        function renderGroup(title: string, items: ComponentDef[]) {
            return (
                <div class="component-group">
                    <div class="component-group-title">{title}</div>
                    <div class="component-group-items">
                        {items.map(item => (
                            <div
                                key={item.type}
                                class="component-item"
                                draggable={true}
                                onDragstart={(e: DragEvent) => {
                                    e.dataTransfer?.setData('componentType', item.type)
                                    emit('drag-start', item.type)
                                }}
                            >
                                <span class="component-item-icon">{item.icon}</span>
                                <span class="component-item-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return () => (
            <div class="component-panel">
                <div class="component-panel-title">组件</div>
                {renderGroup('📦 布局', layoutComponents.value)}
                {renderGroup('📝 内容', contentComponents.value)}
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.component-panel {
    height: 100%;
    overflow-y: auto;
    padding: 12px;
    &-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 12px;
        opacity: 0.8;
    }
}
.component-group {
    margin-bottom: 16px;
    &-title {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        opacity: 0.6;
    }
    &-items {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
}
.component-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s ease;
    font-size: 13px;
    &:hover {
        background: var(--n-color-hover, rgba(99, 102, 241, 0.08));
    }
    &:active {
        cursor: grabbing;
        opacity: 0.6;
    }
    &-icon {
        font-size: 16px;
        line-height: 1;
    }
    &-label {
        line-height: 1;
    }
}
</style>
