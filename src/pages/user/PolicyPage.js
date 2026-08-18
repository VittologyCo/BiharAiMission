import React from 'react';
import Policy from '../../components/Policy/Policy';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';

const PolicyPage = () => {
  return (
    <>
      <SEO
        title="Privacy Policy & Exam Rules | Bihar AI Mission"
        description="Official Bihar AI Mission examination integrity policy, anti-proctoring violation guidelines, and data privacy standard."
        canonical="https://biharaimission.org/policy"
        keywords="Bihar AI Policy, Exam Rules, Proctoring Integrity, Digital Credential Policy"
      />
      <Policy />
      <CTA />
    </>
  );
};

export default PolicyPage;
