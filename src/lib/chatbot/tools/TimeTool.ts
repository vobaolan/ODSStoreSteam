import { BaseTool } from './BaseTool';

export class TimeTool extends BaseTool {
  name = 'time_tool';
  description = 'Get the current time and date for a specific timezone or location. Use this tool when the user asks for the current time, date, or day of the week.';
  parameters = {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The location to get the time for, e.g., "Tokyo", "Vietnam", "New York". Leave empty for system local time.',
      },
    },
  };

  async execute(args: { location?: string }): Promise<any> {
    // In a real production app, we would use an API like WorldTimeAPI
    // Here we will use a simple internal mapping or JS Date as a fallback
    // Since time API isn't strict, we use JS Date and Intl.DateTimeFormat
    
    // Mapping common locations to standard IANA timezones
    const timezoneMap: Record<string, string> = {
      'tokyo': 'Asia/Tokyo',
      'japan': 'Asia/Tokyo',
      'vietnam': 'Asia/Ho_Chi_Minh',
      'hanoi': 'Asia/Ho_Chi_Minh',
      'ho chi minh': 'Asia/Ho_Chi_Minh',
      'new york': 'America/New_York',
      'london': 'Europe/London',
      'paris': 'Europe/Paris',
    };

    let timeZone = undefined;
    if (args.location) {
      const loc = args.location.toLowerCase();
      timeZone = timezoneMap[loc] || undefined; // If not in map, fallback to local
    }

    const now = new Date();
    
    try {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        timeZone,
        dateStyle: 'full',
        timeStyle: 'long',
      }).format(now);
      
      return {
        currentTime: formattedDate,
        location: args.location || 'Local',
        success: true
      };
    } catch (e) {
      return {
        currentTime: now.toISOString(),
        note: 'Could not resolve exact timezone, showing UTC/Local time.',
        success: false
      };
    }
  }
}
