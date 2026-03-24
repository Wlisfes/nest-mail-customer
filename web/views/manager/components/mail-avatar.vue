<script lang="tsx">
import { defineComponent, h } from 'vue'

// 渐变色预设
const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)'
]

/** 根据字符串哈希生成颜色 */
export function hashColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

/** h() 渲染器 — 用于 DataTable 的 render 列 */
export function renderMailAvatar(email: string, size = 36) {
    const initial = (email?.split('@')[0] ?? '?').charAt(0).toUpperCase()
    return h(
        'div',
        {
            class: 'mail-avatar',
            style: {
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: `${Math.round(size * 0.22)}px`,
                background: hashColor(email ?? ''),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: `${Math.round(size * 0.4)}px`,
                color: '#fff',
                flexShrink: '0',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'transform 0.25s ease'
            }
        },
        initial
    )
}

export default defineComponent({
    name: 'MailAvatar',
    props: {
        email: { type: String, default: '' },
        size: { type: Number, default: 36 },
        gradient: { type: String, default: '' }
    },
    setup(props) {
        return () => {
            const initial = (props.email?.split('@')[0] ?? '?').charAt(0).toUpperCase()
            const radius = Math.round(props.size * 0.22)
            const fontSize = Math.round(props.size * 0.4)
            return (
                <div
                    class="mail-avatar"
                    style={{
                        width: `${props.size}px`,
                        height: `${props.size}px`,
                        borderRadius: `${radius}px`,
                        background: props.gradient || hashColor(props.email),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: `${fontSize}px`,
                        color: '#fff',
                        flexShrink: '0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'transform 0.25s ease'
                    }}
                >
                    {initial}
                </div>
            )
        }
    }
})
</script>
