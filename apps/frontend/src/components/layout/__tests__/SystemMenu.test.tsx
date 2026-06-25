import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemMenu } from '@/components/layout/SystemMenu';
import * as healthHook from '@/hooks/useHealthCheck';

vi.mock('@/hooks/useHealthCheck');
vi.mock('@/components/DataManagement', () => ({
  DataManagement: () => <div data-testid="data-management" />,
}));

describe('SystemMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(healthHook, 'useHealthCheck').mockReturnValue({
      data: { status: 'ok', database: 'connected', timestamp: '' },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('is closed by default and opens to reveal connection + data controls', () => {
    render(<SystemMenu />);
    expect(screen.queryByTestId('data-management')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /system menu/i }));

    expect(screen.getByText('API Connected')).toBeInTheDocument();
    expect(screen.getByText('DB Connected')).toBeInTheDocument();
    expect(screen.getByTestId('data-management')).toBeInTheDocument();
  });
});
