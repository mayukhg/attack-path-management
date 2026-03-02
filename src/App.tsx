import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './views/Dashboard';
import { AttackPaths } from './views/AttackPaths';
import { NetworkMap } from './views/NetworkMap';
import { IdentityMovement } from './views/IdentityMovement';
import { Remediation } from './views/Remediation';
import { RiskCorrelation } from './views/RiskCorrelation';
import type { ViewId } from './types';
import { dashboardStats } from './data/mockData';

function ActiveView({ view }: { view: ViewId }) {
  switch (view) {
    case 'dashboard': return <Dashboard />;
    case 'attack-paths': return <AttackPaths />;
    case 'network-map': return <NetworkMap />;
    case 'identity': return <IdentityMovement />;
    case 'remediation': return <Remediation />;
    case 'risk-correlation': return <RiskCorrelation />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');

  return (
    <div className="flex h-screen bg-surface-0 text-slate-200 overflow-hidden font-['Inter',_sans-serif]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeView={activeView} globalRiskScore={dashboardStats.riskScore} />
        <main className="flex-1 overflow-hidden">
          <ActiveView view={activeView} />
        </main>
      </div>
    </div>
  );
}
