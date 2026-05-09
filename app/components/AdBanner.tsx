'use client';

import { useEffect, useRef } from 'react';

// 注意：需要先申请 Google AdSense，这里先用占位符
export default function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 正式 AdSense 代码（申请通过后替换）
    // 目前用公益展示广告代替
    if (adRef.current && process.env.NODE_ENV === 'production') {
      // (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // (window as any).adsbygoogle.push({});
    }
  }, []);

  return (
    <div
      ref={adRef}
      className="w-full h-full flex items-center justify-center bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white/70 text-sm"
    >
      <div className="text-center">
        <div className="text-xs opacity-50 mb-1">广告位招租</div>
        <div>戳破 100 个泡泡解锁成就感 ✨</div>
      </div>
    </div>
  );
}