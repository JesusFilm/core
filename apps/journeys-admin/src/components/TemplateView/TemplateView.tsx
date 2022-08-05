import { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { isThisYear, parseISO, intlFormat } from 'date-fns'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CreateRoundedIcon from '@mui/icons-material/CreateRounded'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import type { TreeBlock } from '@core/journeys/ui/block'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ImageIcon from '@mui/icons-material/Image'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { ImportTemplate } from '../../../__generated__/ImportTemplate'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { Role } from '../../../__generated__/globalTypes'
import { CardView } from '../CardView'
import { Properties } from './Properties'
import { TitleDescriptionDialog } from './TitleDescriptionDialog'

export const IMPORT_TEMPLATE = gql`
  mutation ImportTemplate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
  const userRole = data?.getUserRole?.roles?.includes(Role.publisher)
  const [importTemplate] = useMutation<ImportTemplate>(IMPORT_TEMPLATE)

  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)

  const handleImportTemplate = async (): Promise<void> => {
    if (journey == null) return

    const { data } = await importTemplate({
      variables: {
        id: journey.id
      },
      update(cache, { data }) {
        if (data?.journeyDuplicate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = []) {
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
                    }
                  `
                })
                return [...existingAdminJourneyRefs, duplicatedJourneyRef]
              }
            }
          })
        }
      }
    })

    if (data?.journeyDuplicate != null) {
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
  }

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Stack
        direction={smUp ? 'row' : 'column-reverse'}
        spacing={10}
        sx={{
          px: smUp ? 14 : 7,
          py: smUp ? 17 : 9,
          backgroundColor: 'background.paper'
        }}
      >
        {journey != null ? (
          journey.primaryImageBlock?.src != null ? (
            <Box
              component="img"
              src={journey.primaryImageBlock?.src}
              alt={journey.primaryImageBlock?.alt}
              style={{
                width: 213,
                height: 167,
                objectFit: 'cover',
                borderRadius: 12,
                marginRight: smUp ? 0 : 'auto',
                marginLeft: smUp ? 0 : 'auto'
              }}
            />
          ) : (
            <ImageIcon
              sx={{
                width: 273,
                height: 207,
                objectFit: 'cover',
                borderRadius: 12,
                mx: smUp ? 0 : 'auto'
              }}
            />
          )
        ) : (
          <Skeleton
            variant="rectangular"
            width={213}
            height={167}
            sx={{ mx: 'auto', borderRadius: 1 }}
          />
        )}
        <Stack direction="column" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4
            }}
          >
            <Typography variant="overline">
              {journey != null ? (
                intlFormat(parseISO(journey.createdAt), {
                  month: 'long',
                  day: 'numeric',
                  year: isThisYear(parseISO(journey.createdAt))
                    ? undefined
                    : 'numeric'
                })
              ) : (
                <Skeleton
                  variant="text"
                  width={smUp ? 200 : 100}
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Typography>
            {journey != null ? (
              <Button
                startIcon={<VisibilityIcon />}
                variant="outlined"
                size="small"
                color="secondary"
                onClick={async () =>
                  await router.push(`/api/preview?slug=${journey?.slug}`)
                }
              >
                Preview
              </Button>
            ) : (
              <Skeleton
                variant="rectangular"
                width={100}
                height={30}
                sx={{ borderRadius: 1 }}
              />
            )}
          </Box>
          <Stack direction={'row'} sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h1" gutterBottom>
              {journey != null ? (
                journey.title
              ) : (
                <Skeleton
                  variant="rectangular"
                  width={smUp ? 500 : 150}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Typography>
            {userRole === true && (
              <IconButton
                data-testid="EditTitleDescription"
                size="small"
                onClick={handleUpdateTitleDescription}
              >
                <CreateRoundedIcon />
              </IconButton>
            )}
          </Stack>
          <Typography variant="body2">
            {journey != null ? (
              journey.description
            ) : (
              <Skeleton
                variant="rectangular"
                width={smUp ? 600 : 200}
                height={50}
                sx={{ borderRadius: 1 }}
              />
            )}
          </Typography>
        </Stack>
      </Stack>
      <Properties userRole={userRole} />
      <>
        <CardView blocks={blocks} />
        {journey != null && userRole === true ? (
          <NextLink href={`/journeys/${journey.id}/edit`} passHref>
            <Fab
              variant="extended"
              size="large"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: { xs: 20, sm: 348 }
              }}
              color="primary"
              disabled={journey == null}
            >
              <EditIcon sx={{ mr: 3 }} />
              Edit
            </Fab>
          </NextLink>
        ) : (
          <Fab
            variant="extended"
            size="large"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: { xs: 20, sm: 348 }
            }}
            color="primary"
            disabled={journey == null}
            onClick={handleImportTemplate}
          >
            <CheckRoundedIcon sx={{ mr: 3 }} />
            Use Template
          </Fab>
        )}
      </>
      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={() => setShowTitleDescriptionDialog(false)}
      />
    </Box>
  )
}
