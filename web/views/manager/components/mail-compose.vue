<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { useFormService } from '@/hooks'
import * as Service from '@/api'

export default defineComponent({
    name: 'MailCompose',
    props: {
        accountId: { type: Number, default: 0 }
    },
    emits: ['back', 'sent'],
    setup(props, { emit }) {
        const { formRef, formState, state, setState, fetchValidater } = useFormService({
            formState: {
                to: '',
                subject: '',
                html: ''
            },
            rules: {
                to: { required: true, trigger: 'blur', message: '请输入收件人邮箱', type: 'email' },
                subject: { required: true, trigger: 'blur', message: '请输入邮件主题' },
                html: { required: true, trigger: 'blur', message: '请输入邮件正文' }
            },
            mounted: false
        })

        async function fetchSubmit() {
            return await fetchValidater().then(async result => {
                if (result) {
                    return await setState({ loading: false, disabled: false } as never)
                }
                try {
                    return await Service.httpSendMail({
                        accountId: props.accountId,
                        to: formState.value.to,
                        subject: formState.value.subject,
                        html: formState.value.html
                    }).then(async () => {
                        await setState({ loading: false, disabled: false } as never)
                        window.$message?.success('邮件发送成功')
                        emit('sent')
                        /**重置表单**/
                        formState.value.to = ''
                        formState.value.subject = ''
                        formState.value.html = ''
                    })
                } catch (err: any) {
                    window.$message?.error(err?.message || '发送失败')
                    return await setState({ loading: false, disabled: false } as never)
                }
            })
        }

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden">
                {/* 顶栏 */}
                <div
                    class="flex items-center gap-8px px-16px py-12px border-b border-b-solid"
                    style={{ borderColor: 'var(--n-border-color, rgba(128,128,128,0.12))' }}
                >
                    <n-button text onClick={() => emit('back')} style={{ flexShrink: 0 }}>
                        <n-icon size={20}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                        </n-icon>
                    </n-button>
                    <n-text strong style={{ fontSize: '16px' }}>
                        写信
                    </n-text>
                </div>
                {/* 表单 */}
                <n-scrollbar class="flex-1">
                    <div class="px-16px py-12px">
                        <n-form
                            ref={formRef}
                            model={formState.value}
                            rules={state.rules}
                            disabled={state.loading}
                            label-placement="left"
                            label-width="64"
                            size="medium"
                        >
                            <n-form-item label="收件人" path="to">
                                <n-input v-model:value={formState.value.to} placeholder="请输入收件人邮箱" maxlength={128}></n-input>
                            </n-form-item>
                            <n-form-item label="主题" path="subject">
                                <n-input v-model:value={formState.value.subject} placeholder="请输入邮件主题" maxlength={256}></n-input>
                            </n-form-item>
                            <n-form-item label="正文" path="html">
                                <n-input
                                    v-model:value={formState.value.html}
                                    type="textarea"
                                    placeholder="请输入邮件正文"
                                    rows={12}
                                    autosize={{ minRows: 8, maxRows: 20 }}
                                ></n-input>
                            </n-form-item>
                            <n-form-item label=" ">
                                <n-space>
                                    <n-button type="primary" loading={state.loading} onClick={fetchSubmit}>
                                        发送邮件
                                    </n-button>
                                    <n-button onClick={() => emit('back')}>取消</n-button>
                                </n-space>
                            </n-form-item>
                        </n-form>
                    </div>
                </n-scrollbar>
            </n-element>
        )
    }
})
</script>
