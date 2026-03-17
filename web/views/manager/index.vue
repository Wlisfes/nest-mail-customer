<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Manager',
    async httpServer({ logger }) {
        logger.info('[ManagerIndex.vue]', {
            title: 'Mail Server Manager',
            date: Date.now()
        })
    },
    setup(props) {
        return () => <n-element class="flex flex-col flex-1 overflow-hidden">Manager</n-element>
    }
})
</script>
