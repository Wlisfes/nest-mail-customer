<script lang="tsx">
import { defineComponent, onMounted } from 'vue'
import { httpFetchMailAccounts, httpSendMail, httpSaveDraft } from '@/api'
import { $message } from '@/utils'
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
            accounts: [] as Array<{ label: string; value: number }>
        })

        onMounted(async () => {
            try {
                const res: any = await httpFetchMailAccounts()
                const data = res.data ?? res
                const list = Array.isArray(data) ? data : (data.list ?? [])
                await setState({
                    accounts: list.map((item: any) => ({
                        label: `${item.email} (${item.provider})`,
                        value: item.keyId
                    }))
                })
            } catch (err) {
                console.error('获取邮箱账号列表失败', err)
            }
        })

        async function handleSend() {
            if (!state.accountId || !state.to || !state.subject || !state.html) {
                $message.warning('请填写完整信息')
                return
            }
            await setState({ loading: true })
            try {
                await httpSendMail({
                    accountId: state.accountId,
                    to: state.to,
                    subject: state.subject,
                    html: state.html
                })
                $message.success('发送成功')
                router.push('/manager/sent')
            } catch (err) {
                $message.error('发送失败')
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleSaveDraft() {
            try {
                await httpSaveDraft({
                    toAddress: state.to,
                    subject: state.subject,
                    content: state.html
                })
                $message.success('草稿已保存')
            } catch (err) {
                $message.error('保存失败')
            }
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
