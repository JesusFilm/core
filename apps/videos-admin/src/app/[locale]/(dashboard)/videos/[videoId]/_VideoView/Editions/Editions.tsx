import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { Section } from '../Section'

import { EditionCard } from './EditionCard'
import { DialogAction } from './EditionDialog'

const EditionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "EditionDialog" */
      './EditionDialog/EditionDialog'
    ).then((mod) => mod.EditionDialog),
  { ssr: false }
)

interface EditionsProps {
  editions: any
}

export function Editions({ editions }: EditionsProps): ReactElement {
  const t = useTranslations()
  const [action, setAction] = useState<DialogAction | null>(null)
  const [selectedEdition, setSelectedEdition] = useState<any>(null)

  const handleAction = (action: DialogAction, edition: any) => {
    setSelectedEdition(edition)
    setAction(action)
  }

  return (
    <Section
      title="Editions"
      action={{
        label: 'New Edition',
        onClick: () => setAction(DialogAction.CREATE),
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
              onClick={() => handleAction(DialogAction.VIEW, edition)}
              actions={{
                view: () => handleAction(DialogAction.VIEW, edition),
                edit: () => handleAction(DialogAction.EDIT, edition),
                delete: () => handleAction(DialogAction.DELETE, edition)
              }}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}>
          <Typography>{t('No editions.')}</Typography>
        </Box>
      )}
      <EditionDialog
        action={action}
        close={() => setAction(null)}
        edition={selectedEdition}
      />
    </Section>
  )
}
