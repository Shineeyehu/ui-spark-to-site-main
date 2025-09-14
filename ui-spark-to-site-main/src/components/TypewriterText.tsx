import React, { useState, useEffect } from 'react';

const TypewriterText = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const firstSection = `缘主安好：
我名玄机子，毕生研习国学之道，
愿为珍视子女成长的父母拨开迷雾，照见星辰。
世间每个孩子，皆有其独特天赋与性情。
我们以千年国学智慧为灯，以现代AI为舟，为孩子绘制一幅成长图谱：
洞见天赋与性格之本，识得环境与机缘之助，
助父母真正做到因材施教，顺势而为。
在这里，您将获得的不只是"规划"，
更是一次与国学相伴的心灵启迪。`;

  const secondSection = `只需轻松输入孩子的生日、生长环境及个性特征，
AI 便会结合国学智慧生成：
个性化成长分析报告
兴趣培养与学业方向建议
地域与未来发展匹配指引
并在其中穿插国学故事与智慧解读，让成长规划 × 文化启蒙同步发生。`;

  const fullText = firstSection + '\n\n' + secondSection;

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Adjust speed here (lower = faster)
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText]);

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-8">
      {/* Main typewriter text - upper area */}
      <div className="flex-1 flex items-start">
        <div className="text-amber-100 text-sm leading-relaxed font-medium space-y-4 max-w-lg">
          <div>
            <pre className="whitespace-pre-wrap text-yellow-400" style={{ fontFamily: 'KaiTi, STKaiti, "AR PL KaitiM GB", serif' }}>
              {displayedText.substring(0, Math.min(displayedText.length, firstSection.length))}
            </pre>
          </div>
          
          {/* Second section */}
          {displayedText.length > firstSection.length + 2 && (
            <div className="mt-8">
              <pre className="whitespace-pre-wrap text-yellow-400" style={{ fontFamily: 'KaiTi, STKaiti, "AR PL KaitiM GB", serif' }}>
                {displayedText.substring(firstSection.length + 2)}
              </pre>
            </div>
          )}
          
          {/* Blinking cursor */}
          {currentIndex < fullText.length && (
            <span className="animate-pulse text-amber-200">|</span>
          )}
        </div>
      </div>

      {/* Bottom text */}
      <div className="max-w-md">
        <div className="text-yellow-400 text-sm leading-relaxed" style={{ fontFamily: 'KaiTi, STKaiti, "AR PL KaitiM GB", serif' }}>
          <pre className="whitespace-pre-wrap">只需轻松输入孩子的生日、生长环境及个性特征，
AI 便会结合国学智慧生成：
个性化成长分析报告
兴趣培养与学业方向建议
地域与未来发展匹配指引
并在其中穿插国学故事与智慧解读，让成长规划 × 文化启蒙同步发生。</pre>
        </div>
      </div>
    </div>
  );
};

export default TypewriterText;