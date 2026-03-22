<script lang="tsx">
import { defineComponent, h, ref } from 'vue'
import { faker } from '@faker-js/faker'
import { useState } from '@/hooks'
import dayjs from 'dayjs'
import type { DataTableColumns } from 'naive-ui'

export default defineComponent({
    name: 'ManagerBlacklist',
    setup() {
        const showModal = ref(false)

        const { state } = useState({
            list: Array.from({ length: 4 }, () => ({
                keyId: faker.number.int({ min: 1000, max: 9999 }),
                email: faker.internet.email(),
                reason: faker.helpers.arrayElement(['垃圾邮件', '广告邮件', '钓鱼邮件', '恶意邮件', '']),
                createTime: dayjs().subtract(faker.number.int({ min: 1, max: 60 }), 'day').format('YYYY-MM-DD')
            })),
            form: {
                email: '',
                reason: ''
            }
        })

        const columns: DataTableColumns = [
            { title: '邮箱地址', key: 'email', ellipsis: { tooltip: true } },
            {
                title: '拉黑原因',
                key: 'reason',
                render: (row: any) => h('n-text', { depth: row.reason ? 1 : 3 }, () => row.reason || '未填写')
            },
            { title: '添加时间', key: 'createTime', width: 120 },
            {
                title: '操作',
                key: 'actions',
                width: 80,
                render: () => h('n-button', { size: 'small', type: 'error', text: true, focusable: false }, () => '移除')
            }
        ]

        return () => (
            <n-element class="flex flex-col flex-1 overflow-hidden p-24 gap-16">
                <div class="flex items-center justify-between">
                    <n-text class="text-20" style={{ fontWeight: 700 }}>黑名单管理</n-text>
                    <n-button type="primary" onClick={() => (showModal.value = true)}>
                        添加黑名单
                    </n-button>
                </div>
                {state.list.length === 0 ? (
                    <n-empty description="暂无黑名单" class="flex-1 justify-center" />
                ) : (
                    <n-data-table
                        columns={columns}
                        data={state.list}
                        row-key={(row: any) => row.keyId}
                        bordered={false}
                        striped
                    />
                )}

                <n-modal
                    v-model:show={showModal.value}
                    preset="dialog"
                    title="添加黑名单"
                    positive-text="确认"
                    negative-text="取消"
                    onPositiveClick={() => {
                        showModal.value = false
                        window.$message?.success('已添加至黑名单')
                    }}
                >
                    <n-form label-placement="left" label-width={80} class="m-bs-16">
                        <n-form-item label="邮箱地址">
                            <n-input
                                v-model:value={state.form.email}
                                placeholder="请输入要拉黑的邮箱地址"
                            />
                        </n-form-item>
                        <n-form-item label="原因">
                            <n-input
                                v-model:value={state.form.reason}
                                placeholder="可选填拉黑原因"
                            />
                        </n-form-item>
                    </n-form>
                </n-modal>
            </n-element>
        )
    }
})
</script>
