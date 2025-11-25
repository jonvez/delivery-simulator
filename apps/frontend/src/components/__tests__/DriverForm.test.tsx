import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DriverForm } from '../DriverForm';
import * as useCreateDriverModule from '../../hooks/useCreateDriver';

// Mock the hook
vi.mock('../../hooks/useCreateDriver');

const mockCreateDriver = vi.fn();
const mockResetState = vi.fn();
const mockOnDriverCreated = vi.fn();

describe('DriverForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.spyOn(useCreateDriverModule, 'useCreateDriver').mockReturnValue({
      createDriver: mockCreateDriver,
      loading: false,
      error: null,
      success: false,
      resetState: mockResetState,
    });
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<DriverForm />);

      expect(screen.getByText('Add New Driver')).toBeInTheDocument();
      expect(screen.getByLabelText(/driver name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/available for assignments/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create driver/i })).toBeInTheDocument();
    });

    it('should have availability checkbox checked by default', () => {
      render(<DriverForm />);
      const checkbox = screen.getByRole('checkbox', { name: /available for assignments/i });
      expect(checkbox).toBeChecked();
    });

    it('should render input fields as enabled by default', () => {
      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      expect(nameInput).not.toBeDisabled();
    });
  });

  describe('Form Input Handling', () => {
    it('should update name field when typing', () => {
      render(<DriverForm />);
      const nameInput = screen.getByLabelText(/driver name/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      expect(nameInput).toHaveValue('John Doe');
    });

    it('should toggle availability checkbox', () => {
      render(<DriverForm />);
      const checkbox = screen.getByRole('checkbox', { name: /available for assignments/i });

      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('should display validation error for empty name field', async () => {
      render(<DriverForm />);

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Driver name is required')).toBeInTheDocument();
      });

      expect(mockCreateDriver).not.toHaveBeenCalled();
    });

    it('should display validation error for name exceeding maximum length', async () => {
      render(<DriverForm />);
      const nameInput = screen.getByLabelText(/driver name/i);

      const longName = 'a'.repeat(256);
      fireEvent.change(nameInput, { target: { value: longName } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Driver name must be less than 255 characters')).toBeInTheDocument();
      });

      expect(mockCreateDriver).not.toHaveBeenCalled();
    });

    it('should clear validation error when user starts typing', async () => {
      render(<DriverForm />);
      const nameInput = screen.getByLabelText(/driver name/i);
      const submitButton = screen.getByRole('button', { name: /create driver/i });

      // Trigger validation error
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Driver name is required')).toBeInTheDocument();
      });

      // Start typing
      fireEvent.change(nameInput, { target: { value: 'J' } });

      await waitFor(() => {
        expect(screen.queryByText('Driver name is required')).not.toBeInTheDocument();
      });
    });

    it('should trim whitespace from name before validation', async () => {
      render(<DriverForm />);
      const nameInput = screen.getByLabelText(/driver name/i);

      fireEvent.change(nameInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Driver name is required')).toBeInTheDocument();
      });

      expect(mockCreateDriver).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDriver).toHaveBeenCalledWith({
          name: 'John Doe',
          isAvailable: true,
        });
      });
    });

    it('should submit with trimmed name', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDriver).toHaveBeenCalledWith({
          name: 'John Doe',
          isAvailable: true,
        });
      });
    });

    it('should submit with availability set to false', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const checkbox = screen.getByRole('checkbox', { name: /available for assignments/i });
      fireEvent.click(checkbox);

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDriver).toHaveBeenCalledWith({
          name: 'John Doe',
          isAvailable: false,
        });
      });
    });

    it('should reset form after successful submission', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const checkbox = screen.getByRole('checkbox', { name: /available for assignments/i });
      fireEvent.click(checkbox);

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(checkbox).toBeChecked();
      });
    });

    it('should call onDriverCreated callback after successful submission', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm onDriverCreated={mockOnDriverCreated} />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnDriverCreated).toHaveBeenCalled();
      });
    });

    it('should not reset form if submission fails', async () => {
      mockCreateDriver.mockResolvedValue(null);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDriver).toHaveBeenCalled();
      });

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should call resetState before submission', async () => {
      const mockDriver = {
        id: '1',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateDriver.mockResolvedValue(mockDriver);

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByRole('button', { name: /create driver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetState).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs during submission', () => {
      vi.spyOn(useCreateDriverModule, 'useCreateDriver').mockReturnValue({
        createDriver: mockCreateDriver,
        loading: true,
        error: null,
        success: false,
        resetState: mockResetState,
      });

      render(<DriverForm />);

      const nameInput = screen.getByLabelText(/driver name/i);
      const checkbox = screen.getByRole('checkbox', { name: /available for assignments/i });
      const submitButton = screen.getByRole('button', { name: /creating driver/i });

      expect(nameInput).toBeDisabled();
      expect(checkbox).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      vi.spyOn(useCreateDriverModule, 'useCreateDriver').mockReturnValue({
        createDriver: mockCreateDriver,
        loading: true,
        error: null,
        success: false,
        resetState: mockResetState,
      });

      render(<DriverForm />);
      expect(screen.getByRole('button', { name: /creating driver/i })).toBeInTheDocument();
    });
  });

  describe('Success and Error States', () => {
    it('should display success message when driver is created', () => {
      vi.spyOn(useCreateDriverModule, 'useCreateDriver').mockReturnValue({
        createDriver: mockCreateDriver,
        loading: false,
        error: null,
        success: true,
        resetState: mockResetState,
      });

      render(<DriverForm />);
      expect(screen.getByText('Driver created successfully!')).toBeInTheDocument();
    });

    it('should display error message when creation fails', () => {
      vi.spyOn(useCreateDriverModule, 'useCreateDriver').mockReturnValue({
        createDriver: mockCreateDriver,
        loading: false,
        error: 'Failed to create driver',
        success: false,
        resetState: mockResetState,
      });

      render(<DriverForm />);
      expect(screen.getByText('Failed to create driver')).toBeInTheDocument();
    });
  });
});
