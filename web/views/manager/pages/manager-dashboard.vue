<script lang="tsx">
import { defineComponent } from 'vue'
import { useCoutext, AUTH } from '@/hooks'
import ManagerStatCards from '../components/manager-stat-cards.vue'
import ManagerChartArea from '../components/manager-chart-area.vue'
import ManagerQuickActions from '../components/manager-quick-actions.vue'
import ManagerRecentMails from '../components/manager-recent-mails.vue'

export default defineComponent({
    name: 'ManagerDashboard',
    components: { ManagerStatCards, ManagerChartArea, ManagerQuickActions, ManagerRecentMails },
    async httpServer({ logger }) {
        logger.info('[ManagerDashboard.vue]', {
            title: 'Mail Server Manager Dashboard',
            date: Date.now()
        })
    },
    setup(props) {
        return () => (
            <n-element class="manager-dashboard flex flex-col flex-1 overflow-hidden">
                <div class="flex items-center justify-between m-be-8">
                    <div class="flex flex-col">
                        <n-text class="text-24" style={{ fontWeight: 700 }}>
                            邮件仪表盘
                        </n-text>
                        <n-text depth={3} class="text-14">
                            管理你的邮箱数据与操作概览
                        </n-text>
                    </div>
                    <n-button type="primary" size="medium" onClick={() => {}}>
                        添加邮箱
                    </n-button>
                </div>
                <ManagerStatCards />
                <ManagerChartArea />
                <div class="manager-bottom-grid">
                    <ManagerQuickActions />
                    <ManagerRecentMails />
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
