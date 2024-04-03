import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'

import { Modal } from '../Modal'

interface ViewResourceTableModalProps {
  open: boolean
  closeModal: () => void
  columnsVisibility?: Record<string, boolean>
  toggleColumnVisibility: (column: string, value: boolean) => void
  allColumnsVisibility: () => void
  resetColumnsVisibility: () => void
}

export const ViewResourceTableModal: FC<ViewResourceTableModalProps> = ({
  open,
  closeModal,
  columnsVisibility,
  toggleColumnVisibility,
  allColumnsVisibility,
  resetColumnsVisibility
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title="Select Columns"
      subtitle="Choose columns to display in the table."
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>{t('Cancel')}</Button>
          <Button onClick={resetColumnsVisibility}>{t('Reset')}</Button>
        </Stack>
      }
    >
      <Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={Object.values(columnsVisibility ?? {}).every(
                (isColumnToggled) => isColumnToggled
              )}
            />
          }
          onChange={(e, checked) =>
            checked ? allColumnsVisibility() : undefined
          }
          label="Select All Columns"
        />
        <Divider />
        {Object.keys(columnsVisibility ?? {}).map((column) => (
          <FormControlLabel
            key={column}
            control={
              <Checkbox
                checked={columnsVisibility?.[column]}
                onChange={(e) =>
                  toggleColumnVisibility(column, e.target.checked)
                }
              />
            }
            label={column}
            sx={{
              textTransform: 'capitalize'
            }}
          />
        ))}
      </Stack>
    </Modal>
  )
}
