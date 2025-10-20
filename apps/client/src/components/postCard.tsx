"use client"
// Define the Post type inline to avoid import issues
type Post = {
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
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

interface PostCardProps {
  post: Post;
  showTags?: boolean;
}

function PostCard({ post, showTags = true }: PostCardProps) {
  const link = `/blog/${post.slug}`;
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <li className='flex flex-col gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow'>
      {post.coverImage && (
        <div className='relative group z-10 rounded-t-md min-h-[240px] overflow-hidden'>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            loading='eager'
            className='object-cover size-full h-[260px]'
          />
        </div>
      )}
      <Link
        href={link}
        className='hover:text-muted-foreground transition duration-300'
      >
        <h2 className='font-serif text-2xl text-foreground'>{post.title}</h2>
      </Link>
      <div className='flex items-center gap-2 font-mono text-muted-foreground'>
        <time dateTime={post.publishedAt.toString()}>{formattedDate}</time>
        <span className='mx-2'>-</span>
        <p>{post.authors[0]?.name}</p>
      </div>
      <p className='text-muted-foreground line-clamp-2'>{post.description}</p>
      <div className='flex items-center justify-between mt-auto'>
        <a href={link} className='hover:underline flex items-center gap-2 text-primary hover:text-primary/80'>
          <span>Read post</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='size-3'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25'
            />
          </svg>
        </a>
        {showTags && post.tags && post.tags.length > 0 && (
          <ul className='flex items-center gap-2'>
            {post.tags.map((tag) => (
              <li
                key={tag.id}
                className='text-xs text-muted-foreground hover:text-foreground hover:underline'
              >
                <a href={`/tag/${tag.slug}`}>#{tag.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default PostCard;