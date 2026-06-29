import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const SEEN_KEY = 'dsd-demo-tour-seen';

// Mock driver.js so the tour controller can be asserted without real DOM overlays.
const { driverFactory, driveMock } = vi.hoisted(() => {
  const driveMock = vi.fn();
  const driverFactory = vi.fn(() => ({
    drive: driveMock,
    destroy: vi.fn(),
    moveTo: vi.fn(),
    getActiveIndex: () => 0,
  }));
  return { driverFactory, driveMock };
});

vi.mock('driver.js', () => ({ driver: driverFactory }));
vi.mock('driver.js/dist/driver.css', () => ({}));

// Fresh module each time so the module-scoped auto-tour guard resets between cases.
async function renderLauncher() {
  vi.resetModules();
  const { TourLauncher } = await import('@/components/tour/TourLauncher');
  return render(
    <MemoryRouter initialEntries={['/dispatch']}>
      <TourLauncher />
    </MemoryRouter>
  );
}

describe('TourLauncher / useDemoTour', () => {
  beforeEach(() => {
    // jsdom in this project ships no working localStorage; provide an in-memory one.
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders a relaunchable Tour button', async () => {
    window.localStorage.setItem(SEEN_KEY, '1'); // suppress the auto-tour for this case
    await renderLauncher();
    expect(screen.getByTestId('tour-launcher')).toHaveTextContent('Tour');
  });

  it('starts the tour when the button is clicked', async () => {
    window.localStorage.setItem(SEEN_KEY, '1');
    await renderLauncher();
    fireEvent.click(screen.getByTestId('tour-launcher'));
    expect(driverFactory).toHaveBeenCalledTimes(1);
    expect(driveMock).toHaveBeenCalledTimes(1);
  });

  it('auto-offers the tour on a first visit (no seen flag)', async () => {
    vi.useFakeTimers();
    await renderLauncher();
    expect(driveMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(driveMock).toHaveBeenCalledTimes(1);
  });

  it('does not auto-offer once the tour has been seen', async () => {
    vi.useFakeTimers();
    window.localStorage.setItem(SEEN_KEY, '1');
    await renderLauncher();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(driveMock).not.toHaveBeenCalled();
  });
});
