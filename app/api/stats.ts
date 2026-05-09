import { NextResponse } from 'next/server';

// 纯属娱乐的伪数据
let globalPopCount = 0;

export async function GET() {
  return NextResponse.json({ total: globalPopCount });
}

export async function POST() {
  globalPopCount += Math.floor(Math.random() * 10) + 1;
  return NextResponse.json({ success: true, total: globalPopCount });
}