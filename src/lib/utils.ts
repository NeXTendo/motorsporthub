// utils.ts
export const formatPrice = (num: number) => `$${num.toLocaleString()}`
//helper
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
