import { convertToGcsUrl } from "@/lib/imageUtils";

type Props = {
  name: string;
  picture: string;
  imageSubfolder?: string;
};

const Avatar = ({ name, picture, imageSubfolder }: Props) => {
  // Convert S3 URL to GCS URL with specified subfolder
  const imageUrl = convertToGcsUrl(picture, imageSubfolder);
  
  return (
    <div className="flex items-center">
      <img src={imageUrl} className="w-12 h-12 rounded-full mr-4" alt={name} />
      <div className="text-xl font-bold">{name}</div>
    </div>
  );
};

export default Avatar;
