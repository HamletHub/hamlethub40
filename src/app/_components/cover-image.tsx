import cn from "classnames";
import Link from "next/link";
import Image from "next/image";
import { convertToGcsUrl } from "@/lib/imageUtils";

type Props = {
  title: string;
  src: string;
  slug?: string;
  townSlug?: string;
  imageSubfolder?: string;
};

const CoverImage = ({ title, src, slug, townSlug, imageSubfolder }: Props) => {
  // Convert S3 URL to GCS URL with specified subfolder
  const imageUrl = convertToGcsUrl(src, imageSubfolder);
  
  const image = (
    <Image
      src={imageUrl}
      alt={`Cover Image for ${title}`}
      className={cn("shadow-sm w-full", {
        "hover:shadow-lg transition-shadow duration-200": slug,
      })}
      width={1300}
      height={630}
    />
  );
  
  const href = townSlug && slug
    ? `/${townSlug}/${slug}`
    : slug
      ? `/posts/${slug}`
      : "";
  
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={href} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
