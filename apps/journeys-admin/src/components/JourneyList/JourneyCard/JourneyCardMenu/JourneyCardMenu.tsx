import { ApolloQueryResult } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourneyAiTranslateMutation } from '@core/journeys/ui/useJourneyAiTranslateMutation'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import MoreIcon from '@core/shared/ui/icons/More'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { convertLanguagesToOptions } from '@core/shared/ui/LanguageAutocomplete/utils/convertLanguagesToOptions'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

const AccessDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AccessDialog" */
      '../../../AccessDialog'
    ).then((mod) => mod.AccessDialog),
  { ssr: false }
)

const DeleteJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DeleteJourneyDialog" */
      './DeleteJourneyDialog'
    ).then((mod) => mod.DeleteJourneyDialog),
  { ssr: false }
)

const RestoreJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "RestoreJourneyDialog" */
      './RestoreJourneyDialog'
    ).then((mod) => mod.RestoreJourneyDialog),
  { ssr: false }
)

const TrashJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "RestoreJourneyDialog" */
      './TrashJourneyDialog'
    ).then((mod) => mod.TrashJourneyDialog),
  { ssr: false }
)

const DefaultMenu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DefaultMenu" */
      './DefaultMenu'
    ).then((mod) => mod.DefaultMenu),
  { ssr: false }
)

const TrashMenu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashMenu" */
      './TrashMenu'
    ).then((mod) => mod.TrashMenu),
  { ssr: false }
)

const JourneyDetailsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "JourneyDetailsDialog" */
      '../../../Editor/Toolbar/JourneyDetails/JourneyDetailsDialog'
    ).then((mod) => mod.JourneyDetailsDialog),
  { ssr: false }
)

const TranslateJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TranslateJourneyDialog" */
      './TranslateJourneyDialog'
    ).then((mod) => mod.TranslateJourneyDialog),
  { ssr: false }
)

const CopyToTeamDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CopyToTeamDialog" */
      '@core/journeys/ui/CopyToTeamDialog'
    ).then((mod) => mod.CopyToTeamDialog),
  { ssr: false }
)

export interface JourneyCardMenuProps {
  id: string
  status: JourneyStatus
  slug: string
  published: boolean
  template?: boolean
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
  journey?: Journey
}

/**
 * JourneyCardMenu component provides a menu for managing journey actions.
 * It includes options for accessing, deleting, restoring, and editing journey details.
 *
 * @param {JourneyCardMenuProps} props - The component props
 * @param {string} props.id - The unique identifier for the journey
 * @param {JourneyStatus} props.status - The status of the journey
 * @param {string} props.slug - The slug of the journey
 * @param {boolean} props.published - Whether the journey is published
 * @param {boolean} [props.template] - Whether the journey is a template
 * @param {() => Promise<ApolloQueryResult<GetAdminJourneys>>} [props.refetch] - Function to refetch journey data
 * @param {Journey} [props.journey] - The journey data object
 */

