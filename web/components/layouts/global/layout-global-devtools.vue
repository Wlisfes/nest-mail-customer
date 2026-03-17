<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'LayoutGlobalDvtools',
    setup(props) {
        const { state } = useState({
            hot: 'PROJECT FAQ',
            title: '围绕多邮箱管理的核心能力',
            document: `从注册登录、邮箱授权到邮件收发、搜索与同步，Mail Server 的页面文案围绕需求文档中的 MVP、二期与三期能力规划展开。`,
            columns: [
                {
                    type: 'primary',
                    icon: 'nest-issues-chat',
                    title: `支持接入哪些邮箱平台？`,
                    document: `当前规划优先支持 QQ 邮箱、网易邮箱（163/126）、Outlook/Hotmail 和 Gmail，并预留多账号管理与分账号收件箱能力。`
                },
                {
                    type: 'success',
                    icon: 'nest-issues-signal',
                    title: `邮箱账号如何完成授权？`,
                    document: `Outlook 和 Gmail 推荐 OAuth2，QQ 与网易邮箱支持应用专用密码，同时保留 IMAP/SMTP 手动配置与开启服务引导。`
                },
                {
                    type: 'warning',
                    icon: 'nest-issues-book',
                    title: `邮件如何同步到统一收件箱？`,
                    document: `平台支持后台队列同步、手动立即同步以及同步范围设置，可按最近 7 天、30 天或全部邮件进行拉取，并展示同步状态。`
                },
                {
                    type: 'error',
                    icon: 'nest-issues-cost',
                    title: `能否统一搜索和批量处理邮件？`,
                    document: `支持全局搜索、按发件人、主题、时间范围等高级筛选，以及批量标记已读、删除、移动、添加标签等常见邮件管理操作。`
                },
                {
                    type: 'primary',
                    icon: 'nest-issues-security',
                    title: `附件与发件流程怎么处理？`,
                    document: `写邮件支持富文本、收件人自动补全、多个收件人及附件上传，发送时通过所选邮箱账号的 SMTP 服务发出，并支持失败重试。`
                },
                {
                    type: 'success',
                    icon: 'nest-issues-support',
                    title: `数据安全与可靠性如何保障？`,
                    document: `平台要求使用 bcrypt 存储密码、JWT 管理登录状态、加密保存授权 Token，并通过 HTTPS、失败重试、每日备份与断点续传提升稳定性。`
                }
            ]
        })

        return () => (
            <n-element class="layout-global-devtools common-width-inline flex flex-col p-bs-24 p-be-48">
                <n-text class="chat-hot">{state.hot}</n-text>
                <div class="chat-issues flex justify-between p-be-24">
                    <div class="w-full max-w-[var(--chat-issues-max-width)] flex flex-col gap-5 p-ie-16">
                        <h1 class="m-0 text-28">{state.title}</h1>
                        <n-text depth={3} class="text-16">
                            {state.document}
                        </n-text>
                    </div>
                    <div class="flex items-end justify-center gap-16" data-aos="fade-left">
                        <n-button size="large" type="primary">
                            查看核心需求
                        </n-button>
                        <n-button size="large" type="primary" ghost>
                            联系产品团队
                        </n-button>
                    </div>
                </div>
                <div class="chat-block grid gap-24 p-bs-24">
                    {state.columns.map((item, index) => (
                        <div key={index} class="chat-block-column" data-aos="fade-up" data-aos-delay={index * 100}>
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
.chat-hot {
    color: var(--primary-color);
    @media (max-width: 768px) {
        text-align: center;
    }
}

.chat-issues {
    --chat-issues-max-width: 540px;
    position: relative;
    @media (max-width: 768px) {
        --chat-issues-max-width: 100%;
        flex-direction: column;
        text-align: center;
        row-gap: 20px;
    }
}

.chat-block {
    grid-template-columns: repeat(3, minmax(0px, 1fr));
    position: relative;
    @media (max-width: 1280px) {
        grid-template-columns: repeat(2, minmax(0px, 1fr));
    }
    @media (max-width: 768px) {
        grid-template-columns: repeat(1, minmax(0px, 1fr));
    }
}
</style>
