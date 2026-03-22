<script lang="tsx">
import { defineComponent, h } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerSent',
    setup() {
        const { state } = useState({
            loading: false,
            page: 1,
            size: 20,
            total: 35,
            list: Array.from({ length: 15 }, () => ({
                keyId: faker.number.int({ min: 1000, max: 9999 }),
                toAddress: faker.internet.email(),
                subject: faker.helpers.arrayElement([
                    'Re: 项目进度更新', 'Re: 会议纪要', '合同已签署',
                    '服务器维护通知', '本周工作汇报', '版本发布说明',
                    '回复: 客户需求确认', 'Fwd: 假期安排'
                ]),
                date: dayjs().subtract(faker.number.int({ min: 1, max: 168 }), 'hour').format('YYYY-MM-DD HH:mm'),
                hasAttachment: faker.datatype.boolean() ? 1 : 0
            }))
        })

        const columns: DataTableColumns = [
            { title: '收件人', key: 'toAddress', width: 200, ellipsis: { tooltip: true } },
            { title: '主题', key: 'subject', ellipsis: { tooltip: true } },
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
                <n-text class="text-20" style={{ fontWeight: 700 }}>已发送</n-text>
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
