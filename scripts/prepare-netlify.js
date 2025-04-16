#!/usr/bin/env node

/**
 * This script prepares files for the Netlify build
 * by ensuring there are no Radix UI dependencies in toggle components
 * and installing the required platform-specific Rollup dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

console.log('Starting prepare-netlify.js...');

// First, install the platform-specific Rollup dependencies
try {
  console.log('Installing Linux-specific Rollup dependencies...');
  execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1', { stdio: 'inherit' });
  console.log('✅ Linux Rollup dependencies installed successfully!');
} catch (error) {
  console.error('Error installing Rollup dependencies:', error);
  console.log('⚠️ Continuing despite installation errors...');
}

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the file paths
const componentsDir = path.join(__dirname, '..', 'src', 'components', 'ui');
const togglePath = path.join(componentsDir, 'toggle.tsx');
const toggleGroupPath = path.join(componentsDir, 'toggle-group.tsx');
const pureTogglePath = path.join(componentsDir, 'pure-toggle.tsx');
const pureToggleGroupPath = path.join(componentsDir, 'pure-toggle-group.tsx');

// The pure implementations to use if needed
const pureToggleContent = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(pressed || false)

    React.useEffect(() => {
      if (pressed !== undefined) {
        setIsPressed(pressed)
      }
    }, [pressed])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !isPressed
      setIsPressed(newPressed)
      onPressedChange?.(newPressed)
      props.onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(toggleVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
      />
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants, type ToggleProps }`;

const pureToggleGroupContent = `import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants, type ToggleProps } from "@/components/ui/toggle"

type ToggleGroupContextType = VariantProps<typeof toggleVariants> & {
  value?: string[]
  onValueChange?: (value: string[]) => void
  type?: 'single' | 'multiple'
}

const ToggleGroupContext = React.createContext<ToggleGroupContextType>({
  size: "default",
  variant: "default",
  type: 'multiple',
  value: [],
})

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof toggleVariants> {
  type?: 'single' | 'multiple'
  value?: string[]
  onValueChange?: (value: string[]) => void
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, children, type = 'multiple', value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(value || [])

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const handleValueChange = React.useCallback((newValue: string[]) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }, [onValueChange])

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ 
          variant, 
          size, 
          type, 
          value: internalValue, 
          onValueChange: handleValueChange 
        }}>
          {children}
        </ToggleGroupContext.Provider>
      </div>
    )
  }
)

ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps extends Omit<ToggleProps, 'pressed' | 'onPressedChange'> {
  value: string
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    const isActive = context.value?.includes(value)

    const handleClick = () => {
      if (!context.onValueChange || !context.value) return

      if (context.type === 'single') {
        context.onValueChange([value])
      } else {
        if (isActive) {
          context.onValueChange(context.value.filter(v => v !== value))
        } else {
          context.onValueChange([...context.value, value])
        }
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isActive}
        data-state={isActive ? "on" : "off"}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps }`;

console.log('Starting prepare-netlify.js...');
console.log('Ensuring toggle components have no Radix UI dependencies...');

// Function to check for Radix imports
function hasRadixImports(content) {
  return content.includes('@radix-ui/react-toggle') || 
         content.includes('@radix-ui/react-toggle-group') ||
         content.includes('TogglePrimitive') ||
         content.includes('ToggleGroupPrimitive');
}

try {
  // Handle toggle.tsx
  if (fs.existsSync(togglePath)) {
    const toggleContent = fs.readFileSync(togglePath, 'utf8');
    
    if (hasRadixImports(toggleContent)) {
      console.log('⚠️ toggle.tsx has Radix UI dependencies, replacing with pure implementation...');
      fs.writeFileSync(togglePath, pureToggleContent);
      console.log('✅ toggle.tsx fixed!');
    } else {
      console.log('✅ toggle.tsx already looks good!');
    }
  } else {
    console.log('Creating toggle.tsx with pure implementation...');
    fs.writeFileSync(togglePath, pureToggleContent);
    console.log('✅ toggle.tsx created!');
  }

  // Handle toggle-group.tsx
  if (fs.existsSync(toggleGroupPath)) {
    const toggleGroupContent = fs.readFileSync(toggleGroupPath, 'utf8');
    
    if (hasRadixImports(toggleGroupContent)) {
      console.log('⚠️ toggle-group.tsx has Radix UI dependencies, replacing with pure implementation...');
      fs.writeFileSync(toggleGroupPath, pureToggleGroupContent);
      console.log('✅ toggle-group.tsx fixed!');
    } else {
      console.log('✅ toggle-group.tsx already looks good!');
    }
  } else {
    console.log('Creating toggle-group.tsx with pure implementation...');
    fs.writeFileSync(toggleGroupPath, pureToggleGroupContent);
    console.log('✅ toggle-group.tsx created!');
  }

  // Also create/update the pure-toggle.tsx and pure-toggle-group.tsx files
  // This ensures we have these files for future use
  fs.writeFileSync(pureTogglePath, pureToggleContent);
  fs.writeFileSync(pureToggleGroupPath, pureToggleGroupContent);
  console.log('✅ Updated pure component files as well!');

  console.log('All files prepared successfully for Netlify build!');
} catch (error) {
  console.error('Error preparing files:', error);
  // Don't exit with error code to allow build to continue even if this step fails
  console.log('Continuing with build despite preparation errors...');
}
