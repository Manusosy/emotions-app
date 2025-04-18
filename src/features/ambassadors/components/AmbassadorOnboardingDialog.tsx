import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OnboardingDialog } from './OnboardingDialog';

export function AmbassadorOnboardingDialog() {
  // Force the dialog to always be closed (disabled)
  const [open, setOpen] = useState(false);
  
  // Always return false to ensure dialog never opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(false);
  };

  // Return the dialog with forced closed state
  return (
    <Dialog open={false} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-0 max-w-none w-screen h-screen flex items-center justify-center">
        <OnboardingDialog />
      </DialogContent>
    </Dialog>
  );
}
