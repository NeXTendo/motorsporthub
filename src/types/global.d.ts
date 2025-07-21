// global.d.ts or keen-slider.d.ts
declare module 'keen-slider/react' {
  import { MutableRefObject } from 'react'

  interface KeenSliderOptions {
    loop?: boolean
    mode?: 'free' | 'snap'
    rtl?: boolean
    slides?: { perView?: number; spacing?: number }
  }

  export function useKeenSlider<T extends HTMLElement = HTMLElement>(
    options?: KeenSliderOptions
  ): [MutableRefObject<T | null>]
}
