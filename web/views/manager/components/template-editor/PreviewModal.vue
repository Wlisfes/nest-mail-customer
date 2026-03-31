<script lang="tsx">
/**
 * 预览弹窗 - MJML → HTML 编译后 iframe 渲染
 */
import { defineComponent, ref, watch, type PropType } from 'vue'
import { NButton, NSpace, NModal } from 'naive-ui'
import { type CanvasNode } from './componentDefs'
import { canvasToMjml } from './mjmlCompiler'

export default defineComponent({
    name: 'PreviewModal',
    props: {
        show: { type: Boolean, default: false },
        canvas: { type: Array as PropType<CanvasNode[]>, default: () => [] }
    },
    emits: ['update:show'],
    setup(props, { emit }) {
        const htmlContent = ref('')
        const viewMode = ref<'desktop' | 'mobile'>('desktop')
        const compileError = ref('')

        watch(() => props.show, async (show) => {
            if (show && props.canvas.length > 0) {
                try {
                    const mjmlSource = canvasToMjml(props.canvas)
                    // 动态导入 mjml-browser 避免影响首屏
                    const mjml2html = (await import('mjml-browser')).default
                    const result = mjml2html(mjmlSource, { minify: false })
                    htmlContent.value = result.html
                    compileError.value = result.errors?.length ? result.errors.map((e: any) => e.formattedMessage).join('\n') : ''
                } catch (err: any) {
                    compileError.value = err.message
                    htmlContent.value = ''
                }
            }
        })

        return () => (
            <NModal
                show={props.show}
                onUpdate:show={(v: boolean) => emit('update:show', v)}
                preset="card"
                title="模板预览"
                style={{ width: viewMode.value === 'desktop' ? '720px' : '420px', maxWidth: '95vw' }}
                headerExtra={() => (
                    <NSpace size={8}>
                        <NButton size="tiny" secondary={viewMode.value !== 'desktop'} type={viewMode.value === 'desktop' ? 'primary' : 'default'} onClick={() => viewMode.value = 'desktop'}>
                            🖥 桌面
                        </NButton>
                        <NButton size="tiny" secondary={viewMode.value !== 'mobile'} type={viewMode.value === 'mobile' ? 'primary' : 'default'} onClick={() => viewMode.value = 'mobile'}>
                            📱 手机
                        </NButton>
                    </NSpace>
                )}
            >
                {compileError.value ? (
                    <div style={{ padding: '20px', color: '#EF4444', fontSize: '13px' }}>
                        <strong>编译错误：</strong>
                        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{compileError.value}</pre>
                    </div>
                ) : (
                    <iframe
                        srcdoc={htmlContent.value}
                        sandbox="allow-same-origin"
                        style={{
                            width: '100%',
                            height: '500px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#fff'
                        }}
                    />
                )}
            </NModal>
        )
    }
})
</script>
