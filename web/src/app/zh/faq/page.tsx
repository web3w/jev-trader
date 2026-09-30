import FaqIndex from "@/app/faq/FaqIndex";
import { faqIndexMetadata } from "@/app/faq/metadata";

export const metadata = faqIndexMetadata("zh-CN");

export default function Page() {
  return <FaqIndex locale="zh-CN" />;
}
