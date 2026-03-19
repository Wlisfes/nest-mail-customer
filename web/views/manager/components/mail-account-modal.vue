<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { useFormService } from '@/hooks'
import * as Service from '@/api'

export default defineComponent({
    name: 'MailAccountModal',
    props: {
        visible: { type: Boolean, default: false }
    },
    emits: ['update:visible', 'success'],
    setup(props, { emit }) {
        const { formRef, formState, state, setState, fetchValidater } = useFormService({
            formState: {
                email: '',
                provider: 'qq',
                authCode: ''
            },
            rules: {
                email: { required: true, trigger: 'blur', message: '请输入邮箱地址', type: 'email' },
                provider: { required: true, trigger: 'change', message: '请选择邮箱平台' },
                authCode: { required: true, trigger: 'blur', message: '请输入授权码' }
            },
            mounted: false
        })

        const providerOptions = [
            { label: 'QQ 邮箱', value: 'qq' },
            { label: '网易 163', value: '163' },
            { label: 'Outlook', value: 'outlook' },
            { label: 'Gmail', value: 'gmail' }
        ]

        async function fetchSubmit() {
            return await fetchValidater().then(async result => {
                if (result) {
                    return await setState({ loading: false, disabled: false } as never)
                }
                try {
                    return await Service.httpCreateAccount({
                        email: formState.value.email,
                        provider: formState.value.provider,
                        authCode: formState.value.authCode
                    }).then(async () => {
                        await setState({ loading: false, disabled: false } as never)
                        window.$message?.success('邮箱添加成功')
                        emit('update:visible', false)
                        emit('success')
                        /**重置表单**/
                        formState.value.email = ''
                        formState.value.provider = 'qq'
                        formState.value.authCode = ''
                    })
                } catch (err: any) {
                    window.$message?.error(err?.message || '添加失败')
                    return await setState({ loading: false, disabled: false } as never)
                }
            })
        }

        return () => (
            <n-modal
                show={props.visible}
                onUpdate:show={(val: boolean) => emit('update:visible', val)}
                preset="card"
                title="添加邮箱账号"
                style={{ width: '480px' }}
                mask-closable={false}
            >
                <n-form
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                    label-placement="left"
                    label-width="80"
                    size="medium"
                >
                    <n-form-item label="邮箱平台" path="provider">
                        <n-select
                            v-model:value={formState.value.provider}
                            options={providerOptions}
                            placeholder="请选择邮箱平台"
                        ></n-select>
                    </n-form-item>
                    <n-form-item label="邮箱地址" path="email">
                        <n-input v-model:value={formState.value.email} placeholder="请输入邮箱地址" maxlength={128}></n-input>
                    </n-form-item>
                    <n-form-item label="授权码" path="authCode">
                        <n-input
                            v-model:value={formState.value.authCode}
                            type="password"
                            show-password-on="click"
                            placeholder="请输入授权码"
                            maxlength={255}
                        ></n-input>
                    </n-form-item>
                    <n-form-item label=" ">
                        <n-space>
                            <n-button type="primary" loading={state.loading} onClick={fetchSubmit}>
                                确认添加
                            </n-button>
                            <n-button onClick={() => emit('update:visible', false)}>取消</n-button>
                        </n-space>
                    </n-form-item>
                </n-form>
            </n-modal>
        )
    }
})
</script>
