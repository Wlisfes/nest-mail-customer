<script lang="tsx">
import { defineComponent } from 'vue'
import { useFormService, useCoutext, AUTH } from '@/hooks'
import * as Service from '@/api'

export default defineComponent({
    name: 'MainLogin',
    setup(props) {
        const { cookies } = useCoutext()
        const { formRef, formState, state, setState, fetchValidater, router } = useFormService({
            formState: {
                email: '',
                password: '',
                code: ''
            },
            rules: {
                email: { required: true, trigger: 'blur', message: '请输入用户名或邮箱' },
                password: { required: true, trigger: 'blur', min: 6, max: 18, message: '请输入6~18位登录密码' }
            }
        })

        async function fetchSubmit() {
            return await fetchValidater().then(async result => {
                if (result) {
                    return await setState({ loading: false, disabled: false } as never)
                }
                try {
                    return await Service.httpBaseUserAuthorization({
                        email: formState.value.email,
                        password: window.btoa(encodeURIComponent(formState.value.password))
                    }).then(async ({ data }) => {
                        cookies.set(AUTH.APP_NEST_TOKEN, data.token)
                        return router.push({ path: '/manager', replace: true })
                    })
                } catch (err) {
                    return await setState({ loading: false, disabled: false } as never)
                }
            })
        }

        return () => (
            <n-element class="w-full select-none">
                <n-form size="large" ref={formRef} model={formState.value} rules={state.rules} disabled={state.loading} show-label={false}>
                    <n-form-item path="email">
                        <form-common-input
                            maxlength={64}
                            type="text"
                            placeholder="请输入用户名或邮箱"
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
                    <n-form-item>
                        <common-global-button
                            class="w-full"
                            type="info"
                            disabled={state.loading}
                            loading={state.loading}
                            onClick={fetchSubmit}
                        >
                            登录
                        </common-global-button>
                    </n-form-item>
                    <div class="flex flex-1 items-center justify-between">
                        <div class="flex items-center">
                            <n-text>还没有账号？</n-text>
                            <router-link to="/main/register">
                                <n-button text type="primary" focusable={false}>
                                    去注册
                                </n-button>
                            </router-link>
                        </div>
                        <router-link to="/main/register">
                            <n-button text type="primary" focusable={false}>
                                忘记密码
                            </n-button>
                        </router-link>
                    </div>
                </n-form>
            </n-element>
        )
    }
})
</script>
