import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import { scopeEditorCss } from '../scripts/scope-css'

const run = (css: string) => postcss([scopeEditorCss()]).process(css, { from: undefined }).css.replace(/\s+/g, ' ')
const G = ':where(.echo-editor-ui,.echo-editor-ui *)'

describe('scope-css', () => {
  it('guards utilities and keeps pseudo-elements last', () => {
    expect(run('.flex{display:flex}')).toBe(`${G}.flex{display:flex}`)
    expect(run('.x::placeholder{color:red}')).toBe(`${G}.x::placeholder{color:red}`)
    expect(run('@media (width>=48rem){.md\\:flex{display:flex}}')).toContain(`${G}.md\\:flex`)
  })

  it('keeps type and universal selectors first', () => {
    expect(run('h1{margin:0}')).toBe(`h1${G}{margin:0}`)
    expect(run('*,::before{box-sizing:border-box}')).toContain(`*${G}`)
    expect(run('*,::before{box-sizing:border-box}')).toContain(`${G}::before`)
  })

  it('moves :root tokens onto the editor roots and scopes .dark', () => {
    const root = run(':root,:host{--background:white}')
    expect(root).toContain('.echo-editor-ui')
    expect(root).not.toContain(':root')
    const dark = run('.dark{--background:black}')
    expect(dark).toContain('.dark .echo-editor-ui')
  })

  it('leaves keyframes alone', () => {
    expect(run('@keyframes spin{from{transform:rotate(0)}to{transform:rotate(1turn)}}')).toBe(
      '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(1turn)}}'
    )
  })
})
