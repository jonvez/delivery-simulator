import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderList } from '../OrderList';
import * as useOrdersModule from '../../hooks/useOrders';
import type { Order } from '../../types/order';
import { OrderStatus } from '../../types/order';

// Mock the useOrders hook
vi.mock('../../hooks/useOrders');

describe('OrderList', () => {
  const mockRefetch = vi.fn();

  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      deliveryAddress: '123 Main St',
      orderDetails: null,
      status: OrderStatus.PENDING,
      createdAt: '2024-01-15T10:30:00Z',
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerPhone: '+9876543210',
      deliveryAddress: '456 Oak Ave',
      orderDetails: 'Call on arrival',
      status: OrderStatus.ASSIGNED,
      createdAt: '2024-01-15T10:25:00Z',
      assignedAt: '2024-01-15T10:28:00Z',
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: '2024-01-15T10:28:00Z',
    },
    {
      id: '3',
      customerName: 'Bob Johnson',
      customerPhone: '+5555555555',
      deliveryAddress: '789 Elm St',
      orderDetails: null,
      status: OrderStatus.IN_TRANSIT,
      createdAt: '2024-01-15T10:20:00Z',
      assignedAt: '2024-01-15T10:22:00Z',
      inTransitAt: '2024-01-15T10:25:00Z',
      deliveredAt: null,
      updatedAt: '2024-01-15T10:25:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('should render loading state', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [],
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<OrderList />);
    expect(screen.getByText('Loading stops...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [],
      loading: false,
      error: 'Failed to fetch orders',
      refetch: mockRefetch,
    });

    render(<OrderList />);
    expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked in error state', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [],
      loading: false,
      error: 'Failed to fetch orders',
      refetch: mockRefetch,
    });

    render(<OrderList />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('should render empty state when no orders', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<OrderList />);
    expect(screen.getByText(/No stops yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('should render stop list with total count', () => {
    render(<OrderList />);

    expect(screen.getByText('Stops')).toBeInTheDocument();
    expect(screen.getByText('Total: 3 stops')).toBeInTheDocument();
  });

  it('should display singular stop text when only one stop', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [mockOrders[0]],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<OrderList />);
    expect(screen.getByText('Total: 1 stop')).toBeInTheDocument();
  });

  it('should group stops by status using DSD vocabulary', () => {
    render(<OrderList />);

    expect(screen.getByText('Scheduled Stops')).toBeInTheDocument();
    expect(screen.getByText('Assigned Stops')).toBeInTheDocument();
    // "En Route" appears in both the section heading and stop badges,
    // so use getAllByText
    const enRouteTexts = screen.getAllByText('En Route');
    expect(enRouteTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should not render empty status sections', () => {
    render(<OrderList />);

    // DELIVERED section should not appear since no stops have that status
    expect(screen.queryByText('Delivered')).not.toBeInTheDocument();
  });

  it('should display correct count for each status section', () => {
    render(<OrderList />);

    // Find all instances of "1 stop" text
    const oneStopTexts = screen.getAllByText('1 stop');

    // We should have 3 status sections, each with "1 stop"
    // (PENDING, ASSIGNED, IN_TRANSIT)
    expect(oneStopTexts).toHaveLength(3);
  });

  it('should display all order cards', () => {
    render(<OrderList />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', () => {
    render(<OrderList />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('should display multiple orders in same status section', () => {
    const ordersWithDuplicateStatus: Order[] = [
      mockOrders[0],
      {
        ...mockOrders[0],
        id: '4',
        customerName: 'Alice Brown',
      },
    ];

    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: ordersWithDuplicateStatus,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<OrderList />);

    expect(screen.getByText('2 stops')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
  });
});
