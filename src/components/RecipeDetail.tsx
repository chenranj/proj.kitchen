import type { Recipe } from '@/types/recipe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function RecipeDetail({
  recipe,
  open,
  onClose,
}: {
  recipe: Recipe | null
  open: boolean
  onClose: () => void
}) {
  if (!recipe) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {recipe.name}
            <Badge variant="outline">{recipe.difficulty}</Badge>
            <Badge variant="secondary">{recipe.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Tools */}
          <div>
            <h3 className="mb-2 font-medium">所需工具</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tools.map((tool) => (
                <Badge key={tool} variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="mb-2 font-medium">食材用量</h3>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">食材</TableHead>
                  <TableHead className="w-2/3 text-right">用量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.ingredients.map((ing, i) => (
                  <TableRow key={i}>
                    <TableCell className="break-words">{ing.name}</TableCell>
                    <TableCell className="text-right break-words">{ing.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Steps */}
          <div>
            <h3 className="mb-2 font-medium">制作步骤</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {recipe.tips && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-medium">注意事项</h3>
                <p className="bg-muted text-muted-foreground rounded-md p-3 text-sm">
                  {recipe.tips}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
