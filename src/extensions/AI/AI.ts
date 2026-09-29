import { Node } from '@tiptap/core'
import ActionButton from './components/AIButton.vue'
import type { GeneralOptions } from '@/type'

export interface MenuItem {
  label: string
  prompt?: string
  children?: MenuItem[]
}
export interface AIOptions extends GeneralOptions<AIOptions> {
  /**
   * Returns the model response as an async iterable of chunks: plain strings, OpenAI-style
   * `choices[0].delta.content` objects or `{ text }` objects.
   */
  completions: (
    history: Array<{ role: string; content: string }>,
    signal?: AbortSignal
  ) => AsyncIterable<unknown> | Promise<AsyncIterable<unknown>>
  /**
   * AI Shortcuts Menu
   */
  shortcuts: MenuItem[]
}

export const AI = Node.create<AIOptions>({
  name: 'AI',
  group: 'block',
  addOptions() {
    return {
      ...(this.parent?.() as AIOptions),
      toolbar: false,
      button: ({ editor, t }) => ({
        component: ActionButton,
        componentProps: {
          icon: 'Sparkles',
          tooltip: t('editor.AI.ask'),
        },
      }),
    }
  },
})
