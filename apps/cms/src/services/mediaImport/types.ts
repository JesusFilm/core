export interface ImportStats {
  languagesImported: number
  videosImported: number
  videoVariantsImported: number
  errors: string[]
  duration: number
}

export interface ImportState {
  lastLanguageImport: Date | null
  lastMediaImport: Date | null
}
