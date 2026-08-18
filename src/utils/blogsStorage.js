import { supabase } from './supabase';

const STORAGE_BLOGS = 'bihar_ai_blogs_v1';

export const defaultBlogs = [
  {
    id: 'blog-1',
    title: 'Generative AI Workflows for Bihar Public Administration & District Officers',
    category: 'Governance',
    author: 'Bihar AI Mission Editorial Desk',
    authorRole: 'Governance AI Lead',
    date: '26 July 2026',
    readTime: '5 min read',
    excerpt: 'How departmental AI prompt tools and automated drafting templates are reducing official memo writing time from hours to minutes across Patna, Gaya, and Muzaffarpur district offices.',
    content: `Generative Artificial Intelligence is transforming administrative efficiency across public governance in Bihar. 

With over 500+ departmental officers participating in the Bihar AI Mission workshops, administrative workflows have seen dramatic speed improvements in drafting public notices, summarizing lengthy policy reports, and translating official documents between English and Hindi.

Key Takeaways for Departmental Officers:
1. Standardized Memos: Using pre-tested prompt templates ensures consistent language across government communications.
2. Rapid Summarization: 60-page policy briefs can be distilled into 1-page executive bullet points in under 60 seconds.
3. Bilingual Accessibility: Automated translation engines tuned for Bihar government terminology enable seamless communication across district collectorates.

The Bihar AI Mission continues to conduct hands-on training sessions for state civil servants to build responsible, human-in-the-loop AI governance capabilities.`,
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80',
    isPublished: true,
    createdAt: new Date('2026-07-26').toISOString()
  },
  {
    id: 'blog-2',
    title: 'AI in Smart Agriculture: Detecting Rice Crop Diseases in Bhojpur & Rohtas',
    category: 'Agriculture',
    author: 'Dr. Ramesh Kumar',
    authorRole: 'AgriTech Specialist',
    date: '22 July 2026',
    readTime: '4 min read',
    excerpt: 'Deploying mobile-based computer vision tools for Bihar farmers to diagnose plant leaf diseases in real-time without requiring high-speed internet.',
    content: `Agriculture is the backbone of Bihar's economy, employing over 70% of the state's workforce. Recent pilots in Bhojpur and Rohtas districts demonstrate how mobile-based computer vision algorithms are helping farmers identify rice blast disease early.

Key Features of the Bihar Agri-AI Pilot:
• Offline AI Inference: Smartphone models run directly on the device, functioning smoothly even in remote rural areas with poor connectivity.
• Vernacular Voice Guidance: Recommendations are provided in clear Hindi and local dialects (Bhojpuri and Maithili).
• Soil Health Optimization: Deep learning models analyze soil sensor data to recommend precise fertilizer ratios, cutting input costs by 18%.

Over 12,000 smallholder farmers have adopted the Agri-AI assistant during the recent Kharif season, resulting in a 14% crop yield protection rate.`,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
    isPublished: true,
    createdAt: new Date('2026-07-22').toISOString()
  },
  {
    id: 'blog-3',
    title: 'Empowering Bihar Youth: 30,000+ Learners Certified in Digital AI Skills',
    category: 'Education',
    author: 'Bihar AI Learning Hub Desk',
    authorRole: 'Skill Development Team',
    date: '18 July 2026',
    readTime: '6 min read',
    excerpt: "Inside Bihar's ground-breaking digital AI literacy drive providing bilingual courses and recognized certificates for students, officers, and job seekers.",
    content: `The Bihar AI Learning Hub has crossed a major milestone of 30,000 certified learners across 38 districts of Bihar.

Inspired by the national IndiaAI FutureSkills vision, the portal offers accessible, zero-cost digital courses in AI Fundamentals, Prompt Engineering, Data Governance, and Machine Learning.

Program Highlights:
• 100% Free Certification: Learners can complete hands-on interactive modules and take proctored certification exams online.
• Verification via QR Code: Every digital certificate features an official QR code for instant employment verification by recruiters.
• Live Masterclasses: Weekly online masterclasses conducted by leading AI researchers bridge the gap between academic theory and real-world implementation.

The Bihar AI Mission aims to certify 100,000 learners by December 2026, creating an industry-ready workforce for Bihar's expanding technology ecosystem.`,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    isPublished: true,
    createdAt: new Date('2026-07-18').toISOString()
  }
];

export const getBlogsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_BLOGS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage error reading blogs:', e);
  }
  return [];
};

export const fetchBlogsFromSupabase = async () => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const formatted = data.map(b => ({
          id: b.id,
          title: b.title,
          category: b.category || 'Governance',
          author: b.author || 'Bihar AI Mission Editorial Desk',
          authorRole: b.author_role || 'Governance AI Lead',
          date: b.date || new Date(b.created_at).toLocaleDateString(),
          readTime: b.read_time || '5 min read',
          excerpt: b.excerpt || '',
          content: b.content || '',
          image: b.image || '',
          isPublished: b.is_published !== false,
          createdAt: b.created_at
        }));
        saveBlogsToStorage(formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch blogs warning:', err);
  }
  return getBlogsFromStorage();
};

export const saveBlogsToStorage = (blogs) => {
  try {
    localStorage.setItem(STORAGE_BLOGS, JSON.stringify(blogs));
    window.dispatchEvent(new Event('bihar_ai_blogs_updated'));
  } catch (e) {
    console.error('LocalStorage error saving blogs:', e);
  }
};

export const saveBlogToSupabase = async (blogItem) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('blogs').upsert({
        id: blogItem.id,
        title: blogItem.title,
        category: blogItem.category,
        author: blogItem.author,
        author_role: blogItem.authorRole,
        date: blogItem.date,
        read_time: blogItem.readTime,
        excerpt: blogItem.excerpt,
        content: blogItem.content,
        image: blogItem.image,
        is_published: blogItem.isPublished !== false,
        created_at: blogItem.createdAt || new Date().toISOString()
      });

      if (error) {
        console.error('Supabase save blog error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
  } catch (err) {
    console.error('Supabase save blog exception:', err);
    return { success: false, error: err.message || 'Network error' };
  }
  return { success: true };
};

export const deleteBlogFromSupabase = async (id) => {
  try {
    if (supabase) {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete blog error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    }
  } catch (err) {
    console.error('Supabase delete blog exception:', err);
    return { success: false, error: err.message || 'Network error' };
  }
  return { success: true };
};

export const getBlogById = (id) => {
  const blogs = getBlogsFromStorage();
  return blogs.find((b) => String(b.id) === String(id));
};
