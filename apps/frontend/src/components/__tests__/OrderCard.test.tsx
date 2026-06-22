import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderCard } from '../OrderCard';
import type { Order } from '../../types/order';
import { OrderStatus } from '../../types/order';

describe('OrderCard', () => {
  const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    deliveryAddress: '123 Main St, Apt 4B',
    orderDetails: 'Ring doorbell twice',
    status: OrderStatus.PENDING,
    latitude: null,
    longitude: null,
    driverId: null,
    driver: null,
    planogramReviewed: false,
    planogramNotes: null,
    createdAt: '2024-01-15T10:30:00Z',
    assignedAt: null,
    inTransitAt: null,
    deliveredAt: null,
    updatedAt: '2024-01-15T10:30:00Z',
  };

  it('should render customer information', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('should render store address with DSD label', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('Store Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Apt 4B')).toBeInTheDocument();
  });

  it('should render case list when present', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('Case List')).toBeInTheDocument();
    expect(screen.getByText('Ring doorbell twice')).toBeInTheDocument();
  });

  it('should label assigned rep with DSD vocabulary', () => {
    const assignedOrder = {
      ...mockOrder,
      status: OrderStatus.ASSIGNED,
      driverId: 'd1',
      driver: { id: 'd1', name: 'Rep One', isAvailable: true, createdAt: '2024-01-15T10:30:00Z' },
      assignedAt: '2024-01-15T10:35:00Z',
    } as Order;
    render(<OrderCard order={assignedOrder} />);

    expect(screen.getByText('Assigned Rep')).toBeInTheDocument();
  });

  it('should not render case list section when absent', () => {
    const orderWithoutDetails = { ...mockOrder, orderDetails: null };
    render(<OrderCard order={orderWithoutDetails} />);

    expect(screen.queryByText('Case List')).not.toBeInTheDocument();
  });

  it('should display correct status badge for PENDING (Scheduled)', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('should display correct status badge for ASSIGNED', () => {
    const assignedOrder = {
      ...mockOrder,
      status: OrderStatus.ASSIGNED,
      assignedAt: '2024-01-15T10:35:00Z',
    };
    render(<OrderCard order={assignedOrder} />);

    const assignedTexts = screen.getAllByText('Assigned');
    expect(assignedTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should display correct status badge for IN_TRANSIT (En Route)', () => {
    const inTransitOrder = {
      ...mockOrder,
      status: OrderStatus.IN_TRANSIT,
      assignedAt: '2024-01-15T10:35:00Z',
      inTransitAt: '2024-01-15T10:40:00Z',
    };
    render(<OrderCard order={inTransitOrder} />);

    const enRouteTexts = screen.getAllByText('En Route');
    expect(enRouteTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should display correct status badge for DELIVERED', () => {
    const deliveredOrder = {
      ...mockOrder,
      status: OrderStatus.DELIVERED,
      assignedAt: '2024-01-15T10:35:00Z',
      inTransitAt: '2024-01-15T10:40:00Z',
      deliveredAt: '2024-01-15T11:00:00Z',
    };
    render(<OrderCard order={deliveredOrder} />);

    const deliveredTexts = screen.getAllByText('Delivered');
    expect(deliveredTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should show createdAt timestamp', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should show assignedAt timestamp when present', () => {
    const assignedOrder = {
      ...mockOrder,
      status: OrderStatus.ASSIGNED,
      assignedAt: '2024-01-15T10:35:00Z',
    };
    render(<OrderCard order={assignedOrder} />);

    const assignedTexts = screen.getAllByText('Assigned');
    // Should appear in both badge and timestamp
    expect(assignedTexts.length).toBe(2);
  });

  it('should show inTransitAt timestamp when present', () => {
    const inTransitOrder = {
      ...mockOrder,
      status: OrderStatus.IN_TRANSIT,
      assignedAt: '2024-01-15T10:35:00Z',
      inTransitAt: '2024-01-15T10:40:00Z',
    };
    render(<OrderCard order={inTransitOrder} />);

    const enRouteTexts = screen.getAllByText('En Route');
    // Should appear in both badge and timestamp
    expect(enRouteTexts.length).toBe(2);
  });

  it('should show deliveredAt timestamp when present', () => {
    const deliveredOrder = {
      ...mockOrder,
      status: OrderStatus.DELIVERED,
      assignedAt: '2024-01-15T10:35:00Z',
      inTransitAt: '2024-01-15T10:40:00Z',
      deliveredAt: '2024-01-15T11:00:00Z',
    };
    render(<OrderCard order={deliveredOrder} />);

    const deliveredTexts = screen.getAllByText('Delivered');
    // Should appear in both badge and timestamp
    expect(deliveredTexts.length).toBe(2);
  });

  it('should display truncated stop ID', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText(/Stop ID: 123e4567.../)).toBeInTheDocument();
  });

  describe('planogram compliance', () => {
    it('should render the planogram-review toggle with DSD vocabulary', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.getByText('Planogram reviewed')).toBeInTheDocument();
      const toggle = screen.getByRole('checkbox', { name: /planogram reviewed/i });
      expect(toggle).not.toBeChecked();
    });

    it('should reflect a previously reviewed planogram as checked with its notes', () => {
      const reviewedOrder: Order = {
        ...mockOrder,
        planogramReviewed: true,
        planogramNotes: 'Endcap reset, facings squared',
      };
      render(<OrderCard order={reviewedOrder} />);

      const toggle = screen.getByRole('checkbox', { name: /planogram reviewed/i });
      expect(toggle).toBeChecked();
      expect(screen.getByDisplayValue('Endcap reset, facings squared')).toBeInTheDocument();
    });

    it('should call onReviewPlanogram with the new reviewed flag and notes when saved', async () => {
      const onReviewPlanogram = vi.fn().mockResolvedValue(undefined);
      render(<OrderCard order={mockOrder} onReviewPlanogram={onReviewPlanogram} />);

      // Toggle reviewed on
      const toggle = screen.getByRole('checkbox', { name: /planogram reviewed/i });
      fireEvent.click(toggle);

      // Enter compliance notes
      const notes = screen.getByLabelText(/compliance notes/i);
      fireEvent.change(notes, { target: { value: 'Cooler door planogram verified' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save planogram review/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onReviewPlanogram).toHaveBeenCalledWith(mockOrder.id, {
          planogramReviewed: true,
          planogramNotes: 'Cooler door planogram verified',
        });
      });
    });

    it('should not render save action when no onReviewPlanogram handler is provided', () => {
      render(<OrderCard order={mockOrder} />);

      expect(screen.queryByRole('button', { name: /save planogram review/i })).not.toBeInTheDocument();
    });
  });
});
