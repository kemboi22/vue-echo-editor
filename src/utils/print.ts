/**
 * Collects the CSS rules that style editor content, so printed / exported documents look like the editor.
 * Cross-origin stylesheets cannot be read and are skipped.
 */
export function getContentStyles(selector = '.EchoContentView'): string {
  let css = ''

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[]
    try {
      rules = Array.from(sheet.cssRules || [])
    } catch {
      continue
    }
    for (const rule of rules) {
      if (rule.cssText.includes(selector) || rule instanceof CSSFontFaceRule) {
        css += rule.cssText + '\n'
      }
    }
  }

  return css
}

const escapeHTML = (value: string) =>
  value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/**
 * Wraps editor HTML into a standalone, styled HTML document.
 */
export function createStandaloneHTML(content: string, options: { title?: string; lang?: string } = {}): string {
  const { title = 'Document', lang = document.documentElement.lang || 'en' } = options
  return `<!DOCTYPE html>
<html lang="${escapeHTML(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    body { margin: 0; padding: 24px; font-family: ui-sans-serif, system-ui, sans-serif; }
    @page { margin: 16mm; }
    ${getContentStyles()}
  </style>
</head>
<body class="echo-editor echo-editor-ui">
  <div class="tiptap EchoContentView" translate="no">${content}</div>
</body>
</html>`
}

/**
 * Prints HTML through a hidden iframe (the browser's "Save as PDF" destination produces a PDF).
 * Resolves once the print dialog has been closed.
 */
export function printHTML(content: string, options: { title?: string } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, { position: 'fixed', width: '0', height: '0', border: '0', right: '0', bottom: '0' })
    iframe.setAttribute('aria-hidden', 'true')
    iframe.srcdoc = createStandaloneHTML(content, options)

    const cleanup = () => {
      iframe.remove()
      resolve()
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) {
        iframe.remove()
        reject(new Error('Unable to access the print frame'))
        return
      }
      win.addEventListener('afterprint', cleanup, { once: true })
      // Wait for images and fonts before opening the dialog
      const images = Array.from(win.document.images)
      Promise.all(
        images.map(img => (img.complete ? Promise.resolve() : new Promise(r => img.addEventListener('load', r, { once: true }))))
      ).then(() => {
        win.focus()
        win.print()
      })
    }

    document.body.appendChild(iframe)
  })
}
