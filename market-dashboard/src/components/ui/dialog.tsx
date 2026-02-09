import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange: _onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    if (open === false) return null;
    return <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">{children}</div>
}
const DialogTrigger = ({ children, asChild: _asChild, onClick }: { children: React.ReactNode, asChild?: boolean, onClick?: () => void }) => <div onClick={onClick} className="cursor-pointer">{children}</div>
const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg", className)}>
        {children}
    </div>
)
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
}
