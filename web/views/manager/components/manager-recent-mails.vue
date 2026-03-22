<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { httpFetchMailList } from '@/api'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default defineComponent({
    name: 'ManagerRecentMails',
    setup() {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #10b981, #34d399)',
            'linear-gradient(135deg, #f59e0b, #fbbf24)',
            'linear-gradient(135deg, #ef4444, #f87171)',
            'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'linear-gradient(135deg, #06b6d4, #22d3ee)'
        ]

        const { state, setState } = useState({
            mails: [] as Array<{
                id: number
                sender: string
                email: string
                subject: string
                time: string
                relativeTime: string
                unread: boolean
                gradient: string
            }>
        })

        onMounted(async () => {
            try {
                const res: any = await httpFetchMailList({ folder: 'INBOX', page: 1, size: 6 })
                const data = res.data ?? res
                const list = data.list ?? []
                setState({
                    mails: list.map((item: any, i: number) => ({
                        id: item.keyId,
                        sender: item.fromAddress?.split('@')[0] ?? item.fromAddress,
                        email: item.fromAddress,
                        subject: item.subject ?? '(无主题)',
                        time: item.date ? dayjs(item.date).format('MM/DD HH:mm') : '',
                        relativeTime: item.date ? dayjs(item.date).fromNow() : '',
                        unread: !item.seen,
                        gradient: gradients[i % gradients.length]
                    }))
                })
            } catch (err) {
                console.error('获取最近邮件失败', err)
            }
        })

        return () => (
            <n-card hoverable content-class="p-20!" class="animate-fadeInUp animate-stagger-4" style={{ borderRadius: '16px' }}>
                <div class="flex items-center justify-between m-be-8">
                    <n-text class="text-16" style={{ fontWeight: 700 }}>最近邮件</n-text>
                    <n-button text type="primary" focusable={false} size="small" style={{ fontWeight: 600 }}>
                        查看全部 →
                    </n-button>
                </div>
                <div class="flex flex-col">
                    {state.mails.length === 0 && (
                        <div class="flex flex-col items-center gap-8 p-32">
                            <span style={{ fontSize: '40px', opacity: 0.5 }}>📭</span>
                            <n-text depth={3}>暂无邮件</n-text>
                        </div>
                    )}
                    {state.mails.map((mail, index) => (
                        <div
                            key={mail.id}
                            class={['manager-recent-mail-item flex items-center gap-12 animate-slideInLeft', `animate-stagger-${index + 1}`]}
                        >
                            <div class="mail-avatar" style={{ background: mail.gradient }}>
                                {mail.sender.charAt(0).toUpperCase()}
                            </div>
                            <div class="flex flex-col flex-1 overflow-hidden">
                                <div class="flex items-center gap-8">
                                    <n-text
                                        class="text-14 truncate flex-1"
                                        style={{ fontWeight: mail.unread ? 700 : 400 }}
                                    >
                                        {mail.sender}
                                    </n-text>
                                    <n-text depth={3} class="text-11 flex-shrink-0" style={{ opacity: 0.7 }}>
                                        {mail.relativeTime}
                                    </n-text>
                                </div>
                                <n-text
                                    depth={mail.unread ? 1 : 3}
                                    class="text-13 truncate"
                                >
                                    {mail.subject}
                                </n-text>
                            </div>
                            {mail.unread && <div class="mail-unread-dot"></div>}
                        </div>
                    ))}
                </div>
            </n-card>
        )
    }
})
</script>
