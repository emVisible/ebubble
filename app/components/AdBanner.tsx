'use client';

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // 告诉 AdSense 渲染这个广告位
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-4979711795294991"  // ← 你的 publisher ID
        data-ad-slot="XXXXXXXXXXXX"               // ← 需要替换成你的广告单元 ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}