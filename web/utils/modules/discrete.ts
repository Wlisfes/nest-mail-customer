import { createDiscreteApi, darkTheme } from 'naive-ui'
import { computed } from 'vue'
import { useMouse, useStore } from '@/store'

/**使用 createDiscreteApi 创建全局反馈组件**/
export function useDiscreteApi() {
    const { inverted } = useStore(useMouse)
    const { message, dialog, notification, loadingBar } = createDiscreteApi(
        ['message', 'dialog', 'notification', 'loadingBar'],
        {
            configProviderProps: computed(() => ({
                theme: inverted.value ? darkTheme : null
            }))
        }
    )
    return { message, dialog, notification, loadingBar }
}

/**创建独立实例，不依赖组件上下文**/
const discrete = createDiscreteApi(['message', 'dialog', 'notification', 'loadingBar'])

export const $message = discrete.message
export const $dialog = discrete.dialog
export const $notification = discrete.notification
export const $loadingBar = discrete.loadingBar
