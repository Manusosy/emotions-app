
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & { 
    backgroundImage?: string;
  }
>(({ className, backgroundImage, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b relative", 
      backgroundImage && "bg-cover bg-center bg-no-repeat",
      className
    )}
    style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    iconPosition?: "left" | "right";
    customIcon?: React.ReactNode;
  }
>(({ className, children, iconPosition = "right", customIcon, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline",
        className
      )}
      {...props}
    >
      {iconPosition === "left" && !customIcon && (
        <div className="h-5 w-5 flex items-center justify-center shrink-0 mr-3 transition-transform duration-200">
          <Plus className="h-3 w-3 plus [&[data-state=open]>svg]:hidden" />
          <Minus className="h-3 w-3 minus hidden [&[data-state=open]>svg]:block" />
        </div>
      )}
      
      {iconPosition === "left" && customIcon && (
        <div className="mr-3">
          {customIcon}
        </div>
      )}
      
      {children}
      
      {iconPosition === "right" && !customIcon && (
        <div className="h-5 w-5 flex items-center justify-center shrink-0 transition-transform duration-200 ml-auto">
          <Plus className="h-3 w-3 plus [&[data-state=open]>svg]:hidden" />
          <Minus className="h-3 w-3 minus hidden [&[data-state=open]>svg]:block" />
        </div>
      )}
      
      {iconPosition === "right" && customIcon && (
        <div className="ml-auto">
          {customIcon}
        </div>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
