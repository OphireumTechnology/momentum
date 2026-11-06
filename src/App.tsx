import React, { useState } from 'react';
import { Header, PageView } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { FleetPage } from './components/pages/FleetPage';
import { ServiceAreasPage } from './components/pages/ServiceAreasPage';
import { QuotePage } from './components/pages/QuotePage';
import { ContactPage } from './components/pages/ContactPage';
import { CareersPage } from './components/pages/CareersPage';
import { SafetyPage } from './components/pages/SafetyPage';
import { CustomerPortal } from './components/portal/CustomerPortal';
import { OperationsCommandCenter } from './components/operations/OperationsCommandCenter';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in dedicated Operations Command Center view
  if (currentPage === 'operations') {
    return <OperationsCommandCenter onNavigate={handleNavigate} />;
  }

  // If in dedicated Customer Portal view
  if (currentPage === 'portal') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1">
          <CustomerPortal onNavigate={handleNavigate} />
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'fleet' && <FleetPage onNavigate={handleNavigate} />}
        {currentPage === 'service-areas' && <ServiceAreasPage onNavigate={handleNavigate} />}
        {currentPage === 'quote' && <QuotePage onNavigate={handleNavigate} />}
        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}
        {currentPage === 'careers' && <CareersPage onNavigate={handleNavigate} />}
        {currentPage === 'safety' && <SafetyPage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
