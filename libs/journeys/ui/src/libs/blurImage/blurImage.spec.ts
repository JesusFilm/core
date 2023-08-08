import { blurImage } from './blurImage'

describe('blurImage', () => {
  const image = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    children: []
  }

  it('returns url of blurred image', () => {
    expect(blurImage(image.blurhash, '#000000')).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAD80lEQVRYhZWXXY4cNwyEv2K3gRzCD7n/CZPYw8oDSUk9O4bhXQgttNSsYvFHGv3913cj0BU17ou4Al39jBpIIAAwxk5yRr545YvX68XPHj9eL/57mX9e4ARSkEEZaXs1+/M//cG+3+39JYHffTjGZcDv773WYxbNc2NPQx8++kLEXusPIyeox4aXvcBcGHywPIkY4qtBLxLqTScpHXs28SdwgbOeW4Um4plDSDu/9Gb4q5enSufe53pgwuX95eTbqYK9wLEnBO5gvhn3JnUqIX/yviTfIwlnkzD3eD7aN4m7rKkMisPDmrznxSNHvNcD40cIdg4YkUAisndNKG61hQIvJU5ZB1HvyEOwEgkvEvOfXKpZAHe//Xe8b+NNwAhtBfRUY/WgFQPtJAKywRGbgIpEYC5VRiXiG+KHtgpPBQQ6Ol6B6wiD+FI1/V00+GcVghBcMmmTmFfn3CYQDaZ5noroIFYkhsokdLKbitUKKLHc4CKlJgTZuXErSlJ1iz7VIIRiwHvPkWrqzTFxmgzRDDeBJBVcYewCvyR+Ym6iJKaBFA12AHMospXvAj3XQ8girAeJCFVovJvThcmlAA32CxL17PwYFwWkl+7hRyLhllwhwhDR2/sTNYn74WV0NsUmQcRWo/OhulntcQoryBjPRy0RQyQKWI++USf0TRzMB1zRwLFJKY7ekK1vdwAnoSAVRARkYAWOWCKlWolHaYubiE68kTvgelNDrQLanXAdcG4igRyEC1gOxEV00sltnynrisPNddRhxMqDmvdtKGL3A1GAFiQojB2ky/scEr7q1hTVpOQTWt3mxd0NYIdggWuD95Ws8sBonWjGaRQFmg6kCyl7XF3O7vhvDSen7tU9Gozr9Fzoior/JGr3cnlOUAMXOJEv5Cz5ewRG6Y55bBLdASsHYHn9eA54HCpBnfvOXVckHtCMyhldaDyP7NP+re8XgeNlxJELz/mjNbvyQGwFlAZlVY4vlNnVZJTn4bbBrckBhFf5vakwc8U+DScE3ZRtV9U4UF5IryYSSC4I+/A+Vhe9d/eKJrHrfp0FMXkwCgyBugXgBF+QWftzEjFYNy3NXfNUAG53fT8q4JMSc2zSMWiJLTdQYgW7qjp0TrSuLAcB1Zl6oz7Zjpa8DDyeUwXdUjt5RdYvnmlWKwmnJc+VhYMAuHHv5VkDuQdvowDfFeizLRJSC3gTL2UeHRSWzQpBt0f3whclpiWPStOGj2PY7yqtptVE5kbcV78BLwX4HAKLbeRRu2/l1GGZUJ5JxtwhPK13iO/9sVZOjXQ2jfOjsf2+thXSCd7GlnLSYbt4xfliPDzcPJiJB9PH2icH+LD/3UH4H95u1e/6dl73AAAAAElFTkSuQmCC'
    )
  })

  it('returns undefined as fallback', () => {
    // Prevent 2d canvas from being generated
    const createElement = document.createElement.bind(document)
    document.createElement = <K extends keyof HTMLElementTagNameMap>(
      tagName: K
    ) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => null,
          setAttribute: () => ({})
        }
      }
      return createElement(tagName)
    }

    expect(blurImage(image.blurhash, '#000000')).toBeUndefined()
  })

  it('returns undefined if blurhash is empty string', () => {
    expect(blurImage('', '#00000088')).toBeUndefined()
  })
})
