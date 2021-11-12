import {
  ButtonVariant,
  ButtonColor,
  ButtonSize
} from '../../../../__generated__/globalTypes'
import { ButtonFields } from '../../../../__generated__/ButtonFields'

export const ButtonData: ButtonFields = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'This is a button',
  fullWidth: true,
  alignSelf: null,
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIcon: null,
  endIcon: null,
  action: null
}
