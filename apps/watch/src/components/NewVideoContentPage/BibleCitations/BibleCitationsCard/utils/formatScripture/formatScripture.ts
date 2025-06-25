export function formatScripture(verse: string): string {
  const verseWithoutNotes = verse
    // removes ;chapter:verse and any text preceeding
    .replace(/;\d[\s\S]*/, '')
    // removes ,chapter:verse and any text preceeding
    .replace(/,\d:\d[\s\S]*/, '')
    .replace(/\n/g, ' ')
    .trim()
  return verseWithoutNotes
}
