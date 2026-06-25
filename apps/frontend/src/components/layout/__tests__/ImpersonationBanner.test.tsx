import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import * as driversHook from '@/hooks/useDrivers';

vi.mock('@/hooks/useDrivers');

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ImpersonationBanner />
    </MemoryRouter>
  );
}

describe('ImpersonationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(driversHook, 'useDrivers').mockReturnValue({
      drivers: [{ id: 'd1', name: 'Maria Garcia', isAvailable: true, createdAt: '' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows Dispatcher on the dispatch route', () => {
    renderAt('/dispatch');
    expect(screen.getByText('Dispatcher')).toBeInTheDocument();
  });

  it('shows the impersonated rep name on the rep route', () => {
    renderAt('/route/d1');
    expect(screen.getByText('Route Sales Rep — Maria Garcia')).toBeInTheDocument();
  });

  it('shows Account Manager on the accounts route', () => {
    renderAt('/accounts');
    expect(screen.getByText('Account Manager')).toBeInTheDocument();
  });
});
