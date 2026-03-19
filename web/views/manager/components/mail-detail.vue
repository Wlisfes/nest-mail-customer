<script lang="tsx">
import { defineComponent, ref, watch } from 'vue'
import * as Service from '@/api'

export default defineComponent({
    name: 'MailDetail',
    props: {
        accountId: { type: Number, default: 0 },
        uid: { type: Number, default: 0 },
        subject: { type: String, default: '' }
    },
    emits: ['back'],
    setup(props, { emit }) {
        const loading = ref(false)
        const detail = ref<any>(null)

        async function fetchDetail() {
            if (!props.accountId || !props.uid) return
            loading.value = true
            try {
                const { data } = (await Service.httpMailDetail({
                    accountId: props.accountId,
                    uid: props.uid
                })) as any
                detail.value = data
            } catch (err: any) {
                window.$message?.error(err?.message || '获取邮件详情失败')
            } finally {
                loading.value = false
            }
        }

        watch(
            () => [props.accountId, props.uid],
            () => {
                if (props.accountId && props.uid) {
                    fetchDetail()
                }
            },
            { immediate: true }
        )

        function formatDate(date: string) {
            if (!date) return ''
            return new Date(date).toLocaleString('zh-CN')
        }

        function formatAddress(list: any[]) {
            if (!list || list.length === 0) return ''
            return list.map(addr => (addr.name ? `${addr.name} <${addr.address}>` : addr.address)).join(', ')
        }

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden">
                <n-spin show={loading.value} class="flex flex-col flex-1 overflow-hidden">
                    {detail.value ? (
                        <div class="flex flex-col flex-1 overflow-hidden">
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
                                    {detail.value.subject || '(无主题)'}
                                </n-text>
                            </div>
                            {/* 元信息 */}
                            <div
                                class="px-16px py-12px border-b border-b-solid"
                                style={{ borderColor: 'var(--n-border-color, rgba(128,128,128,0.12))' }}
                            >
                                <div class="flex items-center gap-8px mb-4px">
                                    <n-text depth={3} style={{ fontSize: '13px', width: '48px', flexShrink: 0 }}>
                                        发件人
                                    </n-text>
                                    <n-text style={{ fontSize: '13px' }}>{formatAddress(detail.value.from)}</n-text>
                                </div>
                                <div class="flex items-center gap-8px mb-4px">
                                    <n-text depth={3} style={{ fontSize: '13px', width: '48px', flexShrink: 0 }}>
                                        收件人
                                    </n-text>
                                    <n-text style={{ fontSize: '13px' }}>{formatAddress(detail.value.to)}</n-text>
                                </div>
                                <div class="flex items-center gap-8px">
                                    <n-text depth={3} style={{ fontSize: '13px', width: '48px', flexShrink: 0 }}>
                                        时间
                                    </n-text>
                                    <n-text style={{ fontSize: '13px' }}>{formatDate(detail.value.date)}</n-text>
                                </div>
                                {detail.value.attachments?.length > 0 && (
                                    <div class="flex items-center gap-8px mt-8px">
                                        <n-text depth={3} style={{ fontSize: '13px', width: '48px', flexShrink: 0 }}>
                                            附件
                                        </n-text>
                                        <div class="flex flex-wrap gap-4px">
                                            {detail.value.attachments.map((att: any, i: number) => (
                                                <n-tag key={i} size="small">
                                                    {att.filename || '未命名附件'}
                                                </n-tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* 正文 */}
                            <n-scrollbar class="flex-1">
                                <div
                                    class="px-16px py-12px"
                                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                                    v-html={detail.value.html || detail.value.text || '<p>邮件内容为空</p>'}
                                ></div>
                            </n-scrollbar>
                        </div>
                    ) : (
                        !loading.value && <n-empty description="请选择一封邮件" class="mt-40px"></n-empty>
                    )}
                </n-spin>
            </n-element>
        )
    }
})
</script>
