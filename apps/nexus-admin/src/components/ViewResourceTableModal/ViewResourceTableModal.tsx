import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack
} from '@mui/material'
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
  return (
    <Modal
      title="Select Columns"
      subtitle="Choose columns to display in the table."
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={resetColumnsVisibility}>Reset</Button>
        </Stack>
      }
    >
      <Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={Object.values(columnsVisibility ?? {}).every(
                (isColumnToggled) => isColumnToggled === true
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
