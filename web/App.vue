<script lang="tsx">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { useMouse, useStore } from '@/store'
import { zhCN, dateZhCN } from 'naive-ui'

export default defineComponent({
    name: 'App',
    setup(props) {
        const { themeStyle, themeOverrides } = useStore(useMouse)

        return () => (
            <n-config-provider
                abstract
                inline-theme-disabled
                locale={zhCN}
                date-locale={dateZhCN}
                theme={themeStyle.value}
                theme-overrides={themeOverrides.value}
            >
                <n-global-style />
                <RouterView></RouterView>
            </n-config-provider>
        )
    }
})
</script>
