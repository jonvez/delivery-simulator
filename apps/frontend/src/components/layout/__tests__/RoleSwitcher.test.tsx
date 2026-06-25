import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="loc">{location.pathname}</div>;
}

describe('RoleSwitcher', () => {
  it('marks the role matching the current URL as selected', () => {
    render(
      <MemoryRouter initialEntries={['/route/abc']}>
        <RoleSwitcher />
      </MemoryRouter>
    );
    expect(screen.getByRole('tab', { name: 'Route Sales Rep' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Dispatcher' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Account Manager' })).toHaveAttribute('aria-selected', 'false');
  });

  it('navigates to the role base path on click', () => {
    render(
      <MemoryRouter initialEntries={['/dispatch']}>
        <RoleSwitcher />
        <LocationProbe />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Account Manager' }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/accounts');
  });
});
