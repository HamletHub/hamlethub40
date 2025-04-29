import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPostBySlug } from "@/lib/api";

export default async function Post(props: Params) {
  try {
    const params = await props.params;
    const post = await getPostBySlug(params.slug);

    if (!post) {
      return notFound();
    }

    // Redirect to the town-specific URL
    if (post.townSlug) {
      redirect(`/${post.townSlug}/${post.slug}`);
    }

    return notFound(); // Fallback in case post doesn't have townSlug
  } catch (error) {
    console.error("Error rendering post:", error);
    return notFound();
  }
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  // Simplified metadata as this page will redirect
  return {
    title: "Redirecting...",
  };
}

// Don't generate static params for this route anymore
// as we want all posts to use the town-specific URL
export async function generateStaticParams() {
  return [];
}
