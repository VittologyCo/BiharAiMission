import React from 'react';
import AIWorkTool from '../../components/AIWorkTool/AIWorkTool';
import AICommandsHub from '../../components/AICommandsHub/AICommandsHub';
import AIClasswork from '../../components/AIClasswork/AIClasswork';
import PromptLibrary from '../../components/PromptLibrary/PromptLibrary';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';

const ToolsPage = () => {
  const toolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bihar AI Tools & Practical Classwork Library',
    description: 'Curated 20+ public sector AI tools, 18 practical officer classwork assignments, administrative power slash commands, and 50+ prompt engineering templates.',
    url: 'https://biharaimission.org/tools',
  };

  return (
    <>
      <SEO
        title="AI Tools, Practical Classwork & Prompts | Bihar AI Mission"
        description="Access 18 officer-grade AI practical classwork assignments, curated public governance AI tools, administrative AI power commands, and structured prompt engineering templates."
        canonical="https://biharaimission.org/tools"
        keywords="Bihar AI Tools, AI Practical Classwork, Governance AI Utilities, AI Slash Commands, ChatGPT Commands for Officers, Prompt Engineering Library, Bihar Admin AI"
        schema={toolsSchema}
      />
      <AIWorkTool />
      <AICommandsHub />
      <AIClasswork />
      <PromptLibrary />
      <CTA />
    </>
  );
};

export default ToolsPage;
