<script lang="tsx">
import { defineComponent, onMounted, ref, watch, shallowRef } from 'vue'
import { httpFetchDashboardTrend, httpFetchDashboardDistribution } from '@/api'
import { useMouse, useStore } from '@/store'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
} from 'echarts/components'
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

        function initLineChart() {
            if (!lineRef.value) return
            lineChart.value = echarts.init(lineRef.value, undefined, { renderer: 'svg' })
            lineChart.value.setOption({
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
            pieChart.value = echarts.init(pieRef.value, undefined, { renderer: 'svg' })
            pieChart.value.setOption({
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

        onMounted(async () => {
            try {
                const [trendRes, distRes]: any[] = await Promise.all([
                    httpFetchDashboardTrend(),
                    httpFetchDashboardDistribution()
                ])
                const trend = trendRes.data ?? trendRes
                const dist = distRes.data ?? distRes
                chartData.value = {
                    days: trend.days ?? [],
                    receivedData: trend.receivedData ?? [],
                    sentData: trend.sentData ?? [],
                    pieData: Array.isArray(dist) ? dist : []
                }
            } catch (err) {
                console.error('获取图表数据失败', err)
            }
            initLineChart()
            initPieChart()
            window.addEventListener('resize', handleResize)
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
                        <n-text class="text-16" style={{ fontWeight: 700 }}>近 7 天邮件趋势</n-text>
                        <n-tag size="small" bordered={false} round type="info">📈 趋势</n-tag>
                    </div>
                    <div ref={lineRef} class="chart-container"></div>
                </n-card>
                <n-card class="manager-chart-card animate-fadeInUp animate-stagger-2" hoverable content-class="p-20!">
                    <div class="flex items-center justify-between m-be-4">
                        <n-text class="text-16" style={{ fontWeight: 700 }}>邮箱分布</n-text>
                        <n-tag size="small" bordered={false} round type="warning">🌹 玫瑰图</n-tag>
                    </div>
                    <div ref={pieRef} class="chart-container"></div>
                </n-card>
            </div>
        )
    }
})
</script>
