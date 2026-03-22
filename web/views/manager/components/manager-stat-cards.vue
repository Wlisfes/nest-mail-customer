<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { httpFetchDashboardStats } from '@/api'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerStatCards',
    setup() {
        const { state, setState } = useState({
            cards: [
                {
                    label: '总邮件数',
                    value: 0,
                    trend: 0,
                    trendUp: true,
                    color: 'rgba(99, 125, 255, 0.15)',
                    textColor: '#536dfe'
                },
                {
                    label: '未读邮件',
                    value: 0,
                    trend: 0,
                    trendUp: false,
                    color: 'rgba(240, 160, 32, 0.15)',
                    textColor: '#f0a020'
                },
                {
                    label: '今日发送',
                    value: 0,
                    trend: 0,
                    trendUp: true,
                    color: 'rgba(24, 160, 88, 0.15)',
                    textColor: '#18a058'
                },
                {
                    label: '附件邮件',
                    value: 0,
                    trend: 0,
                    trendUp: true,
                    color: 'rgba(208, 48, 80, 0.15)',
                    textColor: '#d03050'
                }
            ]
        })

        onMounted(async () => {
            try {
                const res: any = await httpFetchDashboardStats()
                const data = res.data ?? res
                setState({
                    cards: [
                        { ...state.cards[0], value: data.totalMails ?? 0 },
                        { ...state.cards[1], value: data.unreadMails ?? 0 },
                        { ...state.cards[2], value: data.sentToday ?? 0 },
                        { ...state.cards[3], value: data.attachmentMails ?? 0 }
                    ]
                })
            } catch (err) {
                console.error('获取统计数据失败', err)
            }
        })

        return () => (
            <div class="manager-stat-cards">
                {state.cards.map((card, index) => (
                    <n-card key={index} class="manager-stat-card" hoverable content-class="p-16!">
                        <div class="flex items-center gap-16">
                            <div
                                class="stat-icon-wrap"
                                style={{ background: card.color }}
                            >
                                <n-text style={{ color: card.textColor, fontSize: '22px', fontWeight: 700 }}>
                                    {card.label.charAt(0)}
                                </n-text>
                            </div>
                            <div class="flex flex-col flex-1">
                                <n-text depth={3} class="text-12">{card.label}</n-text>
                                <div class="flex items-end gap-8">
                                    <n-text class="text-24" style={{ fontWeight: 700 }}>
                                        {card.value.toLocaleString()}
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
