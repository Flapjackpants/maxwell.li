"use client";

import { useState } from "react";
import { retroBtnStyle } from "@/lib/retro-theme";
import { formatListingPrice, listingPrice } from "@/lib/shop/pricing";
import {
  clampPurchaseQuantity,
  formatPurchaseLimit,
} from "@/lib/shop/purchase-limit";
import type { Listing } from "@/lib/shop/types";
import { useCart } from "./CartProvider";
import { CartQuantityPicker } from "./CartQuantityPicker";
import { ListingImage, listingCardStyle } from "./ListingImage";

type Props = {
  listing: Listing;
  currency: string;
};

export function ListingCard({ listing, currency }: Props) {
  const { addItem, items } = useCart();
  const [pickerOpen, setPickerOpen] = useState(false);
  const purchaseLimitLabel = formatPurchaseLimit(listing);
  const existingQuantity =
    items.find((item) => item.listingId === listing.id)?.quantity ?? 0;

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
                  <b>Price:</b>{" "}
                  {formatListingPrice(listingPrice(listing), currency)}
                  {purchaseLimitLabel ? (
                    <>
                      <br />
                      <span style={{ fontSize: 13 }}>{purchaseLimitLabel}</span>
                    </>
                  ) : null}
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
          existingQuantity={existingQuantity}
          onConfirm={(quantity) => {
            const newTotal = clampPurchaseQuantity(
              listing,
              existingQuantity + quantity,
            );
            const toAdd = newTotal - existingQuantity;
            if (toAdd > 0) addItem(listing.id, toAdd, listing.name);
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
