<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerSettings',
    setup() {
        const { state } = useState({
            platforms: [
                {
                    name: 'QQ 邮箱',
                    provider: 'qq',
                    color: '#536dfe',
                    imapHost: 'imap.qq.com',
                    imapPort: 993,
                    smtpHost: 'smtp.qq.com',
                    smtpPort: 465,
                    auth: '授权码',
                    secure: 'SSL'
                },
                {
                    name: '网易 163',
                    provider: '163',
                    color: '#d03050',
                    imapHost: 'imap.163.com',
                    imapPort: 993,
                    smtpHost: 'smtp.163.com',
                    smtpPort: 465,
                    auth: '授权码',
                    secure: 'SSL'
                },
                {
                    name: 'Outlook',
                    provider: 'outlook',
                    color: '#0078d4',
                    imapHost: 'outlook.office365.com',
                    imapPort: 993,
                    smtpHost: 'smtp-mail.outlook.com',
                    smtpPort: 587,
                    auth: 'OAuth2',
                    secure: 'STARTTLS'
                },
                {
                    name: 'Gmail',
                    provider: 'gmail',
                    color: '#ea4335',
                    imapHost: 'imap.gmail.com',
                    imapPort: 993,
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    auth: 'OAuth2',
                    secure: 'TLS'
                }
            ],
            syncFrequency: '15'
        })

        const syncOptions = [
            { label: '实时同步', value: '0' },
            { label: '每 15 分钟', value: '15' },
            { label: '每 30 分钟', value: '30' },
            { label: '每 1 小时', value: '60' }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-24">
                <n-text class="text-20" style={{ fontWeight: 700 }}>平台配置</n-text>

                <n-card title="同步频率" hoverable content-class="p-20!">
                    <n-form label-placement="left" label-width={100}>
                        <n-form-item label="同步间隔">
                            <n-select
                                v-model:value={state.syncFrequency}
                                options={syncOptions}
                                style={{ width: '200px' }}
                            />
                        </n-form-item>
                    </n-form>
                </n-card>

                <n-text class="text-16" style={{ fontWeight: 600 }}>支持的邮箱平台</n-text>
                <div class="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {state.platforms.map(platform => (
                        <n-card key={platform.provider} hoverable content-class="p-20!">
                            <div class="flex items-center gap-12 m-be-16">
                                <div
                                    class="flex items-center justify-center b-rd-8"
                                    style={{
                                        width: '40px', height: '40px',
                                        background: platform.color + '20',
                                        color: platform.color,
                                        fontSize: '18px', fontWeight: 700
                                    }}
                                >
                                    {platform.name.charAt(0)}
                                </div>
                                <div class="flex flex-col">
                                    <n-text class="text-16" style={{ fontWeight: 600 }}>{platform.name}</n-text>
                                    <n-tag size="small" bordered={false} type="info">{platform.auth}</n-tag>
                                </div>
                            </div>
                            <n-descriptions label-placement="left" column={1} size="small" bordered>
                                <n-descriptions-item label="IMAP 服务器">{platform.imapHost}:{platform.imapPort}</n-descriptions-item>
                                <n-descriptions-item label="SMTP 服务器">{platform.smtpHost}:{platform.smtpPort}</n-descriptions-item>
                                <n-descriptions-item label="加密方式">{platform.secure}</n-descriptions-item>
                            </n-descriptions>
                        </n-card>
                    ))}
                </div>
            </n-element>
        )
    }
})
</script>
