import { Image } from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-alignment') || 'center',
        renderHTML: (attributes: Record<string, any>) => ({
          'data-alignment': attributes.alignment,
        }),
      },
      widthPercent: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const val = element.getAttribute('data-width-percent')
          return val ? Number(val) : null
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.widthPercent) return {}
          return {
            'data-width-percent': attributes.widthPercent,
            style: `width: ${attributes.widthPercent}%`,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes['data-alignment'] || 'center'
    const isFloat = alignment === 'float-left' || alignment === 'float-right'

    // Build wrapper attributes
    const wrapperAttrs: Record<string, string> = {
      class: `image-wrapper image-align-${alignment}`,
    }

    // For float, also set float CSS directly on wrapper
    if (isFloat) {
      wrapperAttrs.style = `float: ${alignment === 'float-left' ? 'left' : 'right'}`
    }

    return [
      'figure',
      wrapperAttrs,
      ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
    ]
  },

  parseHTML() {
    return [
      {
        tag: 'figure.image-wrapper img',
      },
      {
        tag: 'img[src]',
      },
    ]
  },
})

export default CustomImage
