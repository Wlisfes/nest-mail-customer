<script lang="tsx">
import { defineComponent } from 'vue'
import { useGlobal, useStore } from '@/store'

export default defineComponent({
    name: 'BaseHome',
    async httpServer({ pinia, logger }) {
        logger.info('[Home.vue]', {
            title: '大苏打33的撒大1111111dsadasdsaDDSADAASDSADASDASDASDAdas',
            date: Date.now()
        })
    },
    // async httpMetaServer({ store, route }) {
    //     return {
    //         title: '大苏打33的撒大1111111'
    //     }
    // },
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
