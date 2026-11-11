import { cva, type VariantProps } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

export const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        // The same tint as the danger callouts on plugify.net: a coloured border and
        // background, the body in the normal text colour (red text on red was hard to read)
        destructive:
          'border-red-500/40 bg-red-500/10 text-foreground [&>svg]:text-red-500 [&_h5]:text-red-700 dark:[&_h5]:text-red-300',
        warning:
          'border-amber-500/40 bg-amber-500/10 text-foreground [&>svg]:text-amber-500 [&_h5]:text-amber-700 dark:[&_h5]:text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type AlertVariants = VariantProps<typeof alertVariants>
