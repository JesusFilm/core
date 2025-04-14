'use client'

import { useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { ActionButton } from '../../../../../components/ActionButton'
import { Section } from '../../../../../components/Section'

interface EditionsPageProps {
  params: {
    videoId: string
  }
}

const GET_EDITIONS = graphql(`
  query GetEditions($videoId: ID!) {
    adminVideo(id: $videoId) {
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

export default function EditionsPage({
  params: { videoId }
}: EditionsPageProps) {
  const router = useRouter()
  const { data } = useSuspenseQuery(GET_EDITIONS, {
    variables: { videoId }
  })
  const editions = data?.adminVideo.videoEditions
  return (
    <Section
      title="Editions"
      action={{
        label: 'New Edition',
        onClick: () => router.push(`/videos/${videoId}/editions/add`),
        startIcon: <Plus2 />
      }}
    >
      {editions.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 2
          }}
        >
          {editions.map((edition) => (
            <Box
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
                router.push(`/videos/${videoId}/editions/${edition.id}`)
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
                      router.push(`/videos/${videoId}/editions/${edition.id}`),
                    delete: () =>
                      edition.name === 'base'
                        ? undefined
                        : router.push(
                            `/videos/${videoId}/editions/${edition.id}/delete`
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
  )
}
