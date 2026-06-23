import type { Metadata } from "next";
import { CartProvider } from "./components/CartProvider";
import { ShopBackgroundAudio } from "./components/ShopBackgroundAudio";

export const metadata: Metadata = {
  title: "Or head to the Susland Plaza (-266, 92, -288) for our brick-and-mortar shopping experience!",
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
