'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  isIron?: boolean;
  ironHits?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

export default function BubbleCanvas({ onPopCountChange }: { onPopCountChange: (count: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [popCount, setPopCount] = useState(0);
  const [toast, setToast] = useState<string>('');
  const recentClicksRef = useRef<{ x: number; y: number; time: number }[]>([]);

  // 嘲讽成就文案
  const achievements = [
    { count: 10, msg: '你开始了吗？ 👀' },
    { count: 50, msg: '手酸吗？ 💪' },
    { count: 100, msg: '100个了，去喝口水吧 💧' },
    { count: 500, msg: '你是机器人吗？ 🤖' },
    { count: 1000, msg: '其实没有奖励，你真的很无聊 🏆' },
  ];

  useEffect(() => {
    onPopCountChange?.(popCount);
  }, [popCount, onPopCountChange]);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  // 生成随机颜色（清爽马卡龙色系）
  const getRandomColor = () => {
    const hue = Math.random() * 60 + 180; // 青绿到蓝
    return `hsla(${hue}, 70%, 65%, ${0.6 + Math.random() * 0.3})`;
  };

  // 生成泡泡
  const generateBubbles = useCallback((width: number, height: number) => {
    const bubbles: Bubble[] = [];
    const count = Math.floor((width * height) / 25000) + 30;
    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 40;
      bubbles.push({
        id: Math.random(),
        x: radius + Math.random() * (width - radius * 2),
        y: radius + Math.random() * (height - radius * 2),
        radius,
        color: getRandomColor(),
      });
    }
    return bubbles;
  }, []);

  // 添加一个新泡泡
  const addOneBubble = useCallback((width: number, height: number) => {
    const radius = 20 + Math.random() * 40;
    return {
      id: Math.random(),
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      radius,
      color: getRandomColor(),
    };
  }, []);

  // 粒子爆炸效果
  const addExplosion = (x: number, y: number, color: string) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 4 + 2,
      });
    }
    particlesRef.current.push(...particles);
  };

  // 播放“噗”声（Web Audio API，无需音频文件）
  const playPopSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = 200 + Math.random() * 100;
    gainNode.gain.value = 0.15;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
    oscillator.stop(audioCtx.currentTime + 0.3);

    // 恢复被用户交互挂起的 AudioContext
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  // 处理戳泡泡
  const popBubble = (index: number, clickX: number, clickY: number, bubble: Bubble) => {
    if (bubble.isIron) {
      // 铁泡泡：需要戳多次
      const newHits = (bubble.ironHits || 0) + 1;
      if (newHits >= 10) {
        // 终于戳破了
        bubblesRef.current.splice(index, 1);
        addExplosion(clickX, clickY, bubble.color);
        playPopSound();
        setPopCount(prev => {
          const newCount = prev + 1;
          const ach = achievements.find(a => a.count === newCount);
          if (ach) showToast(ach.msg);
          return newCount;
        });
      } else {
        // 还没破，更新次数
        bubble.ironHits = newHits;
        showToast(`铁泡泡！还需 ${10 - newHits} 次 💪`);
        // 震动反馈（如果有）
        if (navigator.vibrate) navigator.vibrate(50);
      }
      return;
    }

    // 普通泡泡
    bubblesRef.current.splice(index, 1);
    addExplosion(clickX, clickY, bubble.color);
    playPopSound();
    setPopCount(prev => {
      const newCount = prev + 1;
      const ach = achievements.find(a => a.count === newCount);
      if (ach) showToast(ach.msg);
      return newCount;
    });
  };

  // 绘制
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空
    ctx.clearRect(0, 0, width, height);

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制泡泡
    bubblesRef.current.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

      if (bubble.isIron) {
        // 铁泡泡：灰色渐变
        const grad = ctx.createRadialGradient(bubble.x - 5, bubble.y - 5, 5, bubble.x, bubble.y, bubble.radius);
        grad.addColorStop(0, '#9ca3af');
        grad.addColorStop(1, '#4b5563');
        ctx.fillStyle = grad;
        // 显示剩余次数
        ctx.font = `bold ${bubble.radius * 0.5}px monospace`;
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.fillText(`${10 - (bubble.ironHits || 0)}`, bubble.x - 8, bubble.y + 6);
      } else {
        const grad = ctx.createRadialGradient(bubble.x - 5, bubble.y - 5, 5, bubble.x, bubble.y, bubble.radius);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(1, bubble.color);
        ctx.fillStyle = grad;
      }

      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // 高光
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.radius * 0.2, bubble.y - bubble.radius * 0.2, bubble.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
    });

    // 绘制粒子
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;

      // 计算半径，如果是负数或零则跳过绘制
      const radius = p.size * p.life;
      if (radius > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${p.life * 0.8})`;
        ctx.fill();
      }

      return p.life > 0;
    });
  }, []);

  // 动画循环 + 泡泡浮动
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 让泡泡缓慢浮动 + 边界约束
    bubblesRef.current = bubblesRef.current.map(b => {
      let newX = b.x + (Math.sin(Date.now() * 0.001 * b.radius * 0.1) * 0.3);
      let newY = b.y + (Math.cos(Date.now() * 0.0012 * b.radius * 0.1) * 0.3);

      // 边界约束：不要超出画布边缘（保留一个半径的距离）
      newX = Math.min(Math.max(newX, b.radius), canvas.width - b.radius);
      newY = Math.min(Math.max(newY, b.radius), canvas.height - b.radius);

      return { ...b, x: newX, y: newY };
    });

    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [draw]);

  // 点击处理
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    // 检测铁泡泡彩蛋：连续5次点击同一区域
    const now = Date.now();
    recentClicksRef.current = recentClicksRef.current.filter(c => now - c.time < 2000);
    recentClicksRef.current.push({ x: Math.round(clickX / 10), y: Math.round(clickY / 10), time: now });

    if (recentClicksRef.current.length >= 5) {
      const allSame = recentClicksRef.current.every(c => c.x === recentClicksRef.current[0].x && c.y === recentClicksRef.current[0].y);
      if (allSame) {
        // 生成一个铁泡泡
        const radius = 35;
        bubblesRef.current.push({
          id: Math.random(),
          x: clickX,
          y: clickY,
          radius,
          color: '#6b7280',
          isIron: true,
          ironHits: 0,
        });
        showToast('✨ 触发隐藏彩蛋：铁泡泡出现了！戳10次才能破 ✨');
        recentClicksRef.current = [];
        return;
      }
    }

    // 从后向前遍历（优先戳上层的）
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const dx = clickX - b.x;
      const dy = clickY - b.y;
      if (Math.hypot(dx, dy) < b.radius) {
        popBubble(i, clickX, clickY, b);
        break;
      }
    }

    // 补充一个泡泡
    if (canvas) {
      const newBubble = addOneBubble(canvas.width, canvas.height);
      bubblesRef.current.push(newBubble);
    }
  }, [addOneBubble]);

  // 初始化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      bubblesRef.current = generateBubbles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [generateBubbles, addOneBubble, animate]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className="w-full h-full cursor-pointer block"
        style={{ touchAction: 'none' }}
      />
      {/* 戳破计数器 */}
      <div className="fixed top-4 left-4 bg-black/50 backdrop-blur rounded-full px-4 py-2 text-white font-mono text-sm z-10">
        🫧 戳破: {popCount}
      </div>
      {/* 嘲讽 Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm whitespace-nowrap z-20 animate-fade-in-up">
          {toast}
        </div>
      )}
    </>
  );
}