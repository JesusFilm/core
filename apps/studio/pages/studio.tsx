import { ArrowRight, Camera, MessageCircle, Sparkles, Video, Waves } from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactElement } from 'react'

import { Button } from '../src/components/ui/button'
import { cn } from '../src/libs/cn/cn'

const formatLabels = [
  'Instagram Post',
  'Instagram Story',
  'Facebook Post',
  'Facebook Cover',
  'Pinterest Graphic',
  'Universal Social Post'
]

const visualLabels = [
  'Verse Art',
  'Testimony Clip',
  'Faith Story',
  'Quote Design',
  'Devotional Highlight',
  'Daily Encouragement'
]

const processSteps = [
  {
    title: 'Drop Your Idea',
    description: 'Upload a verse, thought, image, or question.'
  },
  {
    title: 'Get Inspired',
    description: 'AI suggests Scripture, stories, and visuals that resonate.'
  },
  {
    title: 'Generate with AI',
    description: 'See your idea bloom into posts, videos, and stories.'
  },
  {
    title: 'Refine with Drag & Drop',
    description: 'Adjust text, colors, or layout effortlessly.'
  },
  {
    title: 'Publish & Share',
    description: 'Send your creations straight to social or download them anywhere.'
  }
]

const inputTypes = ['Text', 'Image', 'Video', 'Quote', 'Link', 'Audio Note']

