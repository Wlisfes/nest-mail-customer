<script lang="tsx">
/**
 * 模板列表页 - 卡片网格，分类筛选 + CRUD
 */
import { defineComponent, h, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { httpFetchTemplates, httpDeleteTemplate, httpCopyTemplate, httpFetchCategories } from '@/api'
import { $message } from '@/utils'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import { NButton, NSpace, NText, NTag, NEmpty, NTabs, NTabPane, NDropdown, NCard } from 'naive-ui'
import CategoryDialog from '../components/template-editor/CategoryDialog.vue'

export default defineComponent({
    name: 'ManagerTemplates',
    setup() {
        const router = useRouter()
        const { state, setState } = useState({
            loading: false,
            templates: [] as any[],
            categories: [] as any[],
            activeTab: 'all',
            showCategoryDialog: false
        })

        const filteredTemplates = computed(() => {
            if (state.activeTab === 'all') return state.templates
            if (state.activeTab === 'preset') return state.templates.filter(t => t.isPreset === 1)
            if (state.activeTab === 'none') return state.templates.filter(t => !t.categoryId && t.isPreset !== 1)
            return state.templates.filter(t => String(t.categoryId) === state.activeTab)
        })

        async function fetchAll() {
            await setState({ loading: true })
            try {
                const [tplRes, catRes]: any[] = await Promise.all([
                    httpFetchTemplates(),
                    httpFetchCategories()
                ])
                const tplData = tplRes.data ?? tplRes
                const catData = catRes.data ?? catRes
                await setState({
                    templates: Array.isArray(tplData) ? tplData : (tplData.list ?? []),
                    categories: Array.isArray(catData) ? catData : (catData.list ?? [])
                })
            } catch (err) {
                console.error(err)
            } finally {
                await setState({ loading: false })
            }
        }

        async function handleDelete(keyId: number) {
            try {
                await httpDeleteTemplate(keyId)
                $message.success('删除成功')
                await fetchAll()
            } catch (err: any) {
                $message.error(err?.message ?? '删除失败')
            }
        }

        async function handleCopy(keyId: number) {
            try {
                await httpCopyTemplate(keyId)
                $message.success('复制成功')
                await fetchAll()
            } catch (err: any) {
                $message.error(err?.message ?? '复制失败')
            }
        }

        function handleEdit(tpl: any) {
            router.push(`/manager/template-editor/${tpl.keyId}`)
        }

        function handleSend(tpl: any) {
            router.push(`/manager/template-send/${tpl.keyId}`)
        }

        onMounted(fetchAll)

        function renderCard(tpl: any) {
            const isPreset = tpl.isPreset === 1
            const actions = [
                { label: '编辑', key: 'edit' },
                { label: '复制', key: 'copy' },
                { label: '使用发送', key: 'send' }
            ]
            if (!isPreset) {
                actions.push({ label: '删除', key: 'delete' })
            }

            return (
                <NCard
                    key={tpl.keyId}
                    class="template-card"
                    hoverable
                    size="small"
                    contentClass="template-card-body"
                    headerExtraClass="template-card-extra"
                >
                    {{
                        header: () => (
                            <div class="flex items-center gap-8">
                                <NText style={{ fontWeight: 600, fontSize: '14px' }}>{tpl.name}</NText>
                                {isPreset && <NTag size="tiny" type="warning" round bordered={false}>预设</NTag>}
                            </div>
                        ),
                        'header-extra': () => (
                            <NDropdown
                                trigger="click"
                                options={actions}
                                onSelect={(key: string) => {
                                    if (key === 'edit') handleEdit(tpl)
                                    else if (key === 'copy') handleCopy(tpl.keyId)
                                    else if (key === 'send') handleSend(tpl)
                                    else if (key === 'delete') handleDelete(tpl.keyId)
                                }}
                            >
                                <NButton text size="tiny">⋯</NButton>
                            </NDropdown>
                        ),
                        default: () => (
                            <div class="template-card-content">
                                <NText depth={3} style={{ fontSize: '12px', lineHeight: '1.5' }}>
                                    {tpl.description || '暂无描述'}
                                </NText>
                                <div class="template-card-footer">
                                    <NText depth={3} style={{ fontSize: '11px' }}>
                                        {tpl.modifyTime ? dayjs(tpl.modifyTime).format('MM-DD HH:mm') : ''}
                                    </NText>
                                    <NButton size="tiny" type="primary" secondary round onClick={() => handleEdit(tpl)}>
                                        {isPreset ? '使用此模板' : '编辑'}
                                    </NButton>
                                </div>
                            </div>
                        )
                    }}
                </NCard>
            )
        }

        return () => (
            <n-element class="page-container animate-fadeInUp">
                <div class="page-header">
                    <div class="flex items-center gap-12">
                        <n-text class="text-22" style={{ fontWeight: 800 }}>📧 邮件模板</n-text>
                        <n-tag size="small" round bordered={false} type="primary">
                            {state.templates.length} 个
                        </n-tag>
                    </div>
                    <NSpace size={8}>
                        <NButton size="small" secondary round onClick={() => setState({ showCategoryDialog: true })}>
                            📁 管理分类
                        </NButton>
                        <NButton type="primary" size="small" round onClick={() => router.push('/manager/template-editor')}>
                            + 新建模板
                        </NButton>
                    </NSpace>
                </div>

                <NTabs v-model:value={state.activeTab} type="segment" size="small" style={{ marginBottom: '16px' }}>
                    <NTabPane name="all" tab="全部" />
                    <NTabPane name="preset" tab="预设" />
                    <NTabPane name="none" tab="未分类" />
                    {state.categories.map((cat: any) => (
                        <NTabPane key={cat.keyId} name={String(cat.keyId)} tab={cat.name} />
                    ))}
                </NTabs>

                {filteredTemplates.value.length === 0 ? (
                    <div class="flex flex-col items-center justify-center flex-1 gap-12">
                        <NEmpty description="暂无模板" />
                    </div>
                ) : (
                    <div class="template-grid">
                        {filteredTemplates.value.map(tpl => renderCard(tpl))}
                    </div>
                )}

                <CategoryDialog v-model:show={state.showCategoryDialog} onChange={fetchAll} />
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
@import '../manager.scss';
.template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    padding-bottom: 20px;
}
.template-card {
    border-radius: 10px;
    &-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 60px;
    }
    &-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
    }
}
</style>
