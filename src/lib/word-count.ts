export function countWords(text: string): number {
  if (!text.trim()) return 0
  const tibetanSyllables = text.match(/[ༀ-࿿]+/g)
  const tibetanCount = tibetanSyllables
    ? tibetanSyllables.reduce((count, segment) => {
        const syllables = segment.split('་').filter(Boolean)
        return count + syllables.length
      }, 0)
    : 0
  const nonTibetan = text.replace(/[ༀ-࿿་]+/g, ' ').trim()
  const englishCount = nonTibetan ? nonTibetan.split(/\s+/).filter(Boolean).length : 0
  return tibetanCount + englishCount
}
