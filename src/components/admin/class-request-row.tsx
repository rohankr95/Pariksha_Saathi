"use client";

import { useState, useTransition } from "react";
import { Flame } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateClassRequestStatus } from "@/app/admin/class-requests/actions";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassRequestStatus } from "@prisma/client";

type Row = {
  id: string;
  status: ClassRequestStatus;
  adminRemark: string | null;
  upvotes: number;
  chapter: string | null;
  mode: string;
  preferredTime: string | null;
  description: string | null;
  student: { name: string; school: string | null; block: string | null };
  subject: { nameHi: string };
  preferredTeacher: { name: string } | null;
};

const STATUS_VALUES: ClassRequestStatus[] = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "SCHEDULED", "COMPLETED", "DECLINED"];

export function ClassRequestRow({ request }: { request: Row }) {
  const [status, setStatus] = useState<ClassRequestStatus>(request.status);
  const [remark, setRemark] = useState(request.adminRemark ?? "");
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();

  return (
    <div className="rounded-[var(--radius-lg)] border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            {request.subject.nameHi}
            {request.chapter ? ` · ${request.chapter}` : ""}
            {request.upvotes >= 5 && (
              <Badge variant="accent" className="gap-1 text-[10px]">
                <Flame className="h-3 w-3" /> {t("classRequest.admin.trending")} ·{" "}
                {t("classRequest.admin.supportCount", { count: request.upvotes })}
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {request.student.name} · {request.student.school} · {request.student.block}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("classRequest.admin.teacherLabel")}: {request.preferredTeacher?.name ?? t("classRequest.admin.anyTeacherOption")} ·{" "}
            {request.mode === "ONLINE" ? t("classRequest.form.online") : t("classRequest.form.offline")}
            {request.preferredTime ? ` · ${request.preferredTime}` : ""}
          </p>
          {request.description && <p className="mt-1 text-xs text-muted-foreground">{request.description}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value as ClassRequestStatus)} className="max-w-[160px]">
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {t(`classRequest.status.${value}`)}
            </option>
          ))}
        </Select>
        <Input
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder={t("classRequest.admin.remarkPlaceholder")}
          className="max-w-xs flex-1"
        />
        <Button
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => updateClassRequestStatus(request.id, status, remark))}
        >
          {t("classRequest.admin.update")}
        </Button>
      </div>
    </div>
  );
}
