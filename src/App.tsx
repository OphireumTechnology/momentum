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
import { CompanyProfilePage } from './components/pages/CompanyProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 min-w-0 overflow-x-clip">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'fleet' && <FleetPage onNavigate={handleNavigate} />}
        {currentPage === 'service-areas' && <ServiceAreasPage onNavigate={handleNavigate} />}
        {currentPage === 'quote' && <QuotePage onNavigate={handleNavigate} />}
        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}
        {currentPage === 'careers' && <CareersPage onNavigate={handleNavigate} />}
        {currentPage === 'safety' && <SafetyPage onNavigate={handleNavigate} />}
        {currentPage === 'company-profile' && <CompanyProfilePage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
