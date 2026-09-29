import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a professional writing assistant. Respond based on the user's context:

1. Keep a professional, accurate and objective tone
2. Keep responses clear, coherent and well structured
3. Respond in HTML, preserving all HTML tags, links and styles
4. Support grammar fixes, better sentence structure and formatting while keeping the core meaning
5. Keep code formatting intact when the context contains code
6. Use headings, lists and quotes where they improve readability

Only use the provided context; do not add unrelated information.`

/**
 * AI completions handler for the demo.
 *
 * WARNING: demo only. In production, never expose API keys in the browser — call your own backend,
 * which can stream plain text chunks (from OpenAI, Claude or any other model) back to the editor.
 */
export function createAICompletions() {
  return async (history: Array<{ role: string; content: string }> = [], signal?: AbortSignal) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const baseURL = import.meta.env.VITE_OPENAI_BASE_URL
    const model = import.meta.env.VITE_OPENAI_MODEL

    if (!apiKey || !baseURL || !model) {
      throw new Error('AI is not configured. Copy .env.example to examples/.env and fill in the VITE_OPENAI_* values.')
    }

    const openai = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true })

    return openai.chat.completions.create(
      {
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history] as any,
        temperature: 0.7,
        stream: true,
      },
      { signal }
    )
  }
}
