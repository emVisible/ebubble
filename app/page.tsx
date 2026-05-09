'use client';

import dynamic from 'next/dynamic';
import AdBanner from './components/AdBanner';
import StatsPanel from './components/StatsPannel';
import { useState } from 'react';

// 动态导入画布组件（禁用 SSR，因为 Canvas 需要浏览器环境）
const BubbleCanvas = dynamic(() => import('./components/BubbleCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
      加载中...
    </div>
  ),
});

export default function Home() {
  const [popCount, setPopCount] = useState(0);
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <BubbleCanvas onPopCountChange={setPopCount} />
      <StatsPanel popCount={popCount} />

      {/* 无聊的页脚说明 */}
      <footer className="fixed bottom-2 right-4 text-white/30 text-xs z-10">
        Little Bubble
      </footer>
    </main>
  );
}