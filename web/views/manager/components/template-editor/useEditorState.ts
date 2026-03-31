import { reactive, computed, toRaw } from 'vue'
import { type CanvasNode, type MjmlComponentType, createDefaultNode } from './componentDefs'

/**
 * 编辑器状态管理 composable
 */
export function useEditorState() {
    const state = reactive({
        /** 画布组件树 */
        canvas: [] as CanvasNode[],
        /** 当前选中组件 ID */
        selectedId: null as string | null,
        /** 模板名称 */
        templateName: '',
        /** 分类 ID */
        categoryId: null as number | null,
        /** 模板 ID（编辑模式有值） */
        templateId: null as number | null,
        /** 撤销栈 */
        history: [] as string[],
        /** 当前历史位置 */
        historyIndex: -1,
        /** 是否编辑过（脏标记） */
        dirty: false
    })

    /** 选中的节点 */
    const selectedNode = computed<CanvasNode | null>(() => {
        if (!state.selectedId) return null
        return findNodeById(state.canvas, state.selectedId)
    })

    /** 递归查找节点 */
    function findNodeById(nodes: CanvasNode[], id: string): CanvasNode | null {
        for (const node of nodes) {
            if (node.id === id) return node
            if (node.children?.length) {
                const found = findNodeById(node.children, id)
                if (found) return found
            }
        }
        return null
    }

    /** 递归查找父节点 */
    function findParent(nodes: CanvasNode[], id: string, parent: CanvasNode | null = null): CanvasNode | null {
        for (const node of nodes) {
            if (node.id === id) return parent
            if (node.children?.length) {
                const found = findParent(node.children, id, node)
                if (found) return found
            }
        }
        return null
    }

    /** 记录历史快照 */
    function pushHistory() {
        const snapshot = JSON.stringify(toRaw(state.canvas))
        // 截断当前位置后面的历史
        if (state.historyIndex < state.history.length - 1) {
            state.history.splice(state.historyIndex + 1)
        }
        state.history.push(snapshot)
        state.historyIndex = state.history.length - 1
        // 限制历史记录数量
        if (state.history.length > 50) {
            state.history.shift()
            state.historyIndex--
        }
        state.dirty = true
    }

    /** 添加节点 */
    function addNode(type: MjmlComponentType, parentId?: string, index?: number) {
        const newNode = createDefaultNode(type)
        if (parentId) {
            const parent = findNodeById(state.canvas, parentId)
            if (parent) {
                if (typeof index === 'number') {
                    parent.children.splice(index, 0, newNode)
                } else {
                    parent.children.push(newNode)
                }
            }
        } else {
            if (typeof index === 'number') {
                state.canvas.splice(index, 0, newNode)
            } else {
                state.canvas.push(newNode)
            }
        }
        pushHistory()
        return newNode
    }

    /** 移除节点 */
    function removeNode(nodeId: string) {
        function remove(nodes: CanvasNode[]): boolean {
            const idx = nodes.findIndex(n => n.id === nodeId)
            if (idx !== -1) {
                nodes.splice(idx, 1)
                return true
            }
            for (const node of nodes) {
                if (node.children?.length && remove(node.children)) return true
            }
            return false
        }
        remove(state.canvas)
        if (state.selectedId === nodeId) {
            state.selectedId = null
        }
        pushHistory()
    }

    /** 选中节点 */
    function selectNode(id: string | null) {
        state.selectedId = id
    }

    /** 更新节点属性 */
    function updateNodeProps(nodeId: string, props: Record<string, any>) {
        const node = findNodeById(state.canvas, nodeId)
        if (node) {
            Object.assign(node.props, props)
            pushHistory()
        }
    }

    /** 撤销 */
    function undo() {
        if (state.historyIndex > 0) {
            state.historyIndex--
            state.canvas.splice(0, state.canvas.length, ...JSON.parse(state.history[state.historyIndex]))
        }
    }

    /** 重做 */
    function redo() {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++
            state.canvas.splice(0, state.canvas.length, ...JSON.parse(state.history[state.historyIndex]))
        }
    }

    /** 加载画布数据 */
    function loadCanvas(canvasJson: string | CanvasNode[]) {
        const data = typeof canvasJson === 'string' ? JSON.parse(canvasJson) : canvasJson
        state.canvas.splice(0, state.canvas.length, ...data)
        state.selectedId = null
        state.history = [JSON.stringify(data)]
        state.historyIndex = 0
        state.dirty = false
    }

    /** 获取原始画布数据 */
    function getCanvasJson(): string {
        return JSON.stringify(toRaw(state.canvas))
    }

    /** 初始化空白画布 */
    function initBlankCanvas() {
        const section = createDefaultNode('mj-section')
        state.canvas.splice(0, state.canvas.length, section)
        state.history = [JSON.stringify([section])]
        state.historyIndex = 0
        state.dirty = false
    }

    const canUndo = computed(() => state.historyIndex > 0)
    const canRedo = computed(() => state.historyIndex < state.history.length - 1)

    return {
        state,
        selectedNode,
        canUndo,
        canRedo,
        findNodeById,
        findParent,
        addNode,
        removeNode,
        selectNode,
        updateNodeProps,
        undo,
        redo,
        loadCanvas,
        getCanvasJson,
        initBlankCanvas,
        pushHistory
    }
}
