import Head from 'next/head'

import { StudioHomePage } from '../src/components/StudioHomePage/StudioHomePage'
import { Button } from '../src/components/ui/button'

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Studio | Jesus Film Project</title>
      </Head>
      <StudioHomePage>
        <section className="rounded-3xl border border-border/30 bg-background/50 p-10">
          <h2 className="text-2xl font-semibold text-foreground">Stay in the loop</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            We&apos;re actively building new tools and storytelling experiences. Join the waitlist to receive updates when Studio
            content becomes available.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button className="px-6">Join the waitlist</Button>
            <Button variant="ghost" className="px-6">
              Explore Jesus Film resources
            </Button>
          </div>
        </section>
      </StudioHomePage>
    </>
  )
}
