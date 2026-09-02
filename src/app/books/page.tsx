import { Library } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BooksPage() {
  return (
    <ComingSoon
      icon={Library}
      titleHi="पुस्तकें"
      titleEn="Books"
      descHi="यह मॉड्यूल आगामी चरण में पूर्ण सामग्री के साथ जोड़ा जाएगा।"
    />
  );
}
