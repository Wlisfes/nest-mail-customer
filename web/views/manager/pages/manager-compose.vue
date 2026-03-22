<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { useState } from '@/hooks'
import { useRouter } from 'vue-router'

export default defineComponent({
    name: 'ManagerCompose',
    setup() {
        const router = useRouter()
        const { state, setState } = useState({
            loading: false,
            accountId: null as number | null,
            to: '',
            subject: '',
            html: '',
            accounts: [
                { label: 'test@qq.com (QQ 邮箱)', value: 1 },
                { label: 'test@163.com (网易 163)', value: 2 }
            ]
        })

        async function handleSend() {
            if (!state.accountId || !state.to || !state.subject || !state.html) {
                window.$message?.warning('请填写完整信息')
                return
            }
            await setState({ loading: true })
            // TODO: call httpSendMail API
            setTimeout(async () => {
                await setState({ loading: false })
                window.$message?.success('发送成功')
                router.push('/manager/sent')
            }, 1000)
        }

        async function handleSaveDraft() {
            // TODO: call httpSaveDraft API
            window.$message?.success('草稿已保存')
        }

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <n-text class="text-20" style={{ fontWeight: 700 }}>写邮件</n-text>
                <n-card content-class="p-20!">
                    <n-form label-placement="left" label-width={80}>
                        <n-form-item label="发件邮箱">
                            <n-select
                                v-model:value={state.accountId}
                                options={state.accounts}
                                placeholder="请选择发件邮箱"
                            />
                        </n-form-item>
                        <n-form-item label="收件人">
                            <n-input
                                v-model:value={state.to}
                                placeholder="请输入收件人邮箱"
                            />
                        </n-form-item>
                        <n-form-item label="主题">
                            <n-input
                                v-model:value={state.subject}
                                placeholder="请输入邮件主题"
                            />
                        </n-form-item>
                        <n-form-item label="正文">
                            <n-input
                                type="textarea"
                                v-model:value={state.html}
                                placeholder="请输入邮件正文..."
                                rows={12}
                            />
                        </n-form-item>
                        <div class="flex gap-12 justify-end">
                            <n-button
                                secondary
                                onClick={handleSaveDraft}
                            >
                                存为草稿
                            </n-button>
                            <n-button
                                type="primary"
                                loading={state.loading}
                                onClick={handleSend}
                            >
                                发送邮件
                            </n-button>
                        </div>
                    </n-form>
                </n-card>
            </n-element>
        )
    }
})
</script>
