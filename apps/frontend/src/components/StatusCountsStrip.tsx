import type { StatusCounts } from '@/lib/dayState';

const TILES = [
  { key: 'pending', label: 'Unassigned' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'inTransit', label: 'En Route' },
  { key: 'delivered', label: 'Delivered' },
] as const;

/**
 * StatusCountsStrip — at-a-glance tally of the day's stops by status, for 5-second
 * comprehension at the top of the dispatcher view.
 */
export function StatusCountsStrip({ counts }: { counts: StatusCounts }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TILES.map((tile) => (
        <div key={tile.key} className="rounded-lg bg-muted p-4">
          <div className="text-3xl font-bold tabular-nums">{counts[tile.key]}</div>
          <div className="text-sm text-muted-foreground">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
