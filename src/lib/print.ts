export function printDocument() {
  const editorEl = document.querySelector('.tiptap.ProseMirror.simple-editor')
  if (!editorEl) return

  const clonedContent = editorEl.cloneNode(true) as HTMLElement

  const printStyles = `
    @page {
      margin: 0;
      size: A4;
    }
    @media print {
      body * { visibility: hidden !important; }
      #termatype-print-container,
      #termatype-print-container * { visibility: visible !important; }
      #termatype-print-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 0.75in 1in;
        box-sizing: border-box;
      }
    }
    #termatype-print-container {
      font-family: "Source Serif 4", "Noto Serif Tibetan", "Source Serif Pro", Georgia, "Palatino Linotype", serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #2C2A26;
    }
    #termatype-print-container h1 { font-size: 24pt; margin: 0 0 12pt; font-weight: 700; }
    #termatype-print-container h2 { font-size: 20pt; margin: 18pt 0 8pt; font-weight: 600; }
    #termatype-print-container h3 { font-size: 16pt; margin: 14pt 0 6pt; font-weight: 600; }
    #termatype-print-container h4 { font-size: 13pt; margin: 12pt 0 4pt; font-weight: 600; }
    #termatype-print-container p { margin: 0 0 8pt; }
    #termatype-print-container ul,
    #termatype-print-container ol { margin: 4pt 0 8pt 20pt; }
    #termatype-print-container blockquote {
      border-left: 3px solid #ccc;
      margin: 8pt 0;
      padding-left: 12pt;
      color: #555;
    }
    #termatype-print-container code {
      font-family: Consolas, monospace;
      font-size: 10pt;
      background: #f5f5f5;
      padding: 1pt 3pt;
      border-radius: 2pt;
    }
    #termatype-print-container pre {
      font-family: Consolas, monospace;
      font-size: 10pt;
      background: #f5f5f5;
      padding: 8pt;
      border-radius: 4pt;
      overflow-x: auto;
    }
    #termatype-print-container img { max-width: 100%; height: auto; }
    #termatype-print-container hr { border: none; border-top: 1px solid #ddd; margin: 12pt 0; }
    #termatype-print-container div[data-type="pageBreak"] { visibility: hidden; height: 0; margin: 0; border: none; page-break-after: always; }
    #termatype-print-container a { color: #B85C3F; text-decoration: underline; }
    #termatype-print-container.lang-bo { line-height: 1.8; }
    #termatype-print-container table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
    #termatype-print-container th,
    #termatype-print-container td { border: 1px solid #ddd; padding: 6pt 8pt; text-align: left; }
    #termatype-print-container th { background: #f5f5f5; font-weight: 600; }
    #termatype-print-container sup .footnote-ref { font-size: 0.75em; font-weight: 600; color: #B85C3F; text-decoration: none; vertical-align: super; }
    #termatype-print-container ol.footnotes { margin-top: 18pt; padding-top: 10pt; border-top: 1px solid #ccc; font-size: 9pt; list-style: decimal; padding-left: 1.5em; color: #555; }
    #termatype-print-container ol.footnotes li { margin-bottom: 4pt; }
    #termatype-print-container ol.footnotes li p { margin: 0; }
  `

  let styleEl = document.getElementById('termatype-print-styles') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'termatype-print-styles'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = printStyles

  let container = document.getElementById('termatype-print-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'termatype-print-container'
    document.body.appendChild(container)
  }
  container.innerHTML = ''
  while (clonedContent.firstChild) {
    container.appendChild(clonedContent.firstChild)
  }

  const cleanup = () => {
    container?.remove()
    styleEl?.remove()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)

  requestAnimationFrame(() => {
    window.print()
  })
}

