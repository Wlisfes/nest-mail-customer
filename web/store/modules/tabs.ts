import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useState } from '@/hooks'

export interface TabItem {
    name: string
    path: string
    title: string
    icon?: string
    affix?: boolean
}

export const useTabs = defineStore('APP_NEST_TABS_STORE', () => {
    const { state, setState } = useState({
        tabs: [] as TabItem[]
    })

    /**缓存的组件名称列表（去重）**/
    const cachedNames = computed(() => [...new Set(state.tabs.map(tab => tab.name))])

    /**添加标签（以 path 为唯一标识）**/
    function addTab(tab: TabItem) {
        const exists = state.tabs.find(t => t.path === tab.path)
        if (!exists) {
            state.tabs.push(tab)
        }
    }

    /**更新标签标题**/
    function updateTabTitle(path: string, title: string) {
        const tab = state.tabs.find(t => t.path === path)
        if (tab) {
            tab.title = title
        }
    }

    /**关闭标签，返回下一个应跳转的路径**/
    function removeTab(path: string): string | null {
        const index = state.tabs.findIndex(t => t.path === path)
        if (index === -1) return null

        const tab = state.tabs[index]
        if (tab.affix) return null

        state.tabs.splice(index, 1)
        if (state.tabs.length > 0) {
            const next = state.tabs[Math.min(index, state.tabs.length - 1)]
            return next.path
        }
        return '/manager/dashboard'
    }

    /**关闭其他标签**/
    function removeOtherTabs(path: string) {
        state.tabs = state.tabs.filter(t => t.affix || t.path === path)
    }

    /**关闭所有非固定标签**/
    function removeAllTabs(): string {
        state.tabs = state.tabs.filter(t => t.affix)
        return state.tabs[0]?.path ?? '/manager/dashboard'
    }

    return {
        state,
        setState,
        cachedNames,
        addTab,
        updateTabTitle,
        removeTab,
        removeOtherTabs,
        removeAllTabs
    }
})
