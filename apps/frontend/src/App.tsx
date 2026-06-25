import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DispatcherView } from '@/views/DispatcherView';
import { RepView } from '@/views/RepView';
import { AccountManagerView } from '@/views/AccountManagerView';
import { DashboardLegacy } from '@/components/DashboardLegacy';

/**
 * App — route table. A single AppShell layout route wraps the three role views; the URL is
 * the active role. `/legacy` temporarily preserves the original single screen for reference
 * during the reorg and is removed once the role views own every widget.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dispatch" replace />} />
        <Route path="/dispatch" element={<DispatcherView />} />
        <Route path="/route" element={<RepView />} />
        <Route path="/route/:repId" element={<RepView />} />
        <Route path="/accounts" element={<AccountManagerView />} />
        <Route path="*" element={<Navigate to="/dispatch" replace />} />
      </Route>
      <Route path="/legacy" element={<DashboardLegacy />} />
    </Routes>
  );
}

export default App;
