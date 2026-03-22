<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Layout',
    setup(props) {
        return () => (
            <n-layout class="h-full overflow-hidden" content-class="flex flex-col overflow-hidden">
                <n-layout-header class="w-full h-60 overflow-hidden">Header</n-layout-header>
                <n-layout-content
                    class="flex-1 overflow-hidden"
                    content-class="min-h-full flex flex-col"
                    native-scrollbar={false}
                    scrollbar-props={{ size: 100, trigger: 'none' }}
                >
                    <n-element class="flex flex-col flex-1 overflow-hidden">
                        <router-view>{{ default: ({ Component, route }) => <Component key={route.fullPath} /> }}</router-view>
                    </n-element>
                </n-layout-content>
            </n-layout>
        )
    }
})
</script>
