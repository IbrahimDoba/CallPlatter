export type Post = {
    id: string;
    slug: string;
    title: string;
    content: string;
    description: string;
    coverImage: string;
    publishedAt: Date;
    updatedAt: Date;
    authors: Author[];
    category: Omit<Category, "count">;
    tags: Omit<Tag, "count">[];
    attribution: {
      author: string;
      url: string;
    } | null;
  };
  
  export type Pagination = {
    limit: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
    totalPages: number;
  };
  
  export type MarblePostList = {
    posts: Post[];
    pagination: Pagination;
  };
  
  export type MarblePost = {
    post: Post;
  };
  
  export type Tag = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: {
      posts: number;
    };
  };
  export type MarbleTag = {
    tag: Tag;
  };
  
  export type MarbleTagList = {
    tags: Tag[];
    pagination: Pagination;
  };
  
  export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: {
      posts: number;
    };
  };
  
  export type MarbleCategory = {
    category: Category;
  };
  
  export type MarbleCategoryList = {
    categories: Category[];
    pagination: Pagination;
  };
  
  export type Author = {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    bio: string | null;
    role: string | null;
    socials: Social[];
  };
  export type Social = {
    url: string;
    platform: SocialPlatform;
  };
  export type SocialPlatform =
  | "x"
  | "github"
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "website"
  | "onlyfans"
  | "discord"
  | "bluesky";
  
  export type MarbleAuthor = {
    author: Author;
  };
  
  export type MarbleAuthorList = {
    authors: Author[];
    pagination: Pagination;
  };

  export type PostEventData = {
    event: MarblePostEvents;
    data: {
      id: string;
      slug: string;
      title: string;
      userId: string;
    };
  };
  
  export type TagEventData = {
    event: MarbleTagEvents;
    data: {
      id: string;
      slug: string;
    };
  };
  
  export type CategoryEventData = {
    event: MarbleCategoryEvents;
    data: {
      id: string;
      slug: string;
    };
  };
  export type MediaEventData = {
    event: MarbleMediaEvents;
    data: {
      id: string;
      name: string;
    };
  };
  
  export type MarblePostEvents =
    | "post.published"
    | "post.updated"
    | "post.deleted";
  export type MarbleTagEvents = "tag.created" | "tag.updated" | "tag.deleted";
  export type MarbleCategoryEvents =
    | "category.created"
    | "category.updated"
    | "category.deleted";
  export type MarbleMediaEvents = "media.deleted";
  export type MarbleEvents =
    | MarblePostEvents
    | MarbleTagEvents
    | MarbleCategoryEvents
    | MarbleMediaEvents;
  export type MarbleEventData =
    | PostEventData
    | TagEventData
    | CategoryEventData
    | MediaEventData;