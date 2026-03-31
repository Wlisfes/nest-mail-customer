import { type CanvasNode } from './componentDefs'

/**
 * canvasJson → MJML 源码转换器
 * 递归遍历 CanvasNode[] 生成合法 MJML XML 字符串
 */
export function canvasToMjml(nodes: CanvasNode[]): string {
    const body = nodes.map(node => nodeToMjml(node)).join('\n')
    return `<mjml>
  <mj-body>
${body}
  </mj-body>
</mjml>`
}

function nodeToMjml(node: CanvasNode, indent: string = '    '): string {
    const tag = node.type
    const props = { ...node.props }

    switch (tag) {
        case 'mj-section':
            return renderSection(node, props, indent)
        case 'mj-column':
            return renderColumn(node, props, indent)
        case 'mj-text':
            return renderText(props, indent)
        case 'mj-image':
            return renderSelfClosing('mj-image', props, indent)
        case 'mj-button':
            return renderButton(props, indent)
        case 'mj-divider':
            return renderSelfClosing('mj-divider', props, indent)
        case 'mj-social':
            return renderSocial(props, indent)
        case 'mj-hero':
            return renderHero(node, props, indent)
        default:
            return ''
    }
}

function renderSection(node: CanvasNode, props: Record<string, any>, indent: string): string {
    const attrs = propsToAttrs(props)
    const children = node.children.map(c => nodeToMjml(c, indent + '  ')).join('\n')
    return `${indent}<mj-section${attrs}>
${children}
${indent}</mj-section>`
}

function renderColumn(node: CanvasNode, props: Record<string, any>, indent: string): string {
    const attrs = propsToAttrs(props)
    const children = node.children.map(c => nodeToMjml(c, indent + '  ')).join('\n')
    return `${indent}<mj-column${attrs}>
${children}
${indent}</mj-column>`
}

function renderText(props: Record<string, any>, indent: string): string {
    const content = props.content || ''
    const filteredProps = { ...props }
    delete filteredProps.content
    const attrs = propsToAttrs(filteredProps)
    return `${indent}<mj-text${attrs}>${content}</mj-text>`
}

function renderButton(props: Record<string, any>, indent: string): string {
    const content = props.content || '按钮'
    const filteredProps = { ...props }
    delete filteredProps.content
    const attrs = propsToAttrs(filteredProps)
    return `${indent}<mj-button${attrs}>${content}</mj-button>`
}

function renderSelfClosing(tag: string, props: Record<string, any>, indent: string): string {
    const attrs = propsToAttrs(props)
    return `${indent}<${tag}${attrs} />`
}

function renderSocial(props: Record<string, any>, indent: string): string {
    const links: Array<{ name: string; href: string }> = props.links || []
    const filteredProps = { ...props }
    delete filteredProps.links
    const attrs = propsToAttrs(filteredProps)
    const elements = links.map(l => `${indent}  <mj-social-element name="${l.name}" href="${l.href}" />`).join('\n')
    return `${indent}<mj-social${attrs}>
${elements}
${indent}</mj-social>`
}

function renderHero(node: CanvasNode, props: Record<string, any>, indent: string): string {
    const content = props.content || ''
    const filteredProps = { ...props }
    delete filteredProps.content
    const attrs = propsToAttrs(filteredProps)
    return `${indent}<mj-hero${attrs}>
${indent}  <mj-text color="#ffffff">${content}</mj-text>
${indent}</mj-hero>`
}

/** 属性对象转 XML 属性字符串 */
function propsToAttrs(props: Record<string, any>): string {
    const entries = Object.entries(props).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    if (entries.length === 0) return ''
    return ' ' + entries.map(([k, v]) => `${k}="${String(v)}"`).join(' ')
}
