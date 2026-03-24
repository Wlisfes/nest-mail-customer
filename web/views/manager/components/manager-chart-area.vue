<script lang="tsx">
import { defineComponent, onMounted, ref, watch, shallowRef, nextTick, onBeforeUnmount } from 'vue'
import { httpFetchDashboardTrend, httpFetchDashboardDistribution } from '@/api'
import { useMouse, useStore } from '@/store'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, SVGRenderer])

export default defineComponent({
    name: 'ManagerChartArea',
    setup() {
        const lineRef = ref<HTMLElement>()
        const pieRef = ref<HTMLElement>()
        const lineChart = shallowRef<echarts.ECharts>()
        const pieChart = shallowRef<echarts.ECharts>()
        const { inverted } = useStore(useMouse)

        const chartData = ref({
            days: [] as string[],
            receivedData: [] as number[],
            sentData: [] as number[],
            pieData: [] as { name: string; value: number }[]
        })

        function getTextColor() {
            return inverted.value ? 'rgba(255,255,255,0.82)' : 'rgba(51,54,57,1)'
        }
        function getSubTextColor() {
            return inverted.value ? 'rgba(255,255,255,0.28)' : 'rgba(180,180,180,1)'
        }
        function getBgColor() {
            return inverted.value ? '#1e1e1e' : '#fff'
        }
        function getSplitLine() {
            return inverted.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
        }

        function getEchartsTheme() {
            return inverted.value ? 'dark' : undefined
        }

        function initLineChart() {
            if (!lineRef.value) return
            lineChart.value = echarts.init(lineRef.value, getEchartsTheme(), { renderer: 'svg' })
            lineChart.value.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: getBgColor(),
                    borderColor: getSplitLine(),
                    textStyle: { color: getTextColor(), fontSize: 13 },
                    padding: [12, 16],
                    borderRadius: 10
                },
                legend: {
                    data: ['收件', '发件'],
                    bottom: 0,
                    icon: 'roundRect',
                    itemWidth: 12,
                    itemHeight: 4,
                    textStyle: { color: getTextColor(), fontSize: 12 }
                },
                grid: { top: 24, left: 48, right: 16, bottom: 40 },
                xAxis: {
                    type: 'category',
                    data: chartData.value.days,
                    axisLabel: { color: getSubTextColor(), fontSize: 11 },
                    axisLine: { show: false },
                    axisTick: { show: false }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { color: getSubTextColor(), fontSize: 11 },
                    splitLine: { lineStyle: { color: getSplitLine(), type: 'dashed' } },
                    axisLine: { show: false }
                },
                series: [
                    {
                        name: '收件',
                        type: 'line',
                        smooth: 0.4,
                        symbol: 'circle',
                        symbolSize: 6,
                        showSymbol: false,
                        data: chartData.value.receivedData,
                        itemStyle: { color: '#6366f1' },
                        lineStyle: { width: 3 },
                        emphasis: { focus: 'series', itemStyle: { borderWidth: 3, borderColor: '#fff' } },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(99,102,241,0.25)' },
                                { offset: 0.7, color: 'rgba(99,102,241,0.05)' },
                                { offset: 1, color: 'rgba(99,102,241,0)' }
                            ])
                        }
                    },
                    {
                        name: '发件',
                        type: 'line',
                        smooth: 0.4,
                        symbol: 'circle',
                        symbolSize: 6,
                        showSymbol: false,
                        data: chartData.value.sentData,
                        itemStyle: { color: '#10b981' },
                        lineStyle: { width: 3 },
                        emphasis: { focus: 'series', itemStyle: { borderWidth: 3, borderColor: '#fff' } },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(16,185,129,0.25)' },
                                { offset: 0.7, color: 'rgba(16,185,129,0.05)' },
                                { offset: 1, color: 'rgba(16,185,129,0)' }
                            ])
                        }
                    }
                ],
                animationDuration: 1200,
                animationEasing: 'cubicInOut'
            })
        }

        function initPieChart() {
            if (!pieRef.value) return
            pieChart.value = echarts.init(pieRef.value, getEchartsTheme(), { renderer: 'svg' })
            pieChart.value.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                    backgroundColor: getBgColor(),
                    borderColor: getSplitLine(),
                    textStyle: { color: getTextColor(), fontSize: 13 },
                    padding: [10, 14],
                    borderRadius: 10
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    icon: 'circle',
                    itemWidth: 8,
                    itemHeight: 8,
                    textStyle: { color: getTextColor(), fontSize: 12 }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['42%', '72%'],
                        center: ['50%', '42%'],
                        roseType: 'radius',
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: getBgColor(),
                            borderWidth: 3
                        },
                        label: { show: false },
                        emphasis: {
                            label: {
                                show: true,
                                fontWeight: 'bold',
                                fontSize: 14,
                                color: getTextColor()
                            },
                            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' }
                        },
                        data: chartData.value.pieData,
                        color: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']
                    }
                ],
                animationDuration: 1000,
                animationEasing: 'cubicInOut'
            })
        }

        function handleResize() {
            lineChart.value?.resize()
            pieChart.value?.resize()
        }

        // 生成模拟趋势数据（当真实数据为空时使用）
        function generateMockTrend() {
            const days: string[] = []
            const receivedData: number[] = []
            const sentData: number[] = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                days.push(`${d.getMonth() + 1}/${d.getDate()}`)
                receivedData.push(Math.floor(Math.random() * 15) + 3)
                sentData.push(Math.floor(Math.random() * 8) + 1)
            }
            return { days, receivedData, sentData }
        }

        // 生成模拟分布数据
        function generateMockDistribution() {
            return [
                { name: 'QQ 邮箱', value: 42 },
                { name: '网易 163', value: 28 },
                { name: 'Gmail', value: 18 },
                { name: 'Outlook', value: 12 }
            ]
        }

        function isEmptyTrend(trend: any) {
            return (
                !trend?.days?.length || (trend.receivedData?.every((v: number) => v === 0) && trend.sentData?.every((v: number) => v === 0))
            )
        }

        function isEmptyDistribution(dist: any[]) {
            return !dist?.length || dist.every(d => d.value === 0)
        }

        onMounted(async () => {
            let trend: any = null
            let dist: any[] = []
            try {
                const [trendRes, distRes]: any[] = await Promise.all([httpFetchDashboardTrend(), httpFetchDashboardDistribution()])
                trend = trendRes.data ?? trendRes
                dist = Array.isArray(distRes.data ?? distRes) ? (distRes.data ?? distRes) : []
            } catch (err) {
                console.error('获取图表数据失败，使用示例数据', err)
            }

            // 如果接口返回全空/全零，使用模拟数据
            const finalTrend = isEmptyTrend(trend) ? generateMockTrend() : trend
            const finalDist = isEmptyDistribution(dist) ? generateMockDistribution() : dist

            chartData.value = {
                days: finalTrend.days ?? [],
                receivedData: finalTrend.receivedData ?? [],
                sentData: finalTrend.sentData ?? [],
                pieData: finalDist
            }

            initLineChart()
            initPieChart()
            window.addEventListener('resize', handleResize)
        })

        onBeforeUnmount(() => {
            window.removeEventListener('resize', handleResize)
            lineChart.value?.dispose()
            pieChart.value?.dispose()
        })

        watch(inverted, () => {
            lineChart.value?.dispose()
            pieChart.value?.dispose()
            initLineChart()
            initPieChart()
        })

        return () => (
            <div class="manager-charts">
                <n-card class="manager-chart-card animate-fadeInUp animate-stagger-1" hoverable content-class="p-20!">
                    <div class="flex items-center justify-between m-be-4">
                        <n-text class="text-16" style={{ fontWeight: 700 }}>
                            近 7 天邮件趋势
                        </n-text>
                        <n-tag size="small" bordered={false} round type="info">
                            📈 趋势
                        </n-tag>
                    </div>
                    <div ref={lineRef} class="chart-container" style={{ height: '320px' }}></div>
                </n-card>
                <n-card class="manager-chart-card animate-fadeInUp animate-stagger-2" hoverable content-class="p-20!">
                    <div class="flex items-center justify-between m-be-4">
                        <n-text class="text-16" style={{ fontWeight: 700 }}>
                            邮箱分布
                        </n-text>
                        <n-tag size="small" bordered={false} round type="warning">
                            🌹 玫瑰图
                        </n-tag>
                    </div>
                    <div ref={pieRef} class="chart-container" style={{ height: '320px' }}></div>
                </n-card>
            </div>
        )
    }
})
</script>
