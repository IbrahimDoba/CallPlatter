import Container from '@/components/container';
import PostCard from '@/components/postCard';
// Define the type inline to avoid import issues
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
import Link from 'next/link';
import { Home } from 'lucide-react';

const url = process.env.MARBLE_API_URL || 'https://api.marblecms.com';
const key = process.env.MARBLE_WORKSPACE_KEY || 'cmgob7qz8000fl504qffcx68h';

export async function getPosts() {
  try {
    const raw = await fetch(`${url}/${key}/posts`, {
      next: {
        tags: ["posts"],
      },
    });
    const data: MarblePostList = await raw.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export default async function HomePage() {
  const data = await getPosts();

  if (!data || !data.posts || data.posts.length === 0) {
    return (
      <section className="min-h-screen bg-background flex items-center justify-center">
        <Container className='py-20'>
          <div className="text-center space-y-6">
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">No posts yet</h1>
            <p className="text-muted-foreground text-lg">Check back soon for new stories and insights.</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <Container className='py-16 md:py-24'>
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          
          <div className="mb-16 md:mb-20">
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-3 tracking-tight">
              Explore Our Blog
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Discover insights, stories, and updates from our team
            </p>
          </div>
          
          <div className='grid gap-8 md:gap-10 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {data.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}