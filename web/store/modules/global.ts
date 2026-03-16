import { toRefs } from 'vue'
import { defineStore } from 'pinia'
import { useState } from '@/hooks'
import { Logger } from '@/plugins'

export const useGlobal = defineStore('APP_NEST_GLOBAL_STORE', () => {
    const { state, setState } = useState({
        /**开启初始化**/
        initialize: true
    })

    /**初始化**/
    async function fetchGlobaInitialize(logger: Logger) {
        if (!state.initialize) {
            return await setState({ initialize: false })
        }
        try {
            return await setState({ initialize: false })
        } catch (err) {
            return await setState({ initialize: false })
        }
    }

    return {
        ...toRefs(state),
        state,
        setState,
        fetchGlobaInitialize
    }
})
