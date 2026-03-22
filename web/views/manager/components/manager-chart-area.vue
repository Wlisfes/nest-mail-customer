<script lang="tsx">
import { defineComponent, onMounted, ref, watch, shallowRef } from 'vue'
import { httpFetchDashboardTrend, httpFetchDashboardDistribution } from '@/api'
import { useMouse, useStore } from '@/store'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, SVGRenderer])

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
            return inverted.value ? 'rgba(255,255,255,0.38)' : 'rgba(194,194,194,1)'
        }

        function initLineChart() {
            if (!lineRef.value) return
            lineChart.value = echarts.init(lineRef.value, undefined, { renderer: 'svg' })
            lineChart.value.setOption({
                tooltip: { trigger: 'axis' },
                legend: {
                    data: ['收件', '发件'],
                    bottom: 0,
                    textStyle: { color: getTextColor() }
                },
                grid: { top: 16, left: 48, right: 16, bottom: 36 },
                xAxis: {
                    type: 'category',
                    data: chartData.value.days,
                    axisLabel: { color: getSubTextColor() },
                    axisLine: { lineStyle: { color: getSubTextColor() } }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { color: getSubTextColor() },
                    splitLine: { lineStyle: { color: inverted.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' } }
                },
                series: [
                    {
                        name: '收件',
                        type: 'line',
                        smooth: true,
                        data: chartData.value.receivedData,
                        itemStyle: { color: '#536dfe' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(83, 109, 254, 0.3)' },
                                { offset: 1, color: 'rgba(83, 109, 254, 0.02)' }
                            ])
                        }
                    },
                    {
                        name: '发件',
                        type: 'line',
                        smooth: true,
                        data: chartData.value.sentData,
                        itemStyle: { color: '#18a058' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(24, 160, 88, 0.3)' },
                                { offset: 1, color: 'rgba(24, 160, 88, 0.02)' }
                            ])
                        }
                    }
                ]
            })
        }

        function initPieChart() {
            if (!pieRef.value) return
            pieChart.value = echarts.init(pieRef.value, undefined, { renderer: 'svg' })
            pieChart.value.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    textStyle: { color: getTextColor() }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['45%', '70%'],
                        center: ['50%', '42%'],
                        avoidLabelOverlap: false,
                        itemStyle: { borderRadius: 6, borderColor: inverted.value ? '#1e1e1e' : '#fff', borderWidth: 2 },
                        label: { show: false },
                        emphasis: {
                            label: { show: true, fontWeight: 'bold', color: getTextColor() }
                        },
                        data: chartData.value.pieData,
                        color: ['#536dfe', '#f0a020', '#18a058', '#d03050']
                    }
                ]
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
                <n-card class="manager-chart-card" hoverable content-class="p-16!">
                    <n-text class="text-16" style={{ fontWeight: 600 }}>近 7 天邮件趋势</n-text>
                    <div ref={lineRef} class="chart-container"></div>
                </n-card>
                <n-card class="manager-chart-card" hoverable content-class="p-16!">
                    <n-text class="text-16" style={{ fontWeight: 600 }}>邮箱分布</n-text>
                    <div ref={pieRef} class="chart-container"></div>
                </n-card>
            </div>
        )
    }
})
</script>
