import { BaseTool } from './BaseTool';

export class CurrencyTool extends BaseTool {
  name = 'currency_tool';
  description = 'Get exchange rates or convert currency amounts. Use this tool when the user asks about currency exchange rates, USD to VND, EUR to JPY, etc.';
  parameters = {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        description: 'The currency code to convert from (e.g., "USD", "EUR"). Default is USD.',
      },
      to: {
        type: 'string',
        description: 'The currency code to convert to (e.g., "VND", "JPY").',
      },
      amount: {
        type: 'number',
        description: 'The amount to convert. Default is 1.',
      }
    },
    required: ['to'],
  };

  async execute(args: { from?: string, to: string, amount?: number }): Promise<any> {
    try {
      const from = (args.from || 'USD').toUpperCase();
      const to = args.to.toUpperCase();
      const amount = args.amount || 1;

      // Using a free open API for exchange rates
      const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      
      if (!res.ok) {
        // Frankfurter doesn't support all currencies (like VND), fallback to open.er-api.com
        const fallbackRes = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const fallbackData = await fallbackRes.json();
        
        if (fallbackData.result === 'success' && fallbackData.rates[to]) {
           const rate = fallbackData.rates[to];
           return {
             from,
             to,
             rate,
             amount,
             result: amount * rate,
             last_updated: fallbackData.time_last_update_utc
           };
        }
        return { error: `Could not fetch exchange rate for ${from} to ${to}.` };
      }

      const data = await res.json();
      const rate = data.rates[to];

      if (!rate) {
        return { error: `Exchange rate for ${to} not found in the response.` };
      }

      return {
        from,
        to,
        rate,
        amount,
        result: amount * rate,
        last_updated: data.date
      };
    } catch (error: any) {
      return { error: `Failed to fetch currency data: ${error.message}` };
    }
  }
}
