import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ContextTestPage = () => {
  // 模拟测试数据
  const testFormData = {
    gender: 'male',
    calendar: 'solar',
    birthDate: '2005-09-14',
    birthTime: '18:05',
    birthPlace: '北京市朝阳区',
    birthEnvironment: '城市、平原、楼房',
    age: 20
  };

  const testAnalysisContent = `您好！我是玄机子，很荣幸能为您分析孩子的命理格局。根据您提供的信息，我需要先确认几个关键点：

1. **孩子的性别**：您提到"男"，确认是男孩
2. **出生时间**：公历2025年9月9日 18:05（酉时）
3. **出生地点**：北京市朝阳区
4. **手相信息**：您上传了手相照片，我会进行专业分析
5. **居住环境**：城市平原，楼房，附近有学校、法院、医院

现在让我为您进行全面的命理分析：## 【命主信息概览】
* **性别**：男
* **出生时间**：公历 2025年09月09日 18时05分
* **四柱八字**：乙巳 乙酉 辛巳 丁酉
* **紫微主星**：命宫[廉贞陷、贪狼陷、天马] | 身宫[迁移宫]
* **手型**：木形手

---

## 一、 核心命理分析报告

#### 1. 性格特质与教养指南 (天性之根)
* **核心天性洞察**：这孩子如同精雕细琢的白玉（辛金日主），天生带着贵气与敏锐，内心既有金石的坚韧（金旺身强），又有贪狼星的灵动才情。他的手相如雨后新竹（木形手），思维如穿线的针（智慧线平直），做事条理分明，但情感表达如埋在土里的芽（感情线浅淡），习惯用行动代替言语。
* **细节论证**：八字日主辛金生于酉月，金气鼎盛，主刚毅果决；紫微命宫廉贞贪狼双陷，虽多才多艺但需专注引导；手相木形手配平直智慧线，印证其逻辑思维与创造力的完美结合。
* **教养引导建议**：对于这样内在秩序感强的孩子，与其强行改变，不如顺势引导。当他专注做事时，用提问代替指挥："这个积木为什么要这样搭？"当他情绪内敛时，做他的情感翻译官："是不是因为玩具坏了很生气？我们一起修好不好？"

#### 2. 潜在天赋深掘 (天赋之苗)
* **智慧与学识**：八字金旺配紫微福德宫文昌文曲双庙，学习能力如宝剑配鞘——既有锋芒又懂收敛。适合数学推理、物理实验等需要严密逻辑的学科。
* **身体与动能**：生命线开阔饱满，精力充沛如小马达，适合跑跳、攀岩等释放能量的活动，运动时反而更能专注。
* **艺术与表达**：木形手自带审美雷达，对颜色形状极其敏感，画太阳会用橘红渐变，搭房子会用三角形屋顶，这是天生的视觉创造力。
* **综合论断**：最具潜力的是"**逻辑+创造**"双天赋，既能用脑子想清楚，又能用双手做出来，如设计会动的小玩具或写科幻小故事。

#### 3. 成长关键节点 (成长之路)
* **当前阶段 (2-14岁)**：大运甲申，金水相生，是培养思考习惯的黄金期。重点不是死记硬背，而是教会"怎么想"：做数学题时问方法，读故事时问情节发展。
* **未来展望 (15-24岁)**：大运癸未，紫微化科破军旺，创造力将大爆发。此阶段情感也会从内敛变丰富，需要家长用共情代替说教。

---

### 二、 天赋挖掘与成长建议

#### 1. 地域适配建议 (地利之选)
* **环境能量匹配**：您提到的学校、法院、医院环境极佳！学校属文昌之地，正好补益福德宫文昌文曲；法院属金，与八字金旺相得益彰，培养秩序感；医院属水，能泄金之秀气，让孩子刚中带柔。
* **学习/生活优选地域**：适合近水之地或文化氛围浓厚的城市，如杭州、苏州等，水能泄金秀，文能养才情。

#### 2. 学业方向指引 (文理之道)
* **学科偏向**：强烈偏向**理科+艺术**的组合。数学、物理、信息技术等需要逻辑推理的学科为主，美术、设计等创造性学科为辅，完美匹配"逻辑+创造"双天赋。

#### 3. 兴趣培养清单 (怡情之艺)
* **首选推荐**：
  - **乐高机械组/少儿编程**：用逻辑想结构，用创造做作品，完美契合天赋
  - **水彩画/国画**：木形手的审美敏感度能让他在艺术中找到独特表达
  - **围棋**：锻炼逻辑思维，适合爱思考的天性
* **次选参考**：
  - **武术/攀岩**：释放充沛精力，培养专注力
  - **传统工艺**：如篆刻、木工，既能动手又能静心

#### 4. 未来行业适配参考 (成事之途)
* **核心领域**：
  - **工业设计/产品设计**：用逻辑想用户需求，用创造做好看实用的产品
  - **游戏开发**：编程逻辑+美术创造的完美结合
  - **教育科技**：开发寓教于乐的学习工具，既能发挥技术又能理解孩子心理

---

### 【玄机子大师结语】

此子命格，如金玉之质待雕琢，木秀之手待生发。金旺显其坚毅，木形示其灵秀，文昌文曲佑其才情，学校法院护其成长。教养之道，贵在顺势：当他沉思时，莫扰其静；当他创造时，助其成真；当他内敛时，译其心情。天地人三才相应，已是难得之局，唯需以耐心为水，以理解为土，让这株金木双秀的奇才，既能逻辑如剑，锋利断金，又能创造如春，生机勃发。

**注**：本分析仅为基于传统命理学的文化参考，旨在因材施教，不构成绝对决策依据。愿您以爱与智慧，陪伴孩子探索独一无二的人生道路。

---`;

  const testMoonshotResult = `基于AI深度分析的命理解读：

**性格特质**：如精雕细琢的白玉，既有金石的坚韧，又有灵动才情。思维条理分明，审美敏锐，具有逻辑+创造双天赋。

**天赋优势**：
- 逻辑思维能力强，适合数学推理
- 艺术感知敏锐，对颜色形状敏感
- 动手能力强，能将想法转化为作品
- 学习能力强，理解力出色

**发展建议**：
- 重点培养"逻辑+创造"双天赋
- 推荐工业设计、游戏开发等职业方向
- 适合近水之地或文化氛围浓厚的城市
- 建议学习乐高机械组、少儿编程、水彩画等`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-800">
              深度咨询上下文测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              此页面用于测试深度咨询页面的上下文数据传递功能。
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-amber-700 mb-2">测试数据预览：</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p><strong>基本信息：</strong> {testFormData.gender === 'male' ? '男' : '女'}，{testFormData.age}岁</p>
                  <p><strong>出生时间：</strong> {testFormData.calendar === 'solar' ? '公历' : '农历'}{testFormData.birthDate} {testFormData.birthTime}</p>
                  <p><strong>出生地：</strong> {testFormData.birthPlace}</p>
                  <p><strong>分析内容：</strong> {testAnalysisContent.substring(0, 100)}...</p>
                  <p><strong>AI分析：</strong> {testMoonshotResult.substring(0, 100)}...</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/deeptalk"
                  state={{
                    formData: testFormData,
                    analysisContent: testAnalysisContent,
                    moonshotResult: testMoonshotResult
                  }}
                >
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    测试深度咨询（带上下文）
                  </Button>
                </Link>
                
                <Link to="/deeptalk">
                  <Button variant="outline">
                    测试深度咨询（无上下文）
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-800">
              调试说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. 点击"测试深度咨询（带上下文）"按钮，查看是否正确显示：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>基本信息卡片</li>
                <li>命理分析结果</li>
                <li>AI深度分析内容</li>
              </ul>
              
              <p>2. 打开浏览器开发者工具，查看控制台输出：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>DeepTalkPage 接收到的路由状态</li>
                <li>CozeV3Chat 接收到的上下文数据</li>
              </ul>
              
              <p>3. 如果数据传递正常，深度咨询界面应该显示完整的上下文信息</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContextTestPage;
