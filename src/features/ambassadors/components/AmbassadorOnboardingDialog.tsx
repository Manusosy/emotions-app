
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OnboardingDialog } from './OnboardingDialog';

export function AmbassadorOnboardingDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 border-0 max-w-none w-screen h-screen flex items-center justify-center">
        <OnboardingDialog />
      </DialogContent>
    </Dialog>
  );
}
