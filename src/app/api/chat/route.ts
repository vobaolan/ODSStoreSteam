import { NextResponse } from 'next/server';
import { aiRouter } from '@/lib/chatbot/AIRouter';
import { toolRegistry } from '@/lib/chatbot/ToolRegistry';
import { WebsiteRAGTool } from '@/lib/chatbot/tools/WebsiteRAGTool';
import { WeatherTool } from '@/lib/chatbot/tools/WeatherTool';
import { CurrencyTool } from '@/lib/chatbot/tools/CurrencyTool';
import { TimeTool } from '@/lib/chatbot/tools/TimeTool';
import { ProductSearchTool } from '@/lib/chatbot/tools/ProductSearchTool';
import { scheduler } from '@/lib/chatbot/Scheduler';
import { Logger } from '@/lib/chatbot/Logger';

// Register tools
let initialized = false;
if (!initialized) {
  toolRegistry.register(new WebsiteRAGTool());
  toolRegistry.register(new WeatherTool());
  toolRegistry.register(new CurrencyTool());
  toolRegistry.register(new TimeTool());
  toolRegistry.register(new ProductSearchTool());
  
  // Start the scheduler for background crawling
  scheduler.start();
  
  initialized = true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const start = Date.now();
    const response = await aiRouter.handleUserMessage(message, history);
    const latency = Date.now() - start;

    Logger.info(`Request processed in ${latency}ms`, { intent: response.source });

    return NextResponse.json({
      answer: response.answer,
      source: response.source,
      documents: response.documents,
    });
  } catch (error: any) {
    Logger.error('Chat API Error', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request', details: error.message },
      { status: 500 }
    );
  }
}
