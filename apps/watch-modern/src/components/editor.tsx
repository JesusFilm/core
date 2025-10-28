import Head from 'next/head'
import { useRouter } from 'next/router'
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno'
import { Workspace } from 'polotno/canvas/workspace'
import { PagesTimeline } from 'polotno/pages-timeline'
import { SidePanel } from 'polotno/side-panel'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons'
import { useEffect, useState } from 'react'

import { usePolotnoStore } from '../hooks/usePolotnoStore'
import {
  type ImageAnalysisResult,
  type UserInputData,
  userInputStorage
} from '../libs/storage'

import type { TokenSummary } from './editor/editor-header'
import { EditorHeader } from './editor/editor-header'
import { EditorSessionsList } from './editor/editor-sessions-list'
import { EditorSettingsDialog } from './editor/editor-settings-dialog'
import { EditorSuggestionDialogs } from './editor/editor-suggestion-dialogs'

const summarizeTokens = (tokens?: {
  input: number
  output: number
}): TokenSummary | null => {
  if (!tokens) return null
  const total = tokens.input + tokens.output
  if (total <= 0) return null

  const formattedTotal =
    total >= 1_000_000
      ? `${(total / 1_000_000).toFixed(1)}M`
      : total >= 1_000
        ? `${(total / 1_000).toFixed(1)}K`
        : total.toLocaleString()

  const estimatedCost = Math.max(
    (tokens.input / 1_000_000) * 0.05 + (tokens.output / 1_000_000) * 0.4,
    0.01
  ).toFixed(2)

  const summary: TokenSummary = {
    formattedTotal,
    estimatedCost
  }

  return summary
}

export const Editor = () => {
  const router = useRouter()
  const store = usePolotnoStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [unsplashApiKey, setUnsplashApiKey] = useState('')
  const [savedSessions, setSavedSessions] = useState<UserInputData[]>([])
  const [totalTokensUsed, setTotalTokensUsed] = useState({
    input: 0,
    output: 0
  })
  const [isTokensUpdated, setIsTokensUpdated] = useState(false)
  const [selectedImageForDetails, setSelectedImageForDetails] = useState<
    number | null
  >(null)
  const [imageAnalysisResults, setImageAnalysisResults] = useState<
    ImageAnalysisResult[]
  >([])
  const [showAllIdeas, setShowAllIdeas] = useState(false)
  const [animatingSuggestion, setAnimatingSuggestion] = useState<{
    analysisIndex: number
    ideaIndex: number
  } | null>(null)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(
    new Set()
  )

  const tokenSummary = summarizeTokens(totalTokensUsed)

  // Helper function to get the content type for the header
  const getContentTypeForHeader = () => {
    const contentTypes = imageAnalysisResults
      .filter(
        (result) =>
          result.contentIdeas &&
          result.contentIdeas.length > 0 &&
          !result.isAnalyzing
      )
      .map((result) => result.contentType)
      .filter(Boolean)

    if (contentTypes.length === 0) return 'content'

    // If all content types are the same, use that type
    const uniqueTypes = [...new Set(contentTypes)]
    if (uniqueTypes.length === 1) {
      return uniqueTypes[0].replace(/_/g, ' ')
    }

    // If multiple types, use 'content' as generic term
    return 'content'
  }

  const contentTypeForHeader = getContentTypeForHeader()

  const handleSuggestionSelected = (suggestionKey: string) => {
    setHiddenSuggestions((prev) => {
      const next = new Set(prev)
      next.add(suggestionKey)
      return next
    })
    setAnimatingSuggestion(null)
    setShowAllIdeas(false)
  }

  const navigateTo = (path: string) => {
    router.push(path).catch((error) => {
      console.error(`Failed to navigate to ${path}:`, error)
    })
  }

  const loadSession = (session: UserInputData) => {
    console.log('Loading session:', session)
    const nextAnalysis = Array.isArray(session.imageAnalysisResults)
      ? session.imageAnalysisResults
      : []
    setImageAnalysisResults(nextAnalysis)
    setSelectedImageForDetails(null)
    setTotalTokensUsed(
      session.tokensUsed ?? {
        input: 0,
        output: 0
      }
    )

    // Collapse the "Previous Sessions" section with animation
    setIsSessionsOpen(false)

    // Navigate to the new page and scroll to "Parsed Multi-Step Content" section
    navigateTo('/new#parsed-multi-step-content')
  }

  const deleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      userInputStorage.deleteSession(sessionId)
      setSavedSessions(userInputStorage.getAllSessions())
    }
  }

  // Load saved data on mount
  useEffect(() => {
    const allSessions = userInputStorage.getAllSessions()
    setSavedSessions(allSessions)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jesus-film-studio-openai-api-key')
      const savedUnsplashApiKey = localStorage.getItem(
        'jesus-film-studio-unsplash-api-key'
      )
      if (savedUnsplashApiKey) {
        setUnsplashApiKey(savedUnsplashApiKey)
      }
    }
  }, [])

  // Save Unsplash API key to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && unsplashApiKey) {
      localStorage.setItem('jesus-film-studio-unsplash-api-key', unsplashApiKey)
    }
  }, [unsplashApiKey])

  // Flash token widget when updated
  useEffect(() => {
    if (totalTokensUsed.input > 0 || totalTokensUsed.output > 0) {
      setIsTokensUpdated(true)
      const timer = setTimeout(() => setIsTokensUpdated(false), 1000) // Flash for 1 second
      return () => clearTimeout(timer)
    }
  }, [totalTokensUsed])
  return (
    <>
      <Head data-id="Head">
        <title>Editor | Studio | Jesus Film Project</title>
      </Head>
      <div
        className="min-h-screen bg-stone-100 text-foreground"
        data-id="PageRoot"
      >
        <EditorHeader
          onNavigateHome={() => navigateTo('/')}
          onNavigatePlan={() => navigateTo('/new')}
          onToggleSessions={() => setIsSessionsOpen((value) => !value)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          tokenSummary={tokenSummary}
          isTokensUpdated={isTokensUpdated}
        />
        <EditorSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          unsplashApiKey={unsplashApiKey}
          onUnsplashApiKeyChange={setUnsplashApiKey}
        />
        <EditorSuggestionDialogs
          imageAnalysisResults={imageAnalysisResults}
          selectedImageForDetails={selectedImageForDetails}
          onCloseDetails={() => setSelectedImageForDetails(null)}
          showAllIdeas={showAllIdeas}
          onShowAllIdeasChange={setShowAllIdeas}
          hiddenSuggestions={hiddenSuggestions}
          onSuggestionSelected={handleSuggestionSelected}
          animatingSuggestion={animatingSuggestion}
          contentTypeLabel={contentTypeForHeader}
        />
        <EditorSessionsList
          isOpen={isSessionsOpen}
          sessions={savedSessions}
          onLoad={loadSession}
          onDelete={deleteSession}
          summarizeTokens={summarizeTokens}
        />

        <PolotnoContainer
          style={{
            width: '100vw',
            height: 'calc(100vh - 80px)',
            paddingTop: '0'
          }}
        >
          <link
            rel="stylesheet"
            href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
              body .polotno-workspace-inner .polotno-page-container:after {
              content:'';
                background: #E8E8E8 !important;
                width: 200px !important;
                height: 30px !important;
                bottom: 0 !important;
                right: 0 !important;
                position: absolute !important;
                z-index: 1000 !important;
              }
            `
            }}
          />
          <SidePanelWrap>
            <SidePanel store={store} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} downloadButtonEnabled />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </>
  )
}

export default Editor
