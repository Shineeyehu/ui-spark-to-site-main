V1.0
## 知识卡片数据源完整流程
### 1. 数据输入源头
知识卡片的数据源主要来自用户在 `BirthdayForm.tsx` 中填写的表单信息：

- 基本信息 ：性别、年龄
- 出生信息 ：公历/农历、出生日期、出生时间、是否闰月
- 地理信息 ：出生地点、出生环境
- 手相信息 ：可选的手相照片上传
### 2. 数据处理与传递
用户填写完表单后，数据通过以下路径传递：

1. 1.
   表单提交 → `BirthdayForm.tsx` 收集 formData
2. 2.
   路由传递 → 通过 location.state 传递到 `ReportPage.tsx`
3. 3.
   内容生成 → `generateAnalysisContent` 函数将表单数据转换为结构化的分析内容
### 3. AI处理流程
知识卡片的核心内容通过以下AI处理流程生成：
 3.1 Moonshot API调用
- API配置 ：使用 `moonshot-api.ts` 中的配置
- 环境变量 ：
  - VITE_MOONSHOT_API_KEY ：API密钥
  - VITE_MOONSHOT_MODEL ：模型版本（默认：kimi-k2-0905-preview）
  - VITE_MOONSHOT_BASE_URL ：API基础URL 3.2 系统提示词
AI使用 `prompt.txt` 中的专业提示词，该提示词定义了：

- 角色定位 ：融合信息架构师、教育设计师和视觉设计师的AI知识卡设计大师
- 输出格式 ：单文件HTML格式的知识卡片
- 设计规范 ：视觉主题、色彩方案、布局约束、排版体系
- 技术选择 ：HTML5 + TailwindCSS + Font Awesome 3.3 内容生成逻辑
`generateAnalysisContent` 函数将用户数据转换为AI可理解的格式：

### 4. 知识卡片生成
最终的知识卡片通过以下步骤生成：

1. 1.
   API调用 ： `generateKnowledgeCardStream` 调用Moonshot API
2. 2.
   流式输出 ：实时接收AI生成的HTML内容
3. 3.
   内容渲染 ：在 `ReportPage.tsx` 中显示生成的知识卡片
4. 4.
   样式处理 ：使用 `markdown-utils.ts` 处理内容格式
### 5. 数据源总结
主要数据源 ：

- ✅ 用户输入数据 ：通过表单收集的个人信息
- ✅ AI生成内容 ：基于Moonshot API的智能分析
- ✅ 系统提示词 ：专业的命理分析模板
- ✅ 预设测试数据 ：用于开发测试的样本数据
数据流向 ：

关键特点 ：

- 数据完全基于用户输入，没有外部数据库依赖
- AI根据传统命理学知识和用户信息生成个性化内容
- 支持实时流式生成，提供良好的用户体验
- 生成的知识卡片为完整的HTML格式，包含专业的视觉设计
这就是你们项目中知识卡片数据源的完整来源和处理流程！