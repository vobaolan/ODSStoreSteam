import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing DeepSeek...');
  const client = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const response = await client.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Success:', response.choices[0].message);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
