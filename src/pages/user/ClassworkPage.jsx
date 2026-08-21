import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import AIClasswork from '../../components/AIClasswork/AIClasswork';
import CTA from '../../components/CTA/CTA';
import { useLanguage } from '../../hooks/useLanguage';

const ClassworkPage = () => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const classworkSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'Bihar AI Practical Classwork & Hands-on Lab Exercises',
    description: '18 practical hands-on AI exercises for government officers and administrators across ChatGPT, Gemini, Copilot, Perplexity, Canva, Zapier, ElevenLabs, and more.',
    url: 'https://biharaimission.org/tools/classwork',
    provider: {
      '@type': 'Organization',
      name: 'Bihar AI Mission',
      url: 'https://biharaimission.org'
    }
  };

  return (
    <>
      <SEO
        title="AI Practical Classwork & Governance Exercises | Bihar AI Mission"
        description="Access 18 officer-grade practical AI classwork assignments, step-by-step instructions, submission checklists, and downloadable PDF/Word study materials."
        canonical="https://biharaimission.org/tools/classwork"
        keywords="Bihar AI Classwork, Government AI Training, AI Practical Exercises, Bihar IT Department AI, ChatGPT for Officers, Governance AI Prompts"
        schema={classworkSchema}
      />

      <div style={{ paddingTop: '24px', maxWidth: '1220px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C8BFB3', marginBottom: '8px' }}>
          <Link to="/" style={{ color: '#C8BFB3', textDecoration: 'none' }}>
            {isHi ? 'होम' : 'Home'}
          </Link>
          <span>›</span>
          <Link to="/tools" style={{ color: '#C8BFB3', textDecoration: 'none' }}>
            {isHi ? 'AI टूल्स' : 'AI Tools'}
          </Link>
          <span>›</span>
          <span style={{ color: '#E8B23D', fontWeight: 600 }}>
            {isHi ? 'प्रैक्टिकल क्लासवर्क' : 'Practical Classwork'}
          </span>
        </div>
      </div>

      <AIClasswork isStandaloneSubpage={true} />

      <CTA />
    </>
  );
};

export default ClassworkPage;
