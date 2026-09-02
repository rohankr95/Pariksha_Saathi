import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { WEEKDAY_LABEL, BOOKING_MODE_LABEL } from "@/lib/weekday";
import { createAvailability, deleteAvailability, createBlackoutDate, deleteBlackoutDate } from "./actions";

export default async function TeacherAvailabilityPage() {
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
        <ArrowLeft className="h-4 w-4" /> शंका समाधान
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">मेरी उपलब्धता</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">साप्ताहिक समय-सारणी</h2>
          <div className="space-y-2">
            {rules.map((r) => (
              <Card key={r.id} className="flex items-center justify-between gap-2 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {WEEKDAY_LABEL[r.weekday]} · {r.startTime}–{r.endTime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.slotMinutes} मिनट स्लॉट · क्षमता {r.capacity} · {BOOKING_MODE_LABEL[r.mode]}
                  </p>
                </div>
                <form action={deleteAvailability.bind(null, r.id)}>
                  <ConfirmSubmitButton confirmMessage="क्या आप वाकई इसे हटाना चाहते हैं?" aria-label="हटाएँ">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </Card>
            ))}
            {rules.length === 0 && <p className="text-sm text-muted-foreground">अभी कोई समय-सारणी सेट नहीं की गई है।</p>}
          </div>

          <Card className="mt-4 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">नया स्लॉट जोड़ें</p>
            <form action={createAvailability} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <Select name="weekday" defaultValue="1" className="text-sm">
                  {Object.entries(WEEKDAY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Select name="mode" defaultValue="MEET" className="text-sm">
                  <option value="MEET">ऑनलाइन (Meet)</option>
                  <option value="PHONE">फोन कॉल</option>
                  <option value="IN_PERSON">व्यक्तिगत रूप से</option>
                </Select>
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-xs">प्रारंभ समय</Label>
                  <Input id="startTime" name="startTime" type="time" required defaultValue="16:00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-xs">अंतिम समय</Label>
                  <Input id="endTime" name="endTime" type="time" required defaultValue="18:00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slotMinutes" className="text-xs">स्लॉट अवधि (मिनट)</Label>
                  <Input id="slotMinutes" name="slotMinutes" type="number" min={10} required defaultValue={30} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="capacity" className="text-xs">क्षमता (एक साथ विद्यार्थी)</Label>
                  <Input id="capacity" name="capacity" type="number" min={1} required defaultValue={1} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="meetingLink" className="text-xs">मीटिंग लिंक (वैकल्पिक)</Label>
                <Input id="meetingLink" name="meetingLink" placeholder="https://meet.google.com/..." />
              </div>
              <Button type="submit" size="sm">जोड़ें</Button>
            </form>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">अवकाश तिथियाँ</h2>
          <div className="space-y-2">
            {exceptions.map((e) => (
              <Card key={e.id} className="flex items-center justify-between gap-2 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "long", year: "numeric" }).format(e.date)}
                  </p>
                  {e.reason && <p className="text-xs text-muted-foreground">{e.reason}</p>}
                </div>
                <form action={deleteBlackoutDate.bind(null, e.id)}>
                  <ConfirmSubmitButton confirmMessage="क्या आप वाकई इसे हटाना चाहते हैं?" aria-label="हटाएँ">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </Card>
            ))}
            {exceptions.length === 0 && <p className="text-sm text-muted-foreground">कोई अवकाश तिथि निर्धारित नहीं है।</p>}
          </div>

          <Card className="mt-4 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">अवकाश तिथि जोड़ें</p>
            <form action={createBlackoutDate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs">तिथि</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason" className="text-xs">कारण (वैकल्पिक)</Label>
                <Input id="reason" name="reason" placeholder="जैसे: अवकाश, प्रशिक्षण" />
              </div>
              <Button type="submit" size="sm">जोड़ें</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
