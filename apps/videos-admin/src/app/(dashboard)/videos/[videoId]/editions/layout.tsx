'use client'

import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

import { graphql } from '@core/shared/gql'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { ActionButton } from '../../../../../components/ActionButton'
import { Section } from '../../../../../components/Section'

interface EditionsPageProps {
  children: ReactNode
}

const GET_EDITIONS = graphql(`
  query GetEditions($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      videoEditions {
        id
        name
        videoSubtitles {
          id
        }
      }
    }
  }
`)

export default function EditionsPage({ children }: EditionsPageProps) {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)
  const { data, refetch } = useQuery(GET_EDITIONS, {
    variables: { videoId }
  })
  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(
      (pathname?.includes('add') || pathname?.includes('delete')) ?? false
    )
  }, [pathname])
  return (
    <>
      <Section
        title="Editions"
        action={{
          label: 'New Edition',
          onClick: () =>
            router.push(`/videos/${videoId}/editions/add`, {
              scroll: false
            }),
          startIcon: <Plus2 />
        }}
      >
        {(data?.adminVideo.videoEditions.length ?? 0) > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 2
            }}
          >
            {data?.adminVideo.videoEditions.map((edition) => (
              <Box
                key={edition.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  minWidth: 200,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
                onClick={() =>
                  router.push(`/videos/${videoId}/editions/${edition.id}`, {
                    scroll: false
                  })
                }
                data-testid="EditionCard"
              >
                <Stack
                  sx={{
                    p: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="h4" sx={{ ml: 1 }}>
                    {edition.name}
                  </Typography>

                  <ActionButton
                    actions={{
                      edit: () =>
                        router.push(
                          `/videos/${videoId}/editions/${edition.id}`,
                          {
                            scroll: false
                          }
                        ),
                      delete: () =>
                        edition.name === 'base'
                          ? undefined
                          : router.push(
                              `/videos/${videoId}/editions/${edition.id}/delete`,
                              {
                                scroll: false
                              }
                            )
                    }}
                  />
                </Stack>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {edition.videoSubtitles.length} subtitles
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}>
            <Typography>No editions</Typography>
          </Box>
        )}
      </Section>
      {children}
    </>
  )
}
