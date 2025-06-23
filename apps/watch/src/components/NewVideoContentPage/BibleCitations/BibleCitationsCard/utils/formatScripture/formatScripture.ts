export function formatScripture(verse: string): string {
  const verseWithoutNotes = verse.replace(/;\d[\s\S]*/, '')
  return verseWithoutNotes.replace(/\n/g, ' ').trim()
}
