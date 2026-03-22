<script lang="tsx">
import { defineComponent } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'
import dayjs from 'dayjs'

export default defineComponent({
    name: 'ManagerRecentMails',
    setup() {
        const colors = ['#536dfe', '#18a058', '#f0a020', '#d03050', '#7c3aed']

        const { state } = useState({
            mails: Array.from({ length: 6 }, (_, i) => ({
                id: faker.string.uuid(),
                sender: faker.person.fullName(),
                email: faker.internet.email(),
                subject: faker.helpers.arrayElement([
                    '项目进度更新',
                    '会议纪要 - Q1 回顾',
                    '合同审批通知',
                    '服务器告警: CPU 使用率过高',
                    '周报提交提醒',
                    '新版本发布公告',
                    '客户反馈汇总',
                    '假期申请审批'
                ]),
                time: dayjs().subtract(faker.number.int({ min: 1, max: 72 }), 'hour').format('MM/DD HH:mm'),
                unread: i < 3,
                color: colors[i % colors.length]
            }))
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
