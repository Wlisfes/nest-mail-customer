<script lang="tsx">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { $message } from '@/utils'
import { httpSyncAllMailAccounts } from '@/api'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerQuickActions',
    setup() {
        const router = useRouter()
        const { state, setState } = useState({ syncing: false })

        const actions = [
            {
                label: '写邮件',
                desc: '撰写并发送新邮件',
                gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                bgColor: 'rgba(99,102,241,0.1)',
                icon: '✉️',
                route: '/manager/compose'
            },
            {
                label: '添加邮箱',
                desc: '绑定新的邮箱账户',
                gradient: 'linear-gradient(135deg, #10b981, #34d399)',
                bgColor: 'rgba(16,185,129,0.1)',
                icon: '➕',
                route: '/manager/accounts'
            },
            {
                label: '全部同步',
                desc: '同步所有邮箱收件',
                gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                bgColor: 'rgba(245,158,11,0.1)',
                icon: '🔄',
                action: 'sync'
            },
            {
                label: '收件箱',
                desc: '查看最新收件邮件',
                gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
                bgColor: 'rgba(239,68,68,0.1)',
                icon: '📥',
                route: '/manager/inbox'
            }
        ]

        async function handleClick(action: (typeof actions)[0]) {
            if (action.action === 'sync') {
                if (state.syncing) return
                await setState({ syncing: true })
                try {
                    await httpSyncAllMailAccounts()
                    $message.success('同步任务已启动')
                } catch (err: any) {
                    $message.error(err.message || '同步失败')
                } finally {
                    await setState({ syncing: false })
                }
            } else if (action.route) {
                router.push(action.route)
            }
        }

        return () => (
            <n-card hoverable content-class="p-24!" class="animate-fadeInUp animate-stagger-3" style={{ borderRadius: '16px' }}>
                <n-text class="text-16" style={{ fontWeight: 700 }}>
                    快捷操作
                </n-text>
                <div class="manager-quick-actions flex flex-col gap-20 m-bs-20">
                    {actions.map((action, index) => (
                        <n-card
                            key={index}
                            class={['manager-action-card animate-fadeInUp', `animate-stagger-${index + 4}`]}
                            hoverable
                            content-class="p-14!"
                            onClick={() => handleClick(action)}
                        >
                            <div class="flex items-center gap-12">
                                <div class="action-icon-wrap" style={{ background: action.bgColor }}>
                                    <span style={{ fontSize: '20px' }}>{action.icon}</span>
                                </div>
                                <div class="flex flex-col flex-1">
                                    <n-text class="text-14" style={{ fontWeight: 700 }}>
                                        {action.label}
                                    </n-text>
                                    <n-text depth={3} class="text-12">
                                        {action.desc}
                                    </n-text>
                                </div>
                                <n-text depth={3} style={{ fontSize: '16px' }}>
                                    →
                                </n-text>
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '3px',
                                    borderRadius: '0 3px 3px 0',
                                    background: action.gradient
                                }}
                            ></div>
                        </n-card>
                    ))}
                </div>
            </n-card>
        )
    }
})
</script>
