import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getDatabase } from "@/lib/mongodb";
import { Post } from "@/interfaces/post";
import { getTownSlugFromHubId } from "@/lib/hubs";

// Define type for MongoDB assets
interface AssetPost {
  _id: string;
  hubId: string;
  title: string;
  alias: string;
  description: string;
  type: string;
  status: string;
  state: string;
  createdAt: string;
  occurAt: string | null;
  isPublic: boolean;
  imageUrl: string;
  metaDescription: string;
  metaKeywords: string;
  publishAt: string;
}

export default async function Index() {
  try {
    const db = await getDatabase();
    const assetPosts = await db.collection('assets').find({ 
      type: "story",
      state: "published"
    })
    .sort({ publishAt: -1 })
    .limit(10)
    .toArray() as AssetPost[];
    
    const allPosts = assetPosts.map((post: AssetPost) => ({
      slug: post.alias || '',
      title: post.title || '',
      date: post.publishAt ? new Date(post.publishAt).toISOString() : '',
      coverImage: post.imageUrl || '',
      author: { name: 'HamletHub', picture: '' },
      excerpt: post.metaDescription || '',
      ogImage: { url: post.imageUrl || '' },
      content: post.description || '',
      hubId: post.hubId || '',
      townSlug: getTownSlugFromHubId(post.hubId) || '',
    })) as Post[];

    const heroPost = allPosts[0];
    const morePosts = allPosts.slice(1);

    return (
      <main>
        <Container>
          <Intro />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
              townSlug={heroPost.townSlug}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </main>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return (
      <main>
        <Container>
          <Intro />
          <p>Error loading posts. Please try again later.</p>
        </Container>
      </main>
    );
  }
}