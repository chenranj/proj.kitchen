import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const sections = [
  {
    title: '项目宗旨',
    content:
      '厨房计划致力于构建一个开放、准确、机器可读的中文菜谱数据库。我们希望每一份菜谱都像一颗可靠的螺丝钉——标准化、可复现、人人可用。无论你是开发者、美食爱好者还是家庭厨师，都欢迎参与贡献。',
  },
  {
    title: '菜谱规范',
    items: [
      '格式化优先：所有菜谱使用统一的 JSON 格式，确保机器和人类都能轻松读取。不同的人按照同一份菜谱操作，应当能得到近似的结果。',
      '用量精确：尽量使用具体的克数（g）、毫升（ml）等计量单位，避免"适量""少许"等模糊描述。如果确实因人而异，请注明参考范围。',
      '步骤清晰：每个步骤应当描述一个明确的操作，包含时间、火候、状态判断等关键信息。',
      '食材通用：优先使用常见、易购买的食材名称，避免绑定特定品牌。',
    ],
  },
  {
    title: '贡献流程',
    items: [
      'Fork 本仓库到你的 GitHub 账号。',
      '在 recipes/ 目录下新建一个 JSON 文件，文件名使用菜名拼音（如 hongshaorou.json）。',
      '按照菜谱 JSON 格式填写所有必填字段：id、name、category、difficulty、tools、ingredients、steps。',
      '提交 Pull Request，简要说明你添加或修改的内容。',
      '等待维护者审核合并。合并后菜谱将在下次构建时自动上线。',
    ],
  },
  {
    title: '审核标准',
    items: [
      'JSON 格式正确，所有必填字段完整。',
      '菜名不与已有菜谱重复（可以是同一道菜的不同做法，但需要区分命名）。',
      '步骤经过验证，至少提交者本人成功制作过。',
      '不包含广告、品牌推广或商业引导内容。',
      '语言文明，不包含歧视性或冒犯性内容。',
    ],
  },
  {
    title: '开放协议',
    content:
      '本项目采用 MIT 协议。你可以自由复制、修改、发布、分发、编译和出售本仓库中的菜谱，无论是否用于商业目的。唯一的要求是保留版权声明。我们欢迎任何社区或 AI 项目使用本仓库的数据进行训练和开发。',
  },
  {
    title: '衍生作品',
    content:
      '基于本仓库开发的应用、网站或工具属于独立的衍生作品，其行为准则和运营方式由各自的开发者负责，与本项目无关。我们鼓励衍生作品注明数据来源。',
  },
  {
    title: '社区准则',
    items: [
      '尊重每一位贡献者的劳动成果。',
      '在 Issue 和 PR 中保持友善、建设性的沟通。',
      '提出修改建议时，请说明理由并提供改进方案。',
      '不发布垃圾信息、广告或与项目无关的内容。',
    ],
  },
]

export function Guidelines() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">贡献准则</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          参与贡献前，请阅读以下准则
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {sections.map((section, i) => (
            <div key={section.title}>
              {i > 0 && <Separator className="mb-6" />}
              <h3 className="mb-3 text-lg font-semibold">{section.title}</h3>
              {section.content && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.items && (
                <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-primary mt-1 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
