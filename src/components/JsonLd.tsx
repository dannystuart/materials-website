import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { PAID_PACK } from "@/components/section-05/packData";

/**
 * Structured data (schema.org / JSON-LD) for rich-result eligibility.
 *
 * A single `@graph` ties three entities together by `@id`:
 *  - Organization — the publisher (logo + founder).
 *  - WebSite — the site itself, published by the Organization.
 *  - Product — Edition 01, with the Gumroad offer.
 *
 * Price and the offer URL are read from `packData` (the same source the §05
 * pack card renders from) so the markup can't drift from the visible page.
 * Names/URLs come from `site.ts`.
 *
 * Server component — renders a native <script type="application/ld+json">.
 * Per the Next.js JSON-LD guide, `<` is escaped to its unicode form to keep
 * the serialised payload XSS-safe.
 */

// "$9" -> "9.00" — derive from the card's price so it tracks any change there.
const offerPrice = Number(PAID_PACK.price.replace(/[^0-9.]/g, "")).toFixed(2);

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;
const productId = `${SITE_URL}/#product`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
      founder: {
        "@type": "Person",
        name: "Danny Stuart",
        url: "https://dannystuart.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Product",
      "@id": productId,
      name: `${PAID_PACK.name} — Edition 01`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image.png`,
      // Explicit Brand type — a bare { "@id": … } reference reads as an
      // invalid object type in Google's Merchant-listings validator.
      brand: { "@type": "Brand", name: SITE_NAME },
      offers: {
        "@type": "Offer",
        price: offerPrice,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: PAID_PACK.ctaHref,
        // Digital download — instant, no postage. Modelled as free shipping
        // so Google's Merchant listing has the field it expects.
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
          },
        },
        // Digital goods are non-returnable once downloaded.
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnNotPermitted",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: PAID_PACK.rating,
        reviewCount: PAID_PACK.reviewCount,
      },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
