<script lang="tsx">
import { defineComponent, h } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerInbox',
    setup() {
        const { state, setState } = useState({
            loading: false,
            page: 1,
            size: 20,
            total: 50,
            list: Array.from({ length: 20 }, (_, i) => ({
                keyId: faker.number.int({ min: 1000, max: 9999 }),
                fromAddress: faker.internet.email(),
                subject: faker.helpers.arrayElement([
                    '项目进度更新 - Q1 报告', '会议纪要: 产品评审', '合同审批通知',
                    '服务器告警: CPU 使用率过高', '周报提交提醒', '新版本发布公告 v2.5',
                    '客户反馈汇总 - 3月', '假期申请审批结果', '团队建设活动通知',
                    '安全更新提醒', '月度财务报表', '招聘面试安排'
                ]),
                date: dayjs().subtract(faker.number.int({ min: 1, max: 168 }), 'hour').format('YYYY-MM-DD HH:mm'),
                seen: i > 4 ? 1 : 0,
                hasAttachment: faker.datatype.boolean() ? 1 : 0
            }))
        })

        const columns: DataTableColumns = [
            {
                title: '状态',
                key: 'seen',
                width: 60,
                align: 'center',
                render: (row: any) => h('span', {
                    style: {
                        width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block',
                        background: row.seen ? 'transparent' : 'var(--primary-color)',
                        border: row.seen ? '1px solid var(--text-color-3)' : 'none'
                    }
                })
            },
            { title: '发件人', key: 'fromAddress', width: 200, ellipsis: { tooltip: true } },
            {
                title: '主题',
                key: 'subject',
                ellipsis: { tooltip: true },
                render: (row: any) => h('span', { style: { fontWeight: row.seen ? 400 : 700 } }, row.subject)
            },
            {
                title: '附件',
                key: 'hasAttachment',
                width: 60,
                align: 'center',
                render: (row: any) => row.hasAttachment ? h('span', null, '📎') : null
            },
            { title: '时间', key: 'date', width: 160 }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <div class="flex items-center justify-between">
                    <n-text class="text-20" style={{ fontWeight: 700 }}>收件箱</n-text>
                    <div class="flex gap-8">
                        <n-button size="small" secondary>全部标记已读</n-button>
                        <n-button size="small" secondary>刷新</n-button>
                    </div>
                </div>
                <n-data-table
                    columns={columns}
                    data={state.list}
                    row-key={(row: any) => row.keyId}
                    bordered={false}
                    striped
                    flex-height
                    class="flex-1"
                    loading={state.loading}
                />
                <div class="flex justify-end">
                    <n-pagination
                        v-model:page={state.page}
                        page-count={Math.ceil(state.total / state.size)}
                        show-quick-jumper
                    />
                </div>
            </n-element>
        )
    }
})
</script>
