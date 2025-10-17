import {
  Bot,
  Check,
  Copy,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  Loader2,
  Settings,
  Sparkles,
  X
} from 'lucide-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { unstable_setAnimationsEnabled } from 'polotno/config';
import { createStore } from 'polotno/model/store';
import { PagesTimeline } from 'polotno/pages-timeline';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import React, { useEffect, useState } from 'react';

import {
  type GeneratedStepContent,
  type UserInputData,
  userInputStorage
} from '../libs/storage'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

// Enable animations
unstable_setAnimationsEnabled(true);

const initialState = `{"width":1100,"height":600,"fonts":[],"pages":[{"id":"w7fbBNiwJP","children":[{"id":"bJknTigMO5","type":"text","name":"","opacity":1,"visible":true,"selectable":true,"removable":true,"alwaysOnTop":false,"showInExport":true,"x":382.64917811216264,"y":288.06050717606604,"width":334.7016437756747,"height":63,"rotation":0,"animations":[],"blurEnabled":false,"blurRadius":10,"brightnessEnabled":false,"brightness":0,"sepiaEnabled":false,"grayscaleEnabled":false,"filters":{},"shadowEnabled":false,"shadowBlur":5,"shadowOffsetX":0,"shadowOffsetY":0,"shadowColor":"black","shadowOpacity":1,"draggable":true,"resizable":true,"contentEditable":true,"styleEditable":true,"text":"Adventure","placeholder":"","fontSize":51.36334494207179,"fontFamily":"Rock Salt","fontStyle":"italic","fontWeight":"normal","textDecoration":"","fill":"rgba(0,0,0,1)","align":"center","verticalAlign":"top","strokeWidth":0,"stroke":"black","lineHeight":1.2,"letterSpacing":0,"backgroundEnabled":false,"backgroundColor":"#7ED321","backgroundOpacity":1,"backgroundCornerRadius":0.5,"backgroundPadding":0.5},{"id":"m-FOpeqqqN","type":"text","name":"","opacity":1,"visible":true,"selectable":true,"removable":true,"alwaysOnTop":false,"showInExport":true,"x":429.31035134300527,"y":250.3034788934478,"width":106.65521542160857,"height":33,"rotation":0,"animations":[],"blurEnabled":false,"blurRadius":10,"brightnessEnabled":false,"brightness":0,"sepiaEnabled":false,"grayscaleEnabled":false,"filters":{},"shadowEnabled":false,"shadowBlur":5,"shadowOffsetX":0,"shadowOffsetY":0,"shadowColor":"black","shadowOpacity":1,"draggable":true,"resizable":true,"contentEditable":true,"styleEditable":true,"text":"Life is an ","placeholder":"","fontSize":26.165954672341524,"fontFamily":"Quattrocento","fontStyle":"normal","fontWeight":"bold","textDecoration":"","fill":"rgba(0,0,0,1)","align":"left","verticalAlign":"top","strokeWidth":0,"stroke":"black","lineHeight":1.2,"letterSpacing":0,"backgroundEnabled":false,"backgroundColor":"#7ED321","backgroundOpacity":1,"backgroundCornerRadius":0.5,"backgroundPadding":0.5}],"width":"auto","height":"auto","background":"white","bleed":0,"duration":5000},{"id":"hp97ZkZDYa","children":[],"width":"auto","height":"auto","background":"white","bleed":0,"duration":5000}],"audios":[],"unit":"px","dpi":72}`;

const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T', // you can create it here: https://polotno.com/cabinet/
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});
// Don't preload initial state - let useEffect handle loading

