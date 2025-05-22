import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'

const slideMap = {
  intro: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-intro" */ '../Intro').then(
        (mod) => mod.Intro
      ),
    { ssr: false }
  ),
  name: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-name" */ '../Name').then(
        (mod) => mod.Name
      ),
    { ssr: false }
  ),
  q1: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-q1" */ '../Q1').then(
        (mod) => mod.Q1
      ),
    { ssr: false }
  ),
  question_2: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-question-2" */ '../Q2'
      ).then((mod) => mod.Q2),
    { ssr: false }
  ),
  rare_view: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-rare-view" */ '../RareView'
      ).then((mod) => mod.RareView),
    { ssr: false }
  ),
  branch_bible: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-branch-bible" */ '../BranchBible'
      ).then((mod) => mod.BranchBible),
    { ssr: false }
  ),
  question_bible_path: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-question-bible-path" */ '../QuestionBiblePath'
      ).then((mod) => mod.QuestionBiblePath),
    { ssr: false }
  ),
  exploring_now: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-exploring-now" */ '../ExploringNow'
      ).then((mod) => mod.ExploringNow),
    { ssr: false }
  ),
  recommendation_explore: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-recommendation-explore" */ '../RecommendationExplore'
      ).then((mod) => mod.RecommendationExplore),
    { ssr: false }
  )
}

interface SlideLoaderProps {
  slideId: string
}

export function SlideLoader({ slideId }: SlideLoaderProps) {
  const SlideComponent = slideMap[slideId]

  useEffect(() => {
    console.log({ SlideComponent })
  }, [SlideComponent])

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
