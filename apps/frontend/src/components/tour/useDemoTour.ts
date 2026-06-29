import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * useDemoTour — a guided spotlight tour of the DSD operation for first-time visitors (the
 * live-demo link a Pepper reviewer lands on cold). It threads the rep→route hand-off across the
 * three role views, navigating the router between steps. Auto-offered once per browser, and
 * relaunchable anytime from the header.
 */

const SEEN_KEY = 'dsd-demo-tour-seen';

type TourStep = {
  /** Route this step lives on; the tour navigates here before highlighting. */
  route: string;
  /** Selector to spotlight; omit for a centered, element-less popover. */
  element?: string;
  title: string;
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
};

const STEPS: TourStep[] = [
  {
    route: '/dispatch',
    title: 'Welcome to DSD Route Manager',
    description:
      'A 60-second tour of how a Direct Store Delivery operation runs — from the back office to the field. Hit Next, or skip anytime.',
  },
  {
    route: '/dispatch',
    element: '[data-tour="role-switcher"]',
    title: 'Three roles, one hand-off',
    description:
      'A DSD day is a chain: Dispatcher → Route Sales Rep → Account Manager. Switch roles here anytime — we’ll visit each.',
    side: 'bottom',
    align: 'end',
  },
  {
    route: '/dispatch',
    element: '[data-tour="dispatcher-board"]',
    title: 'Dispatcher — plan & assign',
    description:
      'The back office reads the whole day at a glance and assigns each store stop to a route rep. The counts move as the day rolls: Scheduled → Assigned → En Route → Delivered.',
    side: 'bottom',
    align: 'start',
  },
  {
    route: '/route',
    element: '[data-tour="rep-view"]',
    title: 'Route Sales Rep — run the route',
    description:
      'Acting as a rep, you work your stops in order — Start (En Route), then Mark Delivered — and log a planogram check at the shelf. No login; just pick a rep.',
    side: 'top',
    align: 'start',
  },
  {
    route: '/accounts',
    element: '[data-tour="accounts"]',
    title: 'Account Manager — protect the relationship',
    description:
      'Back in the office, account managers track per-store service health and surface at-risk accounts before they churn.',
    side: 'top',
    align: 'start',
  },
  {
    route: '/accounts',
    title: 'That’s the operation',
    description:
      'Dispatch plans, reps deliver, account managers retain — the DSD hand-off, end to end. Explore freely; relaunch this tour anytime from “Tour” in the header.',
  },
];

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}

function hasSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/** Resolve once the selector is in the DOM (after a route change renders) or the timeout lapses. */
function waitForElement(selector: string, timeout = 2500): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) return resolve();
    const start = Date.now();
    const id = window.setInterval(() => {
      if (document.querySelector(selector) || Date.now() - start > timeout) {
        window.clearInterval(id);
        resolve();
      }
    }, 60);
  });
}

// Module-scoped so React StrictMode's mount→unmount→mount only schedules the auto-tour once.
let autoScheduled = false;

export function useDemoTour() {
  const navigate = useNavigate();

  const startTour = useCallback(() => {
    // Guards re-entrancy: a manual destroy() and the close/done hooks can both fire.
    let finished = false;
    const finish = (drv: ReturnType<typeof driver>) => {
      if (finished) return;
      finished = true;
      markSeen();
      drv.destroy();
    };

    const toDriveStep = (s: TourStep): DriveStep => ({
      element: s.element,
      popover: {
        title: s.title,
        description: s.description,
        side: s.side,
        align: s.align,
      },
    });

    // Navigate to the target step's route, wait for its element, then highlight it.
    const goToStep = async (index: number, drv: ReturnType<typeof driver>) => {
      const target = STEPS[index];
      if (!target) return;
      if (window.location.pathname !== target.route) {
        navigate(target.route);
      }
      if (target.element) await waitForElement(target.element);
      drv.moveTo(index);
    };

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      steps: STEPS.map(toDriveStep),
      onNextClick: (_el, _step, { driver: drv }) => {
        const i = drv.getActiveIndex() ?? 0;
        if (i >= STEPS.length - 1) {
          finish(drv);
          return;
        }
        void goToStep(i + 1, drv);
      },
      onPrevClick: (_el, _step, { driver: drv }) => {
        const i = drv.getActiveIndex() ?? 0;
        if (i <= 0) return;
        void goToStep(i - 1, drv);
      },
      onCloseClick: (_el, _step, { driver: drv }) => finish(drv),
      onDestroyStarted: (_el, _step, { driver: drv }) => finish(drv),
    });

    // Start on the first step's route so its highlight target exists.
    if (window.location.pathname !== STEPS[0].route) {
      navigate(STEPS[0].route);
    }
    driverObj.drive();
  }, [navigate]);

  // Auto-offer on first visit only; always relaunchable via startTour().
  useEffect(() => {
    if (autoScheduled || hasSeen()) return;
    autoScheduled = true;
    // No cleanup-cancel: AppShell lives for the app's lifetime, and cancelling on StrictMode's
    // simulated unmount would suppress the one-shot auto-tour entirely.
    window.setTimeout(() => {
      if (!hasSeen()) startTour();
    }, 800);
  }, [startTour]);

  return { startTour };
}
