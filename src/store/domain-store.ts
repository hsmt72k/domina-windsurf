import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { BaseNameTag, DomainStatus } from '@/types/domain'
import { FormSchemaType, formDefaultValues } from '@/schemas/domain'

// フォーム状態とドメイン検索結果のデータをJotaiで管理
// atomWithStorageを使って自動的にlocalStorageとの同期を行う

// フォーム状態の永続化
export const baseNamesAtom = atomWithStorage<BaseNameTag[]>('domina-baseNames', [])
export const businessIdeaAtom = atomWithStorage<string>('domina-businessIdea', '')
export const baseNameInputAtom = atomWithStorage<string>('domina-baseNameInput', '')
export const suggestionsAtom = atomWithStorage<string[]>('domina-suggestions', [])
export const tldsAtom = atomWithStorage<FormSchemaType['tlds']>('domina-tlds', formDefaultValues.tlds)

// 検索結果
export const resultsAtom = atomWithStorage<DomainStatus[]>('domina-results', [])

// UI状態
export const activeTabAtom = atomWithStorage<string>('domina-activeTab', 'input')

// ローディング状態（永続化する必要がないのでatomのみ）
export const isLoadingAtom = atom<boolean>(false)
export const isGeneratingSuggestionsAtom = atom<boolean>(false)

// テーマ設定
export const isDarkModeAtom = atomWithStorage<boolean>('domina-darkMode', false)
