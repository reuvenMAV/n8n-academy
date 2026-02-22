import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
});

export async function POST(request: Request) {
  const body = await request.json();
  const { message, lessonId, canvasGraph } = body as {
    message: string;
    lessonId?: string;
    canvasGraph?: { nodes: unknown[]; edges: unknown[] };
  };
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }
  const graphStr = canvasGraph
    ? JSON.stringify({ nodes: canvasGraph.nodes, edges: canvasGraph.edges }, null, 0)
    : 'none';
  const systemContent = `You are an expert N8N instructor. The user is working on lesson ${lessonId ?? 'general'}. Their current workflow: ${graphStr}. Help them debug and learn. Answer in the same language the user writes in (Hebrew or English). Keep answers concise and practical.`;
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ],
      stream: true,
    });
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });
    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'OpenAI request failed. Use mock or set OPENAI_API_KEY.' },
      { status: 502 }
    );
  }
}
