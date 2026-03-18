<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseHome',
    async httpServer({ logger }) {
        logger.info('Home.vue', {
            title: 'Mail Server Home',
            date: Date.now()
        })
        return await new Promise(resolve => setTimeout(resolve, 100))
    },
    setup(props) {
        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden">
                <layout-global-choose></layout-global-choose>
                <layout-global-choose></layout-global-choose>
                <layout-global-devtools></layout-global-devtools>
                <layout-global-facts></layout-global-facts>
            </n-element>
        )
    }
})
</script>
