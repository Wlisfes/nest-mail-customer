<script lang="tsx">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { httpFetchMailDetail, httpDeleteMail } from '@/api'
import { $message, $dialog } from '@/utils'
import dayjs from 'dayjs'
import { useState } from '@/hooks'
import { NButton, NTag, NSkeleton, NEmpty } from 'naive-ui'
import MailAvatar from '../components/mail-avatar.vue'

export default defineComponent({
    name: 'ManagerMailDetail',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { state, setState } = useState({
            loading: true,
            mail: null as any
        })

        const mailId = route.params.id as string

        async function fetchDetail() {
            await setState({ loading: true })
            try {
                const res: any = await httpFetchMailDetail(mailId)
                const mail = res.data ?? res
                // 转换附件大小显示
                if (mail.attachments?.length > 0) {
                    mail.attachments = mail.attachments.map((att: any) => ({
                        ...att,
                        size: att.size || 0
                    }))
                }
                await setState({ mail })
            } catch (err) {
                $message.error('获取邮件详情失败')
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        // 格式化文件大小
        function formatSize(bytes: number) {
            if (!bytes || bytes === 0) return '0 B'
            if (bytes < 1024) return bytes + ' B'
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
        }

        // 判断是否可预览
        function isPreviewable(mimeType: string) {
            if (!mimeType) return false
            const previewable = ['image/', 'text/', 'application/pdf']
            return previewable.some(type => mimeType.startsWith(type))
        }

        // 下载附件
        function handleDownload(attachmentId: number, filename: string) {
            if (!attachmentId) {
                $message.error('附件ID不存在')
                return
            }
            const link = document.createElement('a')
            link.href = `/api/attachment/${attachmentId}/download`
            link.download = filename
            link.click()
            $message.success('开始下载')
        }

        // 预览附件
        function handlePreview(attachmentId: number) {
            if (!attachmentId) {
                $message.error('附件ID不存在')
                return
            }
            window.open(`/api/attachment/${attachmentId}/view`, '_blank')
        }

        async function handleDelete() {
            $dialog.warning({
                title: '确认删除',
                content: '确定要删除这封邮件吗？此操作不可恢复。',
                positiveText: '删除',
                negativeText: '取消',
                onPositiveClick: async () => {
                    try {
                        await httpDeleteMail(mailId)
                        $message.success('删除成功')
                        router.back()
                    } catch (err) {
                        $message.error('删除失败')
                    }
                }
            })
        }

        function handleReply() {
            router.push({
                path: '/manager/compose',
                query: {
                    replyTo: state.mail?.keyId,
                    to: state.mail?.fromAddress,
                    subject: `Re: ${state.mail?.subject || ''}`
                }
            })
        }

        function handleForward() {
            router.push({
                path: '/manager/compose',
                query: {
                    forward: state.mail?.keyId,
                    subject: `Fwd: ${state.mail?.subject || ''}`
                }
            })
        }

        onMounted(() => fetchDetail())

        return () => (
            <n-element class="page-container animate-fadeInUp" style={{ userSelect: 'text' }}>
                {/* Header */}
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-button quaternary circle onClick={() => router.back()}>
                            <i class="i-carbon-arrow-left text-20"></i>
                        </n-button>
                        <n-text class="text-20" style={{ fontWeight: 700 }}>
                            邮件详情
                        </n-text>
                    </div>
                    <div class="flex gap-8">
                        <n-button type="primary" onClick={handleReply}>
                            <i class="i-carbon-reply mr-6"></i>
                            回复
                        </n-button>
                        <n-button onClick={handleForward}>
                            <i class="i-carbon-forward mr-6"></i>
                            转发
                        </n-button>
                        <n-button type="error" ghost onClick={handleDelete}>
                            <i class="i-carbon-trash-can mr-6"></i>
                            删除
                        </n-button>
                    </div>
                </div>

                {/* Mail Content */}
                {state.loading ? (
                    <div class="mail-detail-card">
                        <n-skeleton text rows={3} />
                        <n-skeleton text rows={10} style={{ marginTop: '24px' }} />
                    </div>
                ) : state.mail ? (
                    <div class="mail-detail-card animate-fadeInUp">
                        {/* Subject */}
                        <h1 class="mail-subject">{state.mail.subject || '(无主题)'}</h1>

                        {/* Sender Info */}
                        <div class="mail-header">
                            <MailAvatar email={state.mail.fromAddress ?? ''} size={48} />
                            <div class="mail-sender-info">
                                <div class="mail-sender-name">{state.mail.fromName || state.mail.fromAddress?.split('@')[0]}</div>
                                <div class="mail-sender-address">{state.mail.fromAddress}</div>
                                <div class="mail-meta">
                                    <span>发送至: {state.mail.toAddress}</span>
                                    <span class="mail-time">{dayjs(state.mail.date).format('YYYY年MM月DD日 HH:mm')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        {state.mail.attachments?.length > 0 && (
                            <div class="mail-attachments">
                                <div class="attachments-title">
                                    <i class="i-carbon-attachment"></i>
                                    附件 ({state.mail.attachments.length})
                                </div>
                                <div class="attachments-list">
                                    {state.mail.attachments.map((att: any) => (
                                        <div class="attachment-item" key={att.keyId || att.filename}>
                                            <i class="i-carbon-document text-20"></i>
                                            <span class="attachment-name" title={att.filename}>
                                                {att.filename}
                                            </span>
                                            <span class="attachment-size">{formatSize(att.size)}</span>
                                            <div class="attachment-actions">
                                                <n-button
                                                    text
                                                    type="primary"
                                                    size="small"
                                                    onClick={() => handleDownload(att.keyId, att.filename)}
                                                >
                                                    <i class="i-carbon-download mr-4"></i>
                                                    下载
                                                </n-button>
                                                {isPreviewable(att.mimeType) && (
                                                    <n-button
                                                        text
                                                        type="info"
                                                        size="small"
                                                        style={{ marginLeft: '8px' }}
                                                        onClick={() => handlePreview(att.keyId)}
                                                    >
                                                        <i class="i-carbon-view mr-4"></i>
                                                        预览
                                                    </n-button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Body */}
                        <div
                            class="mail-body"
                            v-html={state.mail.htmlBody || state.mail.textBody || '<p style="color: #999;">(无内容)</p>'}
                        ></div>
                    </div>
                ) : (
                    <n-empty description="邮件不存在或已被删除" />
                )}
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';

.mail-detail-card {
    background: var(--card-color);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.mail-subject {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 24px 0;
    color: var(--text-color-base);
    line-height: 1.4;
}

.mail-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 24px;
}

.mail-sender-info {
    flex: 1;
    min-width: 0;
}

.mail-sender-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color-base);
}

.mail-sender-address {
    font-size: 13px;
    color: var(--text-color-3);
    margin-top: 2px;
}

.mail-meta {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-color-3);
}

.mail-time {
    margin-left: auto;
}

.mail-attachments {
    background: var(--action-color);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
}

.attachments-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-color-base);
}

.attachments-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--card-color);
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
        background: var(--hover-color);
    }
}

.attachment-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-color-base);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.attachment-size {
    font-size: 12px;
    color: var(--text-color-3);
    min-width: 60px;
    text-align: right;
}

.attachment-actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
}

.mail-body {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-color-base);

    :deep(p) {
        margin: 0 0 16px 0;
    }

    :deep(a) {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
    }

    :deep(blockquote) {
        border-left: 4px solid var(--primary-color);
        padding-left: 16px;
        margin: 16px 0;
        color: var(--text-color-3);
    }

    :deep(pre) {
        background: var(--code-color);
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 13px;
    }

    :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;

        th,
        td {
            border: 1px solid var(--divider-color);
            padding: 8px 12px;
            text-align: left;
        }

        th {
            background: var(--action-color);
            font-weight: 600;
        }
    }
}
</style>
