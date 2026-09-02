import { Library, Download, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import { formatFileSize } from "@/lib/format";
import type { BookCategory } from "@prisma/client";

type BookCardData = {
  id: string;
  title: string;
  category: BookCategory;
  board: string | null;
  medium: string;
  coverUrl: string | null;
  fileUrl: string | null;
  sourceUrl: string | null;
  edition: string | null;
  fileSizeBytes: number | null;
  subject: { nameHi: string } | null;
};

export function BookCard({ book }: { book: BookCardData }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative flex aspect-[3/4] items-center justify-center bg-surface-muted">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Library className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <Badge variant="outline" className="mb-1.5 w-fit text-[10px]">
          {BOOK_CATEGORY_LABEL[book.category]}
        </Badge>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{book.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {book.board}
          {book.subject ? ` · ${book.subject.nameHi}` : ""}
          {book.edition ? ` · ${book.edition}` : ""}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[11px] text-muted-foreground">
            {book.fileSizeBytes ? formatFileSize(book.fileSizeBytes) : "बाहरी स्रोत"}
          </span>
          {book.fileUrl ? (
            <a
              href={book.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" /> डाउनलोड
            </a>
          ) : book.sourceUrl ? (
            <a
              href={book.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" /> स्रोत
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export type { BookCardData };
