import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SheetTrigger = ({ children, asChild: _asChild }: { children: React.ReactNode, asChild?: boolean }) => <div onClick={(e) => e.stopPropagation()}>{children}</div>
const SheetContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("fixed inset-y-0 right-0 h-full w-3/4 border-l bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm z-50", className)}>
        {children}
    </div>
)
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

export {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
