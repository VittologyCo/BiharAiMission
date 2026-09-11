import React, { useState, useEffect } from 'react';
import AIWorkTool from '../../components/AIWorkTool/AIWorkTool';
import AICommandsHub from '../../components/AICommandsHub/AICommandsHub';
import TrendingImagePrompts from '../../components/TrendingImagePrompts/TrendingImagePrompts';
import PromptLibrary from '../../components/PromptLibrary/PromptLibrary';
import CTA from '../../components/CTA/CTA';
import SEO from '../../components/SEO/SEO';

const ToolsPage = () => {
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#ai-fun-zone' || window.location.hash === '#trending-retro-prompts') {
      setIsTrendingOpen(true);
    }
  }, []);

  const handleToggleTrending = () => {
    setIsTrendingOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          const el = document.getElementById('ai-fun-zone') || document.getElementById('trending-retro-prompts');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
      return nextState;
    });
  };

  const toolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bihar AI Tools, Power Commands & AI Fun Zone',
    description: 'Curated 20+ public sector AI tools, administrative power slash commands, interactive AI Fun Zone with creative trending image prompts, and 50+ prompt engineering templates.',
    url: 'https://biharaimission.org/tools',
  };

  return (
    <>
      <SEO
        title="AI Tools, Slash Commands & AI Fun Zone | Bihar AI Mission"
        description="Access curated public governance AI tools, administrative AI power commands, interactive AI Fun Zone with creative trending image prompts, and structured prompt engineering templates."
        canonical="https://biharaimission.org/tools"
        keywords="Bihar AI Tools, AI Fun Zone, Trending AI Image Prompts, Creative AI Prompts, Governance AI Utilities, AI Slash Commands, ChatGPT Commands for Officers, Prompt Engineering Library, Bihar Admin AI"
        schema={toolsSchema}
      />
      <AIWorkTool />
      <AICommandsHub
        onToggleTrendingPrompts={handleToggleTrending}
        isTrendingOpen={isTrendingOpen}
      />
      {isTrendingOpen && (
        <TrendingImagePrompts onClose={() => setIsTrendingOpen(false)} />
      )}
      <PromptLibrary />
      <CTA />
    </>
  );
};

export default ToolsPage;
