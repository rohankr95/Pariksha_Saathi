import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { createAvailability, deleteAvailability, createBlackoutDate, deleteBlackoutDate } from "./actions";

export default async function TeacherAvailabilityPage() {
  const t = await getT();
  const locale = await getServerLocale();
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const [rules, exceptions] = await Promise.all([
    prisma.teacherAvailability.findMany({
      where: { teacherId: session.user.id },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.availabilityException.findMany({
      where: { teacherId: session.user.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div>
      <Link href="/admin/doubt-classes" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("doubtClass.availability.backLink")}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("doubtClass.availability.title")}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">{t("doubtClass.availability.weeklyHeading")}</h2>
          <div className="space-y-2">
            {rules.map((r) => (
              <Card key={r.id} className="flex items-center justify-between gap-2 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {t(`doubtClass.weekday.${r.weekday}`)} · {r.startTime}–{r.endTime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("doubtClass.availability.slotDurationLabel", { minutes: r.slotMinutes })} ·{" "}
                    {t("doubtClass.availability.capacityLabel", { count: r.capacity })} · {t(`doubtClass.bookingMode.${r.mode}`)}
                  </p>
                </div>
                <form action={deleteAvailability.bind(null, r.id)}>
                  <ConfirmSubmitButton confirmMessage={t("doubtClass.availability.removeConfirm")} aria-label={t("doubtClass.availability.remove")}>
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </Card>
            ))}
            {rules.length === 0 && <p className="text-sm text-muted-foreground">{t("doubtClass.availability.noRules")}</p>}
          </div>

          <Card className="mt-4 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{t("doubtClass.availability.addSlotHeading")}</p>
            <form action={createAvailability} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <Select name="weekday" defaultValue="1" className="text-sm">
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                    <option key={value} value={value}>
                      {t(`doubtClass.weekday.${value}`)}
                    </option>
                  ))}
                </Select>
                <Select name="mode" defaultValue="MEET" className="text-sm">
                  <option value="MEET">{t("doubtClass.availability.modeOnline")}</option>
                  <option value="PHONE">{t("doubtClass.availability.modePhone")}</option>
                  <option value="IN_PERSON">{t("doubtClass.availability.modeInPerson")}</option>
                </Select>
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-xs">{t("doubtClass.availability.startTime")}</Label>
                  <Input id="startTime" name="startTime" type="time" required defaultValue="16:00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-xs">{t("doubtClass.availability.endTime")}</Label>
                  <Input id="endTime" name="endTime" type="time" required defaultValue="18:00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slotMinutes" className="text-xs">{t("doubtClass.availability.slotMinutes")}</Label>
                  <Input id="slotMinutes" name="slotMinutes" type="number" min={10} required defaultValue={30} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="capacity" className="text-xs">{t("doubtClass.availability.capacity")}</Label>
                  <Input id="capacity" name="capacity" type="number" min={1} required defaultValue={1} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="meetingLink" className="text-xs">{t("doubtClass.availability.meetingLink")}</Label>
                <Input id="meetingLink" name="meetingLink" placeholder="https://meet.google.com/..." />
              </div>
              <Button type="submit" size="sm">{t("doubtClass.availability.add")}</Button>
            </form>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">{t("doubtClass.availability.blackoutHeading")}</h2>
          <div className="space-y-2">
            {exceptions.map((e) => (
              <Card key={e.id} className="flex items-center justify-between gap-2 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }).format(e.date)}
                  </p>
                  {e.reason && <p className="text-xs text-muted-foreground">{e.reason}</p>}
                </div>
                <form action={deleteBlackoutDate.bind(null, e.id)}>
                  <ConfirmSubmitButton confirmMessage={t("doubtClass.availability.removeConfirm")} aria-label={t("doubtClass.availability.remove")}>
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </Card>
            ))}
            {exceptions.length === 0 && <p className="text-sm text-muted-foreground">{t("doubtClass.availability.noBlackout")}</p>}
          </div>

          <Card className="mt-4 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{t("doubtClass.availability.addBlackoutHeading")}</p>
            <form action={createBlackoutDate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs">{t("doubtClass.availability.date")}</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason" className="text-xs">{t("doubtClass.availability.reason")}</Label>
                <Input id="reason" name="reason" placeholder={t("doubtClass.availability.reasonPlaceholder")} />
              </div>
              <Button type="submit" size="sm">{t("doubtClass.availability.add")}</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
