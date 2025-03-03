import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { DialogAction } from '../../../../../../../components/CrudDialog'
import { GetAdminVideo_AdminVideo_VideoEditions as VideoEditions } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCrudState } from '../../../../../../../libs/useCrudState'
import { ArrayElement } from '../../../../../../../types/array-types'
import { Section } from '../Section'

import { EditionCard } from './EditionCard'

type Edition = ArrayElement<VideoEditions>

const EditionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "EditionDialog" */
      './EditionDialog/EditionDialog'
    ).then((mod) => mod.EditionDialog),
  { ssr: false }
)

interface EditionsProps {
  editions: VideoEditions
}

export function Editions({ editions }: EditionsProps): ReactElement {
  const t = useTranslations()

  const { selectedItem, action, dispatch } = useCrudState<Edition>(editions)

  return (
    <Section
      title={t('Editions')}
      action={{
        label: t('New Edition'),
        onClick: () => dispatch({ type: DialogAction.CREATE }),
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
            <EditionCard
              key={edition.id}
              edition={edition}
              onClick={() =>
                dispatch({ type: DialogAction.VIEW, item: edition })
              }
              actions={{
                view: () =>
                  dispatch({ type: DialogAction.VIEW, item: edition }),
                edit: () =>
                  dispatch({ type: DialogAction.EDIT, item: edition }),
                delete: () =>
                  dispatch({ type: DialogAction.DELETE, item: edition })
              }}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}>
          <Typography>{t('No editions')}</Typography>
        </Box>
      )}
      <EditionDialog
        action={action}
        close={() => dispatch({ type: 'reset' })}
        edition={selectedItem}
      />
    </Section>
  )
}
