import { deepSeekClient } from './DeepSeekClient';
import { toolRegistry } from './ToolRegistry';
import { Logger } from './Logger';

export class AIRouter {
  private systemPrompt = `You are the official AI assistant of this website.

Rules:
1. If CONTEXT is provided, answer ONLY using the provided context.
2. Never fabricate website information.
3. If the answer comes from an external API, respond naturally using that data.
4. If the question is general knowledge, answer normally.
5. If information cannot be found, state that clearly.
6. You MUST ALWAYS respond entirely in Vietnamese.
7. DO NOT include any XML tags, HTML tags, or meta tags like <translation> in your output. Output only raw, natural text.
8. Communicate naturally and conversationally like a human assistant. DO NOT output raw database enum values. For example, convert "AUTO_KEY" to "giao key tự động", "GIFT_ACC" to "giao gift tài khoản", "STEAM" to "Steam", and format prices nicely.`;

  async handleUserMessage(userMessage: string, history: any[] = []): Promise<{ answer: string, source: string, documents: any[] }> {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const tools = toolRegistry.getToolSchemas();
    let source = 'deepseek';
    let documents: any[] = [];

    Logger.info(`Handling user message: ${userMessage}`);

    try {
      // Step 1: Send message to DeepSeek to get intent/tool calls
      const responseMessage = await deepSeekClient.generateChatCompletion(messages, tools.length > 0 ? tools : undefined);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Step 2: DeepSeek wants to call one or more tools
        const toolCall = responseMessage.tool_calls[0]; // For simplicity, handle first tool call
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        Logger.info(`AI Router selected tool: ${toolName}`);

        // Execute the tool
        const toolResult = await toolRegistry.executeTool(toolName, toolArgs);

        if (toolName === 'website_rag') {
          source = 'website';
          documents = toolResult.documents || [];
          // Append context to the conversation
          messages.push({
             role: 'system',
             content: `CONTEXT RETRIEVED FROM WEBSITE:\n${toolResult.context}`
          });
        } else if (toolName === 'weather_tool') {
          source = 'weather';
          messages.push({
             role: 'system',
             content: `WEATHER DATA API RESULT:\n${JSON.stringify(toolResult)}`
          });
        } else if (toolName === 'currency_tool') {
          source = 'currency';
          messages.push({
             role: 'system',
             content: `CURRENCY API RESULT:\n${JSON.stringify(toolResult)}`
          });
        } else if (toolName === 'time_tool') {
          source = 'time';
          messages.push({
             role: 'system',
             content: `TIME API RESULT:\n${JSON.stringify(toolResult)}`
          });
        } else {
           source = toolName;
           messages.push({
             role: 'system',
             content: `TOOL ${toolName} RESULT:\n${JSON.stringify(toolResult)}`
          });
        }

        // Step 3: Get final response from DeepSeek incorporating tool output
        const finalResponse = await deepSeekClient.generateSimpleResponse(messages);
        return {
          answer: finalResponse.content || '',
          source,
          documents
        };

      } else {
        // No tools called, general knowledge
        source = 'deepseek';
        return {
          answer: responseMessage.content || '',
          source,
          documents: []
        };
      }
    } catch (error) {
      Logger.error('Error in AI Router', error);
      throw error;
    }
  }
}

export const aiRouter = new AIRouter();
