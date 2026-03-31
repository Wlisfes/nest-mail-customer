/**
 * 预设模板 Seed 数据
 * 每个预设包含 canvasJson（编辑器结构）和 mjmlSource（MJML 源码）
 */

export const presetTemplates = [
    {
        name: '空白模板',
        description: '一个简洁的空白模板，适合自由创作',
        categoryId: null,
        canvasJson: JSON.stringify([
            {
                id: 'preset-blank-s1',
                type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '20px 0' },
                children: [
                    {
                        id: 'preset-blank-c1',
                        type: 'mj-column',
                        props: {},
                        children: [
                            {
                                id: 'preset-blank-t1',
                                type: 'mj-text',
                                props: { content: '<p>在此输入内容...</p>', 'font-size': '14px', color: '#333333', 'line-height': '1.6' },
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]),
        mjmlSource: `<mjml>
  <mj-body>
    <mj-section background-color="#ffffff" padding="20px 0">
      <mj-column>
        <mj-text font-size="14px" color="#333333" line-height="1.6">在此输入内容...</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        htmlContent: '',
        thumbnail: ''
    },
    {
        name: '营销推广',
        description: '产品推广与营销邮件模板',
        categoryId: null,
        canvasJson: JSON.stringify([
            {
                id: 'preset-mkt-s1',
                type: 'mj-section',
                props: { 'background-color': '#4F46E5', padding: '40px 20px' },
                children: [{
                    id: 'preset-mkt-c1',
                    type: 'mj-column',
                    props: {},
                    children: [{
                        id: 'preset-mkt-t1',
                        type: 'mj-text',
                        props: { content: '<h1 style="color:#fff;text-align:center">🚀 新品发布</h1><p style="color:#E0E7FF;text-align:center">尊敬的 {{name}}，我们有重磅消息！</p>', 'font-size': '16px', color: '#ffffff' },
                        children: []
                    }]
                }]
            },
            {
                id: 'preset-mkt-s2',
                type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '30px 20px' },
                children: [
                    {
                        id: 'preset-mkt-c2',
                        type: 'mj-column',
                        props: { width: '50%' },
                        children: [{
                            id: 'preset-mkt-img1',
                            type: 'mj-image',
                            props: { src: 'https://placehold.co/300x200/E0E7FF/4F46E5?text=Product', alt: '产品图片', width: '280px' },
                            children: []
                        }]
                    },
                    {
                        id: 'preset-mkt-c3',
                        type: 'mj-column',
                        props: { width: '50%' },
                        children: [{
                            id: 'preset-mkt-t2',
                            type: 'mj-text',
                            props: { content: '<h3>产品亮点</h3><ul><li>特性一</li><li>特性二</li><li>特性三</li></ul>', 'font-size': '14px', color: '#333333' },
                            children: []
                        }]
                    }
                ]
            },
            {
                id: 'preset-mkt-s3',
                type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '10px 20px 30px' },
                children: [{
                    id: 'preset-mkt-c4',
                    type: 'mj-column',
                    props: {},
                    children: [{
                        id: 'preset-mkt-btn1',
                        type: 'mj-button',
                        props: { content: '立即了解', 'background-color': '#4F46E5', color: '#ffffff', href: '#', 'border-radius': '6px', 'font-size': '16px' },
                        children: []
                    }]
                }]
            },
            {
                id: 'preset-mkt-s4',
                type: 'mj-section',
                props: { 'background-color': '#F8FAFC', padding: '20px' },
                children: [{
                    id: 'preset-mkt-c5',
                    type: 'mj-column',
                    props: {},
                    children: [{
                        id: 'preset-mkt-t3',
                        type: 'mj-text',
                        props: { content: '<p style="text-align:center;font-size:12px;color:#94A3B8">{{company}} 团队 · 如有疑问请回复本邮件</p>', 'font-size': '12px', color: '#94A3B8', align: 'center' },
                        children: []
                    }]
                }]
            }
        ]),
        mjmlSource: `<mjml>
  <mj-body>
    <mj-section background-color="#4F46E5" padding="40px 20px">
      <mj-column>
        <mj-text font-size="16px" color="#ffffff"><h1 style="color:#fff;text-align:center">🚀 新品发布</h1><p style="color:#E0E7FF;text-align:center">尊敬的 {{name}}，我们有重磅消息！</p></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column width="50%">
        <mj-image src="https://placehold.co/300x200/E0E7FF/4F46E5?text=Product" alt="产品图片" width="280px" />
      </mj-column>
      <mj-column width="50%">
        <mj-text font-size="14px" color="#333333"><h3>产品亮点</h3><ul><li>特性一</li><li>特性二</li><li>特性三</li></ul></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="10px 20px 30px">
      <mj-column>
        <mj-button background-color="#4F46E5" color="#ffffff" href="#" border-radius="6px" font-size="16px">立即了解</mj-button>
      </mj-column>
    </mj-section>
    <mj-section background-color="#F8FAFC" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#94A3B8" align="center">{{company}} 团队 · 如有疑问请回复本邮件</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        htmlContent: '',
        thumbnail: ''
    },
    {
        name: '活动邀请',
        description: '活动邀请函模板',
        categoryId: null,
        canvasJson: JSON.stringify([
            {
                id: 'preset-evt-s1', type: 'mj-section',
                props: { 'background-color': '#10B981', padding: '40px 20px' },
                children: [{ id: 'preset-evt-c1', type: 'mj-column', props: {}, children: [{
                    id: 'preset-evt-t1', type: 'mj-text',
                    props: { content: '<h1 style="color:#fff;text-align:center">🎉 诚邀参加</h1><p style="color:#D1FAE5;text-align:center">尊敬的 {{name}}</p>', color: '#ffffff' },
                    children: []
                }]}]
            },
            {
                id: 'preset-evt-s2', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '30px 20px' },
                children: [{ id: 'preset-evt-c2', type: 'mj-column', props: {}, children: [{
                    id: 'preset-evt-t2', type: 'mj-text',
                    props: { content: '<p>我们真诚邀请您参加本次活动。</p><p><strong>时间：</strong>{{date}}</p><p><strong>地点：</strong>{{venue}}</p>', 'font-size': '14px', color: '#333333', 'line-height': '1.8' },
                    children: []
                }]}]
            },
            {
                id: 'preset-evt-s3', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '10px 20px 30px' },
                children: [{ id: 'preset-evt-c3', type: 'mj-column', props: {}, children: [{
                    id: 'preset-evt-btn1', type: 'mj-button',
                    props: { content: '确认参加', 'background-color': '#10B981', color: '#ffffff', href: '#', 'border-radius': '6px' },
                    children: []
                }]}]
            },
            {
                id: 'preset-evt-d1', type: 'mj-section',
                props: { padding: '0 20px' },
                children: [{ id: 'preset-evt-cd1', type: 'mj-column', props: {}, children: [{
                    id: 'preset-evt-div1', type: 'mj-divider',
                    props: { 'border-color': '#E5E7EB', 'border-width': '1px' },
                    children: []
                }]}]
            },
            {
                id: 'preset-evt-s4', type: 'mj-section',
                props: { 'background-color': '#F8FAFC', padding: '20px' },
                children: [{ id: 'preset-evt-c4', type: 'mj-column', props: {}, children: [{
                    id: 'preset-evt-t3', type: 'mj-text',
                    props: { content: '<p style="text-align:center;font-size:12px;color:#94A3B8">如有疑问请联系组委会</p>', 'font-size': '12px', color: '#94A3B8' },
                    children: []
                }]}]
            }
        ]),
        mjmlSource: `<mjml>
  <mj-body>
    <mj-section background-color="#10B981" padding="40px 20px">
      <mj-column>
        <mj-text color="#ffffff"><h1 style="color:#fff;text-align:center">🎉 诚邀参加</h1><p style="color:#D1FAE5;text-align:center">尊敬的 {{name}}</p></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="14px" color="#333333" line-height="1.8"><p>我们真诚邀请您参加本次活动。</p><p><strong>时间：</strong>{{date}}</p><p><strong>地点：</strong>{{venue}}</p></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="10px 20px 30px">
      <mj-column>
        <mj-button background-color="#10B981" color="#ffffff" href="#" border-radius="6px">确认参加</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px">
      <mj-column>
        <mj-divider border-color="#E5E7EB" border-width="1px" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#F8FAFC" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#94A3B8" align="center">如有疑问请联系组委会</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        htmlContent: '',
        thumbnail: ''
    },
    {
        name: '周报模板',
        description: '团队周报汇报模板',
        categoryId: null,
        canvasJson: JSON.stringify([
            {
                id: 'preset-wr-s1', type: 'mj-section',
                props: { 'background-color': '#1E293B', padding: '30px 20px' },
                children: [{ id: 'preset-wr-c1', type: 'mj-column', props: {}, children: [{
                    id: 'preset-wr-t1', type: 'mj-text',
                    props: { content: '<h2 style="color:#fff;text-align:center">📊 工作周报</h2><p style="color:#94A3B8;text-align:center">{{date}} · {{name}}</p>', color: '#ffffff' },
                    children: []
                }]}]
            },
            {
                id: 'preset-wr-s2', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '20px' },
                children: [{ id: 'preset-wr-c2', type: 'mj-column', props: {}, children: [{
                    id: 'preset-wr-t2', type: 'mj-text',
                    props: { content: '<h3>✅ 本周完成</h3><ul><li>完成项 1</li><li>完成项 2</li></ul>', 'font-size': '14px', color: '#333333', 'line-height': '1.8' },
                    children: []
                }]}]
            },
            {
                id: 'preset-wr-s3', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '0 20px 20px' },
                children: [{ id: 'preset-wr-c3', type: 'mj-column', props: {}, children: [{
                    id: 'preset-wr-t3', type: 'mj-text',
                    props: { content: '<h3>📌 下周计划</h3><ul><li>计划项 1</li><li>计划项 2</li></ul>', 'font-size': '14px', color: '#333333', 'line-height': '1.8' },
                    children: []
                }]}]
            },
            {
                id: 'preset-wr-d1', type: 'mj-section',
                props: { padding: '0 20px' },
                children: [{ id: 'preset-wr-cd1', type: 'mj-column', props: {}, children: [{
                    id: 'preset-wr-div1', type: 'mj-divider',
                    props: { 'border-color': '#E5E7EB', 'border-width': '1px' }, children: []
                }]}]
            },
            {
                id: 'preset-wr-s4', type: 'mj-section',
                props: { 'background-color': '#F8FAFC', padding: '20px' },
                children: [{ id: 'preset-wr-c4', type: 'mj-column', props: {}, children: [{
                    id: 'preset-wr-t4', type: 'mj-text',
                    props: { content: '<p style="text-align:center;font-size:12px;color:#94A3B8">此邮件由系统自动发送</p>', 'font-size': '12px', color: '#94A3B8' },
                    children: []
                }]}]
            }
        ]),
        mjmlSource: `<mjml>
  <mj-body>
    <mj-section background-color="#1E293B" padding="30px 20px">
      <mj-column>
        <mj-text color="#ffffff"><h2 style="color:#fff;text-align:center">📊 工作周报</h2><p style="color:#94A3B8;text-align:center">{{date}} · {{name}}</p></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="14px" color="#333333" line-height="1.8"><h3>✅ 本周完成</h3><ul><li>完成项 1</li><li>完成项 2</li></ul></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="0 20px 20px">
      <mj-column>
        <mj-text font-size="14px" color="#333333" line-height="1.8"><h3>📌 下周计划</h3><ul><li>计划项 1</li><li>计划项 2</li></ul></mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px">
      <mj-column>
        <mj-divider border-color="#E5E7EB" border-width="1px" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#F8FAFC" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#94A3B8" align="center">此邮件由系统自动发送</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        htmlContent: '',
        thumbnail: ''
    },
    {
        name: '通知模板',
        description: '系统通知与提醒模板',
        categoryId: null,
        canvasJson: JSON.stringify([
            {
                id: 'preset-ntf-s1', type: 'mj-section',
                props: { 'background-color': '#F59E0B', padding: '30px 20px' },
                children: [{ id: 'preset-ntf-c1', type: 'mj-column', props: {}, children: [{
                    id: 'preset-ntf-t1', type: 'mj-text',
                    props: { content: '<h2 style="color:#fff;text-align:center">🔔 重要通知</h2>', color: '#ffffff' },
                    children: []
                }]}]
            },
            {
                id: 'preset-ntf-s2', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '30px 20px' },
                children: [{ id: 'preset-ntf-c2', type: 'mj-column', props: {}, children: [{
                    id: 'preset-ntf-t2', type: 'mj-text',
                    props: { content: '<p>尊敬的 {{name}}，</p><p>这是一条重要通知，请注意查阅。</p><p>如有疑问，请联系管理员。</p>', 'font-size': '14px', color: '#333333', 'line-height': '1.8' },
                    children: []
                }]}]
            },
            {
                id: 'preset-ntf-s3', type: 'mj-section',
                props: { 'background-color': '#ffffff', padding: '10px 20px 30px' },
                children: [{ id: 'preset-ntf-c3', type: 'mj-column', props: {}, children: [{
                    id: 'preset-ntf-btn1', type: 'mj-button',
                    props: { content: '查看详情', 'background-color': '#F59E0B', color: '#ffffff', href: '#', 'border-radius': '6px' },
                    children: []
                }]}]
            }
        ]),
        mjmlSource: `<mjml>
  <mj-body>
    <mj-section background-color="#F59E0B" padding="30px 20px">
      <mj-column>
        <mj-text color="#ffffff"><h2 style="color:#fff;text-align:center">🔔 重要通知</h2></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="30px 20px">
      <mj-column>
        <mj-text font-size="14px" color="#333333" line-height="1.8"><p>尊敬的 {{name}}，</p><p>这是一条重要通知，请注意查阅。</p><p>如有疑问，请联系管理员。</p></mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="10px 20px 30px">
      <mj-column>
        <mj-button background-color="#F59E0B" color="#ffffff" href="#" border-radius="6px">查看详情</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        htmlContent: '',
        thumbnail: ''
    }
]
