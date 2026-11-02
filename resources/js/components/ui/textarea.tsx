import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex h-auto w-full max-w-full flex-col rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:text-transparent file:placeholder-transparent [&_::-webkit-file-upload-button]:cursor-pointer cursor-text resize-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none dark:bg-gray-900",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