export default function StudioLandingPage(): ReactElement {
  return (
    <>
      <Head>
        <title>How It Works | Studio | Jesus Film Project</title>
        <meta
          name="description"
          content="Discover how the Studio turns every spark of faith into beautiful, shareable stories and conversations that point hearts toward Jesus."
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#fdfaf4] via-white to-[#f0f5ff] text-stone-900">
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-6">
            <div className="flex items-center gap-4">
              <Image src="/jesusfilm-sign.svg" alt="Jesus Film Project" width={24} height={24} className="h-6 w-auto" />
              <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/new">Launch Studio</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/new">
                  Try It Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(254,240,199,0.55),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(191,219,254,0.45),_transparent_60%)]" />
            <div className="container mx-auto flex flex-col items-center gap-10 px-4 text-center">
              <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 shadow-sm">
                Grace-Filled Creativity
              </span>
              <h2 className="max-w-3xl text-balance text-4xl font-bold leading-tight text-stone-900 md:text-5xl">
                Turn any spark of faith into something the world can see.
              </h2>
              <p className="max-w-2xl text-lg text-stone-600 md:text-xl">
                Our AI-powered studio helps believers create content and conversations that point hearts toward Jesus by incorporating relevant bible verses, stories, and images.
              </p>
              <p className="max-w-2xl text-base text-stone-500">
              Upload a photo, paste a verse, or describe a moment—and watch it grow into visuals, messages, and videos filled
              with grace and salt.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/new">
                    Try It Now
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="#communication">See Conversation Guidance</Link>
                </Button>
              </div>

              <p className="max-w-2xl text-sm text-stone-500">
              Upload a photo, paste a verse, or describe a moment—and watch it grow into visuals, messages, and videos filled
              with grace and salt. From social posts to live conversation guides, this tool transforms inspiration into shareable impact. What begins
                as a simple idea becomes a story that invites reflection, connection, and hope.
              </p>
            </div>
          </section>

          <section id="communication" className="py-24">
            <div className="container mx-auto grid items-center gap-16 px-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Grace &amp; Salt Conversations
                </span>
                <h3 className="text-balance text-3xl font-semibold text-stone-900 md:text-4xl">
                  Your companion for conversations that matter.
                </h3>
                <p className="text-lg text-stone-600">
                  Guided by Scripture. Built to understand people. Whether you’re comforting a friend, answering hard questions, or
                  speaking hope online, our AI helps you express truth with gentleness. It suggests tone, phrasing, and verses that
                  keep your words full of grace and salt.
                </p>
                <div className="rounded-3xl bg-white/80 p-6 shadow-lg shadow-sky-100">
                  <div className="space-y-4 text-left text-sm text-stone-600">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-1 h-5 w-5 text-sky-500" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-stone-700">Friend:</p>
                        <p>“I’ve been feeling lost lately.”</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-1 h-5 w-5 text-emerald-500" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-stone-700">You:</p>
                        <p>“I’m sorry you’re going through that. Can I share something that helped me?”</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-stone-900/90 p-4 text-stone-100">
                      <Sparkles className="mt-1 h-5 w-5 text-amber-300" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">AI Guide:</p>
                        <p>Try suggesting John 14:6 or a short story about finding peace in uncertainty.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button size="sm" asChild>
                      <Link href="/new#conversation">Try Conversation Mode</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#process">Learn How It Works</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 p-8 text-stone-100 shadow-2xl">
                <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <h4 className="text-lg font-semibold tracking-tight">Real-time guidance</h4>
                <p className="mt-3 text-sm text-stone-200/80">
                  The Communication view watches for emotional cues and suggests scripture, thoughtful questions, and gentle
                  language—all in real time. Every hint is designed to help you carry grace and salt into the conversation.
                </p>
                <div className="mt-8 grid gap-4 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">Emotional Insight</p>
                    <p className="text-stone-200/80">Highlights what your friend might be feeling so you can respond with empathy.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">Graceful Suggestions</p>
                    <p className="text-stone-200/80">Offers phrase ideas and scripture prompts tuned for the moment.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">Tactful Evangelism</p>
                    <p className="text-stone-200/80">Gives next-step guidance for keeping the dialogue open and hopeful.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,246,233,0.6),_transparent_58%),_radial-gradient(circle_at_top_right,_rgba(200,213,255,0.45),_transparent_55%)]" />
            <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600 shadow-sm">
                  <Camera className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Formats for every mission
                </span>
                <h3 className="text-balance text-3xl font-semibold text-stone-900 md:text-4xl">
                  Transform your message into ready-to-share designs for every platform.
                </h3>
                <p className="text-lg text-stone-600">
                  Whether it starts with a verse, a quote, or a thought from your journal, our tool shapes it into platform-ready
                  visuals, stories, or posts. One seed of truth, countless ways to share it. Download in PNG, JPG, or JSON formats.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formatLabels.map((label) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-sm font-medium text-stone-700 shadow-sm shadow-amber-100"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl bg-white/70 p-8 shadow-xl shadow-indigo-100">
                  <h4 className="text-lg font-semibold text-stone-900">One click, infinite ways to inspire.</h4>
                  <p className="mt-4 text-sm text-stone-600">
                    Choose from elegant, story-based templates made for outreach, devotionals, and community engagement. Generate
                    scroll-stopping designs with motion and graphics that feel timeless. Zero editing, zero delay—just truth told
                    beautifully.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    {visualLabels.map((label) => (
                      <span key={label} className="rounded-full bg-stone-900/90 px-4 py-1 text-white">
                        {label}
                      </span>
                    ))}
                  </div>
                  <Button className="mt-8" asChild>
                    <Link href="/new#visuals">
                      Start Creating for Free
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="order-2 space-y-6 lg:order-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Scripture That Moves
                </span>
                <h3 className="text-balance text-3xl font-semibold text-stone-900 md:text-4xl">
                  Static verses become living stories.
                </h3>
                <p className="text-lg text-stone-600">
                  Our AI turns any verse or passage into a dynamic short video, complete with motion, music, and visual storytelling.
                  Every verse becomes an experience—clickable, relatable, and ready to inspire deeper exploration of God’s Word.
                </p>
                <p className="text-sm text-stone-500">
                  Each video verse includes interactive layers so people can explore related stories or teachings with a single tap.
                  It’s visual beauty and gospel accessibility in one flow.
                </p>
                <Button size="lg" asChild>
                  <Link href="/new#video-verses">
                    Create a Video Verse
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="order-1 overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-blue-900 to-emerald-700 p-10 text-white shadow-2xl lg:order-2">
                <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Video Verse Preview</p>
                  <h4 className="text-2xl font-semibold">John 3:16</h4>
                  <p className="text-sm text-stone-100/80">
                    “For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have
                    eternal life.”
                  </p>
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-sm font-semibold">Scene Suggestions</p>
                    <p className="text-xs text-stone-100/70">
                      Sunrise over a city, hands lifted in worship, families embracing—each clip curated to echo the verse’s hope.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-sm font-semibold">Interactive Layers</p>
                    <p className="text-xs text-stone-100/70">
                      Tap to explore related teachings, testimonies, or conversation starters linked to the verse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="process" className="relative overflow-hidden py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(254,243,199,0.45),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(221,214,254,0.35),_transparent_65%)]" />
            <div className="container mx-auto flex flex-col gap-12 px-4">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
                  <Waves className="h-4 w-4 text-sky-500" aria-hidden="true" />
                  The Creative Journey
                </span>
                <h3 className="mt-6 text-balance text-3xl font-semibold text-stone-900 md:text-4xl">
                  The creative journey, made simple.
                </h3>
                <p className="mt-4 text-lg text-stone-600">
                  From one idea to a full campaign of grace-filled stories—our process is clear, fast, and beautifully human.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                {processSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={cn(
                      'group relative flex h-full flex-col justify-between rounded-3xl border border-white/60 bg-white/75 p-6 shadow-sm transition-transform',
                      'hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100'
                    )}
                  >
                    <div>
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white shadow-lg shadow-stone-400/30">
                        {index + 1}
                      </span>
                      <h4 className="mt-6 text-lg font-semibold text-stone-900">{step.title}</h4>
                      <p className="mt-3 text-sm text-stone-600">{step.description}</p>
                    </div>
                    {index === 0 && (
                      <p className="mt-6 text-xs text-stone-500">
                        Input: “John 3:16” → Output: Video Verse, Instagram Story, Quote Card, Conversation Guide
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="container mx-auto grid gap-16 px-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  No limits
                </span>
                <h3 className="text-balance text-3xl font-semibold text-stone-900 md:text-4xl">
                  No limits. Every moment can start something meaningful.
                </h3>
                <p className="text-lg text-stone-600">
                  Bring ideas from anywhere—your camera roll, notes app, favorite verses, or social feeds—and watch them become
                  messages of hope.
                </p>
                <p className="text-sm text-stone-500">
                  Snap a photo, paste a quote, record a thought, or drop in anything that moves you. Our AI reads the tone,
                  extracts the heart, and turns it into designs, reels, and stories that shine with grace and truth. You don’t need
                  to create from scratch—just offer the spark.
                </p>
                <div className="flex flex-wrap gap-3">
                  {inputTypes.map((type) => (
                    <span key={type} className="rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-stone-600 shadow-sm">
                      {type}
                    </span>
                  ))}
                </div>
                <Button size="lg" asChild>
                  <Link href="/new">
                    Try It Free
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-white to-sky-100 p-10 shadow-2xl">
                <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
                <div className="grid gap-6 text-sm text-stone-700">
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Input Spark</p>
                    <p className="mt-2 text-lg font-semibold">“How do I encourage my Bible study this week?”</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-amber-200 bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Instant Outputs</p>
                      <ul className="mt-2 space-y-2 text-xs text-stone-600">
                        <li>• Conversation guide with real-time prompts</li>
                        <li>• Instagram carousel with verses on encouragement</li>
                        <li>• Printable devotional for group discussion</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Editable Assets</p>
                      <ul className="mt-2 space-y-2 text-xs text-stone-600">
                        <li>• Motion graphic reel with gentle gradients</li>
                        <li>• Quote card template ready for translation</li>
                        <li>• YouTube short outline with testimony beats</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
