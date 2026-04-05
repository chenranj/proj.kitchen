import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const zhContent = [
  {
    title: '概述',
    body: '厨房计划（"本应用"）是一款用于每周膳食规划、冰箱库存管理和购物清单生成的 iOS 应用。我们高度重视您的隐私，本隐私协议说明了本应用如何处理您的数据。',
  },
  {
    title: '数据收集与存储',
    body: '本应用不收集、不传输、不存储任何个人信息到远程服务器。您的所有数据（包括食谱、膳食计划、冰箱库存和购物清单）均存储在您的设备本地，使用 Apple 的 SwiftData 框架。我们没有自己的服务器或后台服务，不会以任何方式访问您的数据。',
  },
  {
    title: 'Apple Intelligence',
    body: '本应用使用 Apple Intelligence 提供 AI 食谱生成功能。该功能完全在您的设备上运行，由 Apple 的设备端模型处理，不会将您的输入内容发送到任何外部服务器。',
  },
  {
    title: '第三方服务与数据来源',
    body: '本应用使用 proj.kitchen（厨房计划网站）提供的开放 API 获取食谱、食材及用量单位数据。该网站托管的食谱数据源自开源项目《程序员做饭指南》，所有数据均公开可用。本应用会通过网络请求访问 proj.kitchen 的 API 接口以获取和更新食谱数据，但不会向该服务发送任何用户个人信息。',
  },
  {
    title: '数据删除',
    body: '由于所有数据存储在您的设备本地，您可以随时通过删除应用来完全清除所有数据。',
  },
  {
    title: '儿童隐私',
    body: '本应用不针对 13 岁以下的儿童，也不会有意收集儿童的个人信息。',
  },
  {
    title: '隐私协议变更',
    body: '我们可能会不时更新本隐私协议。更新后的版本将在此页面发布，并更新下方的生效日期。',
  },
  {
    title: '联系我们',
    body: '如果您对本隐私协议有任何疑问，请通过 Email 联系我们：hi@jin.cr',
  },
]

const enContent = [
  {
    title: 'Overview',
    body: 'Proj. Kitchen ("the App") is an iOS application for weekly meal planning, fridge inventory management, and grocery list generation. We take your privacy seriously. This Privacy Policy explains how the App handles your data.',
  },
  {
    title: 'Data Collection & Storage',
    body: 'The App does not collect, transmit, or store any personal information on remote servers. All your data — including recipes, meal plans, fridge inventory, and shopping lists — is stored locally on your device using Apple\'s SwiftData framework. We do not operate any servers or backend services and have no access to your data.',
  },
  {
    title: 'Apple Intelligence',
    body: 'The App uses Apple Intelligence to provide AI-powered recipe generation. This feature runs entirely on your device using Apple\'s on-device models. Your input is not sent to any external server.',
  },
  {
    title: 'Third-Party Services & Data Sources',
    body: 'The App uses the open API provided by proj.kitchen (Proj. Kitchen website) to fetch recipes, ingredients, and unit data. The recipe data hosted on this website is sourced from the open-source project "Programmer\'s Cooking Guide," and all data is publicly available. The App makes network requests to proj.kitchen API endpoints to retrieve and update recipe data, but does not send any personal user information to this service.',
  },
  {
    title: 'Data Deletion',
    body: 'Since all data is stored locally on your device, you can completely erase all data at any time by deleting the App.',
  },
  {
    title: "Children's Privacy",
    body: 'The App is not directed at children under 13 and does not knowingly collect personal information from children.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us at: hi@jin.cr',
  },
]

export function PrivacyPolicy() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const content = lang === 'zh' ? zhContent : enContent

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {lang === 'zh' ? '隐私协议' : 'Privacy Policy'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {lang === 'zh'
              ? '生效日期：2026 年 4 月 5 日'
              : 'Effective Date: April 5, 2026'}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={lang === 'zh' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLang('zh')}
          >
            中文
          </Button>
          <Button
            variant={lang === 'en' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLang('en')}
          >
            EN
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {content.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 font-semibold">{section.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
