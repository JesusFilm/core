export interface RandomPickOptions {
  seed?: string | number
  random?: () => number
}

export interface RandomPickResult<T> {
  value: T
  index: number
}

export function randomPick<T>(
  items: readonly T[],
  options: RandomPickOptions = {}
): RandomPickResult<T> {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty collection')
  }

  const randomFn = resolveRandom(options)
  const randomValue = normaliseRandom(randomFn())
  const index = Math.floor(randomValue * items.length)

  return {
    value: items[index],
    index
  }
}

function resolveRandom(options: RandomPickOptions): () => number {
  if (options.random != null) return options.random
  if (options.seed != null) return createSeededRandom(options.seed)
  return Math.random
}

function normaliseRandom(value: number): number {
  if (!Number.isFinite(value)) return 0

  const normalised = Math.abs(value % 1)
  return normalised === 1 ? 0 : normalised
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return function (): number {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

function mulberry32(a: number): () => number {
  return function (): number {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSeededRandom(seed: string | number): () => number {
  const seedFn = xmur3(String(seed))
  const a = seedFn()
  return mulberry32(a)
}
