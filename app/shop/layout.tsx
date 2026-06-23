import type { Metadata } from "next";
import { CartProvider } from "./components/CartProvider";

export const metadata: Metadata = {
  title: "Squing Shop",
  description: "the most UMAZING shopping experience",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
