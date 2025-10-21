export interface ImageAnalysisResult {
  imageSrc: string
  contentType: string
  extractedText: string
  detailedDescription: string
  confidence: string
  contentIdeas: string[]
  isAnalyzing?: boolean
}

export interface GeneratedStepContent {
  content: string
  keywords: string[]
  mediaPrompt: string
  selectedImageUrl?: string
  selectedVideoUrl?: string
}

export interface UserInputData {
  id: string
  timestamp: number
  textContent: string
  images: string[] // Array of image data URLs
  aiResponse?: string // The enhanced content from OpenAI text processing
  aiSteps?: GeneratedStepContent[]
  imageAnalysisResults: ImageAnalysisResult[]
  tokensUsed?: {
    input: number
    output: number
  }
}

const STORAGE_KEYS = {
  sessions: 'jesus-film-studio-user-inputs',
  currentSession: 'jesus-film-studio-current-session',
  draft: 'jesus-film-studio-draft',
} as const

const DRAFT_STORAGE_LIMIT_BYTES = 4 * 1024 * 1024 // 4MB limit to be safe

class UserInputStorage {
  private get storage(): Storage | null {
    return typeof window === 'undefined' ? null : window.localStorage
  }

  private readJSON<T>(key: string, fallback: T, errorMessage: string): T {
    const storage = this.storage
    if (!storage) return fallback

    try {
      const stored = storage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : fallback
    } catch (error) {
      console.error(errorMessage, error)
      return fallback
    }
  }

