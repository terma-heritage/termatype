import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TextColorIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11 2L5.5 16H7.75L9.125 12.5H14.875L16.25 16H18.5L13 2H11ZM9.875 10.5L12 4.67L14.125 10.5H9.875Z"
        fill="currentColor"
      />
      <rect x="3" y="18" width="18" height="3" rx="1" fill="currentColor" className="text-color-bar" />
    </svg>
  )
})

TextColorIcon.displayName = "TextColorIcon"
