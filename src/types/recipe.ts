export interface Ingredient {
  name: string
  amount: string
}

export interface Recipe {
  id: string
  name: string
  category: string
  difficulty: '简单' | '中等' | '困难'
  tools: string[]
  ingredients: Ingredient[]
  steps: string[]
  tips?: string
}

export const CATEGORIES = [
  '荤菜', '素菜', '水产', '主食', '汤与粥', '早餐',
  '甜品', '饮品', '调味品', '半成品加工',
  '家常菜', '川菜', '粤菜', '湘菜', '鲁菜', '其他',
] as const

export const DIFFICULTIES = ['简单', '中等', '困难'] as const
