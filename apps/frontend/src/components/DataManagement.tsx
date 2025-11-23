import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { API_BASE_URL } from '@/config';

/**
 * Data Management Component
 * Story 5.3: Implement Data Reset Functionality
 *
 * Provides UI for resetting and regenerating demo data
 */
export function DataManagement() {
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{
    driversCreated: number;
    ordersCreated: number;
  } | null>(null);

  const handleReset = async () => {
    setResetting(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/data/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset data');
      }

      const result = await response.json();
      setResetResult(result);
      setSuccess(true);

      // Refresh the page after a short delay to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Reset and regenerate demo data for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success message */}
        {success && resetResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              Data reset successful!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Created {resetResult.driversCreated} drivers and {resetResult.ordersCreated} orders.
              Refreshing dashboard...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Reset button with confirmation dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={resetting}
              className="w-full"
            >
              {resetting ? 'Resetting Data...' : 'Reset Demo Data'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete all existing orders and drivers, then
                generate new seed data. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="text-sm text-muted-foreground">
          <p>This will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Delete all existing orders and drivers</li>
            <li>Generate 5-8 new drivers with random availability</li>
            <li>Create 15-25 new orders with varied statuses</li>
            <li>Assign orders to drivers realistically</li>
            <li>Use pre-seeded Brooklyn addresses for geocoding</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
