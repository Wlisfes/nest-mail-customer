<script lang="tsx">
import { defineComponent } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerStatCards',
    setup() {
        const { state } = useState({
            cards: [
                {
                    label: '总邮件数',
                    value: faker.number.int({ min: 1200, max: 9800 }),
                    trend: faker.number.float({ min: 2, max: 18, fractionDigits: 1 }),
                    trendUp: true,
                    color: 'rgba(99, 125, 255, 0.15)',
                    textColor: '#536dfe'
                },
                {
                    label: '未读邮件',
                    value: faker.number.int({ min: 10, max: 120 }),
                    trend: faker.number.float({ min: 1, max: 12, fractionDigits: 1 }),
                    trendUp: false,
                    color: 'rgba(240, 160, 32, 0.15)',
                    textColor: '#f0a020'
                },
                {
                    label: '今日发送',
                    value: faker.number.int({ min: 3, max: 45 }),
                    trend: faker.number.float({ min: 5, max: 25, fractionDigits: 1 }),
                    trendUp: true,
                    color: 'rgba(24, 160, 88, 0.15)',
                    textColor: '#18a058'
                },
                {
                    label: '附件邮件',
                    value: faker.number.int({ min: 50, max: 500 }),
                    trend: faker.number.float({ min: 0.5, max: 8, fractionDigits: 1 }),
                    trendUp: true,
                    color: 'rgba(208, 48, 80, 0.15)',
                    textColor: '#d03050'
                }
            ]
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
