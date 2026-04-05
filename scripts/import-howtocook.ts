import fs from 'fs'
import path from 'path'

const sourceDir = '/tmp/HowToCook/dishes'
const outDir = path.resolve('recipes')

// Category mapping from directory name to Chinese
const categoryMap: Record<string, string> = {
  aquatic: '水产',
  breakfast: '早餐',
  condiment: '调味品',
  dessert: '甜品',
  drink: '饮品',
  meat_dish: '荤菜',
  'semi-finished': '半成品加工',
  soup: '汤与粥',
  staple: '主食',
  vegetable_dish: '素菜',
}

// Convert star count to difficulty
function starsToDifficulty(stars: number): '简单' | '中等' | '困难' {
  if (stars <= 2) return '简单'
  if (stars <= 4) return '中等'
  return '困难'
}

// Generate a safe filename ID from recipe name
function toId(name: string): string {
  return name
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
    .toLowerCase()
}

// Parse ingredient line to extract name and amount
function parseIngredientLine(line: string): { name: string; amount: string } {
  const trimmed = line.replace(/^[\s*\-·•]+/, '').trim()
  // Try patterns like "鸡翅 10～12只", "可乐 500ml", "食盐 2g * 份数"
  const match = trimmed.match(/^(.+?)\s+([\d＋+～~\-\/*×x].+)$/)
  if (match) {
    return {
      name: match[1].trim(),
      amount: match[2].trim().replace(/\s*\*\s*份数/g, '/份'),
    }
  }
  return { name: trimmed, amount: '适量' }
}

// Parse a single markdown recipe
function parseRecipe(content: string, category: string, fileName: string) {
  const lines = content.split('\n')

  // Extract name from H1
  const h1 = lines.find(l => l.startsWith('# '))
  if (!h1) return null
  let name = h1.replace(/^#\s+/, '').replace(/的做法$/, '').trim()
  if (!name) return null

  // Extract difficulty from stars
  const starLine = lines.find(l => l.includes('预估烹饪难度'))
  const starCount = starLine ? (starLine.match(/★/g) || []).length : 3
  const difficulty = starsToDifficulty(starCount)

  // Split into sections
  const sections: Record<string, string[]> = {}
  let currentSection = '_preamble'
  sections[currentSection] = []

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)/)
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim()
      sections[currentSection] = []
    } else {
      if (!sections[currentSection]) sections[currentSection] = []
      sections[currentSection].push(line)
    }
  }

  // Parse ingredients from "计算" section (has amounts), fallback to "必备原料和工具"
  const calcLines = (sections['计算'] || []).filter(l => /^[\s]*[\*\-]/.test(l))
  const toolLines = (sections['必备原料和工具'] || []).filter(l => /^[\s]*[\*\-]/.test(l))

  let ingredients: Array<{ name: string; amount: string }>
  if (calcLines.length > 0) {
    ingredients = calcLines.map(l => parseIngredientLine(l))
  } else if (toolLines.length > 0) {
    ingredients = toolLines.map(l => ({
      name: l.replace(/^[\s*\-·•]+/, '').trim(),
      amount: '适量',
    }))
  } else {
    ingredients = []
  }

  // Filter out empty or irrelevant ingredients
  ingredients = ingredients.filter(i => i.name.length > 0 && i.name.length < 30)

  // Parse steps from "操作" section
  const stepsRaw = (sections['操作'] || []).filter(l => /^[\s]*[\*\-]/.test(l))
  const steps = stepsRaw
    .filter(l => /^[\*\-]/.test(l.trim())) // Only top-level items
    .map(l =>
      l
        .replace(/^[\s*\-]+/, '')
        .replace(/`/g, '')
        .trim()
    )
    .filter(s => s.length > 0)

  // Parse tips from "附加内容" section
  const tipsLines = (sections['附加内容'] || [])
    .filter(l => /^[\s]*[\*\-]/.test(l))
    .map(l => l.replace(/^[\s*\-]+/, '').trim())
    .filter(t => t.length > 0 && !t.includes('遵循本指南'))

  const tips = tipsLines.length > 0 ? tipsLines.join('；') : undefined

  // Guess tools from content
  const tools: string[] = []
  const fullText = content
  if (/烤箱|烘烤/.test(fullText)) tools.push('烤箱')
  if (/炒锅|炒|煎|爆/.test(fullText) && !/不粘锅/.test(fullText)) tools.push('炒锅')
  if (/不粘锅/.test(fullText)) tools.push('不粘锅')
  if (/蒸锅|蒸/.test(fullText)) tools.push('蒸锅')
  if (/电饭煲|电饭锅/.test(fullText)) tools.push('电饭煲')
  if (/空气炸锅/.test(fullText)) tools.push('空气炸锅')
  if (/微波炉/.test(fullText)) tools.push('微波炉')
  if (/砂锅/.test(fullText)) tools.push('砂锅')
  if (/高压锅|压力锅/.test(fullText)) tools.push('高压锅')
  if (/搅拌机|料理机|破壁机/.test(fullText)) tools.push('搅拌机')
  if (tools.length === 0) tools.push('炒锅') // default

  const id = toId(name)
  if (!id || steps.length === 0 || ingredients.length === 0) return null

  return {
    id,
    name,
    category,
    difficulty,
    tools,
    ingredients,
    steps,
    ...(tips ? { tips } : {}),
  }
}

// Walk the dishes directory
const categories = fs.readdirSync(sourceDir).filter(d => {
  const stat = fs.statSync(path.join(sourceDir, d))
  return stat.isDirectory() && d !== 'template'
})

const seenIds = new Set<string>()
// Load existing recipes to avoid duplicates
const existingFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.json'))
for (const f of existingFiles) {
  seenIds.add(f.replace('.json', ''))
}

let imported = 0
let skipped = 0

for (const cat of categories) {
  const category = categoryMap[cat] || cat
  const catDir = path.join(sourceDir, cat)

  // Find all .md files recursively
  function findMd(dir: string): string[] {
    const results: string[] = []
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        results.push(...findMd(full))
      } else if (entry.endsWith('.md')) {
        results.push(full)
      }
    }
    return results
  }

  const mdFiles = findMd(catDir)

  for (const mdFile of mdFiles) {
    const content = fs.readFileSync(mdFile, 'utf-8')
    const recipe = parseRecipe(content, category, path.basename(mdFile, '.md'))
    if (!recipe) {
      skipped++
      continue
    }

    // Handle duplicate IDs
    let finalId = recipe.id
    if (seenIds.has(finalId)) {
      finalId = `${finalId}_${cat}`
      recipe.id = finalId
    }
    if (seenIds.has(finalId)) {
      skipped++
      continue
    }

    seenIds.add(finalId)
    fs.writeFileSync(
      path.join(outDir, `${finalId}.json`),
      JSON.stringify(recipe, null, 2) + '\n',
    )
    imported++
  }
}

console.log(`Imported: ${imported}, Skipped: ${skipped}`)
