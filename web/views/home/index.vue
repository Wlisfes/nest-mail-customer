<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseHome',
    async httpServer({ logger }) {
        logger.info('[Home.vue]', {
            title: 'MailServer Home',
            date: Date.now()
        })
    },
    setup(props) {
        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden">
                <layout-global-choose></layout-global-choose>
                <layout-global-devtools></layout-global-devtools>
                <layout-global-facts></layout-global-facts>
            </n-element>
        )
    }
})
</script>
