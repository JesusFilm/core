import debounce from 'lodash/debounce'
import {
  ComponentProps,
  ReactElement,
  useEffect,
  useMemo,
  useState
} from 'react'
import { HexColorPicker } from 'react-colorful'

export function DebouncedHexColorPicker({
  color,
  onChange,
  ...props
}: ComponentProps<typeof HexColorPicker>): ReactElement {
  const [value, setValue] = useState(color)

  const debouncedChange = useMemo(
    () =>
      debounce((value: string) => {
        onChange?.(value)
      }, 100),

    [onChange]
  )

  useEffect(() => {
    return () => {
      debouncedChange.cancel()
    }
  }, [debouncedChange])

  useEffect(() => {
    setValue(color)
  }, [color])

  async function handleChange(value: string): Promise<void> {
    void debouncedChange(value.toUpperCase())
    setValue(value.toUpperCase())
  }

  return (
    <HexColorPicker
      data-testId="HexColorPicker"
      color={value}
      onChange={handleChange}
      {...props}
    />
  )
}
