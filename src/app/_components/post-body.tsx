import markdownStyles from "./markdown-styles.module.css";
import { processHtmlContent } from "@/lib/imageUtils";

type Props = {
  content: string;
  imageSubfolder?: string;
};

export function PostBody({ content, imageSubfolder }: Props) {
  // Process the HTML content to update image URLs with specified subfolder
  const processedContent = processHtmlContent(content, imageSubfolder);
  
  return (
    <div className="max-w-2xl mx-auto text-base font-normal">
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}
