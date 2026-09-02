export type Badge = { icon: string; label: string };

export function getBadges(entry: { quizzesAttempted: number; accuracy: number }, rank: number, isWeekly: boolean): Badge[] {
  const badges: Badge[] = [];
  if (rank === 1 && isWeekly) badges.push({ icon: "👑", label: "साप्ताहिक टॉपर" });
  if (entry.accuracy >= 90) badges.push({ icon: "🎯", label: "90%+ सटीकता" });
  if (entry.quizzesAttempted >= 10) badges.push({ icon: "🔥", label: "10+ प्रश्नोत्तरी" });
  else if (entry.quizzesAttempted >= 1) badges.push({ icon: "🌱", label: "पहली प्रश्नोत्तरी" });
  return badges;
}
