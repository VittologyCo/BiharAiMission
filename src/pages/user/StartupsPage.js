import React from 'react';
import StartupsHub from '../../components/StartupsHub/StartupsHub';
import StatsPanel from '../../components/StatsPanel/StatsPanel';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';
import { useLanguage } from '../../hooks/useLanguage';

const StartupsPage = ({ onOpenContact, onOpenRegistration }) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const startupsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isHi ? 'बिहार AI स्टार्टअप एवं इन्क्यूबेशन हब' : 'Bihar AI Startup & Innovation Hub',
    description: 'Bihar AI Mission Startup Hub connects AI founders and entrepreneurs with ₹10 Lakh Startup Bihar seed capital, IndiaAI venture fund, and IIT Patna incubation labs.',
    url: 'https://biharaimission.org/startups',
  };

  return (
    <>
      <SEO
        title={isHi ? "स्टार्टअप हब — बिहार AI मिशन | ₹10 लाख सीड ग्रांट व इनक्यूबेशन" : "AI Startups & Innovation Hub — Bihar AI Mission | ₹10L Seed Capital & Labs"}
        description={isHi ? "बिहार AI मिशन स्टार्टअप हब: ₹10 लाख ब्याज-मुक्त सीड फंड, ₹2000 करोड़ IndiaAI वेंचर फंड, IIT पटना व CIMP इनक्यूबेशन और सरकारी पायलट अवसर।" : "Empower your AI venture with ₹10 Lakh Startup Bihar seed capital, ₹2,000 Cr IndiaAI venture fund, IC-IIT Patna GPU computing labs, and government pilot projects."}
        canonical="https://biharaimission.org/startups"
        keywords="Bihar AI Startups, Startup Bihar Policy, IIT Patna Incubation, IndiaAI Startup Fund, DeepTech Bihar, AI Grants Bihar"
        schema={startupsSchema}
      />
      
      <StartupsHub onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />

      <div style={{ maxWidth: '1200px', margin: '20px auto 40px', padding: '0 24px' }}>
        <StatsPanel />
      </div>

      <CTA onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />
    </>
  );
};

export default StartupsPage;
