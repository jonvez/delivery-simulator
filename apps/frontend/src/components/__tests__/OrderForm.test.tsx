import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm } from '../OrderForm';
import * as useCreateOrderModule from '../../hooks/useCreateOrder';
import type { Order } from '../../types/order';
import { OrderStatus } from '../../types/order';

// Mock the useCreateOrder hook
vi.mock('../../hooks/useCreateOrder');

describe('OrderForm', () => {
  const mockCreateOrder = vi.fn();
  const mockResetState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      loading: false,
      error: null,
      success: false,
      resetState: mockResetState,
    });
  });

  it('should render all form fields', () => {
    render(<OrderForm />);

    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/order details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create order/i })).toBeInTheDocument();
  });

  it('should display validation errors for empty required fields', async () => {
    render(<OrderForm />);

    const submitButton = screen.getByRole('button', { name: /create order/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Customer name is required')).toBeInTheDocument();
      expect(screen.getByText('Customer phone is required')).toBeInTheDocument();
      expect(screen.getByText('Delivery address is required')).toBeInTheDocument();
    });

    // Should not call createOrder when validation fails
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('should validate maximum field lengths', async () => {
    render(<OrderForm />);
    const user = userEvent.setup();

    // Customer name > 255 chars
    const longName = 'a'.repeat(256);
    await user.type(screen.getByLabelText(/customer name/i), longName);
    fireEvent.click(screen.getByRole('button', { name: /create order/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Customer name must be less than 255 characters')
      ).toBeInTheDocument();
    });

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const mockOrder: Order = {
      id: '123',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      deliveryAddress: '123 Main St',
      orderDetails: 'Leave at door',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: new Date().toISOString(),
    };

    mockCreateOrder.mockResolvedValue(mockOrder);

    render(<OrderForm />);
    const user = userEvent.setup();

    // Fill in the form
    await user.type(screen.getByLabelText(/customer name/i), 'John Doe');
    await user.type(screen.getByLabelText(/customer phone/i), '+1234567890');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main St');
    await user.type(screen.getByLabelText(/order details/i), 'Leave at door');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create order/i }));

    await waitFor(() => {
      expect(mockResetState).toHaveBeenCalled();
      expect(mockCreateOrder).toHaveBeenCalledWith({
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: 'Leave at door',
      });
    });
  });

  it('should omit orderDetails if empty', async () => {
    const mockOrder: Order = {
      id: '123',
      customerName: 'Jane Doe',
      customerPhone: '+9876543210',
      deliveryAddress: '456 Oak Ave',
      orderDetails: null,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: new Date().toISOString(),
    };

    mockCreateOrder.mockResolvedValue(mockOrder);

    render(<OrderForm />);
    const user = userEvent.setup();

    // Fill in only required fields
    await user.type(screen.getByLabelText(/customer name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/customer phone/i), '+9876543210');
    await user.type(screen.getByLabelText(/delivery address/i), '456 Oak Ave');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create order/i }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        customerName: 'Jane Doe',
        customerPhone: '+9876543210',
        deliveryAddress: '456 Oak Ave',
        // orderDetails should not be included
      });
    });
  });

  it('should display success message on successful submission', async () => {
    const mockOrder: Order = {
      id: '123',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      deliveryAddress: '123 Main St',
      orderDetails: null,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: new Date().toISOString(),
    };

    mockCreateOrder.mockResolvedValue(mockOrder);

    // Re-mock to return success state
    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      loading: false,
      error: null,
      success: true,
      resetState: mockResetState,
    });

    render(<OrderForm />);

    expect(screen.getByText('Order created successfully!')).toBeInTheDocument();
  });

  it('should display error message on failed submission', () => {
    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      loading: false,
      error: 'Failed to create order',
      success: false,
      resetState: mockResetState,
    });

    render(<OrderForm />);

    expect(screen.getByText('Failed to create order')).toBeInTheDocument();
  });

  it('should disable submit button while loading', () => {
    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      loading: true,
      error: null,
      success: false,
      resetState: mockResetState,
    });

    render(<OrderForm />);

    const submitButton = screen.getByRole('button', { name: /creating order/i });
    expect(submitButton).toBeDisabled();
  });

  it('should reset form after successful submission', async () => {
    const mockOrder: Order = {
      id: '123',
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      deliveryAddress: '123 Main St',
      orderDetails: null,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: new Date().toISOString(),
    };

    mockCreateOrder.mockResolvedValue(mockOrder);

    render(<OrderForm />);
    const user = userEvent.setup();

    // Fill in the form
    const nameInput = screen.getByLabelText(/customer name/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/customer phone/i) as HTMLInputElement;
    const addressInput = screen.getByLabelText(/delivery address/i) as HTMLTextAreaElement;

    await user.type(nameInput, 'John Doe');
    await user.type(phoneInput, '+1234567890');
    await user.type(addressInput, '123 Main St');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create order/i }));

    await waitFor(() => {
      // Form fields should be reset
      expect(nameInput.value).toBe('');
      expect(phoneInput.value).toBe('');
      expect(addressInput.value).toBe('');
    });
  });

  it('should clear field error when user starts typing', async () => {
    render(<OrderForm />);
    const user = userEvent.setup();

    // Trigger validation by submitting empty form
    fireEvent.click(screen.getByRole('button', { name: /create order/i }));

    await waitFor(() => {
      expect(screen.getByText('Customer name is required')).toBeInTheDocument();
    });

    // Start typing in customer name field
    await user.type(screen.getByLabelText(/customer name/i), 'J');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Customer name is required')).not.toBeInTheDocument();
    });
  });
});
