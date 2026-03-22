<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { httpFetchMailList } from '@/api'
import { useState } from '@/hooks'
import dayjs from 'dayjs'

export default defineComponent({
    name: 'ManagerRecentMails',
    setup() {
        const colors = ['#536dfe', '#18a058', '#f0a020', '#d03050', '#7c3aed']

        const { state, setState } = useState({
            mails: [] as Array<{
                id: number
                sender: string
                email: string
                subject: string
                time: string
                unread: boolean
                color: string
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
                        unread: !item.seen,
                        color: colors[i % colors.length]
                    }))
                })
            } catch (err) {
                console.error('获取最近邮件失败', err)
            }
        })

        return () => (
            <n-card hoverable content-class="p-16!">
                <div class="flex items-center justify-between m-be-8">
                    <n-text class="text-16" style={{ fontWeight: 600 }}>最近邮件</n-text>
                    <n-button text type="primary" focusable={false} size="small">
                        查看全部
                    </n-button>
                </div>
                <div class="flex flex-col">
                    {state.mails.map(mail => (
                        <div key={mail.id} class="manager-recent-mail-item flex items-center gap-12">
                            <div
                                class="mail-avatar"
                                style={{ background: mail.color, color: '#fff' }}
                            >
                                {mail.sender.charAt(0)}
                            </div>
                            <div class="flex flex-col flex-1 overflow-hidden">
                                <div class="flex items-center gap-8">
                                    <n-text
                                        class="text-14 truncate"
                                        style={{ fontWeight: mail.unread ? 700 : 400 }}
                                    >
                                        {mail.sender}
                                    </n-text>
                                    <n-text depth={3} class="text-12 flex-shrink-0">
                                        {mail.time}
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
