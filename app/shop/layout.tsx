import type { Metadata } from "next";
import { CartProvider } from "./components/CartProvider";

export const metadata: Metadata = {
  title: "~*~ Squing Shop ~*~",
  description: "Official Minecraft server marketplace!!!",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
