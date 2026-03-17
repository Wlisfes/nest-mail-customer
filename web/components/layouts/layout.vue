<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Layout',
    setup(props) {
        return () => (
            <n-layout class="h-full overflow-hidden" content-class="flex flex-col overflow-hidden">
                <n-layout-header class="w-full overflow-hidden">
                    <n-element class="common-width-inline h-60 flex gap-20 overflow-hidden">
                        <router-link to="/" class="flex overflow-hidden">
                            <n-button text focusable={false}>
                                <common-global-wrapper name="nest-logo" color="var(--n-text-color-hover)" size={40}></common-global-wrapper>
                                <h2 class="m-0 p-bs-8 p-inline-5">MailServer</h2>
                            </n-button>
                        </router-link>
                        <n-element class="h-full flex flex-1 items-center justify-end gap-48 p-inline-40">
                            {/* <n-button text focusable={false}>
                                <div class="text-16">产品</div>
                            </n-button>
                            <n-button text focusable={false}>
                                <div class="text-16">解决方案</div>
                            </n-button>
                            <n-button text focusable={false}>
                                <div class="text-16">定价</div>
                            </n-button>
                            <n-button text focusable={false}>
                                <div class="text-16">帮助中心</div>
                            </n-button>
                            <n-button text focusable={false}>
                                <div class="text-16">关于我们</div>
                            </n-button> */}
                        </n-element>
                        <n-element class="h-full flex items-center overflow-hidden">
                            <layout-common-deploy></layout-common-deploy>
                            <n-divider vertical class="h-20! m-inline-20!" />
                            <n-element class="flex items-center gap-20 overflow-hidden">
                                <router-link to="/main/login">
                                    <n-button text focusable={false}>
                                        登录
                                    </n-button>
                                </router-link>
                                {/* <layout-common-consumer></layout-common-consumer> */}
                                <router-link to="/main/register">
                                    <n-button focusable={false} round type="primary">
                                        立即注册
                                    </n-button>
                                </router-link>
                            </n-element>
                        </n-element>
                    </n-element>
                </n-layout-header>
                <n-layout-content
                    class="flex-1 overflow-hidden"
                    content-class="min-h-full flex flex-col"
                    native-scrollbar={false}
                    scrollbar-props={{ size: 100, trigger: 'none' }}
                >
                    <n-element class="flex flex-col flex-1">
                        <router-view>{{ default: ({ Component, route }) => <Component key={route.fullPath} /> }}</router-view>
                    </n-element>
                    <layout-common-footer></layout-common-footer>
                </n-layout-content>
            </n-layout>
        )
    }
})
</script>
