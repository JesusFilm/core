import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { DialogAction } from '../../../../../../components/CrudDialog'
import { Section } from '../../../../../../components/Section'
import { GetAdminVideo_AdminVideo_VideoEdition as Edition } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCrudState } from '../../../../../../libs/useCrudState'

import { EditionCard } from './EditionCard'
import { EditionDialog } from './EditionDialog/EditionDialog'

interface EditionsProps {
  editions: Array<Edition>
}

export function Editions({ editions }: EditionsProps): ReactElement {
  const { selectedItem, action, dispatch } = useCrudState<Edition>(editions)

  return (
    <Section
      title="Editions"
      action={{
        label: 'New Edition',
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
          <Typography>No editions</Typography>
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
