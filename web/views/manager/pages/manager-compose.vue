<script lang="tsx">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { httpFetchMailAccounts, httpSendMail, httpSaveDraft, httpFetchMailDetail } from '@/api'
import { $message, $dialog } from '@/utils'
import { useState } from '@/hooks'
import { NButton, NTag, NPopover, NTooltip, NDropdown } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'

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

// 富文本编辑器工具栏
const EDITOR_TOOLS = [
    { icon: 'i-carbon-text-bold', command: 'bold', title: '粗体' },
    { icon: 'i-carbon-text-italic', command: 'italic', title: '斜体' },
    { icon: 'i-carbon-text-underline', command: 'underline', title: '下划线' },
    { icon: 'i-carbon-text-strikethrough', command: 'strikeThrough', title: '删除线' },
    { divider: true },
    { icon: 'i-carbon-text-align-left', command: 'justifyLeft', title: '左对齐' },
    { icon: 'i-carbon-text-align-center', command: 'justifyCenter', title: '居中' },
    { icon: 'i-carbon-text-align-right', command: 'justifyRight', title: '右对齐' },
    { divider: true },
    { icon: 'i-carbon-list-bulleted', command: 'insertUnorderedList', title: '无序列表' },
    { icon: 'i-carbon-list-numbered', command: 'insertOrderedList', title: '有序列表' },
    { divider: true },
    { icon: 'i-carbon-link', command: 'createLink', title: '插入链接' },
    { icon: 'i-carbon-image', command: 'insertImage', title: '插入图片' },
    { icon: 'i-carbon-code', command: 'formatBlock', value: 'PRE', title: '代码块' },
    { icon: 'i-carbon-undo', command: 'undo', title: '撤销' },
    { icon: 'i-carbon-redo', command: 'redo', title: '重做' }
]

