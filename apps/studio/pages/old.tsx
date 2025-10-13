import {
  Crown,
  Facebook,
  FileText,
  Globe,
  Instagram,
  Minus,
  Palette,
  Plus,
  Printer,
  Settings,
  Sparkles,
  Twitter,
  Users,
  Video,
  Youtube,
  Zap
} from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card'
import { Checkbox } from '../src/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/ui/dialog'
import { Input } from '../src/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs'
import { Textarea } from '../src/components/ui/textarea'

export default function OldPage() {
  const [selectedOutputs, setSelectedOutputs] = useState<Record<string, string[]>>({})
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleOutputChange = (category: string, optionName: string, checked: boolean) => {
    setSelectedOutputs(prev => {
      const categoryOutputs = prev[category] || []
      if (checked) {
        return { ...prev, [category]: [...categoryOutputs, optionName] }
      } else {
        return { ...prev, [category]: categoryOutputs.filter(o => o !== optionName) }
      }
    })
  }

  const styleOptions = [
    { name: 'Modern', icon: Palette },
    { name: 'Classic', icon: Crown },
    { name: 'Minimal', icon: Minus },
    { name: 'Bold', icon: Zap },
    { name: 'Elegant', icon: Sparkles }
  ]

  const outputOptions = {
    video: [
      { name: 'Full HD: 1920 × 1080 px', icon: Video },
      { name: '4K UHD: 3840 × 2160 px', icon: Video },
      { name: 'Vertical HD: 1080 × 1920 px', icon: Video },
      { name: 'Square HD: 1080 × 1080 px', icon: Video }
    ],
    social: [
      { name: 'Instagram Post: 1080 × 1080 px', icon: Instagram },
      { name: 'Instagram Story: 1080 × 1920 px', icon: Instagram },
      { name: 'Instagram Ad: 1080 × 1080 px', icon: Instagram },
      { name: 'Facebook Post (Landscape): 1200 × 630 px', icon: Facebook },
      { name: 'Facebook Post (Square): 1080 × 1080 px', icon: Facebook },
      { name: 'Facebook Cover: 851 × 315 px', icon: Facebook },
      { name: 'Twitter Post: 1600 × 900 px', icon: Twitter },
      { name: 'Twitter Header: 1500 × 500 px', icon: Twitter },
      { name: 'Twitter Square: 1080 × 1080 px', icon: Twitter },
      { name: 'LinkedIn Post: 1200 × 627 px', icon: Users },
      { name: 'LinkedIn Banner: 1584 × 396 px', icon: Users },
      { name: 'LinkedIn Square: 1080 × 1080 px', icon: Users },
      { name: 'YouTube Thumbnail: 1280 × 720 px', icon: Youtube },
      { name: 'YouTube Channel: 2560 × 1440 px', icon: Youtube },
      { name: 'YouTube Short: 1080 × 1920 px', icon: Youtube }
    ],
    print: [
      { name: 'Invitation: 14 × 14 cm', icon: FileText },
      { name: 'A4 Portrait: 21 × 29.7 cm', icon: FileText },
      { name: 'A4 Landscape: 29.7 × 21 cm', icon: FileText },
      { name: 'A3: 29.7 × 42 cm', icon: FileText },
      { name: 'Letter Portrait: 8.5 × 11 in', icon: FileText },
      { name: 'Letter Landscape: 11 × 8.5 in', icon: FileText },
      { name: 'Business Card: 3.5 × 2 in', icon: FileText },
      { name: 'Poster: 18 × 24 in', icon: FileText }
    ],
    web: [
      { name: 'Web Page: 1920 × 1080 px', icon: Globe },
      { name: 'Carousel Slide: 1200 × 800 px', icon: Globe },
      { name: 'Embed Banner: 800 × 600 px', icon: Globe },
      { name: 'Hero Section: 1920 × 800 px', icon: Globe },
      { name: 'Card Component: 400 × 300 px', icon: Globe }
    ]
  }

  return (
    <>
      <Head>
        <title>Create New Content (Old) | Studio | Jesus Film Project</title>
      </Head>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background/70 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/jesusfilm-sign.svg"
                  alt="Jesus Film Project"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
                <h1 className="text-2xl font-bold text-foreground">Studio (Old)</h1>
              </div>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-5 w-5" />
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
                      <label htmlFor="openai-api-key" className="text-sm font-medium">
                        OpenAI API Key
                      </label>
                      <Input
                        id="openai-api-key"
                        type="password"
                        placeholder="Enter your OpenAI API key..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key is required to process content with OpenAI. It will be stored locally in your browser.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Your Content Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your content:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Enter your text content here..."
                      className="min-h-[120px] resize-none bg-white"
                    />
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* Demo images carousel */}
                    <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src="https://images.unsplash.com/photo-1696229571968-6fbe217d812a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFja2dyb3VuZCUyMHZlcnRpY2FsfGVufDB8fDB8fHww"
                        alt="Demo image 1"
                        width={128}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src="https://images.unsplash.com/photo-1752870240378-09b4f326ce67?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJhY2tncm91bmQlMjB2ZXJ0aWNhbHxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Demo image 2"
                        width={128}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src="https://images.unsplash.com/photo-1667668060308-49e3c0583367?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJhY2tncm91bmQlMjB2ZXJ0aWNhbHxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Demo image 3"
                        width={128}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Add new image button */}
                    <button className="flex-shrink-0 w-32 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center group">
                      <Plus className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Style Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Style:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* Carousel of style selectors - dummy implementation */}
                    {styleOptions.map((style) => {
                      const IconComponent = style.icon
                      return (
                        <Button key={style.name} variant="outline" className="shrink-0 flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {style.name}
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">(Dummy carousel for prototype)</p>
                </CardContent>
              </Card>

            </div>

            {/* Right Sidebar - Output & Create Button */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Output Section with Create Button */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Output:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="video" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="video" className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video
                        </TabsTrigger>
                        <TabsTrigger value="social" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Social
                        </TabsTrigger>
                        <TabsTrigger value="print" className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Print
                        </TabsTrigger>
                        <TabsTrigger value="web" className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Web
                        </TabsTrigger>
                      </TabsList>

                      {Object.entries(outputOptions).map(([category, options]) => (
                        <TabsContent key={category} value={category} className="mt-4">
                          <div className="space-y-3">
                            {options.map((option) => {
                              const IconComponent = option.icon
                              return (
                                <div key={option.name} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${category}-${option.name}`}
                                    checked={(selectedOutputs[category] || []).includes(option.name)}
                                    onCheckedChange={(checked) =>
                                      handleOutputChange(category, option.name, checked as boolean)
                                    }
                                  />
                                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                                  <label
                                    htmlFor={`${category}-${option.name}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.name}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="mt-6 pt-6 border-t border-border">
                      <Button
                        size="lg"
                        className="w-full h-16 text-lg font-semibold flex items-center justify-center gap-2"
                        onClick={() => {
                          console.log('Selected outputs:', selectedOutputs)
                          // Dummy create functionality
                          alert('Create functionality - coming soon!')
                        }}
                      >
                        <Sparkles className="w-5 h-5" />
                        Create
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
