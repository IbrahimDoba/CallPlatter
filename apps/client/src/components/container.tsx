"use client"
import { cn } from '@/lib/utils';
import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full min-h-screen px-6 md:px-14 lg:px-20 z-10 relative',
        className
      )}
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080802a_1px,transparent_1px),linear-gradient(to_bottom,#8080802a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      {children}
    </div>
  );
}

export default Container;