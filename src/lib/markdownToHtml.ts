import { remark } from "remark";
import html from "remark-html";
import { processHtmlContent } from "./imageUtils";

export default async function markdownToHtml(markdown: string, imageSubfolder?: string) {
  const result = await remark().use(html).process(markdown);
  const htmlContent = result.toString();
  // Process the HTML to update any S3 image URLs to GCS URLs with specified subfolder
  return processHtmlContent(htmlContent, imageSubfolder);
}
