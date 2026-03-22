<script lang="tsx">
import { defineComponent, h } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerDrafts',
    setup() {
        const { state } = useState({
            loading: false,
            list: Array.from({ length: 5 }, () => ({
                keyId: faker.number.int({ min: 1000, max: 9999 }),
                toAddress: faker.internet.email(),
                subject: faker.helpers.arrayElement([
                    '(未完成) 项目方案', '(草稿) 月度报告', '回复: 合作意向',
                    '(草稿) 产品需求文档', '(草稿) 技术选型'
                ]),
                content: faker.lorem.sentence(),
                createTime: dayjs().subtract(faker.number.int({ min: 1, max: 72 }), 'hour').format('YYYY-MM-DD HH:mm')
            }))
        })

        const columns: DataTableColumns = [
            { title: '收件人', key: 'toAddress', width: 200, ellipsis: { tooltip: true } },
            { title: '主题', key: 'subject', ellipsis: { tooltip: true } },
            { title: '保存时间', key: 'createTime', width: 160 },
            {
                title: '操作',
                key: 'actions',
                width: 140,
                render: (row: any) => h('div', { class: 'flex gap-8' }, [
                    h('n-button', { size: 'small', type: 'primary', text: true, focusable: false }, () => '编辑'),
                    h('n-button', { size: 'small', type: 'error', text: true, focusable: false }, () => '删除')
                ])
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <n-text class="text-20" style={{ fontWeight: 700 }}>草稿箱</n-text>
                {state.list.length === 0 ? (
                    <n-empty description="暂无草稿" class="flex-1 justify-center" />
                ) : (
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
                )}
            </n-element>
        )
    }
})
</script>
