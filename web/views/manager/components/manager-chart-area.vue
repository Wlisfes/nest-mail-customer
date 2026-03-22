<script lang="tsx">
import { defineComponent, onMounted, ref, watch, shallowRef } from 'vue'
import { faker } from '@faker-js/faker'
import { useMouse, useStore } from '@/store'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

export default defineComponent({
    name: 'ManagerChartArea',
    setup() {
        const lineRef = ref<HTMLElement>()
        const pieRef = ref<HTMLElement>()
        const lineChart = shallowRef<echarts.ECharts>()
        const pieChart = shallowRef<echarts.ECharts>()
        const { inverted } = useStore(useMouse)

        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return `${d.getMonth() + 1}/${d.getDate()}`
        })
        const receivedData = days.map(() => faker.number.int({ min: 5, max: 60 }))
        const sentData = days.map(() => faker.number.int({ min: 2, max: 30 }))

        const pieData = [
            { name: 'QQ 邮箱', value: faker.number.int({ min: 200, max: 800 }) },
            { name: '网易 163', value: faker.number.int({ min: 100, max: 500 }) },
            { name: 'Outlook', value: faker.number.int({ min: 50, max: 300 }) },
            { name: 'Gmail', value: faker.number.int({ min: 30, max: 200 }) }
        ]

        function getTextColor() {
            return inverted.value ? 'rgba(255,255,255,0.82)' : 'rgba(51,54,57,1)'
        }
        function getSubTextColor() {
            return inverted.value ? 'rgba(255,255,255,0.38)' : 'rgba(194,194,194,1)'
        }

        function initLineChart() {
            if (!lineRef.value) return
            lineChart.value = echarts.init(lineRef.value)
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
                    data: days,
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
                        data: receivedData,
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
                        data: sentData,
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
            pieChart.value = echarts.init(pieRef.value)
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
                        data: pieData,
                        color: ['#536dfe', '#f0a020', '#18a058', '#d03050']
                    }
                ]
            })
        }

        function handleResize() {
            lineChart.value?.resize()
            pieChart.value?.resize()
        }

        onMounted(() => {
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
