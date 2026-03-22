<script lang="tsx">
import { defineComponent } from 'vue'
import { useCoutext, AUTH } from '@/hooks'
import { useRouter } from 'vue-router'
import ManagerStatCards from '../components/manager-stat-cards.vue'
import ManagerChartArea from '../components/manager-chart-area.vue'
import ManagerQuickActions from '../components/manager-quick-actions.vue'
import ManagerRecentMails from '../components/manager-recent-mails.vue'
import dayjs from 'dayjs'

export default defineComponent({
    name: 'ManagerDashboard',
    components: { ManagerStatCards, ManagerChartArea, ManagerQuickActions, ManagerRecentMails },
    async httpServer({ logger }) {
        logger.info('[ManagerDashboard.vue]', { title: 'Mail Server Manager Dashboard', date: Date.now() })
    },
    setup() {
        const router = useRouter()
        const now = dayjs()
        const hour = now.hour()
        const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

        return () => (
            <n-element class="manager-dashboard flex flex-col flex-1 overflow-hidden">
                <div class="flex items-center justify-between m-be-8 animate-fadeInUp">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-8">
                            <n-text class="text-26" style={{ fontWeight: 800 }}>
                                {greeting} 👋
                            </n-text>
                        </div>
                        <n-text depth={3} class="text-14">
                            {now.format('YYYY年MM月DD日 dddd')} · 管理你的邮箱数据与操作概览
                        </n-text>
                    </div>
                    <n-button
                        type="primary"
                        size="medium"
                        round
                        onClick={() => router.push('/manager/accounts')}
                        style={{ fontWeight: 600 }}
                    >
                        ➕ 添加邮箱
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
