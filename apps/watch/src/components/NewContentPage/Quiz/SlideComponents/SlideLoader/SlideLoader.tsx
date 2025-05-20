import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const slideMap = {
  intro: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-intro" */ '../../Slides/Intro'
      ).then((mod) => mod.Intro),
    { ssr: false }
  ),
  name: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-name" */ '../../Slides/Name'
      ).then((mod) => mod.Name),
    { ssr: false }
  ),
  // q1: dynamic(
  //   async () =>
  //     await import(/* webpackChunkName: "quiz-slide-q1" */ '../Q1/Q1').then(
  //       (mod) => mod.Q1
  //     ),
  //   { ssr: false }
  // ),
  q1: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-q1" */ '../../Slides/Q1'
      ).then((mod) => mod.Q1),
    { ssr: false }
  ),
  rare_view: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-rare-view" */ '../../Slides/RareView'
      ).then((mod) => mod.RareView),
    { ssr: false }
  ),
  question_2: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-question-2" */ '../../Slides/Q2'
      ).then((mod) => mod.Q2),
    { ssr: false }
  )
}

interface SlideLoaderProps {
  slideId: string
}

export function SlideLoader({ slideId }: SlideLoaderProps) {
  const SlideComponent = slideMap[slideId]

  if (!SlideComponent) {
    return null
  }

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <SlideComponent />
    </Suspense>
  )
}