export async function exportPDF(fileName: string) {
  const editorEl = document.querySelector('.tiptap.ProseMirror.simple-editor')
  if (!editorEl) return

  const html2pdf = (await import('html2pdf.js')).default

  const clone = editorEl.cloneNode(true) as HTMLElement
  clone.style.cssText = `
    font-family: "Source Serif 4", "Noto Serif Tibetan", Georgia, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #2C2A26;
    padding: 0;
    max-width: none;
    width: 100%;
  `

  const pdfName = fileName.replace(/\.[^.]+$/, '') || 'document'

  const instance = html2pdf()
    .set({
      margin: [0.75, 1, 0.75, 1],
      filename: `${pdfName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(clone)

  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeFile } = await import('@tauri-apps/plugin-fs')

    const savePath = await save({
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
      defaultPath: `${pdfName}.pdf`,
    })

    if (!savePath) return

    const blob: Blob = await instance.outputPdf('blob')
    const buffer = await blob.arrayBuffer()
    await writeFile(savePath, new Uint8Array(buffer))
  } catch {
    await instance.save()
  }
}

export async function exportEPUB(fileName: string) {
  const editorEl = document.querySelector('.tiptap.ProseMirror.simple-editor')
  if (!editorEl) {
    console.error('EPUB export: editor element not found')
    return
  }

  try {
    const clone = editorEl.cloneNode(true) as HTMLElement

    clone.querySelectorAll('[data-type="pageBreak"]').forEach(el => el.remove())
    clone.querySelectorAll('.ProseMirror-gapcursor').forEach(el => el.remove())

    const epubName = fileName.replace(/\.[^.]+$/, '') || 'document'

    const chapters: { title: string; content: string }[] = []
    const headings = clone.querySelectorAll('h1, h2')

    if (headings.length === 0) {
      chapters.push({
        title: epubName,
        content: clone.innerHTML,
      })
    } else {
      let currentTitle = epubName
      let currentContent = ''

      for (const child of Array.from(clone.children)) {
        const tag = child.tagName?.toLowerCase()
        if (tag === 'h1' || tag === 'h2') {
          if (currentContent.trim()) {
            chapters.push({ title: currentTitle, content: currentContent })
          }
          currentTitle = child.textContent || 'Untitled'
          currentContent = (child as HTMLElement).outerHTML
        } else {
          currentContent += (child as HTMLElement).outerHTML
        }
      }
      if (currentContent.trim()) {
        chapters.push({ title: currentTitle, content: currentContent })
      }
    }

    const epubCSS = `
      body { font-family: Georgia, "Noto Serif Tibetan", serif; font-size: 12pt; line-height: 1.6; color: #2C2A26; }
      h1 { font-size: 24pt; margin: 0 0 12pt; font-weight: 700; }
      h2 { font-size: 20pt; margin: 18pt 0 8pt; font-weight: 600; }
      h3 { font-size: 16pt; margin: 14pt 0 6pt; font-weight: 600; }
      h4 { font-size: 13pt; margin: 12pt 0 4pt; font-weight: 600; }
      p { margin: 0 0 8pt; }
      blockquote { border-left: 3px solid #ccc; margin: 8pt 0; padding-left: 12pt; color: #555; }
      code { font-family: Consolas, monospace; font-size: 10pt; background: #f5f5f5; padding: 1pt 3pt; }
      pre { font-family: Consolas, monospace; font-size: 10pt; background: #f5f5f5; padding: 8pt; }
      table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
      th, td { border: 1px solid #ddd; padding: 6pt 8pt; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      img { max-width: 100%; height: auto; }
      hr { border: none; border-top: 1px solid #ddd; margin: 12pt 0; }
    `

    const epubMod = await import('epub-gen-memory')
    // Handle both ESM default and CJS interop: epub-gen-memory may be { default: fn } or { default: { default: fn } }
    const epub = typeof epubMod.default === 'function'
      ? epubMod.default
      : (epubMod.default as any)?.default ?? epubMod.default

    if (typeof epub !== 'function') {
      console.error('EPUB export: could not resolve epub-gen-memory export', epubMod)
      alert('EPUB export failed: library could not be loaded.')
      return
    }

    const epubBuffer = await epub(
      {
        title: epubName,
        author: 'TermaType',
        css: epubCSS,
        lang: 'en',
      },
      chapters.map(ch => ({
        title: ch.title,
        content: ch.content,
      }))
    )

    const blob = new Blob([new Uint8Array(epubBuffer)], { type: 'application/epub+zip' })

    try {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const { writeFile } = await import('@tauri-apps/plugin-fs')

      const savePath = await save({
        filters: [{ name: 'EPUB Document', extensions: ['epub'] }],
        defaultPath: `${epubName}.epub`,
      })

      if (!savePath) return

      const buffer = await blob.arrayBuffer()
      await writeFile(savePath, new Uint8Array(buffer))
    } catch {
      // Fallback: download via browser
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${epubName}.epub`
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('EPUB export failed:', err)
    alert(`EPUB export failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}