  private writeJSON(
    key: string,
    value: unknown,
    errorMessage: string,
    onQuotaExceeded?: () => void,
  ): void {
    const storage = this.storage
    if (!storage) return

    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(errorMessage, error)
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        onQuotaExceeded?.()
      }
    }
  }

  private writeJSONWithLimit(
    key: string,
    value: unknown,
    errorMessage: string,
    limitExceededMessage: string,
    sizeLimit: number,
  ): void {
    const storage = this.storage
    if (!storage) return

    try {
      const serialized = JSON.stringify(value)
      if (serialized.length > sizeLimit) {
        console.warn(limitExceededMessage)
        return
      }

      storage.setItem(key, serialized)
    } catch (error) {
      console.error(errorMessage, error)
    }
  }

  private removeItem(key: string): void {
    const storage = this.storage
    storage?.removeItem(key)
  }

  private sanitizeKeywords(keywords: unknown): string[] {
    if (!Array.isArray(keywords)) return []

    return keywords
      .filter((keyword): keyword is string => Boolean(keyword))
      .slice(0, 5)
  }

  private sanitizeSteps(steps: GeneratedStepContent[] | undefined): GeneratedStepContent[] {
    if (!Array.isArray(steps)) return []

    return steps.map(step => ({
      content: step?.content || '',
      keywords: this.sanitizeKeywords(step?.keywords),
      mediaPrompt: step?.mediaPrompt || '',
      selectedImageUrl: typeof step?.selectedImageUrl === 'string' ? step.selectedImageUrl : undefined,
      selectedVideoUrl: typeof step?.selectedVideoUrl === 'string' ? step.selectedVideoUrl : undefined,
    }))
  }

  private sanitizeImageAnalysis(
    results: ImageAnalysisResult[] | undefined,
  ): ImageAnalysisResult[] {
    if (!Array.isArray(results)) return []

    return results.map(result => ({
      imageSrc: result?.imageSrc || '',
      contentType: result?.contentType || 'unknown',
      extractedText: result?.extractedText || '',
      detailedDescription: result?.detailedDescription || '',
      confidence: result?.confidence || 'unknown',
      contentIdeas: Array.isArray(result?.contentIdeas)
        ? result.contentIdeas.filter((idea): idea is string => Boolean(idea))
        : [],
      isAnalyzing: Boolean(result?.isAnalyzing),
    }))
  }

  private sanitizeDraftData(data: Omit<UserInputData, 'id' | 'timestamp'>) {
    return {
      textContent: data.textContent || '',
      images: Array.isArray(data.images) ? data.images : [],
      aiResponse: data.aiResponse || '',
      aiSteps: this.sanitizeSteps(data.aiSteps),
      imageAnalysisResults: this.sanitizeImageAnalysis(data.imageAnalysisResults),
    }
  }

  private getStoredData(): UserInputData[] {
    return this.readJSON<UserInputData[]>(
      STORAGE_KEYS.sessions,
      [],
      'Failed to load stored data:',
    )
  }

  private saveStoredData(data: UserInputData[]): void {
    this.writeJSON(
      STORAGE_KEYS.sessions,
      data,
      'Failed to save data:',
      () =>
        console.warn(
          'localStorage quota exceeded. Try running cleanup: userInputStorage.cleanupImageData()',
        ),
    )
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Save current session data
  saveCurrentSession(data: Omit<UserInputData, 'id' | 'timestamp'>): string {
    // Automatically cleanup images from previous sessions to prevent quota exceeded errors
    this.cleanupImageData()

    const sessionData: UserInputData = {
      ...data,
      id: this.generateId(),
      timestamp: Date.now(),
    }

    const existingData = this.getStoredData()
    const updatedData = [sessionData, ...existingData.slice(0, 9)] // Keep only last 10 sessions

    this.saveStoredData(updatedData)

    // Save current session ID
    const storage = this.storage
    storage?.setItem(STORAGE_KEYS.currentSession, sessionData.id)

    return sessionData.id
  }

  // Update existing session
  updateSession(sessionId: string, data: Partial<Omit<UserInputData, 'id' | 'timestamp'>>): void {
    const existingData = this.getStoredData()
    const sessionIndex = existingData.findIndex(session => session.id === sessionId)

    if (sessionIndex !== -1) {
      existingData[sessionIndex] = {
        ...existingData[sessionIndex],
        ...data,
      }
      this.saveStoredData(existingData)
    }
  }

  // Get current session data
  getCurrentSession(): UserInputData | null {
    const storage = this.storage
    if (!storage) return null

    const currentSessionId = storage.getItem(STORAGE_KEYS.currentSession)
    if (!currentSessionId) return null

    const allData = this.getStoredData()
    return allData.find(session => session.id === currentSessionId) || null
  }

  // Get all saved sessions
  getAllSessions(): UserInputData[] {
    return this.getStoredData()
  }

  // Delete a specific session
  deleteSession(sessionId: string): void {
    const existingData = this.getStoredData()
    const filteredData = existingData.filter(session => session.id !== sessionId)
    this.saveStoredData(filteredData)

    // Clear current session if it was deleted
    const storage = this.storage
    if (storage) {
      const currentSessionId = storage.getItem(STORAGE_KEYS.currentSession)
      if (currentSessionId === sessionId) {
        storage.removeItem(STORAGE_KEYS.currentSession)
      }
    }
  }

  // Clear all data
  clearAll(): void {
    this.removeItem(STORAGE_KEYS.sessions)
    this.removeItem(STORAGE_KEYS.currentSession)
  }

  // Cleanup images from all sessions while preserving analysis data
  cleanupImageData(): { sessionsProcessed: number; imagesRemoved: number; spaceSaved: number } {
    const existingData = this.getStoredData()
    let imagesRemoved = 0
    let spaceSaved = 0

    const cleanedData = existingData.map(session => {
      if (session.images && session.images.length > 0) {
        // Calculate space saved (rough estimate)
        const imagesSize = JSON.stringify(session.images).length
        spaceSaved += imagesSize
        imagesRemoved += session.images.length

        // Return session with images cleared but analysis data preserved
        return {
          ...session,
          images: [] // Clear the images array
        }
      }
      return session
    })

    // Only save if there were changes
    if (imagesRemoved > 0) {
      this.saveStoredData(cleanedData)
      console.log(`Storage cleanup completed: ${imagesRemoved} images removed from ${existingData.length} sessions, ~${Math.round(spaceSaved / 1024)}KB saved`)
    }

    return {
      sessionsProcessed: existingData.length,
      imagesRemoved,
      spaceSaved
    }
  }

  // Auto-save current working data (for draft-like functionality)
  autoSaveDraft(data: Omit<UserInputData, 'id' | 'timestamp'>): void {
    try {
      const dataToSave = {
        ...this.sanitizeDraftData(data),
        lastSaved: Date.now(),
      }

      this.writeJSONWithLimit(
        STORAGE_KEYS.draft,
        dataToSave,
        'Failed to auto-save draft:',
        'Draft data too large for localStorage, skipping auto-save',
        DRAFT_STORAGE_LIMIT_BYTES,
      )
    } catch (error) {
      console.error('Failed to auto-save draft:', error)
      // Don't re-throw the error to prevent app crashes
    }
  }

  // Load draft data
  loadDraft(): (Omit<UserInputData, 'id' | 'timestamp'> & { lastSaved: number }) | null {
    return this.readJSON<
      (Omit<UserInputData, 'id' | 'timestamp'> & { lastSaved: number }) | null
    >(
      STORAGE_KEYS.draft,
      null,
      'Failed to load draft:',
    )
  }

  // Clear draft
  clearDraft(): void {
    this.removeItem(STORAGE_KEYS.draft)
  }
}

export const userInputStorage = new UserInputStorage()

// Export the class for testing
export { UserInputStorage }
