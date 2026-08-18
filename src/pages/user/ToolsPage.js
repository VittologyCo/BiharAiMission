import React from 'react';
import AIWorkTool from '../../components/AIWorkTool/AIWorkTool';
import AICommandsHub from '../../components/AICommandsHub/AICommandsHub';
import PromptLibrary from '../../components/PromptLibrary/PromptLibrary';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';

const ToolsPage = () => {
  const toolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bihar AI Tools & Prompt Engineering Library',
    description: 'Curated 20+ public sector AI tools, administrative power slash commands, and 50+ copy-paste prompt engineering templates for governance and productivity.',
    url: 'https://biharaimission.org/tools',
  };

  return (
    <>
      <SEO
        title="AI Tools & Prompt Library | Bihar AI Mission"
        description="Access curated public governance AI tools, administrative AI power commands for ChatGPT, Gemini, Claude, and 50+ structured prompt engineering templates."
        canonical="https://biharaimission.org/tools"
        keywords="Bihar AI Tools, Governance AI Utilities, AI Slash Commands, ChatGPT Commands for Officers, Prompt Engineering Library, Bihar Admin AI"
        schema={toolsSchema}
      />
      <AIWorkTool />
      <AICommandsHub />
      <PromptLibrary />
      <CTA />
    </>
  );
};

export default ToolsPage;
