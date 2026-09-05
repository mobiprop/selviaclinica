import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { AppointmentsProvider } from "@/lib/appointments-context";
import { SuppliesProvider } from "@/lib/supplies-context";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Selvia Dashboard",
  description: "Selvia Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppointmentsProvider>
          <SuppliesProvider>{children}</SuppliesProvider>
        </AppointmentsProvider>
      </body>
    </html>
  );
}
