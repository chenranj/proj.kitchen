import { Input } from '@/components/ui/input'
import { CATEGORIES, DIFFICULTIES } from '@/types/recipe'

interface FilterProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string | null) => void
  difficulty: string
  onDifficultyChange: (v: string | null) => void
}

export function RecipeFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
}: FilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="搜索菜名、食材..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border-input bg-transparent h-8 rounded-lg border px-2.5 text-sm outline-none sm:w-[140px]"
      >
        <option value="all">全部分类</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="border-input bg-transparent h-8 rounded-lg border px-2.5 text-sm outline-none sm:w-[140px]"
      >
        <option value="all">全部难度</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  )
}
