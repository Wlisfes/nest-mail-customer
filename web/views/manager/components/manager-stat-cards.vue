<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { httpFetchDashboardStats } from '@/api'
import { useState } from '@/hooks'
import CountUp from 'vue-countup-v3'

export default defineComponent({
    name: 'ManagerStatCards',
    setup() {
        const { state, setState } = useState({
            loaded: false,
            cards: [
                {
                    label: '总邮件数',
                    value: 0,
                    trend: 12,
                    trendUp: true,
                    icon: '📧',
                    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                    iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    textColor: '#6366f1'
                },
                {
                    label: '未读邮件',
                    value: 0,
                    trend: 8,
                    trendUp: false,
                    icon: '🔔',
                    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.08) 100%)',
                    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    textColor: '#f59e0b'
                },
                {
                    label: '今日发送',
                    value: 0,
                    trend: 23,
                    trendUp: true,
                    icon: '🚀',
                    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(52,211,153,0.08) 100%)',
                    iconBg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    textColor: '#10b981'
                },
                {
                    label: '附件邮件',
                    value: 0,
                    trend: 5,
                    trendUp: true,
                    icon: '📎',
                    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(248,113,113,0.08) 100%)',
                    iconBg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                    textColor: '#ef4444'
                }
            ]
        })

        onMounted(async () => {
            try {
                const res: any = await httpFetchDashboardStats()
                const data = res.data ?? res
                setState({
                    loaded: true,
                    cards: [
                        { ...state.cards[0], value: data.totalMails ?? 0 },
                        { ...state.cards[1], value: data.unreadMails ?? 0 },
                        { ...state.cards[2], value: data.sentToday ?? 0 },
                        { ...state.cards[3], value: data.attachmentMails ?? 0 }
                    ]
                })
            } catch (err) {
                console.error('获取统计数据失败', err)
                setState({ loaded: true })
            }
        })

        return () => (
            <div class="manager-stat-cards">
                {state.cards.map((card, index) => (
                    <n-card
                        key={index}
                        class={['manager-stat-card animate-fadeInUp', `animate-stagger-${index + 1}`]}
                        hoverable
                        content-class="p-20!"
                        style={{ background: card.gradient }}
                    >
                        <div class="flex items-center gap-16">
                            <div
                                class="stat-icon-wrap"
                                style={{ background: card.iconBg }}
                            >
                                <span style={{ fontSize: '24px', filter: 'grayscale(0) brightness(2)' }}>
                                    {card.icon}
                                </span>
                            </div>
                            <div class="flex flex-col flex-1">
                                <n-text depth={3} class="text-12" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    {card.label}
                                </n-text>
                                <div class="flex items-end gap-8">
                                    <n-text class="text-28" style={{ fontWeight: 800, lineHeight: 1.2 }}>
                                        {state.loaded ? (
                                            <CountUp endVal={card.value} duration={2} options={{ separator: ',' }} />
                                        ) : '—'}
                                    </n-text>
                                    <span class={['stat-trend', card.trendUp ? 'up' : 'down']}>
                                        {card.trendUp ? '↑' : '↓'} {card.trend}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </n-card>
                ))}
            </div>
        )
    }
})
</script>
