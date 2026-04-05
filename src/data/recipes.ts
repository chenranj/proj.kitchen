import type { Recipe } from '@/types/recipe'

const modules = import.meta.glob<Recipe>('../../recipes/*.json', { eager: true, import: 'default' })

export const recipes: Recipe[] = Object.values(modules)
