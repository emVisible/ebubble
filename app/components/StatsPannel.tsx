'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalPops: number;
  sessionDuration: number;
  clickSpeed: number;
}

export default function StatsPanel({ popCount }: { popCount: number }) {
  const [stats, setStats] = useState<Stats>({
    totalPops: 0,
    sessionDuration: 0,
    clickSpeed: 0,
  });
  const [lastClickTime, setLastClickTime] = useState<number>(Date.now());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // 每秒更新会话时长
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - lastClickTime) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastClickTime]);

  useEffect(() => {
    // 更新点击速度和总次数
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    const clickSpeed = timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;

    setStats(prev => ({
      totalPops: popCount,
      sessionDuration: prev.sessionDuration,
      clickSpeed: clickSpeed > 20 ? 20 : clickSpeed, // 上限 20/秒
    }));
    setLastClickTime(now);
  }, [popCount]);

  // 生成随机废话
  const randomFacts = [
    `🐌 你戳泡泡的速度比蜗牛快 ${stats.clickSpeed} 倍`,
    `💪 你已经消耗了 ${Math.floor(popCount * 0.1)} 卡路里`,
    `🌍 全球同步浪费 ${stats.sessionDuration} 秒人生`,
    `🎯 离 10000 个还差 ${10000 - popCount} 个`,
    `🤔 如果每个泡泡值 1 分钱，你已经赚了 ¥${(popCount * 0.01).toFixed(2)}`,
    `⏰ 戳破这些泡泡够看完 ${Math.floor(popCount / 60)} 个 15 秒短视频`,
  ];

  const currentFact = randomFacts[popCount % randomFacts.length];

  return (
    <div className="fixed bottom-24 right-4 z-10">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-black/50 backdrop-blur rounded-full px-3 py-2 text-white/70 text-xs hover:bg-black/70 transition-all"
      >
        {showPanel ? '📊 关闭废话' : '📊 看看废话'}
      </button>

      {showPanel && (
        <div className="mt-2 bg-black/80 backdrop-blur rounded-lg p-3 text-white text-xs space-y-1 min-w-[200px] border border-white/20">
          <div className="text-yellow-400 font-bold mb-1">无聊数据面板</div>
          <div>🫧 本局戳破: {stats.totalPops}</div>
          <div>⚡ 手速: {stats.clickSpeed} 次/秒</div>
          <div>⏱️ 浪费时光: {stats.sessionDuration} 秒</div>
          <div className="text-amber-500/80 border-t border-white/20 pt-1 mt-1">
            {currentFact}
          </div>
          <div className="text-[10px] text-white/40 text-center mt-2">
            这些数据没有任何意义 ✨
          </div>
        </div>
      )}
    </div>
  );
}