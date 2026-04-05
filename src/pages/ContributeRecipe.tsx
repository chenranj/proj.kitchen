import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES, DIFFICULTIES, UNITS } from '@/types/recipe'
import type { Ingredient, Recipe } from '@/types/recipe'

import { REPO_OWNER, REPO_NAME } from '@/config'

function generateId(name: string): string {
  return name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
}

function recipeToJson(recipe: Omit<Recipe, 'id'>): string {
  const id = generateId(recipe.name)
  return JSON.stringify({ id, ...recipe }, null, 2)
}

export function ContributeRecipe() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [tools, setTools] = useState<string[]>([])
  const [toolInput, setToolInput] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' },
  ])
  const [steps, setSteps] = useState<string[]>([''])
  const [tips, setTips] = useState('')

  // GitHub submission
  const [ghToken, setGhToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    ok: boolean
    message: string
    url?: string
  } | null>(null)

  const addIngredient = () =>
    setIngredients([...ingredients, { name: '', amount: '' }])
  const removeIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i))
  const updateIngredient = (i: number, field: keyof Ingredient, val: string) =>
    setIngredients(
      ingredients.map((ing, idx) =>
        idx === i ? { ...ing, [field]: val } : ing,
      ),
    )

  const addStep = () => setSteps([...steps, ''])
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i: number, val: string) =>
    setSteps(steps.map((s, idx) => (idx === i ? val : s)))

  const isValid =
    name.trim() &&
    category &&
    difficulty &&
    ingredients.some((i) => i.name.trim()) &&
    steps.some((s) => s.trim())

  const buildRecipe = (): Omit<Recipe, 'id'> => ({
    name: name.trim(),
    category,
    difficulty: difficulty as Recipe['difficulty'],
    tools,
    ingredients: ingredients.filter((i) => i.name.trim()),
    steps: steps.filter((s) => s.trim()),
    ...(tips.trim() ? { tips: tips.trim() } : {}),
  })

  const jsonPreview = isValid ? recipeToJson(buildRecipe()) : ''

  // Submit PR via GitHub API
  const submitPR = async () => {
    if (!ghToken || !isValid) return
    setSubmitting(true)
    setSubmitResult(null)

    try {
      const recipe = buildRecipe()
      const id = generateId(recipe.name)
      const json = JSON.stringify({ id, ...recipe }, null, 2) + '\n'
      const filePath = `recipes/${id}.json`
      const branchName = `add-recipe-${id}-${Date.now()}`

      // 1. Get user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${ghToken}` },
      })
      if (!userRes.ok) throw new Error('Token 无效，请检查你的 Personal Access Token')
      const user = await userRes.json()

      // 2. Fork the repo (idempotent)
      await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            'Content-Type': 'application/json',
          },
        },
      )
      // Wait a bit for fork to be ready
      await new Promise((r) => setTimeout(r, 3000))

      const forkOwner = user.login

      // 3. Get default branch SHA
      const repoRes = await fetch(
        `https://api.github.com/repos/${forkOwner}/${REPO_NAME}`,
        { headers: { Authorization: `Bearer ${ghToken}` } },
      )
      const repo = await repoRes.json()
      const defaultBranch = repo.default_branch || 'main'

      const refRes = await fetch(
        `https://api.github.com/repos/${forkOwner}/${REPO_NAME}/git/ref/heads/${defaultBranch}`,
        { headers: { Authorization: `Bearer ${ghToken}` } },
      )
      const ref = await refRes.json()
      const baseSha = ref.object.sha

      // 4. Create branch
      await fetch(
        `https://api.github.com/repos/${forkOwner}/${REPO_NAME}/git/refs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
          }),
        },
      )

      // 5. Create file
      const createRes = await fetch(
        `https://api.github.com/repos/${forkOwner}/${REPO_NAME}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Add recipe: ${recipe.name}`,
            content: btoa(unescape(encodeURIComponent(json))),
            branch: branchName,
          }),
        },
      )
      if (!createRes.ok) {
        const err = await createRes.json()
        throw new Error(err.message || '创建文件失败')
      }

      // 6. Create PR
      const prRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `Add recipe: ${recipe.name}`,
            head: `${forkOwner}:${branchName}`,
            base: defaultBranch,
            body: `## 新增菜谱：${recipe.name}\n\n- 分类：${recipe.category}\n- 难度：${recipe.difficulty}\n- 食材：${recipe.ingredients.length} 种\n- 步骤：${recipe.steps.length} 步\n\n由 Open Kitchen 在线表单提交`,
          }),
        },
      )

      if (prRes.ok) {
        const pr = await prRes.json()
        setSubmitResult({
          ok: true,
          message: `PR 已成功创建！`,
          url: pr.html_url,
        })
      } else {
        const err = await prRes.json()
        throw new Error(err.message || '创建 PR 失败')
      }
    } catch (e) {
      setSubmitResult({
        ok: false,
        message: e instanceof Error ? e.message : '提交失败',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manual submission URL (GitHub new file page)
  const manualUrl = isValid
    ? `https://github.com/${REPO_OWNER}/${REPO_NAME}/new/main/recipes?filename=${generateId(name)}.json&value=${encodeURIComponent(jsonPreview)}`
    : ''

  return (
    <div className="space-y-8">
      {/* Guide Section */}
      <div>
        <h2 className="text-2xl font-bold">新增食谱</h2>
        <p className="text-muted-foreground mt-1">
          填写下方表单即可提交新菜谱，或直接在 GitHub 上提交 PR。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>贡献指南</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>每道菜谱是 <code className="bg-muted rounded px-1.5 py-0.5">recipes/</code> 目录下的一个 JSON 文件，格式如下：</p>
          <pre className="bg-muted overflow-x-auto rounded-lg p-4">
            <code>{`{
  "id": "hongshaorou",
  "name": "红烧肉",
  "category": "荤菜",
  "difficulty": "中等",
  "tools": ["炒锅", "砂锅"],
  "ingredients": [
    { "name": "五花肉", "amount": "500g" },
    { "name": "冰糖", "amount": "30g" }
  ],
  "steps": [
    "第一步...",
    "第二步..."
  ],
  "tips": "注意事项（可选）"
}`}</code>
          </pre>
          <div className="space-y-2 pt-2">
            <p className="font-medium">手动提交步骤：</p>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1">
              <li>Fork 本仓库</li>
              <li>在 <code className="bg-muted rounded px-1.5 py-0.5">recipes/</code> 目录下新建 JSON 文件</li>
              <li>按照上述格式填写菜谱信息</li>
              <li>提交 Pull Request</li>
            </ol>
          </div>
          <p className="text-muted-foreground pt-2">
            也可以直接使用下方表单填写，我们会帮你生成 JSON 并提交。
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Recipe Form */}
      <Card>
        <CardHeader>
          <CardTitle>在线填写菜谱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>菜名 *</Label>
              <Input
                placeholder="如：红烧肉"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>分类 *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>难度 *</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v ?? '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择难度" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-2">
            <Label>所需工具</Label>
            <div className="border-input focus-within:ring-ring flex flex-wrap items-center gap-1.5 rounded-md border px-3 py-2 focus-within:ring-1">
              {tools.map((tool, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {tool}
                  <button
                    type="button"
                    className="hover:bg-muted-foreground/20 ml-0.5 rounded-full p-0.5"
                    onClick={() => setTools(tools.filter((_, idx) => idx !== i))}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l6 6M9 3l-6 6" />
                    </svg>
                  </button>
                </Badge>
              ))}
              <input
                className="placeholder:text-muted-foreground min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                placeholder={tools.length === 0 ? '输入后按回车添加，如：炒锅' : '继续添加...'}
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = toolInput.trim()
                    if (val && !tools.includes(val)) {
                      setTools([...tools, val])
                      setToolInput('')
                    }
                  } else if (e.key === 'Backspace' && !toolInput && tools.length > 0) {
                    setTools(tools.slice(0, -1))
                  }
                }}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>食材用量 *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                + 添加食材
              </Button>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="食材名"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="数量"
                  value={ing.amount.replace(/[^\d.]/g, '')}
                  onChange={(e) => {
                    const unit = ing.amount.replace(/[\d.]/g, '')
                    updateIngredient(i, 'amount', e.target.value + unit)
                  }}
                  className="w-20"
                />
                <Select
                  value={ing.amount.replace(/[\d.]/g, '') || undefined}
                  onValueChange={(v) => {
                    const num = ing.amount.replace(/[^\d.]/g, '')
                    updateIngredient(i, 'amount', num + v)
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="单位" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u.unit} value={u.unit}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(i)}
                    className="text-destructive shrink-0"
                  >
                    删除
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>制作步骤 *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                + 添加步骤
              </Button>
            </div>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="mt-2.5 h-6 w-6 shrink-0 justify-center rounded-full"
                >
                  {i + 1}
                </Badge>
                <Textarea
                  placeholder={`第 ${i + 1} 步...`}
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(i)}
                    className="text-destructive mt-1.5 shrink-0"
                  >
                    删除
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <Label>注意事项（可选）</Label>
            <Textarea
              placeholder="烹饪小贴士..."
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={2}
            />
          </div>

          <Separator />

          {/* JSON Preview */}
          {isValid && (
            <div className="space-y-2">
              <Label>生成的 JSON</Label>
              <pre className="bg-muted max-h-64 overflow-auto rounded-lg p-4 text-xs">
                <code>{jsonPreview}</code>
              </pre>
            </div>
          )}

          <Separator />

          {/* Submission Options */}
          <div className="space-y-4">
            <h3 className="font-medium">提交方式</h3>

            {/* Option 1: Auto PR with token */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm font-medium">方式一：自动提交 PR（需要 GitHub Token）</p>
                <p className="text-muted-foreground text-xs">
                  需要一个具有 <code className="bg-muted rounded px-1">public_repo</code> 权限的{' '}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=public_repo&description=Open+Kitchen+Recipe+Submission"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Personal Access Token
                  </a>
                  。Token 仅在浏览器中使用，不会发送到我们的服务器。
                </p>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                />
                <Button
                  onClick={submitPR}
                  disabled={!isValid || !ghToken || submitting}
                  className="w-full"
                >
                  {submitting ? '提交中...' : '自动提交 PR'}
                </Button>
                {submitResult && (
                  <p
                    className={`text-sm ${submitResult.ok ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {submitResult.message}
                    {submitResult.url && (
                      <>
                        {' '}
                        <a
                          href={submitResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          查看 PR
                        </a>
                      </>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Option 2: Manual */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm font-medium">方式二：手动提交</p>
                <p className="text-muted-foreground text-xs">
                  点击下方按钮跳转到 GitHub，JSON 内容已自动填入，确认后提交即可。
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!isValid}
                    className="flex-1"
                    onClick={() => {
                      if (manualUrl) window.open(manualUrl, '_blank')
                    }}
                  >
                    在 GitHub 上创建文件
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!isValid}
                    onClick={() => {
                      navigator.clipboard.writeText(jsonPreview)
                    }}
                  >
                    复制 JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
