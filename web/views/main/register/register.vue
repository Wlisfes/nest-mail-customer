<script lang="tsx">
import { defineComponent } from 'vue'
import { useFormService } from '@/hooks'

export default defineComponent({
    name: 'MainRegister',
    setup(props) {
        const { formRef, formState, state, fetchValidater } = useFormService({
            formState: {
                nickname: '',
                email: '',
                password: '',
                code: ''
            },
            rules: {
                nickname: { required: true, trigger: 'blur', message: '请输入用户名' },
                email: { required: true, trigger: 'blur', message: '请输入注册邮箱' },
                password: { required: true, trigger: 'blur', min: 8, max: 18, message: '请输入8~18位密码' },
                code: { required: true, trigger: 'blur', message: '请输入邮箱验证码' }
            }
        })

        async function fetchSubmit() {
            return await fetchValidater().then(async result => {
                if (result) {
                    // return await codexRef.value.fetchRefresh(300).then(() => {
                    //     return setState({ loading: false, disabled: false })
                    // })
                }
                try {
                    // return await Service.httpBaseSystemUserTokenAuthorize({
                    //     code: form.value.code,
                    //     number: form.value.number,
                    //     password: window.btoa(encodeURIComponent(form.value.password))
                    // }).then(async ({ data }) => {
                    //     return await setCompose(data).then(async () => {
                    //         return router.push({ path: '/', replace: true })
                    //     })
                    // })
                } catch (err) {
                    // return await codexRef.value.fetchRefresh(300).then(() => {
                    //     return setState({ loading: false, disabled: false })
                    // })
                }
            })
        }

        return () => (
            <n-element class="w-full select-none">
                <n-form size="large" ref={formRef} model={formState.value} rules={state.rules} disabled={state.loading} show-label={false}>
                    <n-form-item path="nickname">
                        <form-common-input
                            maxlength={32}
                            type="text"
                            placeholder="请输入用户名"
                            v-model:value={formState.value.nickname}
                            input-props={{ autocomplete: 'on' }}
                            prefix={{ name: 'nest-unset-user', size: 20 }}
                            onSubmit={fetchSubmit}
                        ></form-common-input>
                    </n-form-item>
                    <n-form-item path="email">
                        <form-common-input
                            maxlength={64}
                            type="text"
                            placeholder="请输入注册邮箱"
                            v-model:value={formState.value.email}
                            input-props={{ autocomplete: 'on' }}
                            prefix={{ name: 'nest-unset-user', size: 22 }}
                            onSubmit={fetchSubmit}
                        ></form-common-input>
                    </n-form-item>
                    <n-form-item path="password">
                        <form-common-input
                            maxlength={32}
                            placeholder="请输入登录密码"
                            type="password"
                            show-password-on="click"
                            input-props={{ autocomplete: 'password' }}
                            style={{ '--input-password-right': '46px' }}
                            v-model:value={formState.value.password}
                            prefix={{ name: 'nest-unset-ockes', size: 22 }}
                            onSubmit={fetchSubmit}
                        ></form-common-input>
                    </n-form-item>
                    <n-form-item path="code">
                        <div class="flex flex-1 items-center overflow-hidden">
                            <form-common-input
                                class="flex-1"
                                type="text"
                                placeholder="请输入邮箱验证码"
                                maxlength={4}
                                v-model:value={formState.value.code}
                                prefix={{ name: 'nest-unset-codex', size: 22 }}
                                onSubmit={fetchSubmit}
                            ></form-common-input>
                        </div>
                    </n-form-item>
                    <n-form-item>
                        <common-global-button
                            class="w-full"
                            type="info"
                            disabled={state.loading}
                            loading={state.loading}
                            onClick={fetchSubmit}
                        >
                            立即注册
                        </common-global-button>
                    </n-form-item>
                    <div class="flex flex-1 items-center justify-between">
                        <div class="flex items-center">
                            <n-text>已有账号？</n-text>
                            <router-link to="/main/login">
                                <n-button text type="primary" focusable={false}>
                                    去登录
                                </n-button>
                            </router-link>
                        </div>
                    </div>
                </n-form>
            </n-element>
        )
    }
})
</script>
