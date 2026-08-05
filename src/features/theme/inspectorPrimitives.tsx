import * as React from 'react';
import { Label } from '@/components/ui/label';

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <Label className="mb-1.5 block text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
