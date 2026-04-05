import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const endpoints = [
  {
    method: 'GET',
    path: '/api/recipes',
    description: '获取所有菜谱的索引列表',
    response: `[
  {
    "id": "hongshaorou",
    "name": "红烧肉",
    "category": "家常菜",
    "difficulty": "中等"
  }
]`,
  },
  {
    method: 'GET',
    path: '/api/recipes/{id}',
    description: '获取单个菜谱的完整信息',
    response: `{
  "id": "hongshaorou",
  "name": "红烧肉",
  "category": "家常菜",
  "difficulty": "中等",
  "tools": ["炒锅", "砂锅"],
  "ingredients": [
    { "name": "五花肉", "amount": "500g" }
  ],
  "steps": [
    "五花肉切块..."
  ],
  "tips": "焯水时冷水下锅..."
}`,
  },
]

const schema = `{
  "id": "string       — 唯一标识（文件名）",
  "name": "string     — 菜名",
  "category": "string — 分类（川菜/粤菜/家常菜...）",
  "difficulty": "简单 | 中等 | 困难",
  "tools": "string[]  — 所需工具",
  "ingredients": [
    { "name": "string — 食材名", "amount": "string — 用量" }
  ],
  "steps": "string[]  — 制作步骤",
  "tips": "string?    — 注意事项（可选）"
}`

export function ApiDocs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API 文档</h2>
        <p className="text-muted-foreground mt-1">
          所有接口均为静态 JSON 文件，无需认证，可直接 fetch 使用。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>数据结构</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
            <code>{schema}</code>
          </pre>
        </CardContent>
      </Card>

      {endpoints.map((ep) => (
        <Card key={ep.path}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <Badge className="bg-green-600 text-white">{ep.method}</Badge>
              <code className="text-sm">{ep.path}</code>
            </CardTitle>
            <p className="text-muted-foreground text-sm">{ep.description}</p>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm font-medium">响应示例：</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              <code>{ep.response}</code>
            </pre>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>使用示例</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">JavaScript / TypeScript：</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              <code>{`// 获取菜谱列表
const res = await fetch('https://proj.kitchen/api/recipes')
const recipes = await res.json()

// 获取单个菜谱
const detail = await fetch(\`https://proj.kitchen/api/recipes/\${id}\`)
const recipe = await detail.json()`}</code>
            </pre>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">cURL：</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              <code>{`curl https://proj.kitchen/api/recipes
curl https://proj.kitchen/api/recipes/hongshaorou`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自部署</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            如果你有大量请求需求，建议 fork 本项目到自己的服务器。
            只需定期从上游同步即可获取最新菜谱数据。
            本项目采用 MIT 协议，可自由商业使用，但请保留署名。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
