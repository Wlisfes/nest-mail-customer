<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { useMouse, useStore } from '@/store'
import { useI18nContext } from '@/i18n'

/**内部组件：挂载 Naive UI 全局 API 到 window（仅客户端）**/
const NaiveApiProvider = defineComponent({
    name: 'NaiveApiProvider',
    setup() {
        const message = useMessage()
        const dialog = useDialog()
        onMounted(() => {
            window.$message = message
            window.$dialog = dialog
        })
        return () => null
    }
})

export default defineComponent({
    name: 'App',
    setup(props) {
        const { themeStyle, themeOverrides } = useStore(useMouse)
        const { Locale } = useI18nContext()

        return () => (
            <n-config-provider
                abstract
                inline-theme-disabled
                locale={Locale.value}
                date-locale={Locale.value.i18nDate}
                theme={themeStyle.value}
                theme-overrides={themeOverrides.value}
            >
                <n-global-style />
                <n-message-provider>
                    <n-dialog-provider>
                        <NaiveApiProvider />
                        <RouterView></RouterView>
                    </n-dialog-provider>
                </n-message-provider>
            </n-config-provider>
        )
    }
})
</script>
