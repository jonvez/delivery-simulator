import type { StatusCounts } from '@/lib/dayState';

// Each tile is tinted with its Stop-lifecycle status hue (soft bg + accent number)
// so the board reads at a glance and matches the status badges elsewhere.
const TILES = [
  { key: 'pending', label: 'Unassigned', bg: 'bg-status-scheduled-soft', accent: 'text-status-scheduled' },
  { key: 'assigned', label: 'Assigned', bg: 'bg-status-assigned-soft', accent: 'text-status-assigned' },
  { key: 'inTransit', label: 'En Route', bg: 'bg-status-enroute-soft', accent: 'text-status-enroute' },
  { key: 'delivered', label: 'Delivered', bg: 'bg-status-delivered-soft', accent: 'text-status-delivered' },
] as const;

/**
 * StatusCountsStrip — at-a-glance tally of the day's stops by status, for 5-second
 * comprehension at the top of the dispatcher view.
 */
export function StatusCountsStrip({ counts }: { counts: StatusCounts }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TILES.map((tile) => (
        <div key={tile.key} className={`rounded-lg p-4 ${tile.bg}`}>
          <div className={`text-3xl font-bold tabular-nums ${tile.accent}`}>{counts[tile.key]}</div>
          <div className="text-sm text-muted-foreground">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
