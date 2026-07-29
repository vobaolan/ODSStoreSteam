import { BaseTool } from './BaseTool';

export class WeatherTool extends BaseTool {
  name = 'weather_tool';
  description = 'Get the current weather and forecast for a specific location. Use this tool when the user asks about the weather, temperature, or rain.';
  parameters = {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city or location to get the weather for, e.g., "Hanoi", "Tokyo", "New York".',
      },
    },
    required: ['location'],
  };

  async execute(args: { location: string }): Promise<any> {
    try {
      // Helper to remove Vietnamese tones for Geocoding API
      const removeVietnameseTones = (str: string) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
      };

      let normalizedLocation = removeVietnameseTones(args.location).toLowerCase();
      
      // Remove common Vietnamese prefixes
      const prefixes = ["thanh pho ", "tp ", "tp.", "tinh ", "quan ", "huyen ", "thi xa "];
      for (const prefix of prefixes) {
        if (normalizedLocation.startsWith(prefix)) {
          normalizedLocation = normalizedLocation.substring(prefix.length).trim();
        }
      }

      // Step 1: Geocoding (Open-Meteo free geocoding API)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedLocation)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return { error: `Could not find coordinates for location: ${args.location}` };
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Weather Data (Open-Meteo free API)
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      const weatherData = await weatherRes.json();

      return {
        location: `${name}, ${country}`,
        current_weather: weatherData.current_weather,
        forecast: weatherData.daily ? {
           dates: weatherData.daily.time,
           max_temp: weatherData.daily.temperature_2m_max,
           min_temp: weatherData.daily.temperature_2m_min,
           rain_probability: weatherData.daily.precipitation_probability_max
        } : null,
      };
    } catch (error: any) {
      return { error: `Failed to fetch weather data: ${error.message}` };
    }
  }
}
