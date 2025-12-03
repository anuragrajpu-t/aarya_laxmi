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
    const contentType = req.headers.get('content-type') || '';

    let messageText = '';

    if (contentType.includes('application/json')) {
      // JSON payload → convert to readable text
      const json = await req.json().catch(() => null);
      if (!json || typeof json !== 'object') {
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      // Convert the JSON to a pretty text block
      messageText = Object.entries(json)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    } else {
      // Plain text or any other type → send raw text exactly as-is
      messageText = await req.text();
      if (!messageText.trim()) {
        return NextResponse.json(
          { error: 'Empty text body' },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Server not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: messageText }),
      cache: 'no-store',
    });

    const data = await tgRes.json().catch(() => ({}));

    if (!tgRes.ok || data?.ok === false) {
      return NextResponse.json(
        { error: 'Failed to send message to Telegram', details: data },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, result: data.result || null },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected error', details: err?.message || String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
