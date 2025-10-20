import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type ProseProps = HTMLAttributes<HTMLElement> & {
  as?: 'article';
  html: string;
};

function Prose({ children, html, className }: ProseProps) {
  return (
    <article
      className={cn(
        'prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground',
        className
      )}
    >
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </article>
  );
}

export default Prose;