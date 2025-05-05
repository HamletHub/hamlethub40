import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import Container from "@/app/_components/container";
import { PostHeader } from "@/app/_components/post-header";
import { PostBody } from "@/app/_components/post-body";
import TownHeader from "@/app/_components/TownHeader";
import { convertToGcsUrl } from "@/lib/imageUtils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import GoogleAd from "@/app/_components/GoogleAd";
import { LRUCache } from "lru-cache";

// Cache configuration
const hubCache = new LRUCache<string, Hub>({
  max: 100, // Maximum 100 items
  ttl: 1000 * 60 * 10, // 10 minutes
});

const postCache = new LRUCache<string, AssetPost>({
  max: 500, // Maximum 500 items
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Define type for MongoDB assets/posts
interface AssetPost {
  _id: string;
  hubId: any;
  title: string;
  alias: string;
  description: string;
  type: string;
  status: string;
  state: string;
  publishAt: string;
  imageUrl: string;
  metaDescription: string;
}

// Define type for MongoDB hubs
interface Hub {
  _id: string;
  title: string;
  alias: string;
  state: string;
}

// Define params type for Next.js 15
interface PageParams {
  params: Promise<{
    town: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const { town: townAlias, slug } = resolvedParams;

    const db = await getDatabase();
    
    // Cache key for hub
    const hubCacheKey = `hub:${townAlias}`;
    
    // Try to get hub from cache
    let hub = hubCache.get(hubCacheKey);
    
    // If not in cache, fetch from database and cache it
    if (!hub) {
      hub = await db.collection("hubs").findOne({ alias: townAlias }) as Hub;
      if (hub) {
        hubCache.set(hubCacheKey, hub);
      }
    }

    if (!hub) {
      return {
        title: "Town Not Found | HamletHub",
        description: "The requested town could not be found."
      };
    }

    // Cache key for post
    const postCacheKey = `post:${hub._id}:${slug}`;
    
    // Try to get post from cache
    let post = postCache.get(postCacheKey);
    
    // If not in cache, fetch from database and cache it
    if (!post) {
      post = await db.collection('assets').findOne({
        alias: slug,
        type: "story",
        state: "published",
        hubId: hub._id
      }) as AssetPost;
      
      if (post) {
        postCache.set(postCacheKey, post);
      }
    }

    if (!post) {
      return {
        title: "Post Not Found | HamletHub",
        description: "The requested post could not be found."
      };
    }

    // Convert image URL for Open Graph
    const imageUrl = post.imageUrl ? convertToGcsUrl(post.imageUrl, "original") : '';

    return {
      title: `${post.title} | ${hub.title} | HamletHub`,
      description: post.metaDescription || `${post.title} - Latest from ${hub.title}`,
      openGraph: {
        title: post.title,
        description: post.metaDescription || "",
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error | HamletHub",
      description: "An error occurred",
    };
  }
}

export default async function StoryPage({ params }: PageParams) {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const { town: townAlias, slug } = resolvedParams;

    // Check if the slug appears to be an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    const hasImageExtension = imageExtensions.some(ext => slug.toLowerCase().endsWith(ext));

    if (hasImageExtension) {
      console.log(`Image file detected in slug: ${slug}`);
      return notFound();
    }

    const db = await getDatabase();

    // Cache key for hub
    const hubCacheKey = `hub:${townAlias}`;
    
    // Try to get hub from cache
    let hub = hubCache.get(hubCacheKey);
    
    // If not in cache, fetch from database and cache it
    if (!hub) {
      hub = await db.collection("hubs").findOne({ alias: townAlias }) as Hub;
      if (hub) {
        hubCache.set(hubCacheKey, hub);
      }
    }

    if (!hub) {
      console.error(`No hub found with alias: ${townAlias}`);
      return notFound();
    }

    // Cache key for post
    const postCacheKey = `post:${hub._id}:${slug}`;
    
    // Try to get post from cache
    let post = postCache.get(postCacheKey);
    
    // If not in cache, fetch from database and cache it
    if (!post) {
      post = await db.collection('assets').findOne({
        alias: slug,
        type: "story",
        state: "published",
        hubId: hub._id
      }) as AssetPost;
      
      if (post) {
        postCache.set(postCacheKey, post);
      }
    }

    if (!post) {
      console.error(`No post found with slug: ${slug} in town: ${townAlias}`);
      return notFound();
    }

    // Check if user is logged in (for Edit button)
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

    // Convert image URL to use original subfolder
    const imageUrl = post.imageUrl ? convertToGcsUrl(post.imageUrl, "original") : '';

    const formattedPost = {
      title: post.title || '',
      coverImage: imageUrl,
      date: post.publishAt ? new Date(post.publishAt).toISOString() : '',
      author: { name: 'HamletHub', picture: '' },
      content: post.description || ''
    };

    const adAlias = townAlias;

    return (
      <main>
        <Container>
          <TownHeader hubTitle={hub.title} />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">

              <article className="mb-32">
                {isLoggedIn && (
                  <div className="flex justify-end mb-4">
                    <Link
                      href={`/editor/${post._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                    >
                      Edit Story
                    </Link>
                  </div>
                )}
                <PostHeader
                  title={formattedPost.title}
                  coverImage={formattedPost.coverImage}
                  date={formattedPost.date}
                  author={formattedPost.author}
                  imageSubfolder="original"
                />
                <PostBody
                  content={formattedPost.content}
                  imageSubfolder="original"
                />
              </article>
            </div>
            <div className="w-full md:w-[330px] px-[15px] bg-white">
              <div className="mt-4">
                <GoogleAd
                  alias={adAlias}
                  size="300x250"
                />
              </div>
            </div>
          </div>

        </Container>
      </main>
    );
  } catch (error) {
    console.error("Error rendering story:", error);
    return (
      <main>
        <Container>
          <TownHeader hubTitle="Story" />
          <div className="py-10">
            <h1 className="text-2xl font-bold mb-4">Error Loading Story</h1>
            <p>Sorry, we couldn't load this story. Please try again later.</p>
          </div>
        </Container>
      </main>
    );
  }
}