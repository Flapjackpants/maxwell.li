"use client";

import { useState } from "react";
import { retroBtnStyle } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";
import { useCart } from "./CartProvider";
import { CartQuantityPicker } from "./CartQuantityPicker";
import { ListingImage, listingCardStyle } from "./ListingImage";

type Props = {
  listing: Listing;
  currency: string;
};

export function ListingCard({ listing, currency }: Props) {
  const { addItem } = useCart();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <div style={listingCardStyle()}>
        <table width="100%" cellPadding={6}>
          <tbody>
            <tr>
              <td width="120" valign="top" style={{ backgroundColor: "#111166" }}>
                <ListingImage
                  src={listing.imageUrl}
                  alt={listing.name}
                  width={100}
                  height={100}
                />
              </td>
              <td valign="top" style={{ backgroundColor: "#0a0a44" }}>
                <b style={{ fontSize: "17px", color: "#ff6600" }}>{listing.name}</b>
                {!listing.inStock ? (
                  <span style={{ color: "#f00", marginLeft: 8 }}>[OUT OF STOCK]</span>
                ) : (
                  <span style={{ color: "#0f0", marginLeft: 8 }}>[IN STOCK]</span>
                )}
                <p>{listing.description}</p>
                <p>
                  <b>Price:</b> {listing.price} {currency} per item
                </p>
                <button
                  type="button"
                  style={{
                    ...retroBtnStyle,
                    opacity: listing.inStock ? 1 : 0.5,
                  }}
                  disabled={!listing.inStock}
                  onClick={() => setPickerOpen(true)}
                >
                  [ ADD TO CART ]
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {pickerOpen ? (
        <CartQuantityPicker
          listing={listing}
          onConfirm={(quantity) => {
            addItem(listing.id, quantity, listing.name);
            setPickerOpen(false);
          }}
          onCancel={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

export function ShopErrorBanner({ message }: { message: string }) {
  return (
    <p style={{ color: "#f00", textAlign: "center", fontWeight: "bold" }}>
      {message}
    </p>
  );
}
