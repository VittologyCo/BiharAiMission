import React from 'react';
import About from '../../components/About/About';
import StatsPanel from '../../components/StatsPanel/StatsPanel';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';
import { useLanguage } from '../../hooks/useLanguage';

const AboutPage = ({ onOpenContact, onOpenRegistration }) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Bihar AI Mission',
    description: 'Bihar AI Mission is an independent, citizen-started platform dedicated to democratizing AI education, technology access, and digital literacy across all 38 districts of Bihar.',
    url: 'https://biharaimission.org/about',
  };

  return (
    <>
      <SEO
        title={isHi ? "हमारे बारे में — बिहार AI मिशन | नागरिक AI साक्षरता पहल" : "About Us — Bihar AI Mission | Transforming Bihar through Artificial Intelligence"}
        description={isHi ? "बिहार AI मिशन के स्वतंत्र नागरिक विजन, 38 जिलों में AI साक्षरता रोडमैप और तकनीकी सशक्तीकरण के बारे में जानें।" : "Learn about Bihar AI Mission, our independent civic vision, grassroots AI initiatives, digital literacy roadmap, and commitment to Bihar's digital transformation."}
        canonical="https://biharaimission.org/about"
        keywords="About Bihar AI Mission, Bihar Artificial Intelligence, Civic AI Bihar, Tech Empowerment Bihar, Bihar AI Roadmap"
        schema={aboutSchema}
      />
      
      <About />

      <div style={{ maxWidth: '1140px', margin: '40px auto 20px', padding: '0 24px' }}>
        <StatsPanel />
      </div>

      <CTA onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />
    </>
  );
};

export default AboutPage;
