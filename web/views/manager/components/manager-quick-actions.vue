<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerQuickActions',
    setup() {
        const { state } = useState({
            actions: [
                {
                    label: '写邮件',
                    desc: '撰写并发送新邮件',
                    color: 'rgba(99, 125, 255, 0.15)',
                    textColor: '#536dfe',
                    icon: '✉'
                },
                {
                    label: '添加邮箱',
                    desc: '绑定新的邮箱账户',
                    color: 'rgba(24, 160, 88, 0.15)',
                    textColor: '#18a058',
                    icon: '＋'
                },
                {
                    label: '全部同步',
                    desc: '同步所有邮箱收件',
                    color: 'rgba(240, 160, 32, 0.15)',
                    textColor: '#f0a020',
                    icon: '⟳'
                },
                {
                    label: '搜索邮件',
                    desc: '按关键词搜索邮件',
                    color: 'rgba(208, 48, 80, 0.15)',
                    textColor: '#d03050',
                    icon: '⌕'
                }
            ]
        })

        return () => (
            <n-card hoverable content-class="p-16!">
                <n-text class="text-16" style={{ fontWeight: 600 }}>快捷操作</n-text>
                <div class="manager-quick-actions m-bs-16">
                    {state.actions.map((action, index) => (
                        <n-card
                            key={index}
                            class="manager-action-card"
                            hoverable
                            content-class="p-12!"
                        >
                            <div class="flex items-center gap-12">
                                <div
                                    class="action-icon-wrap"
                                    style={{ background: action.color }}
                                >
                                    <span style={{ color: action.textColor, fontSize: '20px' }}>
                                        {action.icon}
                                    </span>
                                </div>
                                <div class="flex flex-col">
                                    <n-text class="text-14" style={{ fontWeight: 600 }}>
                                        {action.label}
                                    </n-text>
                                    <n-text depth={3} class="text-12">
                                        {action.desc}
                                    </n-text>
                                </div>
                            </div>
                        </n-card>
                    ))}
                </div>
            </n-card>
        )
    }
})
</script>
