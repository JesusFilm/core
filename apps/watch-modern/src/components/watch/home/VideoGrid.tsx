"use client"

import type { Hit as AlgoliaHit } from 'instantsearch.js'
import { Highlight, Hits, Pagination, SearchBox } from 'react-instantsearch'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'

type VideoHit = AlgoliaHit<{
  title: string
  description?: string
  image?: string
}>

function Hit({ hit }: { hit: VideoHit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Highlight attribute="title" hit={hit} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          <Highlight attribute="description" hit={hit} />
        </p>
      </CardContent>
    </Card>
  )
}

export function VideoGrid() {
  return (
    <section id="videos" className="py-10">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <SearchBox
            classNames={{
              root: 'w-full md:max-w-sm',
              input: 'h-10 w-full rounded-md border px-3 py-2'
            }}
            placeholder="Search videos"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Hits hitComponent={Hit} />
        </div>

        <div className="mt-8 flex justify-center">
          <Pagination
            classNames={{
              root: 'flex items-center gap-2',
              selectedItem: 'font-semibold'
            }}
          />
        </div>
      </Container>
    </section>
  )
}
