import { ReactNode } from 'react'

interface StudioHomePageProps {
  hero?: ReactNode
  children?: ReactNode
}

export function StudioHomePage({ hero, children }: StudioHomePageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/70 backdrop-blur">
        <div className="container flex flex-col gap-4 py-10 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Jesus Film Project</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Studio</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              A focused creative space for crafting immersive gospel-centered experiences.
            </p>
          </div>
          {hero ?? (
            <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-border/60 bg-gradient-to-br from-primary/20 via-primary/40 to-primary">
              <span className="text-sm font-semibold uppercase tracking-widest text-primary-foreground">Coming Soon</span>
            </div>
          )}
        </div>
      </header>
      <main className="container flex flex-col gap-16 py-16">
        <section className="grid gap-8 rounded-3xl border border-border/40 bg-card/60 p-10 shadow-2xl">
          <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Studio is where stories take shape. While we prepare the full experience, explore a curated selection of resources,
            behind-the-scenes updates, and tools that will empower your ministry in the seasons ahead.
          </p>
        </section>
        <section className="grid gap-10 rounded-3xl border border-border/40 bg-card/40 p-10">
          <h2 className="text-2xl font-semibold text-foreground">What&apos;s Next</h2>
          <ul className="grid gap-6 text-muted-foreground md:grid-cols-3">
            <li className="rounded-2xl border border-border/30 bg-background/40 p-6">
              <h3 className="text-lg font-semibold text-foreground">Interactive Storytelling</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Immersive narratives tailored for different cultures and ministry contexts.
              </p>
            </li>
            <li className="rounded-2xl border border-border/30 bg-background/40 p-6">
              <h3 className="text-lg font-semibold text-foreground">Creative Resources</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Downloadable toolkits and visual assets to help you share the gospel.
              </p>
            </li>
            <li className="rounded-2xl border border-border/30 bg-background/40 p-6">
              <h3 className="text-lg font-semibold text-foreground">Collaboration Spaces</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Connect with filmmakers, ministry leaders, and storytellers from around the world.
              </p>
            </li>
          </ul>
        </section>
        {children}
      </main>
      <footer className="border-t border-border/40 bg-background/80 py-10">
        <div className="container text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Jesus Film Project. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
