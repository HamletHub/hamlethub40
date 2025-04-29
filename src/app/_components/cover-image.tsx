import cn from "classnames";
import Link from "next/link";
import Image from "next/image";

type Props = {
  title: string;
  src: string;
  slug?: string;
  townSlug?: string;
};

const CoverImage = ({ title, src, slug, townSlug }: Props) => {
  const image = (
    <Image
      src={src}
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
