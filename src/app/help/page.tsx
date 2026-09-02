export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-sans text-2xl font-bold text-foreground">सहायता</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        किसी भी सहायता के लिए हेल्पलाइन नंबर{" "}
        {process.env.NEXT_PUBLIC_HELPLINE_NUMBER ?? "1800-XXX-XXXX"} पर संपर्क करें।
      </p>
    </div>
  );
}
