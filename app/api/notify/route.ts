import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
} as const;  

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const symbol = body?.symbol;
    const price = body?.price;

    if (!symbol || typeof symbol !== 'string' || typeof price === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid payload. Expected { symbol: string, price: number }' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Server not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const text = `Symbol: ${symbol}\nPrice: ${price}`;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      cache: 'no-store',
    });

    const data = await tgRes.json().catch(() => ({}));

    if (!tgRes.ok || (data && data.ok === false)) {
      return NextResponse.json(
        { error: 'Failed to send Telegram message', details: data },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, result: data?.result ?? null },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected error', details: err?.message || String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
