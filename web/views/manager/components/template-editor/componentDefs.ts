/**
 * MJML 组件类型定义 & 默认属性
 */

export type MjmlComponentType =
    | 'mj-section'
    | 'mj-column'
    | 'mj-text'
    | 'mj-image'
    | 'mj-button'
    | 'mj-divider'
    | 'mj-social'
    | 'mj-hero'

export interface CanvasNode {
    id: string
    type: MjmlComponentType
    props: Record<string, any>
    children: CanvasNode[]
}

/** 组件分组 */
export type ComponentGroup = 'layout' | 'content'

export interface ComponentDef {
    type: MjmlComponentType
    label: string
    icon: string
    group: ComponentGroup
    /** 允许包含的子组件类型 */
    allowChildren?: MjmlComponentType[]
    /** 默认属性 */
    defaultProps: Record<string, any>
}

/** 内容组件类型（可放入 column 的） */
export const CONTENT_TYPES: MjmlComponentType[] = ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-social']

/** 组件定义注册表 */
export const componentDefs: ComponentDef[] = [
    // 布局组件
    {
        type: 'mj-section',
        label: '段落容器',
        icon: '📦',
        group: 'layout',
        allowChildren: ['mj-column'],
        defaultProps: {
            'background-color': '#ffffff',
            padding: '20px 0',
            'border-radius': '0px'
        }
    },
    {
        type: 'mj-column',
        label: '列布局',
        icon: '▤',
        group: 'layout',
        allowChildren: ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-social'],
        defaultProps: {
            width: '100%',
            padding: '0',
            'vertical-align': 'top'
        }
    },
    // 内容组件
    {
        type: 'mj-text',
        label: '文本块',
        icon: '📝',
        group: 'content',
        defaultProps: {
            content: '<p>在此输入文本...</p>',
            'font-size': '14px',
            color: '#333333',
            'line-height': '1.6',
            align: 'left',
            padding: '10px 25px'
        }
    },
    {
        type: 'mj-image',
        label: '图片',
        icon: '🖼',
        group: 'content',
        defaultProps: {
            src: 'https://placehold.co/600x300/E0E7FF/4F46E5?text=Image',
            alt: '图片',
            width: '100%',
            padding: '10px 25px',
            'border-radius': '0px'
        }
    },
    {
        type: 'mj-button',
        label: '按钮',
        icon: '🔘',
        group: 'content',
        defaultProps: {
            content: '点击按钮',
            'background-color': '#4F46E5',
            color: '#ffffff',
            'font-size': '14px',
            'border-radius': '6px',
            padding: '10px 25px',
            'inner-padding': '10px 25px',
            href: '#',
            align: 'center'
        }
    },
    {
        type: 'mj-divider',
        label: '分隔线',
        icon: '➖',
        group: 'content',
        defaultProps: {
            'border-color': '#E5E7EB',
            'border-width': '1px',
            'border-style': 'solid',
            padding: '10px 25px'
        }
    },
    {
        type: 'mj-social',
        label: '社交链接',
        icon: '🌐',
        group: 'content',
        defaultProps: {
            mode: 'horizontal',
            padding: '10px 25px',
            'icon-size': '24px',
            links: [
                { name: 'facebook', href: '#' },
                { name: 'twitter', href: '#' },
                { name: 'linkedin', href: '#' }
            ]
        }
    },
    {
        type: 'mj-hero',
        label: '横幅',
        icon: '🏔',
        group: 'content',
        defaultProps: {
            'background-color': '#4F46E5',
            'background-height': '300px',
            mode: 'fixed-height',
            padding: '40px 20px',
            content: '<h1 style="color:#fff;text-align:center">横幅标题</h1>',
            'vertical-align': 'middle'
        }
    }
]

/** 根据类型获取定义 */
export function getComponentDef(type: MjmlComponentType): ComponentDef | undefined {
    return componentDefs.find(d => d.type === type)
}

/** 创建默认节点 */
export function createDefaultNode(type: MjmlComponentType, id?: string): CanvasNode {
    const def = getComponentDef(type)
    const nodeId = id || `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const node: CanvasNode = {
        id: nodeId,
        type,
        props: { ...(def?.defaultProps ?? {}) },
        children: []
    }
    // section 默认包含一个 column
    if (type === 'mj-section') {
        node.children = [createDefaultNode('mj-column')]
    }
    return node
}
