import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { toast } from 'vue-sonner'

/**
 * Extracts text from a streamed chunk. Supports plain strings (any backend), OpenAI-style
 * `choices[0].delta.content` chunks and `{ text }` / `{ delta: { text } }` objects.
 */
function getChunkText(chunk: unknown): string {
  if (typeof chunk === 'string') return chunk
  if (!chunk || typeof chunk !== 'object') return ''
  const value = chunk as Record<string, any>
  return value.choices?.[0]?.delta?.content ?? value.delta?.text ?? value.text ?? ''
}

export function useAIConversation(editor: Editor) {
  const result = ref<string>('')
  const status = ref<'init' | 'generating' | 'completed'>('init')
  const conversationHistory = ref<Array<{ role: string; content: string }>>([])
  const abortController = ref<AbortController | null>(null)

  async function handleCompletion(context: string, prompt: string) {
    status.value = 'generating'
    result.value = ''
    const AIOptions = editor.extensionManager.extensions.find(e => e.name === 'AI')?.options

    try {
      if (conversationHistory.value.length === 0) {
        conversationHistory.value.push({
          role: 'user',
          content: `Question: ${prompt} Context:${context}`,
        })
      } else {
        conversationHistory.value.push({
          role: 'user',
          content: prompt,
        })
      }

      abortController.value = new AbortController()
      const stream = await AIOptions.completions(conversationHistory.value, abortController.value.signal)
      if (!stream) {
        throw new Error('Failed to create stream')
      }

      let assistantResponse = ''
      let frame = 0
      // Render streamed tokens at most once per frame instead of once per chunk
      const flush = () => {
        frame = 0
        result.value = assistantResponse
      }
      for await (const chunk of stream) {
        assistantResponse += getChunkText(chunk)
        if (!frame) frame = requestAnimationFrame(flush)
      }
      if (frame) cancelAnimationFrame(frame)
      flush()

      conversationHistory.value.push({
        role: 'assistant',
        content: assistantResponse,
      })

      status.value = 'completed'
      return assistantResponse
    } catch (error: any) {
      if (error.name === 'AbortError') {
        status.value = 'init'
      } else {
        toast.error(error?.message ?? 'Failed to generate AI completion')
      }
      throw error
    }
  }

  function resetConversation() {
    result.value = ''
    status.value = 'init'
    conversationHistory.value = []
    abortController.value = null
  }

  const stopGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  return {
    result,
    status,
    conversationHistory,
    handleCompletion,
    resetConversation,
    stopGeneration,
  }
}
