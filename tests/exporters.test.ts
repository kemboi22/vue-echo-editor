import { describe, expect, it } from 'vitest'
import { escapeRTF, jsonToRTF } from '@/extensions/Export/exporters'

describe('RTF exporter', () => {
  it('escapes control characters and unicode', () => {
    expect(escapeRTF('a{b}\\c')).toBe('a\\{b\\}\\\\c')
    expect(escapeRTF('é')).toBe('\\u233?')
    // Characters outside the BMP become a surrogate pair of signed 16-bit units
    expect(escapeRTF('😀')).toBe('\\u-10179?\\u-8704?')
  })

  it('serialises headings, marks and lists', () => {
    const rtf = jsonToRTF({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' plain' },
          ],
        },
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item' }] }] }],
        },
      ],
    })
    expect(rtf.startsWith('{\\rtf1')).toBe(true)
    expect(rtf).toContain('\\b\\fs48 Title')
    expect(rtf).toContain('{\\b bold}')
    expect(rtf).toContain('\\bullet\\tab item')
    expect(rtf.endsWith('}')).toBe(true)
  })
})