export default defineComponent({
    name: 'ManagerCompose',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const editorRef = ref<HTMLDivElement>()
        
        const { state, setState } = useState({
            loading: false,
            saving: false,
            showCc: false,
            showBcc: false,
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

        // 获取回复/转发原邮件
        onMounted(async () => {
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
                // 默认选中第一个
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

        // 富文本命令
        function execCommand(command: string, value?: string) {
            document.execCommand(command, false, value)
            if (editorRef.value) {
                editorRef.value.focus()
            }
        }

        // 处理工具栏点击
        function handleToolClick(tool: any) {
            if (tool.command === 'createLink') {
                const url = prompt('请输入链接地址:', 'https://')
                if (url) execCommand(tool.command, url)
            } else if (tool.command === 'insertImage') {
                const url = prompt('请输入图片地址:', 'https://')
                if (url) execCommand(tool.command, url)
            } else {
                execCommand(tool.command, tool.value)
            }
        }

        // 处理编辑器内容变化
        function handleEditorInput(e: Event) {
            const target = e.target as HTMLDivElement
            setState({ html: target.innerHTML })
        }

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
                state.attachments.push({
                    name: file.name,
                    size: file.size,
                    file: file
                })
            }
            setState({ attachments: [...state.attachments] })
            input.value = ''
        }

        // 移除附件
        function removeAttachment(index: number) {
            state.attachments.splice(index, 1)
            setState({ attachments: [...state.attachments] })
        }

        // 格式化文件大小
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
                // 填充模板变量
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
                if (editorRef.value) {
                    editorRef.value.innerHTML = content
                }
            }

            if (template.subject && !state.subject) {
                setState({ subject: template.subject.replace(/{\w+}/g, '【请填写】') })
            }

            $message.success(`已应用模板：${template.label}`)
        }

        // 发送邮件
        async function handleSend() {
            if (!state.accountId) {
                $message.warning('请选择发件邮箱')
                return
            }
            if (state.to.length === 0 && state.cc.length === 0 && state.bcc.length === 0) {
                $message.warning('请至少填写一个收件人')
                return
            }
            if (!state.subject.trim()) {
                $dialog.warning({
                    title: '确认发送',
                    content: '邮件主题为空，是否继续发送？',
                    positiveText: '继续发送',
                    negativeText: '取消',
                    onPositiveClick: async () => {
                        await doSend()
                    }
                })
                return
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

        // 保存草稿
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

        // 渲染收件人输入
        function renderRecipientInput(type: 'to' | 'cc' | 'bcc', label: string) {
            const list = type === 'to' ? state.to : type === 'cc' ? state.cc : state.bcc
            const showField = type === 'to' ? true : type === 'cc' ? state.showCc : state.showBcc
            
            if (!showField && type !== 'to') return null

            return (
                <n-form-item label={label} label-width={80}>
                    <div class="recipient-input-wrapper">
                        <div class="recipient-tags">
                            {list.map(email => (
                                <n-tag
                                    key={email}
                                    closable
                                    size="small"
                                    onClose={() => removeRecipient(type, email)}
                                >
                                    {email}
                                </n-tag>
                            ))}
                            <input
                                type="text"
                                class="recipient-input"
                                placeholder={list.length === 0 ? `输入邮箱地址，按回车添加` : ''}
                                onKeydown={(e: KeyboardEvent) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addRecipient(type, (e.target as HTMLInputElement).value)
                                        ;(e.target as HTMLInputElement).value = ''
                                    }
                                }}
                            />
                        </div>
                    </div>
                </n-form-item>
            )
        }

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-8">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>✏️ 写邮件</n-text>
                        {(state.replyTo || state.forward) && (
                            <n-tag type="info" size="small">
                                {state.replyTo ? '回复邮件' : '转发邮件'}
                            </n-tag>
                        )}
                    </div>
                    <div class="flex gap-8">
                        <n-dropdown
                            trigger="click"
                            options={MAIL_TEMPLATES.map(t => ({ label: t.label, key: t.key }))}
                            onSelect={(key: string) => applyTemplate(key)}
                        >
                            <n-button secondary round>
                                <i class="i-carbon-template mr-6"></i>
                                模板
                            </n-button>
                        </n-dropdown>
                        <n-button secondary round loading={state.saving} onClick={handleSaveDraft}>
                            <i class="i-carbon-save mr-6"></i>
                            存草稿
                        </n-button>
                        <n-button type="primary" round loading={state.loading} onClick={handleSend} style={{ fontWeight: 600 }}>
                            <i class="i-carbon-send-filled mr-6"></i>
                            发送
                        </n-button>
                    </div>
                </div>

                <n-card content-class="p-24!" style={{ borderRadius: '16px' }} hoverable>
                    <n-form label-placement="left" label-width={80}>
                        {/* 发件人 */}
                        <n-form-item label="发件人">
                            <n-select
                                v-model:value={state.accountId}
                                options={state.accounts}
                                placeholder="请选择发件邮箱"
                                style={{ width: '400px' }}
                            />
                        </n-form-item>

                        {/* 收件人 */}
                        {renderRecipientInput('to', '收件人')}

                        {/* 抄送/密送切换 */}
                        <div class="flex gap-16 m-bs-8 m-be-16" style={{ paddingLeft: '88px' }}>
                            {!state.showCc && (
                                <n-button text type="primary" size="small" onClick={() => setState({ showCc: true })}>
                                    + 抄送
                                </n-button>
                            )}
                            {!state.showBcc && (
                                <n-button text type="primary" size="small" onClick={() => setState({ showBcc: true })}>
                                    + 密送
                                </n-button>
                            )}
                        </div>

                        {/* 抄送 */}
                        {renderRecipientInput('cc', '抄送')}

                        {/* 密送 */}
                        {renderRecipientInput('bcc', '密送')}

                        {/* 主题 */}
                        <n-form-item label="主题" label-width={80}>
                            <n-input
                                v-model:value={state.subject}
                                placeholder="请输入邮件主题"
                            />
                        </n-form-item>

                        {/* 附件 */}
                        <n-form-item label="附件" label-width={80}>
                            <div class="attachment-area">
                                {state.attachments.length > 0 && (
                                    <div class="attachment-list">
                                        {state.attachments.map((att, index) => (
                                            <div class="attachment-item" key={index}>
                                                <i class="i-carbon-document text-16"></i>
                                                <span class="attachment-name">{att.name}</span>
                                                <span class="attachment-size">{formatSize(att.size)}</span>
                                                <n-button
                                                    text
                                                    type="error"
                                                    size="tiny"
                                                    onClick={() => removeAttachment(index)}
                                                >
                                                    <i class="i-carbon-close text-14"></i>
                                                </n-button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <n-button dashed onClick={() => document.getElementById('file-input')?.click()}>
                                    <i class="i-carbon-attachment mr-6"></i>
                                    添加附件
                                </n-button>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </n-form-item>

                        {/* 富文本编辑器 */}
                        <n-form-item label="正文" label-width={80} style={{ marginBottom: 0 }}>
                            <div class="rich-editor">
                                {/* 工具栏 */}
                                <div class="editor-toolbar">
                                    {EDITOR_TOOLS.map((tool, index) => (
                                        tool.divider ? (
                                            <div key={index} class="toolbar-divider"></div>
                                        ) : (
                                            <n-tooltip key={index} trigger="hover">
                                                {{
                                                    trigger: () => (
                                                        <button
                                                            class="toolbar-btn"
                                                            onClick={() => handleToolClick(tool)}
                                                        >
                                                            <i class={tool.icon}></i>
                                                        </button>
                                                    ),
                                                    default: () => tool.title
                                                }}
                                            </n-tooltip>
                                        )
                                    ))}
                                </div>
                                {/* 编辑区域 */}
                                <div
                                    ref={editorRef}
                                    class="editor-content"
                                    contentEditable
                                    onInput={handleEditorInput}
                                    innerHTML={state.html}
                                    placeholder="请输入邮件正文..."
                                ></div>
                            </div>
                        </n-form-item>
                    </n-form>
                </n-card>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';

.recipient-input-wrapper {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 4px 8px;
    min-height: 34px;
    transition: border-color 0.2s;

    &:hover, &:focus-within {
        border-color: var(--primary-color);
    }
}

.recipient-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.recipient-input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    min-width: 120px;
    padding: 4px 0;
    font-size: 14px;
    color: var(--text-color-base);

    &::placeholder {
        color: var(--text-color-3);
    }
}

.attachment-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--action-color);
    border-radius: 6px;
    font-size: 13px;
}

.attachment-name {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-color-base);
}

.attachment-size {
    color: var(--text-color-3);
    font-size: 12px;
}

.rich-editor {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
}

.editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: var(--action-color);
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
}

.toolbar-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-base);
    transition: all 0.2s;

    &:hover {
        background: var(--hover-color);
        color: var(--primary-color);
    }

    i {
        font-size: 16px;
    }
}

.toolbar-divider {
    width: 1px;
    height: 20px;
    background: var(--divider-color);
    margin: 0 4px;
}

.editor-content {
    min-height: 300px;
    padding: 16px;
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-color-base);
    outline: none;

    &:empty::before {
        content: attr(placeholder);
        color: var(--text-color-3);
        pointer-events: none;
    }

    :deep(p) {
        margin: 0 0 12px 0;
    }

    :deep(ul), :deep(ol) {
        margin: 0 0 12px 0;
        padding-left: 24px;
    }

    :deep(li) {
        margin-bottom: 4px;
    }

    :deep(a) {
        color: var(--primary-color);
    }

    :deep(pre) {
        background: var(--code-color);
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        overflow-x: auto;
    }

    :deep(blockquote) {
        border-left: 3px solid var(--primary-color);
        padding-left: 12px;
        margin: 0 0 12px 0;
        color: var(--text-color-3);
    }
}
</style>