export function JourneyCardMenu({
  id,
  status,
  slug,
  published,
  template,
  refetch,
  journey
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [openAccessDialog, setOpenAccessDialog] = useState<
    boolean | undefined
  >()
  const [openTrashDialog, setOpenTrashDialog] = useState<boolean | undefined>()
  const [openRestoreDialog, setOpenRestoreDialog] = useState<
    boolean | undefined
  >()
  const [openDeleteDialog, setOpenDeleteDialog] = useState<
    boolean | undefined
  >()
  const [openDetailsDialog, setOpenDetailsDialog] = useState<
    boolean | undefined
  >()
  const [openTranslateDialog, setOpenTranslateDialog] = useState<
    boolean | undefined
  >()
  const [openCopyToTeamDialog, setOpenCopyToTeamDialog] = useState<
    boolean | undefined
  >()

  const router = useRouter()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { translateJourney } = useJourneyAiTranslateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  async function handleCopyToTeam(
    teamId: string,
    selectedLanguage: LanguageOption
  ): Promise<void> {
    if (journey?.id == null || selectedLanguage == null) return

    const journeyTitle = journey.title
    const journeyLanguageData = journey.language

    try {
      const { data } = await journeyDuplicate({
        variables: {
          id: journey.id,
          teamId
        }
      })

      if (data?.journeyDuplicate.id != null) {
        const translatedJourney = await translateJourney({
          journeyId: data.journeyDuplicate.id,
          name: `${journeyTitle}`,
          journeyLanguageName:
            journeyLanguageData?.name.find((n) => !n.primary)?.value ??
            journeyLanguageData?.name.find((n) => n.primary)?.value ??
            '',
          textLanguageId: selectedLanguage.id ?? '',
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        })

        if (translatedJourney) {
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
        } else {
          throw new Error('Failed to start translation')
        }
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      console.error('Error in translation process:', error)
      enqueueSnackbar(
        t('Failed to process translation request. Please try again.'),
        {
          variant: 'error'
        }
      )
    }
  }

  function handleOpenCopyToTeamDialog(): void {
    setRoute('copy-journey')
    setOpenCopyToTeamDialog(true)
  }

  const journeyLanguageOption: LanguageOption | undefined =
    journey?.language != null
      ? convertLanguagesToOptions([journey.language])[0]
      : undefined

  return (
    <>
      <IconButton
        id="journey-actions"
        aria-controls="journey-actions"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={handleOpenMenu}
        edge="end"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        data-testid="JourneyCardMenu"
      >
        {status === JourneyStatus.trashed ? (
          <TrashMenu
            setOpenRestoreDialog={() => setOpenRestoreDialog(true)}
            setOpenDeleteDialog={() => setOpenDeleteDialog(true)}
            handleCloseMenu={handleCloseMenu}
          />
        ) : (
          <DefaultMenu
            id={id}
            status={status}
            slug={slug}
            journeyId={id}
            published={published}
            setOpenAccessDialog={() => setOpenAccessDialog(true)}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={() => setOpenTrashDialog(true)}
            setOpenDetailsDialog={() => setOpenDetailsDialog(true)}
            setOpenTranslateDialog={() => setOpenTranslateDialog(true)}
            template={template}
            refetch={refetch}
            handleOpenCopyToTeamDialog={handleOpenCopyToTeamDialog}
          />
        )}
      </Menu>
      {openAccessDialog != null && (
        <AccessDialog
          journeyId={id}
          open={openAccessDialog}
          onClose={() => setOpenAccessDialog(false)}
        />
      )}
      {openTrashDialog != null && (
        <TrashJourneyDialog
          id={id}
          open={openTrashDialog}
          handleClose={() => setOpenTrashDialog(false)}
          refetch={refetch}
        />
      )}
      {openRestoreDialog != null && (
        <RestoreJourneyDialog
          id={id}
          open={openRestoreDialog}
          published={published}
          handleClose={() => setOpenRestoreDialog(false)}
          refetch={refetch}
        />
      )}
      {openDeleteDialog != null && (
        <DeleteJourneyDialog
          id={id}
          open={openDeleteDialog}
          handleClose={() => setOpenDeleteDialog(false)}
          refetch={refetch}
        />
      )}
      {openDetailsDialog != null && (
        <JourneyDetailsDialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          journey={journey}
        />
      )}
      {openTranslateDialog != null && (
        <TranslateJourneyDialog
          open={openTranslateDialog}
          onClose={() => setOpenTranslateDialog(false)}
          journey={journey}
        />
      )}
      {openCopyToTeamDialog != null && (
        <CopyToTeamDialog
          title={t('Copy to Another Team')}
          open={openCopyToTeamDialog}
          journeyLanguage={journeyLanguageOption}
          onClose={() => {
            setOpenCopyToTeamDialog(false)
          }}
          submitAction={handleCopyToTeam}
        />
      )}
    </>
  )
}
