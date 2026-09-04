import React from 'react';
import Hero from '../../components/Hero/Hero';
import DailyNewsRadar from '../../components/DailyNewsRadar/DailyNewsRadar';
import Pillars from '../../components/Pillars/Pillars';
import UseCases from '../../components/UseCases/UseCases';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA, HOME_FAQ_SCHEMA } from '../../utils/seoData';

const HomePage = ({ onOpenContact, onOpenRegistration }) => {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA, HOME_FAQ_SCHEMA],
  };

  return (
    <>
      <SEO
        title="Bihar AI Mission — Official Civic AI & Digital Literacy Initiative"
        description="Bihar AI Mission is a citizen-led civic AI initiative bringing AI literacy, Level 1 masterclasses, digital certifications, prompt engineering libraries, and governance AI tools to Bihar."
        canonical="https://biharaimission.org/"
        schema={homeSchema}
      />
      <Hero onOpenRegistration={onOpenRegistration} />
      <DailyNewsRadar />
      <Pillars />
      <UseCases />
      <CTA onOpenContact={onOpenContact} />
    </>
  );
};

export default HomePage;
