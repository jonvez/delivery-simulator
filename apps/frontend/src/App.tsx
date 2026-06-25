import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DispatcherView } from '@/views/DispatcherView';
import { RepView } from '@/views/RepView';
import { AccountManagerView } from '@/views/AccountManagerView';

/**
 * App — route table. A single AppShell layout route wraps the three role views; the URL is the
 * active role (and, for the rep view, the impersonated rep via /route/:repId).
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
    </Routes>
  );
}

export default App;
