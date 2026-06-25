import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusCountsStrip } from '@/components/StatusCountsStrip';

describe('StatusCountsStrip', () => {
  it('renders the four counts with their labels', () => {
    render(<StatusCountsStrip counts={{ pending: 7, assigned: 2, inTransit: 3, delivered: 10 }} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('En Route')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });
});
