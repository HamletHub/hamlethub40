import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import { getHubIdFromTownSlug } from "@/lib/hubs";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";

export default async function TownPost(props: Params) {
  try {
    const params = await props.params;
    const post = await getPostBySlug(params.slug);

    // Verify that the post belongs to the correct town
    if (!post || post.townSlug !== params.town) {
      return notFound();
    }

    const content = await markdownToHtml(post.content || "");

    return (
      <main>
        <Alert preview={post.preview} />
        <Container>
          <Header />
          <article className="mb-32">
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
            />
            <PostBody content={content} />
          </article>
        </Container>
      </main>
    );
  } catch (error) {
    console.error("Error rendering post:", error);
    return (
      <main>
        <Container>
          <Header />
          <div className="py-10">
            <h1 className="text-2xl font-bold mb-4">Error Loading Post</h1>
            <p>Sorry, we couldn't load this post. Please try again later.</p>
          </div>
        </Container>
      </main>
    );
  }
}

type Params = {
  params: Promise<{
    town: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  try {
    const params = await props.params;
    const post = await getPostBySlug(params.slug);

    if (!post || post.townSlug !== params.town) {
      return {
        title: "Post Not Found",
        description: "The requested post could not be found."
      };
    }

    // Include town name in the title
    const title = `${post.title} | ${params.town.replace(/-/g, ' ')} | ${CMS_NAME}`;

    return {
      title,
      openGraph: {
        title,
        images: [post.ogImage.url],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Post - Error",
    };
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();

    return posts.map((post) => ({
      town: post.townSlug,
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
} 