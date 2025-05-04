'use client';

import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

// Function to truncate text to a specific length without cutting off words
const truncateText = (text: string | undefined, maxLength: number): string => {
  // Handle undefined or empty text
  if (!text || text.length === 0) return '';

  // First remove HTML tags
  let plainText = text.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  plainText = plainText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');

  if (plainText.length <= maxLength) return plainText;

  // Find the last space before maxLength
  const lastSpaceIndex = plainText.substring(0, maxLength).lastIndexOf(' ');

  // If no space found, cut at maxLength
  if (lastSpaceIndex === -1) return plainText.substring(0, maxLength) + '...';

  // Cut at the last space and add ellipsis
  return plainText.substring(0, lastSpaceIndex) + '...';
};

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  content?: string;
  author: Author;
  slug: string;
  townSlug: string;
  imageSubfolder?: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  content,
  author,
  slug,
  townSlug,
  imageSubfolder,
}: Props) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage
          slug={slug}
          title={title}
          src={coverImage}
          townSlug={townSlug}
          imageSubfolder={imageSubfolder}
        />
      </div>
      <div className="text-sm text-greyblue-light mb-1">
        <DateFormatter dateString={date} />
      </div>

      <h3 className="text-2xl font-semibold font-vollkorn mb-2 leading-snug">
        <Link
          href={`/${townSlug}/${slug}`}
          className="hover:underline"
          onClick={() => console.log(`Link clicked for ${title} at ${Date.now()}`)}
        >
          {title}
        </Link>
      </h3>
      <p className="text-base font-normal text-greyblue-light leading-relaxed mb-4">
        {truncateText(content || excerpt, 160)}
      </p>
      {/* <Avatar name={author.name} picture={author.picture} /> */}
    </div>
  );
}
