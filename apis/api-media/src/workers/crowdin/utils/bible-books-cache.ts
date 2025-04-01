import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

// Cache for Bible book IDs to avoid repeated database queries
let bookIds = new Set<string>()

export async function initializeBibleBooks(logger?: Logger): Promise<void> {
  const books = await prisma.bibleBook.findMany({
    select: { id: true }
  })
  bookIds = new Set(books.map((book) => book.id))
  logger?.info({ count: books.length }, 'Found existing Bible books')
}

export function hasBook(bookId: string): boolean {
  return bookIds.has(bookId)
}

export function clearBibleBooks(): void {
  bookIds.clear()
}
