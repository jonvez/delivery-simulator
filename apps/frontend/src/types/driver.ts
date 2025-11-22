/**
 * Driver type definitions
 * Story 3.2: Build Driver Management UI
 */

export interface Driver {
  id: string;
  name: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateDriverInput {
  name: string;
  isAvailable?: boolean;
}

export interface UpdateDriverInput {
  name?: string;
  isAvailable?: boolean;
}
