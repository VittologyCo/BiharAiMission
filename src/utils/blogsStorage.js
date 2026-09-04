/**
 * Bihar AI Mission — Blog & Article CMS Service
 * 100% Backend & Supabase Driven (Zero hardcoded articles)
 */
import { supabase } from './supabase';

const STORAGE_BLOGS = 'bihar_ai_blogs_db_cache';

export const defaultBlogs = [];

export const getBlogsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_BLOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

export const cacheBlogsSilently = (blogs) => {
  try {
    localStorage.setItem(STORAGE_BLOGS, JSON.stringify(blogs || []));
  } catch (e) {
    console.warn('LocalStorage error caching blogs silently:', e);
  }
};

export const saveBlogsToStorage = (blogs) => {
  try {
    localStorage.setItem(STORAGE_BLOGS, JSON.stringify(blogs || []));
    window.dispatchEvent(new Event('bihar_ai_blogs_updated'));
  } catch (e) {
    console.error('LocalStorage error saving blogs:', e);
  }
};

/**
 * Fetch all published blogs directly from Supabase database
 */
export const fetchBlogsFromSupabase = async () => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const formatted = data.map((b) => ({
          id: b.id,
          slug: b.slug || b.id,
          title: b.title || 'Untitled Article',
          category: b.category || 'Mission',
          author: b.author || 'Bihar AI Mission Editorial Desk',
          authorRole: b.author_role || b.authorRole || 'Editorial Lead',
          date: b.date || (b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
          readTime: b.read_time || b.readTime || '5 min read',
          excerpt: b.excerpt || '',
          content: b.content || '',
          image: b.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          tags: Array.isArray(b.tags) ? b.tags : [],
          targetPage: b.target_page || b.targetPage || '',
          keywords: b.keywords || '',
          isPublished: b.is_published !== false,
          views: Number(b.views || 0),
          createdAt: b.created_at || new Date().toISOString(),
        }));
        cacheBlogsSilently(formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch blogs warning:', err);
  }
  return getBlogsFromStorage();
};

/**
 * Save / Update a blog article in Supabase
 */
export const saveBlogToSupabase = async (blogItem) => {
  const slug = (blogItem.slug || blogItem.title || `article-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const formattedItem = {
    id: blogItem.id || `blog-${Date.now()}`,
    slug: slug,
    title: blogItem.title,
    category: blogItem.category || 'Mission',
    author: blogItem.author || 'Bihar AI Mission Editorial Desk',
    author_role: blogItem.authorRole || 'Editorial Lead',
    date: blogItem.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    read_time: blogItem.readTime || '5 min read',
    excerpt: blogItem.excerpt || '',
    content: blogItem.content || '',
    image: blogItem.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    tags: Array.isArray(blogItem.tags) ? blogItem.tags : (typeof blogItem.tags === 'string' ? blogItem.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
    target_page: blogItem.targetPage || '',
    keywords: blogItem.keywords || '',
    is_published: blogItem.isPublished !== false,
    views: Number(blogItem.views || 0),
    updated_at: new Date().toISOString(),
  };

  // Local sync
  const currentBlogs = getBlogsFromStorage();
  const existingIndex = currentBlogs.findIndex((b) => String(b.id) === String(formattedItem.id));
  const uiItem = {
    ...formattedItem,
    authorRole: formattedItem.author_role,
    readTime: formattedItem.read_time,
    targetPage: formattedItem.target_page,
    isPublished: formattedItem.is_published,
  };

  if (existingIndex >= 0) {
    currentBlogs[existingIndex] = uiItem;
  } else {
    currentBlogs.unshift(uiItem);
  }
  saveBlogsToStorage(currentBlogs);

  if (supabase) {
    try {
      const { data, error } = await supabase.from('blogs').upsert(formattedItem);
      if (error) {
        console.error('Supabase save blog error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Supabase save blog exception:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/**
 * Delete a blog from Supabase
 */
export const deleteBlogFromSupabase = async (id) => {
  const currentBlogs = getBlogsFromStorage().filter((b) => String(b.id) !== String(id));
  saveBlogsToStorage(currentBlogs);

  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete blog error:', error);
        return { success: false, error: error.message };
      }
    } catch (err) {
      console.error('Supabase delete blog exception:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/**
 * Increment blog view count
 */
export const incrementBlogViews = async (id) => {
  const currentBlogs = getBlogsFromStorage();
  const target = currentBlogs.find((b) => String(b.id) === String(id) || String(b.slug) === String(id));
  if (target) {
    target.views = (target.views || 0) + 1;
    cacheBlogsSilently(currentBlogs);
  }

  if (supabase && target) {
    try {
      await supabase.from('blogs').update({ views: target.views }).eq('id', target.id);
    } catch (e) {}
  }
};

/**
 * Retrieve article by slug or id
 */
export const getBlogBySlugOrId = (slugOrId) => {
  const blogs = getBlogsFromStorage();
  return blogs.find(
    (b) => String(b.slug).toLowerCase() === String(slugOrId).toLowerCase() || String(b.id) === String(slugOrId)
  );
};
