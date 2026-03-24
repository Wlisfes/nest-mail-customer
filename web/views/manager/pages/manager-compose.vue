<script lang="tsx">
import { defineComponent, onMounted, ref, shallowRef, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { httpFetchMailAccounts, httpSendMail, httpSaveDraft, httpFetchMailDetail } from '@/api'
import { $message, $dialog } from '@/utils'
import { useState } from '@/hooks'
import { useStore, useMouse } from '@/store'
import { NButton, NTag, NDropdown, NSelect } from 'naive-ui'
import { getEditorConfig } from '../components/ckeditor-config'
import 'ckeditor5/ckeditor5.css'
import '@/assets/ckeditor-dark.css'

// 邮件模板
const MAIL_TEMPLATES = [
    {
        label: '空白邮件',
        key: 'blank',
        content: ''
    },
    {
        label: '会议邀请',
        key: 'meeting',
        subject: '会议邀请：{topic}',
        content: `<p>您好，</p>
<p>诚邀您参加以下会议：</p>
<p><strong>会议主题：</strong>{topic}</p>
<p><strong>会议时间：</strong>{time}</p>
<p><strong>会议地点：</strong>{location}</p>
<p><strong>会议议程：</strong></p>
<ol>
    <li>议程一</li>
    <li>议程二</li>
    <li>议程三</li>
</ol>
<p>期待您的参与！</p>
<p>此致<br>敬礼</p>`
    },
    {
        label: '项目汇报',
        key: 'report',
        subject: '项目进度汇报 - {project}',
        content: `<p>领导您好，</p>
<p>现将<strong>{project}</strong>项目最新进度汇报如下：</p>
<h3>一、本周完成工作</h3>
<ul>
    <li>任务一</li>
    <li>任务二</li>
    <li>任务三</li>
</ul>
<h3>二、下周计划</h3>
<ul>
    <li>计划一</li>
    <li>计划二</li>
</ul>
<h3>三、存在问题</h3>
<p>暂无</p>
<p>以上，请审阅。</p>`
    },
    {
        label: '请假申请',
        key: 'leave',
        subject: '请假申请',
        content: `<p>尊敬的领导：</p>
<p>您好！</p>
<p>因<strong>{reason}</strong>，需请假<strong>{days}</strong>天，具体时间为<strong>{startDate}</strong>至<strong>{endDate}</strong>。</p>
<p>请假期间工作已交接给<strong>{handover}</strong>同事，联系方式：{handoverPhone}</p>
<p>望批准，谢谢！</p>
<p>此致<br>敬礼</p>
<p>申请人：{name}<br>日期：{date}</p>`
    },
    {
        label: '商务合作',
        key: 'business',
        subject: '商务合作洽谈 - {company}',
        content: `<p>尊敬的{contact}，</p>
<p>您好！</p>
<p>我是{company}的{position}，关注贵司已久，非常欣赏贵司在{field}领域的成就。</p>
<p>我们{ourCompany}专注于{ourField}，希望能与贵司建立合作关系，共同开拓市场。</p>
<p>期待能与您进一步沟通，探讨合作可能性。如方便，请回复您的时间安排。</p>
<p>祝商祺！</p>
<p>{name}<br>{phone}<br>{email}</p>`
    }
]

export default defineComponent({
    name: 'ManagerCompose',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const editorReady = ref(false)
        const CKEditorComponent = shallowRef<any>(null)
        const ClassicEditorRef = shallowRef<any>(null)
        const editorInstance = shallowRef<any>(null)
        const isFullscreen = ref(false)
        const { inverted } = useStore(useMouse)
        const isDark = computed(() => inverted.value)

        const { state, setState } = useState({
            loading: false,
            saving: false,
            showBcc: false,
            urgent: false,
            accountId: null as number | null,
            to: [] as string[],
            cc: [] as string[],
            bcc: [] as string[],
            subject: '',
            html: '',
            attachments: [] as Array<{ name: string; size: number; file?: File }>,
            accounts: [] as Array<{ label: string; value: number; email: string }>,
            replyTo: null as any,
            forward: null as any
        })

        onMounted(async () => {
            // 动态导入 CKEditor（仅客户端）
            if (typeof window !== 'undefined') {
                try {
                    const [ckeditorVue, ckeditorCore] = await Promise.all([import('@ckeditor/ckeditor5-vue'), import('ckeditor5')])
                    CKEditorComponent.value = ckeditorVue.Ckeditor
                    ClassicEditorRef.value = ckeditorCore.ClassicEditor
                    editorReady.value = true
                } catch (err) {
                    console.error('CKEditor 加载失败', err)
                }
            }

            // 加载邮箱账号
            try {
                const res: any = await httpFetchMailAccounts()
                const data = res.data ?? res
                const list = Array.isArray(data) ? data : (data.list ?? [])
                await setState({
                    accounts: list.map((item: any) => ({
                        label: `${item.email} (${item.provider})`,
                        value: item.keyId,
                        email: item.email
                    }))
                })
                if (list.length > 0 && !state.accountId) {
                    await setState({ accountId: list[0].keyId })
                }
            } catch (err) {
                console.error('获取邮箱账号列表失败', err)
            }

            // 处理回复
            const replyToId = route.query.replyTo as string
            if (replyToId) {
                try {
                    const res: any = await httpFetchMailDetail(replyToId)
                    const mail = res.data ?? res
                    await setState({
                        replyTo: mail,
                        to: [mail.fromAddress],
                        subject: mail.subject?.startsWith('Re:') ? mail.subject : `Re: ${mail.subject || ''}`,
                        html: `<br><br><div style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
<p><strong>原始邮件</strong></p>
<p><strong>发件人：</strong>${mail.fromAddress}</p>
<p><strong>时间：</strong>${mail.date}</p>
<p><strong>主题：</strong>${mail.subject}</p>
<br>
${mail.htmlBody || mail.textBody || ''}
</div>`
                    })
                } catch (err) {
                    console.error('获取原邮件失败', err)
                }
            }

            // 处理转发
            const forwardId = route.query.forward as string
            if (forwardId) {
                try {
                    const res: any = await httpFetchMailDetail(forwardId)
                    const mail = res.data ?? res
                    await setState({
                        forward: mail,
                        subject: mail.subject?.startsWith('Fwd:') ? mail.subject : `Fwd: ${mail.subject || ''}`,
                        html: `<br><br><div style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
<p>---------- 转发邮件 ----------</p>
<p><strong>发件人：</strong>${mail.fromAddress}</p>
<p><strong>收件人：</strong>${mail.toAddress}</p>
<p><strong>时间：</strong>${mail.date}</p>
<p><strong>主题：</strong>${mail.subject}</p>
<br>
${mail.htmlBody || mail.textBody || ''}
</div>`
                    })
                } catch (err) {
                    console.error('获取原邮件失败', err)
                }
            }
        })

        // 添加收件人
        function addRecipient(type: 'to' | 'cc' | 'bcc', email: string) {
            if (!email || !email.includes('@')) return
            const list = type === 'to' ? state.to : type === 'cc' ? state.cc : state.bcc
            if (!list.includes(email)) {
                list.push(email)
                setState({ [type]: [...list] })
            }
        }

        // 移除收件人
        function removeRecipient(type: 'to' | 'cc' | 'bcc', email: string) {
            const list = type === 'to' ? state.to : type === 'cc' ? state.cc : state.bcc
            const index = list.indexOf(email)
            if (index > -1) {
                list.splice(index, 1)
                setState({ [type]: [...list] })
            }
        }

        // 处理附件上传
        function handleFileSelect(e: Event) {
            const input = e.target as HTMLInputElement
            const files = input.files
            if (!files) return
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (file.size > 25 * 1024 * 1024) {
                    $message.warning(`${file.name} 超过25MB限制`)
                    continue
                }
                state.attachments.push({ name: file.name, size: file.size, file })
            }
            setState({ attachments: [...state.attachments] })
            input.value = ''
        }

        function removeAttachment(index: number) {
            state.attachments.splice(index, 1)
            setState({ attachments: [...state.attachments] })
        }

        function formatSize(bytes: number) {
            if (bytes < 1024) return bytes + ' B'
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        }

        // 应用模板
        function applyTemplate(templateKey: string) {
            const template = MAIL_TEMPLATES.find(t => t.key === templateKey)
            if (!template) return
            if (template.content) {
                let content = template.content
                const vars: Record<string, string> = {
                    topic: '【请填写主题】',
                    time: new Date().toLocaleString(),
                    location: '【请填写地点】',
                    project: '【请填写项目名称】',
                    reason: '【请填写原因】',
                    days: '【请填写天数】',
                    startDate: new Date().toLocaleDateString(),
                    endDate: new Date().toLocaleDateString(),
                    handover: '【请填写交接人】',
                    handoverPhone: '【请填写电话】',
                    name: '【请填写姓名】',
                    date: new Date().toLocaleDateString(),
                    company: '【请填写公司】',
                    contact: '【请填写联系人】',
                    position: '【请填写职位】',
                    field: '【请填写领域】',
                    ourCompany: '【请填写我方公司】',
                    ourField: '【请填写我方领域】',
                    phone: '【请填写电话】',
                    email: state.accounts.find(a => a.value === state.accountId)?.email || ''
                }
                Object.keys(vars).forEach(key => {
                    content = content.replace(new RegExp(`{${key}}`, 'g'), vars[key])
                })
                setState({ html: content })
            }
            if (template.subject && !state.subject) {
                setState({ subject: template.subject.replace(/{\w+}/g, '【请填写】') })
            }
            $message.success(`已应用模板：${template.label}`)
        }

        // 发送邮件
        async function handleSend() {
            if (!state.accountId) return $message.warning('请选择发件邮箱')
            if (state.to.length === 0 && state.cc.length === 0 && state.bcc.length === 0) {
                return $message.warning('请至少填写一个收件人')
            }
            if (!state.subject.trim()) {
                return $dialog.warning({
                    title: '确认发送',
                    content: '邮件主题为空，是否继续发送？',
                    positiveText: '继续发送',
                    negativeText: '取消',
                    onPositiveClick: () => doSend()
                })
            }
            await doSend()
        }

        async function doSend() {
            await setState({ loading: true })
            try {
                await httpSendMail({
                    accountId: state.accountId,
                    to: state.to.join(', '),
                    cc: state.cc.join(', '),
                    bcc: state.bcc.join(', '),
                    subject: state.subject,
                    html: state.html,
                    attachments: state.attachments.map(a => ({ name: a.name, size: a.size }))
                })
                $message.success('🎉 发送成功')
                router.push('/manager/sent')
            } catch (err: any) {
                $message.error(err.message || '发送失败')
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleSaveDraft() {
            await setState({ saving: true })
            try {
                await httpSaveDraft({
                    accountId: state.accountId,
                    toAddress: state.to.join(', '),
                    ccAddress: state.cc.join(', '),
                    bccAddress: state.bcc.join(', '),
                    subject: state.subject,
                    content: state.html,
                    attachments: state.attachments.map(a => ({ name: a.name, size: a.size }))
                })
                $message.success('📝 草稿已保存')
            } catch (err) {
                $message.error('保存失败')
            } finally {
                await setState({ saving: false })
            }
        }

        function handleCancel() {
            if (state.to.length > 0 || state.subject || state.html) {
                $dialog.warning({
                    title: '确认取消',
                    content: '当前邮件内容未保存，确定要取消吗？',
                    positiveText: '确定取消',
                    negativeText: '继续编辑',
                    onPositiveClick: () => router.back()
                })
            } else {
                router.back()
            }
        }

        // 渲染收件人输入行
        function renderRecipientRow(type: 'to' | 'cc' | 'bcc', label: string, required = false) {
            const list = type === 'to' ? state.to : type === 'cc' ? state.cc : state.bcc
            if (type === 'bcc' && !state.showBcc) return null
            return (
                <div class="compose-field-row">
                    <label class="compose-field-label">
                        {required && <span class="compose-required">*</span>}
                        {label}
                    </label>
                    <div class="compose-field-content">
                        <div class="recipient-tags">
                            {list.map(email => (
                                <n-tag
                                    key={email}
                                    closable
                                    size="small"
                                    type="info"
                                    bordered={false}
                                    onClose={() => removeRecipient(type, email)}
                                >
                                    {email}
                                </n-tag>
                            ))}
                            <input
                                type="text"
                                class="recipient-input"
                                placeholder={list.length === 0 ? '支持多个邮箱粘贴，请使用 ; 或英文 , 分隔邮箱' : ''}
                                onKeydown={(e: KeyboardEvent) => {
                                    const target = e.target as HTMLInputElement
                                    if (e.key === 'Enter' || e.key === ';' || e.key === ',') {
                                        e.preventDefault()
                                        const val = target.value.trim().replace(/[;,]$/, '')
                                        if (val) {
                                            val.split(/[;,\s]+/)
                                                .filter(v => v.includes('@'))
                                                .forEach(v => addRecipient(type, v.trim()))
                                            target.value = ''
                                        }
                                    }
                                    if (e.key === 'Backspace' && !target.value && list.length > 0) {
                                        removeRecipient(type, list[list.length - 1])
                                    }
                                }}
                                onBlur={(e: FocusEvent) => {
                                    const target = e.target as HTMLInputElement
                                    const val = target.value.trim()
                                    if (val && val.includes('@')) {
                                        val.split(/[;,\s]+/)
                                            .filter(v => v.includes('@'))
                                            .forEach(v => addRecipient(type, v.trim()))
                                        target.value = ''
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        const currentSenderEmail = () => state.accounts.find(a => a.value === state.accountId)?.email ?? ''

        // CKEditor 配置
        const editorConfig = getEditorConfig()

        // 编辑器就绪回调
        function onEditorReady(editor: any) {
            editorInstance.value = editor
            // 初始内容加载（回复/转发场景）
            if (state.html && editor.getData() !== state.html) {
                editor.setData(state.html)
            }
        }

        // 全屏切换
        function toggleFullscreen() {
            isFullscreen.value = !isFullscreen.value
        }

        return () => (
            <div class="compose-page animate-fadeInUp">
                {/* ===== 顶部操作栏 ===== */}
                <div class="compose-action-bar">
                    <div class="compose-action-left">
                        <n-button
                            type="primary"
                            size="medium"
                            loading={state.loading}
                            onClick={handleSend}
                            style={{ fontWeight: 600, borderRadius: '6px', paddingLeft: '20px', paddingRight: '20px' }}
                        >
                            <i class="i-carbon-send-filled mr-6"></i>
                            发送
                        </n-button>
                        <n-button size="medium" secondary onClick={handleSaveDraft} loading={state.saving}>
                            存为草稿
                        </n-button>
                        <n-button size="medium" secondary onClick={handleCancel}>
                            取消
                        </n-button>
                    </div>
                    <div class="compose-action-right">
                        <n-dropdown
                            trigger="click"
                            options={MAIL_TEMPLATES.map(t => ({ label: t.label, key: t.key }))}
                            onSelect={(key: string) => applyTemplate(key)}
                        >
                            <n-button text type="primary" size="small">
                                使用模板
                            </n-button>
                        </n-dropdown>
                        {!state.showBcc && (
                            <n-button text type="primary" size="small" onClick={() => setState({ showBcc: true })}>
                                添加密送
                            </n-button>
                        )}
                        {(state.replyTo || state.forward) && (
                            <n-tag type="info" size="small" round>
                                {state.replyTo ? '回复邮件' : '转发邮件'}
                            </n-tag>
                        )}
                    </div>
                </div>

                {/* ===== 表单区域 ===== */}
                <div class="compose-form">
                    <div class="compose-field-row">
                        <label class="compose-field-label">当前发件人</label>
                        <div class="compose-field-content">
                            <span class="compose-sender-email">{currentSenderEmail()}</span>
                        </div>
                    </div>
                    {renderRecipientRow('to', '收件人', true)}
                    {renderRecipientRow('cc', '抄送给')}
                    {renderRecipientRow('bcc', '密送')}
                    <div class="compose-field-row">
                        <label class="compose-field-label">
                            <span class="compose-required">*</span>主题
                        </label>
                        <div class="compose-field-content">
                            <input
                                type="text"
                                class="compose-subject-input"
                                placeholder="请输入主题"
                                value={state.subject}
                                onInput={(e: Event) => setState({ subject: (e.target as HTMLInputElement).value })}
                            />
                        </div>
                    </div>
                    <div class="compose-field-row">
                        <label class="compose-field-label">添加附件</label>
                        <div class="compose-field-content">
                            <div class="compose-attachment-area">
                                <span class="compose-attachment-hint">(支持附件，单个附件大小在 25M 以内)</span>
                                <n-button text type="primary" size="small" onClick={() => document.getElementById('file-input')?.click()}>
                                    浏览文件
                                </n-button>
                                <input id="file-input" type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
                            </div>
                            {state.attachments.length > 0 && (
                                <div class="compose-attachment-list">
                                    {state.attachments.map((att, index) => (
                                        <div class="compose-attachment-item" key={index}>
                                            <span class="attachment-name">📄 {att.name}</span>
                                            <span class="attachment-size">{formatSize(att.size)}</span>
                                            <n-button text type="error" size="tiny" onClick={() => removeAttachment(index)}>
                                                ✕
                                            </n-button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== CKEditor 编辑器 ===== */}
                <div
                    class={[
                        'compose-editor-wrap',
                        isDark.value ? 'ck-dark-theme' : '',
                        isFullscreen.value ? 'compose-editor-fullscreen' : ''
                    ]}
                >
                    {isFullscreen.value && (
                        <div class="compose-fullscreen-bar">
                            <span>全屏编辑</span>
                            <NButton text type="primary" size="small" onClick={toggleFullscreen}>
                                退出全屏
                            </NButton>
                        </div>
                    )}
                    {editorReady.value && CKEditorComponent.value && ClassicEditorRef.value ? (
                        <CKEditorComponent.value
                            editor={ClassicEditorRef.value}
                            modelValue={state.html}
                            onUpdate:modelValue={(val: string) => setState({ html: val })}
                            config={editorConfig}
                            onReady={onEditorReady}
                        />
                    ) : (
                        <div class="compose-editor-loading">
                            <span>编辑器加载中...</span>
                        </div>
                    )}
                    {!isFullscreen.value && (
                        <div class="compose-fullscreen-toggle" onClick={toggleFullscreen} title="全屏编辑">
                            ⛶
                        </div>
                    )}
                </div>

                {/* ===== 底部栏 ===== */}
                <div class="compose-bottom-bar">
                    <div class="compose-bottom-left">
                        <span class="compose-bottom-label">
                            <span class="compose-required">*</span>发件人
                        </span>
                        <n-select
                            v-model:value={state.accountId}
                            options={state.accounts}
                            placeholder="请选择发件邮箱"
                            size="small"
                            style={{ width: '260px' }}
                        />
                        <label class="compose-urgent-label" onClick={() => setState({ urgent: !state.urgent })}>
                            <input type="checkbox" checked={state.urgent} />
                            <span>紧急</span>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';

.compose-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

/* ===== 顶部操作栏 ===== */
.compose-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
}

.compose-action-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.compose-action-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* ===== 表单区域 ===== */
.compose-form {
    flex-shrink: 0;
}

.compose-field-row {
    display: flex;
    align-items: flex-start;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border-color);
    min-height: 42px;
}

.compose-field-label {
    flex-shrink: 0;
    width: 80px;
    font-size: 13px;
    color: var(--text-color-2);
    line-height: 22px;
    padding-top: 1px;
    display: flex;
    align-items: center;
    gap: 2px;
}

.compose-required {
    color: #e74c3c;
    font-weight: 600;
}

.compose-field-content {
    flex: 1;
    min-width: 0;
}

.compose-sender-email {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
}

/* ===== 收件人输入 ===== */
.recipient-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    min-height: 22px;
}

.recipient-input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    min-width: 200px;
    padding: 0;
    font-size: 13px;
    line-height: 22px;
    color: var(--text-color-base);
    &::placeholder {
        color: var(--text-color-3);
    }
}

/* ===== 主题输入 ===== */
.compose-subject-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 14px;
    line-height: 22px;
    color: var(--text-color-base);
    &::placeholder {
        color: var(--text-color-3);
    }
}

/* ===== 附件区域 ===== */
.compose-attachment-area {
    display: flex;
    align-items: center;
    gap: 8px;
}

.compose-attachment-hint {
    font-size: 12px;
    color: var(--text-color-3);
}

.compose-attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.compose-attachment-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: var(--action-color);
    border-radius: 4px;
    font-size: 12px;

    .attachment-name {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .attachment-size {
        color: var(--text-color-3);
    }
}

/* ===== CKEditor 编辑器 ===== */
.compose-editor-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    :deep(.ck-editor) {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }

    :deep(.ck-editor__top) {
        border-bottom: 1px solid var(--border-color);
    }

    :deep(.ck-toolbar) {
        border: none !important;
        border-radius: 0 !important;
    }

    :deep(.ck-editor__main) {
        flex: 1;
        overflow: auto;
    }

    :deep(.ck-editor__editable) {
        border: none !important;
        border-radius: 0 !important;
        min-height: 300px;
        padding: 16px 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
    }

    :deep(.ck-editor__editable:focus) {
        box-shadow: none !important;
    }
}

.compose-editor-fullscreen {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: var(--body-color, #fff);
}

.compose-fullscreen-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 600;
}

.compose-fullscreen-toggle {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    opacity: 0.4;
    transition:
        opacity 0.2s,
        background 0.2s;
    &:hover {
        opacity: 1;
        background: var(--hover-color);
    }
}

.compose-editor-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-3);
    font-size: 14px;
}

/* ===== 底部栏 ===== */
.compose-bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
}

.compose-bottom-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.compose-bottom-label {
    font-size: 13px;
    color: var(--text-color-2);
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}

.compose-urgent-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-color-2);
    margin-left: 8px;
    input[type='checkbox'] {
        accent-color: var(--primary-color);
    }
    &:hover {
        color: var(--text-color-base);
    }
}
</style>
