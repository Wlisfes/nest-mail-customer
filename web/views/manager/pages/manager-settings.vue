<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'ManagerSettings',
    setup() {
        const { state } = useState({
            platforms: [
                {
                    name: 'QQ 邮箱', provider: 'qq',
                    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#6366f1', icon: '📧',
                    imapHost: 'imap.qq.com', imapPort: 993,
                    smtpHost: 'smtp.qq.com', smtpPort: 465,
                    auth: '授权码', secure: 'SSL'
                },
                {
                    name: '网易 163', provider: '163',
                    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
                    color: '#ef4444', icon: '📨',
                    imapHost: 'imap.163.com', imapPort: 993,
                    smtpHost: 'smtp.163.com', smtpPort: 465,
                    auth: '授权码', secure: 'SSL'
                },
                {
                    name: 'Outlook', provider: 'outlook',
                    gradient: 'linear-gradient(135deg, #0078d4, #4db8ff)',
                    color: '#0078d4', icon: '📬',
                    imapHost: 'outlook.office365.com', imapPort: 993,
                    smtpHost: 'smtp-mail.outlook.com', smtpPort: 587,
                    auth: 'OAuth2', secure: 'STARTTLS'
                },
                {
                    name: 'Gmail', provider: 'gmail',
                    gradient: 'linear-gradient(135deg, #ea4335, #ff6b6b)',
                    color: '#ea4335', icon: '📩',
                    imapHost: 'imap.gmail.com', imapPort: 993,
                    smtpHost: 'smtp.gmail.com', smtpPort: 587,
                    auth: 'OAuth2', secure: 'TLS'
                }
            ],
            syncFrequency: '15'
        })

        const syncOptions = [
            { label: '⚡ 实时同步', value: '0' },
            { label: '⏱️ 每 15 分钟', value: '15' },
            { label: '🕐 每 30 分钟', value: '30' },
            { label: '🕑 每 1 小时', value: '60' }
        ]

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <n-text class="text-22" style={{ fontWeight: 800 }}>⚙️ 平台配置</n-text>

                <n-card hoverable content-class="p-20!" style={{ borderRadius: '16px' }}>
                    <div class="flex items-center gap-8 m-be-16">
                        <span style={{ fontSize: '18px' }}>🔄</span>
                        <n-text class="text-16" style={{ fontWeight: 700 }}>同步设置</n-text>
                    </div>
                    <n-form label-placement="left" label-width={100}>
                        <n-form-item label="同步间隔">
                            <n-select
                                v-model:value={state.syncFrequency}
                                options={syncOptions}
                                style={{ width: '240px' }}
                            />
                        </n-form-item>
                    </n-form>
                </n-card>

                <div class="flex items-center gap-8">
                    <span style={{ fontSize: '18px' }}>📋</span>
                    <n-text class="text-16" style={{ fontWeight: 700 }}>支持的邮箱平台</n-text>
                </div>

                <div class="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {state.platforms.map((platform, index) => (
                        <n-card
                            key={platform.provider}
                            hoverable
                            content-class="p-0!"
                            class={['animate-fadeInUp', `animate-stagger-${index + 1}`]}
                            style={{ borderRadius: '16px', overflow: 'hidden' }}
                        >
                            <div style={{ height: '4px', background: platform.gradient }}></div>
                            <div class="p-20">
                                <div class="flex items-center gap-12 m-be-16">
                                    <div
                                        class="flex items-center justify-center"
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: `${platform.color}15`, fontSize: '22px'
                                        }}
                                    >
                                        {platform.icon}
                                    </div>
                                    <div class="flex flex-col">
                                        <n-text class="text-15" style={{ fontWeight: 700 }}>{platform.name}</n-text>
                                        <n-tag size="tiny" bordered={false} round type="info">{platform.auth}</n-tag>
                                    </div>
                                </div>
                                <n-descriptions label-placement="left" column={1} size="small" bordered>
                                    <n-descriptions-item label="📥 IMAP">{platform.imapHost}:{platform.imapPort}</n-descriptions-item>
                                    <n-descriptions-item label="📤 SMTP">{platform.smtpHost}:{platform.smtpPort}</n-descriptions-item>
                                    <n-descriptions-item label="🔒 加密">{platform.secure}</n-descriptions-item>
                                </n-descriptions>
                            </div>
                        </n-card>
                    ))}
                </div>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
