// @ts-ignore
import { Metadata } from "next";
// @ts-ignore
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import Container from "@/app/_components/container";
import { PostHeader } from "@/app/_components/post-header";
import { PostBody } from "@/app/_components/post-body";
import TownHeader from "@/app/_components/TownHeader";

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
    const { town, slug } = resolvedParams;

    const db = await getDatabase();

    // First verify the town exists
    const hub = await db.collection("hubs").findOne({ alias: town }) as Hub;
    if (!hub) {
      return {
        title: "Town Not Found | HamletHub",
        description: "The requested town could not be found."
      };
    }

    // Then find the post
    const post = await db.collection('assets').findOne({
      alias: slug,
      type: "story",
      state: "published",
      $expr: { 
        $eq: [
          { $toString: "$hubId" }, 
          { $toString: hub._id }
        ]
      }
    }) as AssetPost;

    if (!post) {
      return {
        title: "Post Not Found | HamletHub",
        description: "The requested post could not be found."
      };
    }

    return {
      title: `${post.title} | ${hub.title} | HamletHub`,
      description: post.metaDescription || `${post.title} - Latest from ${hub.title}`,
      openGraph: {
        title: post.title,
        description: post.metaDescription || "",
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
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
    const { town, slug } = resolvedParams;

    const db = await getDatabase();

    // First verify the town exists
    const hub = await db.collection("hubs").findOne({ alias: town }) as Hub;
    if (!hub) {
      console.error(`No hub found with alias: ${town}`);
      return notFound();
    }

    // Then find the post
    const post = await db.collection('assets').findOne({
      alias: slug,
      type: "story",
      state: "published",
      $expr: { 
        $eq: [
          { $toString: "$hubId" }, 
          { $toString: hub._id }
        ]
      }
    }) as AssetPost;

    if (!post) {
      console.error(`No post found with slug: ${slug} in town: ${town}`);
      return notFound();
    }

    const formattedPost = {
      title: post.title || '',
      coverImage: post.imageUrl || '',
      date: post.publishAt ? new Date(post.publishAt).toISOString() : '',
      author: { name: 'HamletHub', picture: '' },
      content: post.description || ''
    };

    return (
      <main>
        <Container>
          <TownHeader hubTitle={hub.title} />
          <article className="mb-32">
            <PostHeader
              title={formattedPost.title}
              coverImage={formattedPost.coverImage}
              date={formattedPost.date}
              author={formattedPost.author}
            />
            <PostBody content={formattedPost.content} />
          </article>
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