export const Editor = () => {
  const router = useRouter()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [unsplashApiKey, setUnsplashApiKey] = useState('')
  const [savedSessions, setSavedSessions] = useState<UserInputData[]>([])
  const [totalTokensUsed, setTotalTokensUsed] = useState({
    input: 0,
    output: 0
  })
  const [isTokensUpdated, setIsTokensUpdated] = useState(false)
  const [selectedImageForDetails, setSelectedImageForDetails] = useState<number | null>(null)
  const [imageAnalysisResults, setImageAnalysisResults] = useState<Array<{
    imageSrc: string
    contentType: string
    extractedText: string
    detailedDescription: string
    confidence: string
    contentIdeas: string[]
    isAnalyzing: boolean
  }>>([])
  const [showAllIdeas, setShowAllIdeas] = useState(false)
  const [animatingSuggestion, setAnimatingSuggestion] = useState<{
    analysisIndex: number
    ideaIndex: number
  } | null>(null)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(new Set())

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

  const loadSession = (session: UserInputData) => {
    // Implementation would go here if needed
    console.log('Loading session:', session)
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
  useEffect(() => {
    const loadDesign = async () => {
      const getDefaultDesign = () => JSON.parse(initialState);

      if (typeof window !== 'undefined') {
        const storedDesign = window.localStorage.getItem(
          'studio-polotno-design'
        );
        try {
          if (storedDesign) {
            await store.loadJSON(JSON.parse(storedDesign));
          } else {
            await store.loadJSON(getDefaultDesign());
          }
        } catch (error) {
          console.error('Failed to load design for Polotno editor:', error);
          await store.loadJSON(getDefaultDesign());
        } finally {
          window.localStorage.removeItem('studio-polotno-design');
          window.localStorage.removeItem('studio-polotno-design-meta');
        }
      } else {
        await store.loadJSON(getDefaultDesign());
      }

      if (store.pages.length === 0) {
        store.addPage();
      }
    };

    void loadDesign();
  }, []);

  return (
    <>
      <Head data-id="Head">
        <title>Editor | Studio | Jesus Film Project</title>
      </Head>
      <div className="min-h-screen bg-stone-100 text-foreground" data-id="PageRoot">
        <header className="border-b border-border bg-background backdrop-blur" data-id="Header">
          <div className="container mx-auto px-4 py-6" data-id="HeaderContainer">
            <div className="flex items-center justify-between" data-id="HeaderRow">
              <div className="flex items-center gap-4" data-id="HeaderBranding">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img
                      src="/jesusfilm-sign.svg"
                      alt="Jesus Film Project"
                      width={24}
                      height={24}
                      className="h-6 w-auto"
                    />
                    <span className="text-2xl font-bold text-foreground">Studio</span>
                  </button>
                  <span className="text-muted-foreground">{'>'}</span>
                  <button
                    onClick={() => router.push('/new')}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Plan
                  </button>
                  <span className="text-muted-foreground">{'>'}</span>
                  <span className="text-lg font-medium text-foreground">Edit</span>
                </div>
              </div>
              <div className="flex items-center gap-4" data-id="HeaderActions">
                {(totalTokensUsed.input > 0 || totalTokensUsed.output > 0) && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                      isTokensUpdated ? 'bg-red-500 text-white' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={
                        isTokensUpdated ? 'text-white' : 'text-muted-foreground'
                      }
                    >
                      Tokens:
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const total =
                          totalTokensUsed.input + totalTokensUsed.output
                        if (total >= 1000000) {
                          return `${(total / 1000000).toFixed(1)}M`
                        } else if (total >= 1000) {
                          return `${(total / 1000).toFixed(1)}K`
                        }
                        return total.toLocaleString()
                      })()}
                    </span>
                    <span
                      className={
                        isTokensUpdated ? 'text-white' : 'text-muted-foreground'
                      }
                    >
                      •
                    </span>
                    <span className="font-medium">
                      $
                      {Math.max(
                        (totalTokensUsed.input / 1000000) * 0.05 +
                          (totalTokensUsed.output / 1000000) * 0.4,
                        0.01
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
                  onClick={() => setIsSessionsOpen(v => !v)}
                >
                  <History className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
                  <span className="sr-only">Sessions</span>
                </Button>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
                    >
                      <Settings className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                      <DialogDescription>
                        Configure your API keys and preferences.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium">
                          OpenAI Access
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Responses are now powered by a secure, server-managed OpenAI connection. No personal API key is required.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="unsplash-api-key"
                          className="text-sm font-medium"
                        >
                          Unsplash Access Key
                        </label>
                        <Input
                          id="unsplash-api-key"
                          type="password"
                          placeholder="Enter your Unsplash Access Key..."
                          value={unsplashApiKey}
                          onChange={(e) => setUnsplashApiKey(e.target.value)}
                          className={`w-full ${unsplashApiKey && !/^[A-Za-z0-9_-]{40,80}$/.test(unsplashApiKey) ? 'border-red-500' : ''}`}
                        />
                        {unsplashApiKey && !/^[A-Za-z0-9_-]{40,80}$/.test(unsplashApiKey) && (
                          <p className="text-xs text-red-600 mt-1">
                            Access Key appears to be invalid format. Should be 40-80 characters.
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Your Unsplash Access Key is used to fetch relevant
                            images for content steps. Get one from{' '}
                            <a
                              href="https://unsplash.com/developers"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Unsplash Developers
                            </a>
                            . It will be stored locally in your browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* AI Analysis Details Dialog */}
                <Dialog
                  open={selectedImageForDetails !== null}
                  onOpenChange={() => setSelectedImageForDetails(null)}
                >
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>AI Image Analysis Details</DialogTitle>
                      <DialogDescription>
                        Detailed analysis of the selected image by AI
                      </DialogDescription>
                    </DialogHeader>
                    {selectedImageForDetails !== null &&
                      (() => {
                        const analysis =
                          imageAnalysisResults[selectedImageForDetails]
                        return (
                          <div className="space-y-6">
                            {/* Image preview */}
                            <div className="flex justify-center">
                              <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted border">
                                <img
                                  src={analysis?.imageSrc}
                                  alt={`Image ${selectedImageForDetails + 1}`}
                                  width={256}
                                  height={256}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Analysis results */}
                            {analysis?.isAnalyzing ? (
                              <div className="flex items-center justify-center gap-2 py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <span>Analyzing image...</span>
                              </div>
                            ) : analysis ? (
                              <div className="space-y-4">
                                {/* Content type and confidence */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">
                                    Content Type:
                                  </span>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full ${
                                      analysis.contentType === 'bible_picture'
                                        ? 'bg-blue-100 text-blue-800'
                                        : analysis.contentType ===
                                            'devotional_picture'
                                          ? 'bg-green-100 text-green-800'
                                          : analysis.contentType ===
                                              'church_service_slide'
                                            ? 'bg-purple-100 text-purple-800'
                                            : analysis.contentType ===
                                                'scripture_verse'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {analysis.contentType
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full ml-2 ${
                                      analysis.confidence === 'high'
                                        ? 'bg-green-100 text-green-800'
                                        : analysis.confidence === 'medium'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-primary/10 text-primary'
                                    }`}
                                  >
                                    {analysis.confidence} confidence
                                  </span>
                                </div>

                                {/* Extracted text */}
                                {analysis.extractedText && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Extracted Text:
                                    </h4>
                                    <div className="p-3 bg-muted rounded-lg border">
                                      <p className="text-sm font-mono whitespace-pre-wrap">
                                        {analysis.extractedText}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Content ideas */}
                                {Array.isArray(analysis.contentIdeas) &&
                                  analysis.contentIdeas.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        Content Ideas:
                                      </h4>
                                      <div className="space-y-2">
                                        {analysis.contentIdeas.map(
                                          (idea, ideaIndex) => (
                                            <div
                                              key={ideaIndex}
                                              className="text-xs px-3 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
                                            >
                                              {typeof idea === 'string'
                                                ? idea
                                                : JSON.stringify(idea)}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Detailed description */}
                                {analysis.detailedDescription && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Detailed Description:
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {analysis.detailedDescription}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>
                                  No analysis available. Try again once the AI proxy finishes processing, or re-run the analysis.
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                  </DialogContent>
                </Dialog>

                {/* See All Ideas Dialog */}
                <Dialog open={showAllIdeas} onOpenChange={setShowAllIdeas}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        All Content Ideas for {getContentTypeForHeader()}
                      </DialogTitle>
                      <DialogDescription>
                        Click any idea below to add it to your content. These
                        ideas are tailored to your uploaded images.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {imageAnalysisResults
                        .filter(
                          (result) =>
                            result.contentIdeas &&
                            result.contentIdeas.length > 0 &&
                            !result.isAnalyzing
                        )
                        .map((analysis, analysisIndex) => (
                          <div key={analysisIndex} className="space-y-3">
                            {analysisIndex > 0 && (
                              <hr className="border-border" />
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border flex-shrink-0">
                                <img
                                  src={analysis.imageSrc}
                                  alt={`Image ${analysisIndex + 1}`}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                Ideas from Image {analysisIndex + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Array.isArray(analysis.contentIdeas) &&
                                analysis.contentIdeas.map((idea, ideaIndex) => {
                                  const suggestionKey = `modal-${analysisIndex}-${ideaIndex}`
                                  if (hiddenSuggestions.has(suggestionKey))
                                    return null

                                  return (
                                    <div
                                      key={ideaIndex}
                                      className={`relative p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:scale-102 transition-all duration-200 ${
                                        animatingSuggestion?.analysisIndex ===
                                          analysisIndex &&
                                        animatingSuggestion?.ideaIndex ===
                                          ideaIndex
                                          ? 'animate-suggestion-disappear opacity-100'
                                          : 'opacity-0 animate-fade-in-up transition-all duration-300'
                                      }`}
                                      style={{
                                        animationDelay: `${0.4 + (analysisIndex * analysis.contentIdeas.length + ideaIndex) * 0.1}s`,
                                        animationFillMode: 'forwards'
                                      }}
                                      onClick={() => {
                                        // Animation logic would go here if needed
                                        setHiddenSuggestions((prev) =>
                                          new Set(prev).add(suggestionKey)
                                        )
                                        setAnimatingSuggestion(null)
                                        setShowAllIdeas(false)
                                      }}
                                    >
                                      <p className="text-sm text-gray-800 leading-relaxed">
                                        {typeof idea === 'string'
                                          ? idea
                                          : JSON.stringify(idea)}
                                      </p>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Previous Sessions */}
        {isSessionsOpen && savedSessions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="border border-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Previous Sessions</span>
              </div>
              <div className="space-y-3">
                {savedSessions.map((session) => (
                  <div key={session.id} className="p-3 border-muted">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {session.textContent.substring(0, 60)}...
                          </h4>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>
                            {new Date(session.timestamp).toLocaleString()}
                          </p>
                          <p>
                            {session.images.length} images •{' '}
                            {session.aiResponse
                              ? `Has AI response${session.tokensUsed && (session.tokensUsed.input > 0 || session.tokensUsed.output > 0) ? ` • Tokens: ${(() => {
                                  const total = session.tokensUsed.input + session.tokensUsed.output
                                  if (total >= 1000000) {
                                    return `${(total / 1000000).toFixed(1)}M`
                                  } else if (total >= 1000) {
                                    return `${(total / 1000).toFixed(1)}K`
                                  }
                                  return total.toLocaleString()
                                })()} • $${(session.tokensUsed.input / 1000000) * 0.05 + (session.tokensUsed.output / 1000000) * 0.4 >= 0.01 ? ((session.tokensUsed.input / 1000000) * 0.05 + (session.tokensUsed.output / 1000000) * 0.4).toFixed(3) : '0.000'}` : ''}`
                              : 'No AI response'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSession(session)}
                          className="h-7 px-2 text-xs"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSession(session.id)}
                          className="h-7 px-2 text-xs text-primary hover:text-primary"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <PolotnoContainer style={{ width: '100vw', height: 'calc(100vh - 80px)', paddingTop: '0' }}>
          <link
            rel="stylesheet"
            href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
          />
          <style dangerouslySetInnerHTML={{
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
          }} />
          <SidePanelWrap>
            {/* <SidePanel store={store} /> */}
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
  );
};

export default Editor;
