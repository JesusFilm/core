import debounce from 'lodash/debounce'
import {
  ComponentProps,
  ReactElement,
  useEffect,
  useRef,
} from 'react'
import { HexColorPicker } from 'react-colorful'

export function DebouncedHexColorPicker({
  color,
  onChange,
  ...props
}: ComponentProps<typeof HexColorPicker>): ReactElement {
  const debouncedChange = useRef(
    debounce((value: string) => {
      onChange?.(value)
    }, 100)
  ).current

  useEffect(() => {
    return () => {
      debouncedChange.cancel()
    }
  }, [debouncedChange])

  async function handleChange(value: string): Promise<void> {
    void debouncedChange(value.toUpperCase())
  }

  return (
    <HexColorPicker
      data-testId="HexColorPicker"
      color={color}
      onChange={handleChange}
      {...props}
    />
  )
}
