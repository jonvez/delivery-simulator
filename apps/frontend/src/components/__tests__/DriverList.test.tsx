import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DriverList } from '../DriverList';
import * as useDriversModule from '../../hooks/useDrivers';
import * as useUpdateDriverModule from '../../hooks/useUpdateDriver';
import * as useDriverOrdersModule from '../../hooks/useDriverOrders';
import { OrderStatus } from '@/types/order';
import type { Driver } from '@/types/driver';
import type { Order } from '@/types/order';

// Mock the hooks
vi.mock('../../hooks/useDrivers');
vi.mock('../../hooks/useUpdateDriver');
vi.mock('../../hooks/useDriverOrders');

const mockRefetch = vi.fn();
const mockUpdateDriver = vi.fn();

const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Doe',
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    isAvailable: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Customer 1',
    customerPhone: '+15551234567',
    deliveryAddress: '123 Main St',
    orderDetails: 'Pizza',
    status: OrderStatus.ASSIGNED,
    driverId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    customerName: 'Customer 2',
    customerPhone: '+15559876543',
    deliveryAddress: '456 Oak Ave',
    orderDetails: 'Burger',
    status: OrderStatus.IN_TRANSIT,
    driverId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

describe('DriverList', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
      drivers: mockDrivers,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    vi.spyOn(useUpdateDriverModule, 'useUpdateDriver').mockReturnValue({
      updateDriver: mockUpdateDriver,
      loading: false,
      error: null,
      success: false,
      resetState: vi.fn(),
    });

    vi.spyOn(useDriverOrdersModule, 'useDriverOrders').mockReturnValue({
      orders: [],
      loading: false,
      error: null,
    });
  });

  describe('Loading State', () => {
    it('should render loading state', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [],
        loading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<DriverList />);
      expect(screen.getByText('Loading drivers...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error state with error message', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [],
        loading: false,
        error: 'Failed to load drivers',
        refetch: mockRefetch,
      });

      render(<DriverList />);
      expect(screen.getByText('Failed to load drivers')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked in error state', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [],
        loading: false,
        error: 'Failed to load drivers',
        refetch: mockRefetch,
      });

      render(<DriverList />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no drivers exist', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<DriverList />);
      expect(screen.getByText(/no drivers yet/i)).toBeInTheDocument();
    });

    it('should allow refreshing in empty state', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<DriverList />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Driver List Display', () => {
    it('should render list of drivers', () => {
      render(<DriverList />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display driver count correctly', () => {
      render(<DriverList />);
      expect(screen.getByText('(2 drivers)')).toBeInTheDocument();
    });

    it('should display singular form for one driver', () => {
      vi.spyOn(useDriversModule, 'useDrivers').mockReturnValue({
        drivers: [mockDrivers[0]],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<DriverList />);
      expect(screen.getByText('(1 driver)')).toBeInTheDocument();
    });

    it('should display availability status correctly', () => {
      render(<DriverList />);
      const availableBadges = screen.getAllByText('Available');
      const unavailableBadges = screen.getAllByText('Unavailable');
      expect(availableBadges).toHaveLength(1);
      expect(unavailableBadges).toHaveLength(1);
    });

    it('should call refetch when refresh button is clicked', () => {
      render(<DriverList />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Driver Availability Toggle', () => {
    it('should show "Mark Unavailable" button for available drivers', () => {
      render(<DriverList />);
      expect(screen.getByRole('button', { name: /mark unavailable/i })).toBeInTheDocument();
    });

    it('should show "Mark Available" button for unavailable drivers', () => {
      render(<DriverList />);
      expect(screen.getByRole('button', { name: /mark available/i })).toBeInTheDocument();
    });

    it('should call updateDriver when toggling availability', async () => {
      mockUpdateDriver.mockResolvedValue(mockDrivers[0]);

      render(<DriverList />);
      const toggleButton = screen.getByRole('button', { name: /mark unavailable/i });
      fireEvent.click(toggleButton);

      expect(mockUpdateDriver).toHaveBeenCalledWith('1', { isAvailable: false });
    });

    it('should refetch drivers after successful availability update', async () => {
      mockUpdateDriver.mockResolvedValue(mockDrivers[0]);

      render(<DriverList />);
      const toggleButton = screen.getByRole('button', { name: /mark unavailable/i });
      fireEvent.click(toggleButton);

      await vi.waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should not refetch if update fails', async () => {
      mockUpdateDriver.mockResolvedValue(null);

      render(<DriverList />);
      const toggleButton = screen.getByRole('button', { name: /mark unavailable/i });
      fireEvent.click(toggleButton);

      await vi.waitFor(() => {
        expect(mockUpdateDriver).toHaveBeenCalled();
      });

      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe('Driver Orders Expansion', () => {
    it('should show "View Orders" button by default', () => {
      render(<DriverList />);
      const viewButtons = screen.getAllByRole('button', { name: /view orders/i });
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should expand driver orders when "View Orders" is clicked', () => {
      vi.spyOn(useDriverOrdersModule, 'useDriverOrders').mockReturnValue({
        orders: mockOrders,
        loading: false,
        error: null,
      });

      render(<DriverList />);
      const viewButton = screen.getAllByRole('button', { name: /view orders/i })[0];
      fireEvent.click(viewButton);

      expect(screen.getByText(/hide orders/i)).toBeInTheDocument();
    });

    it('should show active order count badge', () => {
      vi.spyOn(useDriverOrdersModule, 'useDriverOrders').mockReturnValue({
        orders: mockOrders,
        loading: false,
        error: null,
      });

      render(<DriverList />);
      const viewButton = screen.getAllByRole('button', { name: /view orders/i })[0];
      fireEvent.click(viewButton);

      // Use getAllByText since badge appears multiple times (for each driver with orders)
      const badges = screen.getAllByText('2 active orders');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should show loading state when fetching driver orders', () => {
      vi.spyOn(useDriverOrdersModule, 'useDriverOrders').mockReturnValue({
        orders: [],
        loading: true,
        error: null,
      });

      render(<DriverList />);
      const viewButton = screen.getAllByRole('button', { name: /view orders/i })[0];
      fireEvent.click(viewButton);

      expect(screen.getByText('Loading orders...')).toBeInTheDocument();
    });

    it('should show empty state when driver has no orders', () => {
      vi.spyOn(useDriverOrdersModule, 'useDriverOrders').mockReturnValue({
        orders: [],
        loading: false,
        error: null,
      });

      render(<DriverList />);
      const viewButton = screen.getAllByRole('button', { name: /view orders/i })[0];
      fireEvent.click(viewButton);

      expect(screen.getByText('No orders assigned yet')).toBeInTheDocument();
    });

    it('should collapse driver orders when "Hide Orders" is clicked', () => {
      render(<DriverList />);
      const viewButton = screen.getAllByRole('button', { name: /view orders/i })[0];

      // Expand
      fireEvent.click(viewButton);
      expect(screen.getByText(/hide orders/i)).toBeInTheDocument();

      // Collapse
      const hideButton = screen.getByRole('button', { name: /hide orders/i });
      fireEvent.click(hideButton);

      expect(screen.queryByText(/hide orders/i)).not.toBeInTheDocument();
    });
  });
});
