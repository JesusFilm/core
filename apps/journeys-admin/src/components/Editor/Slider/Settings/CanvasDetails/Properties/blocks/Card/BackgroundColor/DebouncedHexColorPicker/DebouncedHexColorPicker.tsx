import debounce from 'lodash/debounce'
import {
  ComponentProps,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

export function DebouncedHexColorPicker({
  color,
  onChange,
  ...props
}: ComponentProps<typeof HexAlphaColorPicker>): ReactElement {
  const [value, setValue] = useState(color)

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

  useEffect(() => {
    setValue(color)
  }, [color])

  async function handleChange(value: string): Promise<void> {
    void debouncedChange(value.toUpperCase())
    setValue(value.toUpperCase())
  }

  return (
    <HexAlphaColorPicker
      data-testid="HexColorPicker"
      color={value}
      onChange={handleChange}
      {...props}
    />
  )
}
