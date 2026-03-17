<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'LayoutGlobalChoose',
    setup(props) {
        const { state } = useState({
            hot: 'WHY Mail Server',
            title: '一个入口管理所有邮箱账号',
            document: `Mail Server 是面向多邮箱场景的 Web 邮件聚合平台，支持把工作邮箱、个人邮箱和备用邮箱统一接入，在浏览器中完成收件、搜索、发送、同步与提醒。`,
            columns: [
                {
                    type: 'primary',
                    icon: 'nest-issues-signal',
                    title: `统一收件箱，聚合多个账号`,
                    document: `支持 QQ 邮箱、网易邮箱、Outlook 与 Gmail 等主流平台接入，统一展示新邮件、已读状态、附件信息和最后同步时间。`
                },
                {
                    type: 'warning',
                    icon: 'nest-edit',
                    title: `授权简单，上手成本更低`,
                    document: `优先支持 OAuth2 授权，也兼容应用专用密码与 IMAP/SMTP 手动配置，让普通用户也能快速完成邮箱接入。`
                },
                {
                    type: 'error',
                    icon: 'nest-choose-channel',
                    title: `实时同步，减少信息遗漏`,
                    document: `支持手动同步和后台自动同步，可按实时、15 分钟、30 分钟、1 小时等频率拉取邮件，并提供浏览器新邮件提醒。`
                },
                {
                    type: 'success',
                    icon: 'nest-choose-backst',
                    title: `跨平台访问，安全可控`,
                    document: `基于 Web 技术即可在电脑和平板上访问，结合 JWT、加密存储、账号状态监控与失败重试，兼顾效率与可靠性。`
                }
            ]
        })

        return () => (
            <n-element class="layout-global-choose common-width-inline flex flex-col p-block-64">
                <div class="flex flex-col items-center max-w-640 m-inline-auto">
                    <n-text class="chat-hot text-[var(--primary-color)]">{state.hot}</n-text>
                    <h1 class="m-0 text-28">{state.title}</h1>
                    <n-text depth={3} class="text-16 text-center!">
                        {state.document}
                    </n-text>
                </div>
                <div class="chat-choose grid gap-24 p-bs-48">
                    {state.columns.map((item, index) => (
                        <div key={index} class="chat-choose-column" data-aos="fade-up" data-aos-delay={index * 100}>
                            <n-card hoverable content-class="p-24!" class="b-rd-8 h-full">
                                <n-button secondary circle focusable={false} type={item.type} class="w-64 h-64">
                                    <common-global-wrapper name={item.icon} size={32}></common-global-wrapper>
                                </n-button>
                                <div class="flex flex-col gap-5 m-bs-10">
                                    <h1 class="m-0 text-18">{item.title}</h1>
                                    <n-text depth={3}>{item.document}</n-text>
                                </div>
                            </n-card>
                        </div>
                    ))}
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.chat-choose {
    position: relative;
    grid-template-columns: repeat(2, minmax(0px, 1fr));
    @media (max-width: 768px) {
        grid-template-columns: repeat(1, minmax(0px, 1fr));
    }
}
</style>
