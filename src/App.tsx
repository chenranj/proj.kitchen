import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useParams, useNavigate } from 'react-router'
import { Layout } from '@/components/Layout'
import { RecipeList } from '@/pages/RecipeList'
import { ApiDocs } from '@/pages/ApiDocs'
import { ContributeRecipe } from '@/pages/ContributeRecipe'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { Guidelines } from '@/pages/Guidelines'

const TABS = ['recipes', 'api', 'contribute', 'guidelines', 'privacy'] as const

function App() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const current = tab && TABS.includes(tab as typeof TABS[number]) ? tab : 'recipes'

  return (
    <Layout>
      <Tabs value={current} onValueChange={(v) => navigate(v === 'recipes' ? '/' : `/${v}`)}>
        <TabsList>
          <TabsTrigger value="recipes">菜谱浏览</TabsTrigger>
          <TabsTrigger value="api">API 文档</TabsTrigger>
          <TabsTrigger value="contribute">新增食谱</TabsTrigger>
          <TabsTrigger value="guidelines">贡献准则</TabsTrigger>
          <TabsTrigger value="privacy">隐私协议</TabsTrigger>
        </TabsList>
        <TabsContent value="recipes" className="mt-6">
          <RecipeList />
        </TabsContent>
        <TabsContent value="api" className="mt-6">
          <ApiDocs />
        </TabsContent>
        <TabsContent value="contribute" className="mt-6">
          <ContributeRecipe />
        </TabsContent>
        <TabsContent value="guidelines" className="mt-6">
          <Guidelines />
        </TabsContent>
        <TabsContent value="privacy" className="mt-6">
          <PrivacyPolicy />
        </TabsContent>
      </Tabs>
    </Layout>
  )
}

export default App
