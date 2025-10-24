import Container from '@/components/container';
import Prose from '@/components/prose';
import { getPosts, getSinglePost } from '@/lib/marble/queries';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // read route params
  const slug = (await params).slug;

  // fetch data
  const data = await getSinglePost(slug);

  if (!data || !data.post) return {};

  return {
    title: data.post.title,
    description: data.post.description,
    twitter: {
      title: data.post.title,
      description: data.post.description,
      card: 'summary_large_image',
      images: data.post.coverImage ? [data.post.coverImage] : undefined,
    },
    openGraph: {
      type: 'article',
      title: data.post.title,
      description: data.post.description,
      publishedTime: new Date(data.post.publishedAt).toISOString(),
      authors: data.post.authors?.map((author: any) => author.name) || [],
      images: data.post.coverImage ? [
        {
          url: data.post.coverImage,
          width: 1200,
          height: 630,
          alt: data.post.title,
        }
      ] : [],
    },
  };
}

export async function generateStaticParams() {
  const data = await getPosts();
  if (!data || !data.posts.length) return [];

  return data.posts.map((post: any) => ({
    slug: post.slug,
  }));
}

async function Page({ params }: PageProps) {
  const slug = (await params).slug;
  const data = await getSinglePost(slug);
  if (!data || !data.post) return notFound();

  const formattedDate = new Date(data.post.publishedAt).toLocaleDateString(
    'en-US',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
  const authors = data.post.authors
  return (
    <div className="min-h-screen py-14">
        <section className='space-y-6 lg:space-y-8 max-w-3xl mx-auto'>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
          
          <div className='flex flex-col items-start gap-4 text-start'>
            <h1 className='font-serif text-3xl lg:text-4xl text-foreground'>
              {data.post.title}
            </h1>
            <div className="flex flex-col items-start gap-2 text-muted-foreground">
              <time dateTime={data.post.publishedAt.toString()}>
                {formattedDate}
              </time>
              {/* {data.post.authors && data.post.authors.length > 0 && data.post.authors[0] && (
                <div className='flex items-start gap-2'>
                  {data.post.authors[0].image && (
                    <Image
                      src={data.post.authors[0].image}
                      alt={data.post.authors[0].name || 'Author'}
                      width={36}
                      height={36}
                      loading='eager'
                      className='aspect-square shrink-0 size-8 rounded-full'
                    />
                  )}
                  <p className='text-muted-foreground'>{data.post.authors[0].name}</p>
                </div>
              )} */}
            </div>
          </div>
          
          {data.post.coverImage && (
            <div className='relative min-h-[360px] md:min-h-[400px] lg:min-h-[430px] rounded-lg overflow-hidden'>
              <Image
                src={data.post.coverImage}
                alt={data.post.title}
                loading='eager'
                fill
                className='object-cover size-full max-sm:max-h-[360px]'
              />
            </div>
          )}
          
          <div className="prose-wrapper">
            <Prose html={data.post.content} />
          </div>
        </section>
    </div>
  );
}

export default Page;