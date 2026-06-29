import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoTour } from '@/components/tour/useDemoTour';

/**
 * TourLauncher — the header affordance that (re)starts the guided demo tour. Mounting it also
 * arms the one-shot auto-tour on a visitor's first load (see useDemoTour).
 */
export function TourLauncher() {
  const { startTour } = useDemoTour();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={startTour}
      className="gap-1.5 text-muted-foreground"
      data-testid="tour-launcher"
    >
      <Compass className="h-4 w-4" />
      Tour
    </Button>
  );
}
