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
}

export interface UserInputData {
  id: string
  timestamp: number
  textContent: string
  images: string[] // Array of image data URLs
  aiResponse?: string // The enhanced content from OpenAI text processing
  aiSteps?: GeneratedStepContent[]
  imageAnalysisResults: ImageAnalysisResult[]
}

const STORAGE_KEY = 'jesus-film-studio-user-inputs'
const CURRENT_SESSION_KEY = 'jesus-film-studio-current-session'

class UserInputStorage {
  private getStoredData(): UserInputData[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load stored data:', error)
      return []
    }
  }

  private saveStoredData(data: UserInputData[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Save current session data
  saveCurrentSession(data: Omit<UserInputData, 'id' | 'timestamp'>): string {
    const sessionData: UserInputData = {
      ...data,
      id: this.generateId(),
      timestamp: Date.now(),
    }

    const existingData = this.getStoredData()
    const updatedData = [sessionData, ...existingData.slice(0, 9)] // Keep only last 10 sessions

    this.saveStoredData(updatedData)

    // Save current session ID
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionData.id)
    }

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
    if (typeof window === 'undefined') return null

    const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)
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
    if (typeof window !== 'undefined') {
      const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)
      if (currentSessionId === sessionId) {
        localStorage.removeItem(CURRENT_SESSION_KEY)
      }
    }
  }

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }

  // Auto-save current working data (for draft-like functionality)
  autoSaveDraft(data: Omit<UserInputData, 'id' | 'timestamp'>): void {
    const draftKey = 'jesus-film-studio-draft'

    if (typeof window !== 'undefined') {
      try {
        // Ensure data is serializable and handle potential issues with imageAnalysisResults
        const sanitizedData = {
          textContent: data.textContent || '',
          images: Array.isArray(data.images) ? data.images : [],
          aiResponse: data.aiResponse || '',
          aiSteps: Array.isArray(data.aiSteps)
            ? data.aiSteps.map((step) => ({
                content: step?.content || '',
                keywords: Array.isArray(step?.keywords)
                  ? step.keywords
                      .filter((keyword): keyword is string => Boolean(keyword))
                      .slice(0, 5)
                  : [],
                mediaPrompt: step?.mediaPrompt || ''
              }))
            : [],
          imageAnalysisResults: Array.isArray(data.imageAnalysisResults)
            ? data.imageAnalysisResults.map(result => ({
                imageSrc: result?.imageSrc || '',
                contentType: result?.contentType || 'unknown',
                extractedText: result?.extractedText || '',
                detailedDescription: result?.detailedDescription || '',
                confidence: result?.confidence || 'unknown',
                contentIdeas: Array.isArray(result?.contentIdeas) ? result.contentIdeas : [],
                isAnalyzing: result?.isAnalyzing || false,
              }))
            : []
        }

        const dataToSave = {
          ...sanitizedData,
          lastSaved: Date.now(),
        }

        // Check if data is too large for localStorage (limit is ~5MB)
        const dataString = JSON.stringify(dataToSave)
        if (dataString.length > 4 * 1024 * 1024) { // 4MB limit to be safe
          console.warn('Draft data too large for localStorage, skipping auto-save')
          return
        }

        localStorage.setItem(draftKey, dataString)
      } catch (error) {
        console.error('Failed to auto-save draft:', error)
        // Don't re-throw the error to prevent app crashes
      }
    }
  }

  // Load draft data
  loadDraft(): (Omit<UserInputData, 'id' | 'timestamp'> & { lastSaved: number }) | null {
    if (typeof window === 'undefined') return null

    try {
      const draft = localStorage.getItem('jesus-film-studio-draft')
      return draft ? JSON.parse(draft) : null
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }

  // Clear draft
  clearDraft(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jesus-film-studio-draft')
    }
  }
}

export const userInputStorage = new UserInputStorage()
