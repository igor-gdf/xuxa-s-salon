import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xuxa's Salon",
  description: "Xuxa's Salon é um slão de beleza localizado em Natal - RN, especializado em cuidados capilares e estética. Oferecemos uma variedade de serviços, incluindo cortes de cabelo, coloração, tratamentos capilares. Nossa equipe de profissionais altamente qualificados está comprometida em proporcionar uma experiência de beleza excepcional para nossos clientes. Venha nos visitar e descubra como podemos realçar sua beleza natural!"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
