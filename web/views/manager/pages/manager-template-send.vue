<script lang="tsx">
/**
 * 模板发送页面 - 选择模板后填充变量、指定收件人发送
 */
import { defineComponent, h, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { httpFetchTemplateDetail, httpFetchVariables, httpSendTemplate, httpFetchMailAccounts } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import { NButton, NSpace, NText, NInput, NSelect, NTag, NDataTable, NModal, type DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerTemplateSend',
    setup() {
        const route = useRoute()
        const router = useRouter()

        const { state, setState } = useState({
            loading: false,
            sending: false,
            template: null as any,
            variables: [] as any[],
            subject: '',
            accountId: null as number | null,
            accounts: [] as any[],
            recipients: [{ email: '', variables: {} as Record<string, string> }] as Array<{ email: string; variables: Record<string, string> }>,
            showResult: false,
            sendResult: null as any
        })

        async function loadData() {
            await setState({ loading: true })
            try {
                const templateId = Number(route.params.id)
                const [tplRes, varRes]: any[] = await Promise.all([
                    httpFetchTemplateDetail(templateId),
                    httpFetchVariables()
                ])
                const tpl = tplRes.data ?? tplRes
                const vars = varRes.data ?? varRes
                // 尝试获取邮箱账号
                let accounts: any[] = []
                try {
                    const accRes: any = await httpFetchMailAccounts()
                    const accData = accRes.data ?? accRes
                    accounts = Array.isArray(accData) ? accData : (accData.list ?? [])
                } catch {}

                const variableList = Array.isArray(vars) ? vars : (vars.list ?? [])
                // 初始化收件人变量
                const defaultVars: Record<string, string> = {}
                variableList.forEach((v: any) => { defaultVars[v.varKey] = v.defaultValue || '' })

                await setState({
                    template: tpl,
                    variables: variableList,
                    subject: tpl.name || '',
                    accounts,
                    accountId: accounts[0]?.keyId || null,
                    recipients: [{ email: '', variables: { ...defaultVars } }]
                })
            } catch (err: any) {
                $message.error(err?.message ?? '加载失败')
                router.back()
            } finally {
                await setState({ loading: false })
            }
        }

        function addRecipient() {
            const defaultVars: Record<string, string> = {}
            state.variables.forEach((v: any) => { defaultVars[v.varKey] = v.defaultValue || '' })
            state.recipients.push({ email: '', variables: { ...defaultVars } })
        }

        function removeRecipient(index: number) {
            if (state.recipients.length > 1) {
                state.recipients.splice(index, 1)
            }
        }

        async function handleSend() {
            if (!state.accountId) {
                $message.warning('请选择发件账号')
                return
            }
            const validRecipients = state.recipients.filter(r => r.email.trim())
            if (validRecipients.length === 0) {
                $message.warning('请至少填写一个收件人')
                return
            }
            await setState({ sending: true })
            try {
                const res: any = await httpSendTemplate({
                    templateId: state.template.keyId,
                    accountId: state.accountId,
                    subject: state.subject,
                    recipients: validRecipients
                })
                const result = res.data ?? res
                await setState({ sendResult: result, showResult: true })
                $message.success(`发送完成: ${result.success || 0} 成功, ${result.failed || 0} 失败`)
            } catch (err: any) {
                $message.error(err?.message ?? '发送失败')
            } finally {
                await setState({ sending: false })
            }
        }

        onMounted(loadData)

        const recipientColumns = computed<DataTableColumns>(() => {
            const cols: DataTableColumns = [
                {
                    title: '收件人邮箱',
                    key: 'email',
                    width: 250,
                    render: (_: any, index: number) =>
                        h(NInput, {
                            value: state.recipients[index].email,
                            'onUpdate:value': (v: string) => { state.recipients[index].email = v },
                            size: 'small',
                            placeholder: 'user@example.com'
                        })
                }
            ]
            // 为每个变量添加一列
            state.variables.forEach((v: any) => {
                cols.push({
                    title: `${v.name} (${v.varKey})`,
                    key: v.varKey,
                    width: 150,
                    render: (_: any, index: number) =>
                        h(NInput, {
                            value: state.recipients[index].variables[v.varKey] || '',
                            'onUpdate:value': (val: string) => { state.recipients[index].variables[v.varKey] = val },
                            size: 'small',
                            placeholder: v.defaultValue || v.varKey
                        })
                })
            })
            cols.push({
                title: '',
                key: 'actions',
                width: 60,
                render: (_: any, index: number) =>
                    state.recipients.length > 1
                        ? h(NButton, { size: 'tiny', type: 'error', secondary: true, onClick: () => removeRecipient(index) }, () => '✕')
                        : null
            })
            return cols
        })

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <NButton text onClick={() => router.back()} style={{ fontSize: '18px' }}>←</NButton>
                        <n-text class="text-22" style={{ fontWeight: 800 }}>📨 模板发送</n-text>
                        {state.template && (
                            <NTag size="small" round bordered={false} type="primary">{state.template.name}</NTag>
                        )}
                    </div>
                </div>

                <div class="flex flex-col gap-16 flex-1 overflow-auto" style={{ padding: '0 0 20px' }}>
                    {/* 发送配置 */}
                    <div class="flex gap-16">
                        <div class="flex flex-col gap-8" style={{ flex: 1 }}>
                            <NText depth={3} style={{ fontSize: '12px' }}>发件账号</NText>
                            <NSelect
                                v-model:value={state.accountId}
                                options={state.accounts.map((a: any) => ({ label: a.email, value: a.keyId }))}
                                placeholder="选择发件邮箱"
                                size="small"
                            />
                        </div>
                        <div class="flex flex-col gap-8" style={{ flex: 1 }}>
                            <NText depth={3} style={{ fontSize: '12px' }}>邮件主题</NText>
                            <NInput v-model:value={state.subject} placeholder="邮件主题" size="small" />
                        </div>
                    </div>

                    {/* 收件人表格 */}
                    <div class="flex flex-col gap-8">
                        <div class="flex items-center justify-between">
                            <NText style={{ fontWeight: 600, fontSize: '14px' }}>收件人列表</NText>
                            <NButton size="tiny" type="primary" secondary onClick={addRecipient}>+ 添加收件人</NButton>
                        </div>
                        <NDataTable
                            columns={recipientColumns.value}
                            data={state.recipients}
                            bordered={false}
                            size="small"
                            max-height={300}
                        />
                    </div>

                    {/* 发送按钮 */}
                    <div class="flex justify-end">
                        <NButton type="primary" size="medium" loading={state.sending} onClick={handleSend}>
                            🚀 发送 ({state.recipients.filter(r => r.email.trim()).length} 封)
                        </NButton>
                    </div>
                </div>

                {/* 发送结果弹窗 */}
                <NModal
                    v-model:show={state.showResult}
                    preset="dialog"
                    title="发送结果"
                    style={{ width: '500px' }}
                >
                    {state.sendResult && (
                        <div class="flex flex-col gap-12">
                            <NSpace size={16}>
                                <NTag type="success" round>✅ 成功: {state.sendResult.success}</NTag>
                                <NTag type="error" round>❌ 失败: {state.sendResult.failed}</NTag>
                                <NTag round>总计: {state.sendResult.total}</NTag>
                            </NSpace>
                            {state.sendResult.results?.filter((r: any) => r.status === 'failed').length > 0 && (
                                <div>
                                    <NText depth={3} style={{ fontSize: '12px' }}>失败详情：</NText>
                                    {state.sendResult.results.filter((r: any) => r.status === 'failed').map((r: any) => (
                                        <div key={r.email} style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                                            {r.email}: {r.error}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </NModal>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
</style>
