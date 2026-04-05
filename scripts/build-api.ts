import fs from 'fs'
import path from 'path'

const recipesDir = path.resolve('recipes')
const outDir = path.resolve('public/api')

fs.mkdirSync(path.join(outDir, 'recipes'), { recursive: true })

const files = fs.readdirSync(recipesDir).filter(f => f.endsWith('.json'))
const index: Array<{
  id: string
  name: string
  category: string
  difficulty: string
}> = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(recipesDir, file), 'utf-8')
  const recipe = JSON.parse(raw)

  // Write individual recipe
  fs.writeFileSync(
    path.join(outDir, 'recipes', `${recipe.id}.json`),
    JSON.stringify(recipe, null, 2),
  )

  // Add to index
  index.push({
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    difficulty: recipe.difficulty,
  })
}

// Write index
fs.writeFileSync(
  path.join(outDir, 'recipes.json'),
  JSON.stringify(index, null, 2),
)

// Write units
const unitsRaw = fs.readFileSync(path.resolve('units.json'), 'utf-8')
const units = JSON.parse(unitsRaw)
fs.writeFileSync(
  path.join(outDir, 'units.json'),
  JSON.stringify(units, null, 2),
)

console.log(`Built API: ${index.length} recipes, ${units.length} units`)
