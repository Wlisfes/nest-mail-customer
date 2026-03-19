<script lang="tsx">
import { defineComponent, ref, onMounted, computed, watch, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DatasetComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMouse, useStore } from '@/store'

/**注册 ECharts 组件**/
echarts.use([
    LineChart,
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DatasetComponent,
    CanvasRenderer
])

export default defineComponent({
    name: 'MailDashboard',
    props: {
        accounts: { type: Array as () => Array<any>, default: () => [] },
        totalMails: { type: Number, default: 0 },
        unreadMails: { type: Number, default: 0 }
    },
    setup(props) {
        const { theme } = useStore(useMouse)
        const trendChartRef = ref<HTMLElement | null>(null)
        const pieChartRef = ref<HTMLElement | null>(null)
        const barChartRef = ref<HTMLElement | null>(null)
        const trendChart = shallowRef<echarts.ECharts | null>(null)
        const pieChart = shallowRef<echarts.ECharts | null>(null)
        const barChart = shallowRef<echarts.ECharts | null>(null)

        /**模拟数据**/
        const stats = computed(() => ({
            totalMails: props.totalMails || 1284,
            unreadMails: props.unreadMails || 36,
            todaySent: 12,
            todayReceived: 28,
            accountCount: props.accounts.length || 3
        }))

        /**生成最近7天日期**/
        function getLast7Days() {
            const days = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                days.push(`${d.getMonth() + 1}/${d.getDate()}`)
            }
            return days
        }

        /**邮件趋势折线图**/
        function initTrendChart() {
            if (!trendChartRef.value) return
            const isDark = theme.value === 'dark'
            trendChart.value = echarts.init(trendChartRef.value, isDark ? 'dark' : undefined)
            trendChart.value.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: isDark ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    textStyle: { color: isDark ? '#cdd6f4' : '#333' }
                },
                legend: {
                    data: ['收到', '发送'],
                    right: 16,
                    top: 12,
                    textStyle: { color: isDark ? '#a6adc8' : '#666' }
                },
                grid: { left: 40, right: 24, top: 48, bottom: 32 },
                xAxis: {
                    type: 'category',
                    data: getLast7Days(),
                    axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' } },
                    axisLabel: { color: isDark ? '#a6adc8' : '#999' }
                },
                yAxis: {
                    type: 'value',
                    splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } },
                    axisLabel: { color: isDark ? '#a6adc8' : '#999' }
                },
                series: [
                    {
                        name: '收到',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        data: [32, 45, 28, 51, 38, 42, 28],
                        lineStyle: { width: 3, color: '#536dfe' },
                        itemStyle: { color: '#536dfe' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(83,109,254,0.25)' },
                                { offset: 1, color: 'rgba(83,109,254,0.02)' }
                            ])
                        }
                    },
                    {
                        name: '发送',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        data: [18, 12, 22, 15, 8, 19, 12],
                        lineStyle: { width: 3, color: '#7c4dff' },
                        itemStyle: { color: '#7c4dff' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(124,77,255,0.2)' },
                                { offset: 1, color: 'rgba(124,77,255,0.02)' }
                            ])
                        }
                    }
                ]
            })
        }

        /**邮箱来源饼图**/
        function initPieChart() {
            if (!pieChartRef.value) return
            const isDark = theme.value === 'dark'
            pieChart.value = echarts.init(pieChartRef.value, isDark ? 'dark' : undefined)
            pieChart.value.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: isDark ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    textStyle: { color: isDark ? '#cdd6f4' : '#333' }
                },
                legend: {
                    orient: 'vertical',
                    right: 16,
                    top: 'center',
                    textStyle: { color: isDark ? '#a6adc8' : '#666' }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['45%', '70%'],
                        center: ['35%', '50%'],
                        avoidLabelOverlap: false,
                        padAngle: 3,
                        itemStyle: { borderRadius: 6 },
                        label: { show: false },
                        emphasis: {
                            label: { show: true, fontSize: 14, fontWeight: 'bold' }
                        },
                        data: [
                            { value: 540, name: 'QQ邮箱', itemStyle: { color: '#536dfe' } },
                            { value: 380, name: '网易163', itemStyle: { color: '#7c4dff' } },
                            { value: 220, name: 'Gmail', itemStyle: { color: '#f5576c' } },
                            { value: 144, name: 'Outlook', itemStyle: { color: '#43e97b' } }
                        ]
                    }
                ]
            })
        }

        /**每周活跃度柱状图**/
        function initBarChart() {
            if (!barChartRef.value) return
            const isDark = theme.value === 'dark'
            barChart.value = echarts.init(barChartRef.value, isDark ? 'dark' : undefined)
            barChart.value.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: isDark ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    textStyle: { color: isDark ? '#cdd6f4' : '#333' }
                },
                grid: { left: 40, right: 16, top: 24, bottom: 32 },
                xAxis: {
                    type: 'category',
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' } },
                    axisLabel: { color: isDark ? '#a6adc8' : '#999' }
                },
                yAxis: {
                    type: 'value',
                    splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } },
                    axisLabel: { color: isDark ? '#a6adc8' : '#999' }
                },
                series: [
                    {
                        type: 'bar',
                        data: [65, 82, 55, 78, 90, 42, 30],
                        barWidth: '50%',
                        itemStyle: {
                            borderRadius: [6, 6, 0, 0],
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#536dfe' },
                                { offset: 1, color: '#7c4dff' }
                            ])
                        }
                    }
                ]
            })
        }

        /**初始化所有图表**/
        function initAllCharts() {
            initTrendChart()
            initPieChart()
            initBarChart()
        }

        /**销毁并重新初始化（主题切换时）**/
        function disposeAndReinit() {
            trendChart.value?.dispose()
            pieChart.value?.dispose()
            barChart.value?.dispose()
            setTimeout(initAllCharts, 100)
        }

        onMounted(() => {
            initAllCharts()
            /**窗口 resize**/
            window.addEventListener('resize', () => {
                trendChart.value?.resize()
                pieChart.value?.resize()
                barChart.value?.resize()
            })
        })

        /**监听主题变化**/
        watch(theme, () => {
            disposeAndReinit()
        })

        /**最近邮件模拟数据**/
        const recentMails = [
            { from: 'GitHub', subject: '您的仓库有新的 Pull Request', time: '10 分钟前', avatar: 'G', color: '#24292e' },
            { from: '阿里云', subject: '服务器到期续费提醒', time: '30 分钟前', avatar: '阿', color: '#ff6a00' },
            { from: 'Figma', subject: '团队设计稿已更新', time: '1 小时前', avatar: 'F', color: '#a259ff' },
            { from: 'Vercel', subject: '部署成功通知 - nest-mail', time: '2 小时前', avatar: 'V', color: '#000' },
            { from: 'Notion', subject: '本周任务总结报告已生成', time: '3 小时前', avatar: 'N', color: '#000' }
        ]

        return () => (
            <div class="mail-dashboard">
                <n-scrollbar style={{ maxHeight: '100%' }}>
                    <div class="dashboard-inner">
                        {/* 欢迎语 */}
                        <div class="dashboard-welcome">
                            <h2 class="welcome-title">欢迎回来 👋</h2>
                            <n-text depth={3} style={{ fontSize: '14px' }}>
                                今天是{' '}
                                {new Date().toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                })}
                            </n-text>
                        </div>

                        {/* 统计卡片 */}
                        <div class="dashboard-stats">
                            <div class="stat-card stat-total">
                                <div class="stat-icon">📧</div>
                                <div class="stat-content">
                                    <div class="stat-value">{stats.value.totalMails}</div>
                                    <div class="stat-label">总邮件数</div>
                                </div>
                            </div>
                            <div class="stat-card stat-unread">
                                <div class="stat-icon">📬</div>
                                <div class="stat-content">
                                    <div class="stat-value">{stats.value.unreadMails}</div>
                                    <div class="stat-label">未读邮件</div>
                                </div>
                            </div>
                            <div class="stat-card stat-received">
                                <div class="stat-icon">📥</div>
                                <div class="stat-content">
                                    <div class="stat-value">{stats.value.todayReceived}</div>
                                    <div class="stat-label">今日收到</div>
                                </div>
                            </div>
                            <div class="stat-card stat-sent">
                                <div class="stat-icon">📤</div>
                                <div class="stat-content">
                                    <div class="stat-value">{stats.value.todaySent}</div>
                                    <div class="stat-label">今日发送</div>
                                </div>
                            </div>
                        </div>

                        {/* 图表区域 */}
                        <div class="dashboard-charts">
                            {/* 邮件趋势 */}
                            <div class="chart-card chart-wide">
                                <div class="chart-header">
                                    <h3 class="chart-title">📈 邮件收发趋势</h3>
                                    <n-text depth={3} style={{ fontSize: '12px' }}>
                                        最近 7 天
                                    </n-text>
                                </div>
                                <div ref={trendChartRef} class="chart-body" style={{ height: '260px' }}></div>
                            </div>

                            {/* 第二行：饼图 + 柱状图 */}
                            <div class="chart-row">
                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3 class="chart-title">🍩 邮箱来源分布</h3>
                                    </div>
                                    <div ref={pieChartRef} class="chart-body" style={{ height: '240px' }}></div>
                                </div>
                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3 class="chart-title">📊 每周活跃度</h3>
                                    </div>
                                    <div ref={barChartRef} class="chart-body" style={{ height: '240px' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 最近邮件 */}
                        <div class="dashboard-recent">
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h3 class="chart-title">🕐 最近邮件</h3>
                                    <n-button text type="primary" size="small">
                                        查看全部 →
                                    </n-button>
                                </div>
                                <div class="recent-list">
                                    {recentMails.map((mail, index) => (
                                        <div key={index} class="recent-item">
                                            <div class="recent-avatar" style={{ backgroundColor: mail.color }}>
                                                {mail.avatar}
                                            </div>
                                            <div class="recent-content">
                                                <div class="recent-from">{mail.from}</div>
                                                <n-ellipsis class="recent-subject">{mail.subject}</n-ellipsis>
                                            </div>
                                            <n-text depth={3} class="recent-time">
                                                {mail.time}
                                            </n-text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </n-scrollbar>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.mail-dashboard {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.dashboard-inner {
    padding: 24px;
    max-width: 1200px;
}

.dashboard-welcome {
    margin-bottom: 24px;
    .welcome-title {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 16px;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    cursor: default;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
        font-size: 32px;
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        flex-shrink: 0;
    }

    .stat-content {
        flex: 1;
    }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -1px;
    }

    .stat-label {
        font-size: 13px;
        color: var(--n-text-color-3, #999);
        margin-top: 2px;
    }
}

.stat-total {
    background: linear-gradient(135deg, rgba(83, 109, 254, 0.08) 0%, rgba(83, 109, 254, 0.02) 100%);
    border: 1px solid rgba(83, 109, 254, 0.12);
    .stat-icon {
        background: rgba(83, 109, 254, 0.1);
    }
}

.stat-unread {
    background: linear-gradient(135deg, rgba(245, 87, 108, 0.08) 0%, rgba(245, 87, 108, 0.02) 100%);
    border: 1px solid rgba(245, 87, 108, 0.12);
    .stat-icon {
        background: rgba(245, 87, 108, 0.1);
    }
}

.stat-received {
    background: linear-gradient(135deg, rgba(67, 233, 123, 0.08) 0%, rgba(67, 233, 123, 0.02) 100%);
    border: 1px solid rgba(67, 233, 123, 0.12);
    .stat-icon {
        background: rgba(67, 233, 123, 0.1);
    }
}

.stat-sent {
    background: linear-gradient(135deg, rgba(124, 77, 255, 0.08) 0%, rgba(124, 77, 255, 0.02) 100%);
    border: 1px solid rgba(124, 77, 255, 0.12);
    .stat-icon {
        background: rgba(124, 77, 255, 0.1);
    }
}

.dashboard-charts {
    margin-bottom: 24px;
}

.chart-card {
    background: var(--n-card-color, #fff);
    border: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.12));
    border-radius: 16px;
    padding: 20px;
    transition: box-shadow 0.2s;

    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
}

.chart-wide {
    margin-bottom: 16px;
}

.chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .chart-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
    }
}

.chart-body {
    width: 100%;
}

.dashboard-recent {
    margin-bottom: 24px;
}

.recent-list {
    margin-top: 12px;
}

.recent-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.08));
    transition: background 0.15s;
    cursor: pointer;

    &:hover {
        background: var(--n-color-hover, rgba(128, 128, 128, 0.04));
        border-radius: 8px;
    }

    &:last-child {
        border-bottom: none;
    }
}

.recent-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
}

.recent-content {
    flex: 1;
    min-width: 0;

    .recent-from {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
    }

    .recent-subject {
        font-size: 12px;
        color: var(--n-text-color-3, #999);
    }
}

.recent-time {
    font-size: 11px;
    flex-shrink: 0;
    white-space: nowrap;
}
</style>
