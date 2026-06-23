import type { Metadata } from "next";
import { CartProvider } from "./components/CartProvider";
import { ShopBackgroundAudio } from "./components/ShopBackgroundAudio";

export const metadata: Metadata = {
  title: "umazing",
  description: "the most UMAZING shopping experience",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ShopBackgroundAudio />
      {children}
    </CartProvider>
  );
}
