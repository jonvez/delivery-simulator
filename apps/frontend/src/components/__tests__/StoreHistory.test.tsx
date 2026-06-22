import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreHistory } from '../StoreHistory';
import * as useStoreHistoryModule from '../../hooks/useStoreHistory';
import type { StoreAccountAggregate } from '../../types/storeHistory';
import { OrderStatus } from '../../types/order';

// Mock the useStoreHistory hook
vi.mock('../../hooks/useStoreHistory');

describe('StoreHistory (Per-Account view)', () => {
  const mockRefetch = vi.fn();

  const mockAccounts: StoreAccountAggregate[] = [
    {
      storeAccount: 'QuickStop #1',
      storeAddress: '123 Bedford Ave, Brooklyn, NY 11249',
      totalStops: 3,
      totalDrops: 2,
      lastVisit: '2026-02-10T15:00:00Z',
      history: [
        {
          id: 'h1',
          status: OrderStatus.PENDING,
          createdAt: '2026-02-12T10:00:00Z',
          deliveredAt: null,
        },
        {
          id: 'h2',
          status: OrderStatus.DELIVERED,
          createdAt: '2026-02-10T10:00:00Z',
          deliveredAt: '2026-02-10T15:00:00Z',
        },
      ],
    },
    {
      storeAccount: 'Corner Market',
      storeAddress: '456 Atlantic Ave, Brooklyn, NY 11217',
      totalStops: 1,
      totalDrops: 0,
      lastVisit: null,
      history: [
        {
          id: 'h3',
          status: OrderStatus.ASSIGNED,
          createdAt: '2026-02-11T10:00:00Z',
          deliveredAt: null,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useStoreHistoryModule, 'useStoreHistory').mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders a loading state', () => {
    vi.spyOn(useStoreHistoryModule, 'useStoreHistory').mockReturnValue({
      accounts: [],
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<StoreHistory />);
    expect(screen.getByText(/loading store accounts/i)).toBeInTheDocument();
  });

  it('renders an error state with a retry button', () => {
    vi.spyOn(useStoreHistoryModule, 'useStoreHistory').mockReturnValue({
      accounts: [],
      loading: false,
      error: 'Failed to fetch store accounts',
      refetch: mockRefetch,
    });

    render(<StoreHistory />);
    expect(screen.getByText('Failed to fetch store accounts')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders an empty state when there are no store accounts', () => {
    vi.spyOn(useStoreHistoryModule, 'useStoreHistory').mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StoreHistory />);
    expect(screen.getByText(/no store accounts yet/i)).toBeInTheDocument();
  });

  it('renders each store account name and address', () => {
    render(<StoreHistory />);

    expect(screen.getByText('QuickStop #1')).toBeInTheDocument();
    expect(screen.getByText('123 Bedford Ave, Brooklyn, NY 11249')).toBeInTheDocument();
    expect(screen.getByText('Corner Market')).toBeInTheDocument();
    expect(screen.getByText('456 Atlantic Ave, Brooklyn, NY 11217')).toBeInTheDocument();
  });

  it('shows total drops and total stops per account using DSD vocabulary', () => {
    render(<StoreHistory />);

    // Drops (delivered) and total stops are surfaced per account.
    expect(screen.getByText('2')).toBeInTheDocument(); // QuickStop drops
    expect(screen.getAllByText(/drops/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/stops/i).length).toBeGreaterThan(0);
  });

  it('shows the last visit date, and "No visits yet" when never delivered', () => {
    render(<StoreHistory />);

    // QuickStop #1 has a last-visit date rendered (year present).
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
    // Corner Market has never been visited.
    expect(screen.getByText(/no visits yet/i)).toBeInTheDocument();
  });
});
