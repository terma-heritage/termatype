export interface DocumentTemplate {
  name: string
  description: string
  content: object
}

export const TEMPLATES: DocumentTemplate[] = [
  {
    name: 'Blank Document',
    description: 'Start with a clean slate',
    content: {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
  },
  {
    name: 'Tibetan Prayer Text',
    description: 'Template for traditional prayer formatting',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'གསོལ་འདེབས།' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'ན་མོ་གུ་རུ། ' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Colophon' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Composed by...' }] },
      ],
    },
  },
  {
    name: 'Translation Project',
    description: 'Side-by-side Tibetan and English',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Translation Title' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tibetan Source' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'བོད་ཡིག་འདིར་འཇོག' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'English Translation' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'English translation here...' }] },
        { type: 'horizontalRule' },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Notes' }] },
        { type: 'paragraph' },
      ],
    },
  },
  {
    name: 'Glossary',
    description: 'Tibetan-English term list with table',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Glossary' }] },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tibetan' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Wylie' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'English' }] }] },
              ],
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'སེམས' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'sems' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'mind' }] }] },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Essay / Article',
    description: 'Standard essay structure',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Author Name — Date' }] },
        { type: 'horizontalRule' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Main Body' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'References' }] },
        { type: 'paragraph' },
      ],
    },
  },
]
