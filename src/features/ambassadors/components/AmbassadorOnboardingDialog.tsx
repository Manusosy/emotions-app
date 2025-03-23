
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OnboardingDialog } from './OnboardingDialog';

export function AmbassadorOnboardingDialog() {
  // Set initial state to false to disable the dialog
  const [open, setOpen] = useState(false);
  
  // Function to handle dialog state
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-0 max-w-none w-screen h-screen flex items-center justify-center">
        <OnboardingDialog />
      </DialogContent>
    </Dialog>
  );
}
