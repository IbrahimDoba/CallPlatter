// Define types inline to avoid import issues
type MarblePostList = {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    content: string;
    description: string;
    coverImage: string;
    publishedAt: Date;
    updatedAt: Date;
    authors: Array<{
      id: string;
      name: string;
      slug: string;
      image: string | null;
      bio: string | null;
      role: string | null;
      socials: Array<{
        url: string;
        platform: "x" | "github" | "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "website" | "onlyfans" | "discord" | "bluesky";
      }>;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
    tags: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>;
    attribution: {
      author: string;
      url: string;
    } | null;
  }>;
  pagination: {
    limit: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
    totalPages: number;
  };
};

type MarblePost = {
  post: {
    id: string;
    slug: string;
    title: string;
    content: string;
    description: string;
    coverImage: string;
    publishedAt: Date;
    updatedAt: Date;
    authors: Array<{
      id: string;
      name: string;
      slug: string;
      image: string | null;
      bio: string | null;
      role: string | null;
      socials: Array<{
        url: string;
        platform: "x" | "github" | "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "website" | "onlyfans" | "discord" | "bluesky";
      }>;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
    tags: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>;
    attribution: {
      author: string;
      url: string;
    } | null;
  };
};

type MarbleTagList = {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
  pagination: {
    limit: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
    totalPages: number;
  };
};

type MarbleCategoryList = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
  pagination: {
    limit: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
    totalPages: number;
  };
};

type MarbleAuthorList = {
  authors: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
    bio: string | null;
    role: string | null;
    socials: Array<{
      url: string;
      platform: "x" | "github" | "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "website" | "onlyfans" | "discord" | "bluesky";
    }>;
  }>;
  pagination: {
    limit: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
    totalPages: number;
  };
};

const url = process.env.MARBLE_API_URL || 'https://api.marblecms.com';
const key = process.env.MARBLE_WORKSPACE_KEY || 'cmgob7qz8000fl504qffcx68h';

export async function getPosts() {
  try {
    const raw = await fetch(`${url}/${key}/posts`, {
      cache: "force-cache",
      next: {
        tags: ["posts"],
      },
    });
    
    if (!raw.ok) {
      throw new Error(`Failed to fetch posts: ${raw.status}`);
    }
    
    const data: MarblePostList = await raw.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}

export async function getTags() {
  try {
    const raw = await fetch(`${url}/${key}/tags`, {
      cache: "force-cache",
      next: {
        tags: ["tags"],
      },
    });
    
    if (!raw.ok) {
      throw new Error(`Failed to fetch tags: ${raw.status}`);
    }
    
    const data: MarbleTagList = await raw.json();
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return null;
  }
}

export async function getSinglePost(slug: string) {
  try {
    const raw = await fetch(`${url}/${key}/posts/${slug}`, {
      cache: "force-cache",
      next: {
        tags: ["posts", slug],
      },
    });
    
    if (!raw.ok) {
      throw new Error(`Failed to fetch post: ${raw.status}`);
    }
    
    const data: MarblePost = await raw.json();
    return data;
  } catch (error) {
    console.error('Error fetching single post:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const raw = await fetch(`${url}/${key}/categories`, {
      cache: "force-cache",
      next: {
        tags: ["categories"],
      },
    });
    
    if (!raw.ok) {
      throw new Error(`Failed to fetch categories: ${raw.status}`);
    }
    
    const data: MarbleCategoryList = await raw.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

export async function getAuthors() {
  try {
    const raw = await fetch(`${url}/${key}/authors`, {
      cache: "force-cache",
      next: {
        tags: ["authors"],
      },
    });
    
    if (!raw.ok) {
      throw new Error(`Failed to fetch authors: ${raw.status}`);
    }
    
    const data: MarbleAuthorList = await raw.json();
    return data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return null;
  }
}
