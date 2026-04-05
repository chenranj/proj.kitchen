import type { Recipe } from '@/types/recipe'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const difficultyColor = {
  '简单': 'bg-green-100 text-green-800',
  '中等': 'bg-yellow-100 text-yellow-800',
  '困难': 'bg-red-100 text-red-800',
} as const

export function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          <Badge variant="outline" className={difficultyColor[recipe.difficulty]}>
            {recipe.difficulty}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Badge variant="secondary">{recipe.category}</Badge>
          <span className="text-muted-foreground text-sm">
            {recipe.ingredients.length} 种食材 · {recipe.steps.length} 步
          </span>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
