export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: any; // JSON Schema for parameters

  /**
   * Execute the tool with the given parameters.
   * @param args The parameters passed to the tool by the AI Router.
   * @returns A string or object representing the result of the tool execution.
   */
  abstract execute(args: any): Promise<any>;
}
