const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function groqChatCompletion(options, retries = 2) {
  const timeoutMs = 30000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await groq.chat.completions.create(
        { ...options },
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = Math.pow(2, attempt) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { groqChatCompletion };
