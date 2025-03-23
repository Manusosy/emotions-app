
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OnboardingDialog } from './OnboardingDialog';

export function AmbassadorOnboardingDialog() {
  const [open, setOpen] = useState(true);
  
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
