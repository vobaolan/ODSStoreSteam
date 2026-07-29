import { BaseTool } from './tools/BaseTool';
import { Logger } from './Logger';

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  register(tool: BaseTool) {
    if (this.tools.has(tool.name)) {
      Logger.warn(`Tool ${tool.name} is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
    Logger.info(`Registered tool: ${tool.name}`);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getToolSchemas() {
    return this.getAllTools().map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    try {
      Logger.info(`Executing tool ${name} with args`, args);
      const result = await tool.execute(args);
      Logger.info(`Tool ${name} executed successfully`);
      return result;
    } catch (error) {
      Logger.error(`Error executing tool ${name}`, error);
      throw error;
    }
  }
}

export const toolRegistry = new ToolRegistry();
