import { Routes, Route } from 'react-router-dom';
import { DashboardLegacy } from '@/components/DashboardLegacy';

/**
 * App — top-level route table. During the UX reorg this temporarily renders the original
 * single-screen dashboard for every path; subsequent steps replace this with an AppShell
 * layout route and the role-based views (Dispatcher / Route Sales Rep / Account Manager).
 */
function App() {
  return (
    <Routes>
      <Route path="*" element={<DashboardLegacy />} />
    </Routes>
  );
}

export default App;
