import FaqIndex from "@/app/faq/FaqIndex";
import { faqIndexMetadata } from "@/app/faq/metadata";

export const metadata = faqIndexMetadata("ko");

export default function Page() {
  return <FaqIndex locale="ko" />;
}
