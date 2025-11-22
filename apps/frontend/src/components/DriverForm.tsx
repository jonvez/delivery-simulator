import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateDriver } from '@/hooks/useCreateDriver';

interface DriverFormProps {
  onDriverCreated?: () => void;
}

/**
 * Form for creating new drivers
 * Story 3.2: Build Driver Management UI
 */
export function DriverForm({ onDriverCreated }: DriverFormProps) {
  const { createDriver, loading, error, success, resetState } = useCreateDriver();
  const [name, setName] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNameError('');
    resetState();

    // Validation
    if (!name.trim()) {
      setNameError('Driver name is required');
      return;
    }

    if (name.length > 255) {
      setNameError('Driver name must be less than 255 characters');
      return;
    }

    // Submit
    const driver = await createDriver({ name: name.trim(), isAvailable });

    if (driver) {
      // Reset form
      setName('');
      setIsAvailable(true);
      onDriverCreated?.();
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Add New Driver</h3>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          Driver created successfully!
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Driver Name *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter driver name"
          disabled={loading}
          className={nameError ? 'border-red-500' : ''}
        />
        {nameError && <p className="text-sm text-red-600">{nameError}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={(checked) => setIsAvailable(checked === true)}
          disabled={loading}
        />
        <Label
          htmlFor="isAvailable"
          className="text-sm font-normal cursor-pointer"
        >
          Available for assignments
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating Driver...' : 'Create Driver'}
      </Button>
    </form>
  );
}
