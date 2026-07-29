import OpenAI from 'openai';
import { Logger } from './Logger';

export class DeepSeekClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateChatCompletion(messages: any[], tools?: any[]) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools,
        tool_choice: tools ? 'auto' : 'none',
      });
      return response.choices[0].message;
    } catch (error) {
      Logger.error('DeepSeek API Error', error);
      throw error;
    }
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();
