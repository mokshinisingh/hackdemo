import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { AssistantPage } from './pages/AssistantPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { ComparePage } from './pages/ComparePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-[#24352F]">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/:slug" element={<GuideDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
