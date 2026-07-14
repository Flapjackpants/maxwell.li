"use client";

import { useState } from "react";
import { listingCardStyle, retroBtnStyle } from "@/lib/retro-theme";
import { formatListingPrice, listingPrice } from "@/lib/shop/pricing";
import {
  clampPurchaseQuantity,
  formatPurchaseLimit,
} from "@/lib/shop/purchase-limit";
import type { Listing } from "@/lib/shop/types";
import { useCart } from "./CartProvider";
import { CartQuantityPicker } from "./CartQuantityPicker";
import { ListingImage } from "./ListingImage";

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
  const special = listing.specialOffer === true;
  const accent = special ? "#ff2244" : "#ff6600";

  return (
    <>
      <div style={listingCardStyle({ specialOffer: special })}>
        <table width="100%" cellPadding={6} style={{ height: "100%" }}>
          <tbody>
            <tr>
              <td
                width="100"
                valign="top"
                style={{ backgroundColor: special ? "#441122" : "#111166" }}
              >
                <ListingImage
                  src={listing.imageUrl}
                  alt={listing.name}
                  width={90}
                  height={90}
                />
              </td>
              <td
                valign="top"
                style={{ backgroundColor: special ? "#2a0011" : "#0a0a44" }}
              >
                {special ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        marginBottom: 4,
                        padding: "1px 6px",
                        background: "#660011",
                        color: "#ff6688",
                        border: "1px solid #ff0033",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      SPECIAL OFFER
                    </span>
                    <br />
                  </>
                ) : null}
                <b style={{ fontSize: "17px", color: accent }}>{listing.name}</b>
                {!listing.inStock ? (
                  <span style={{ color: "#f00", marginLeft: 8 }}>
                    [OUT OF STOCK]
                  </span>
                ) : (
                  <span style={{ color: "#0f0", marginLeft: 8 }}>
                    [IN STOCK]
                  </span>
                )}
                <p style={{ margin: "6px 0" }}>{listing.description}</p>
                <p style={{ margin: "6px 0" }}>
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
                    background: special ? "#ff6688" : retroBtnStyle.background,
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
