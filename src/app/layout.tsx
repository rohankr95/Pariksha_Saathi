import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "परीक्षा साथी | Pariksha Saathi — जिला प्रशासन, सूरजपुर",
  description:
    "हर विद्यार्थी का साथी — तैयारी से सफलता तक। जिला शिक्षा विभाग, सूरजपुर की आधिकारिक परीक्षा तैयारी पोर्टल।",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const cookieStore = await cookies();
  const initialLocale =
    (cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined) ?? DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <a href="#main-content" className="skip-link">
              मुख्य सामग्री पर जाएँ / Skip to main content
            </a>
            <SiteHeader session={session} />
            <main id="main-content" className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <SiteFooter />
            <BottomNav />
            <InstallPrompt />
            <RegisterServiceWorker />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
