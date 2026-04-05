import { useState, useMemo } from 'react'
import { recipes } from '@/data/recipes'
import { RecipeCard } from '@/components/RecipeCard'
import { RecipeDetail } from '@/components/RecipeDetail'
import { RecipeFilter } from '@/components/RecipeFilter'
import type { Recipe } from '@/types/recipe'

export function RecipeList() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [selected, setSelected] = useState<Recipe | null>(null)

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (category !== 'all' && r.category !== category) return false
      if (difficulty !== 'all' && r.difficulty !== difficulty) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, category, difficulty])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          菜谱列表
          <span className="text-muted-foreground ml-2 text-base font-normal">
            共 {recipes.length} 道菜
          </span>
        </h2>
      </div>

      <RecipeFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={(v) => setCategory(v ?? 'all')}
        difficulty={difficulty}
        onDifficultyChange={(v) => setDifficulty(v ?? 'all')}
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          没有找到匹配的菜谱
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelected(recipe)}
            />
          ))}
        </div>
      )}

      <RecipeDetail
        recipe={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
