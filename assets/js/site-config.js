/* ============================================================================
 * site-config.js — Hollis & Hem
 * ----------------------------------------------------------------------------
 * Single source of truth for every business detail used across the storefront.
 *
 * HOW IT IS USED
 * --------------
 * The HTML already contains the correct values as plain text, so the site reads
 * correctly with JavaScript disabled and is fully crawlable. On load, main.js
 * walks every element carrying a `data-config="KEY"` (or `data-config-href`,
 * `data-config-attr`) attribute and rewrites it from this object. That keeps one
 * authoritative copy of the data: change it here, and every page follows.
 *
 * <!-- OWNER TO COMPLETE -->
 * Before trading, replace the demo values marked below with your real details.
 * See /SETUP.md for the full checklist.
 * ==========================================================================*/

(function (global) {
  "use strict";

  var SITE_CONFIG = {
    /* ---------------------------------------------------------------- Brand */
    STORE_NAME: "Hollis & Hem",
    TAGLINE: "Everyday pieces, made to be lived in.",
    BRAND_STORY:
      "Founded in 2021 by two friends who were tired of choosing between " +
      "comfortable and put-together. Small-batch collections, released seasonally.",

    /* ------------------------------------------------------------- Identity */
    DOMAIN: "hollisandhem.com",
    SITE_URL: "https://hollisandhem.com",

    /* The three values below are DEMO VALUES for a fictional company. They are
       filled in so the storefront reads as a finished site, but they do not
       identify a real business.
       <!-- OWNER TO COMPLETE: replace all three with your own registered
            details before trading or advertising. They appear in the footer of
            every page, on the Contact page, and in all five policies. --> */
    LEGAL_ENTITY_NAME: "Hollis & Hem LLC",
    MAILING_ADDRESS: "412 Foundry Lane, Suite 210, Portland, OR 97209",
    ADDRESS_STREET: "412 Foundry Lane, Suite 210",
    ADDRESS_LOCALITY: "Portland",
    ADDRESS_REGION: "OR",
    ADDRESS_POSTAL_CODE: "97209",
    GOVERNING_STATE: "Oregon",

    /* -------------------------------------------------------------- Contact */
    SUPPORT_EMAIL: "support@hollisandhem.com",
    ORDERS_EMAIL: "orders@hollisandhem.com",
    PRIVACY_EMAIL: "privacy@hollisandhem.com",
    PHONE: "(555) 010-4827",
    PHONE_HREF: "tel:+15550104827",
    BUSINESS_HOURS: "Monday–Friday, 9:00 AM – 6:00 PM ET",
    RESPONSE_TIME: "within 1 business day",
    COUNTRY: "United States",

    /* ------------------------------------------------- Returns and refunds */
    RETURN_WINDOW_DAYS: 30,
    REFUND_PROCESSING: "5–10 business days after we receive your return",
    EXCHANGE_WINDOW_DAYS: 30,

    /* --------------------------------------------------------- Order fulfillment */
    FREE_SHIPPING_THRESHOLD: 75,
    ORDER_PROCESSING_TIME: "1–2 business days",
    SHIPPING_RATES: [
      { id: "standard", label: "Standard", estimate: "5–7 business days", price: 6.95 },
      { id: "expedited", label: "Expedited", estimate: "2–3 business days", price: 14.95 },
      { id: "overnight", label: "Overnight", estimate: "1 business day", price: 29.95 }
    ],

    /* Estimated sales tax rate used only to show an example figure in the
       checkout summary. Real tax is destination-based and is calculated by the
       payment/tax provider at checkout. */
    ESTIMATED_TAX_RATE: 0.0725,

    /* ------------------------------------------------------------- Policies */
    POLICY_EFFECTIVE_DATE: "January 15, 2026",
    COPYRIGHT_YEAR: 2026,

    /* --------------------------------------------------------------- Social */
    SOCIAL_LINKS: [
      { name: "Instagram", href: "#" },
      { name: "Pinterest", href: "#" },
      { name: "Facebook", href: "#" },
      { name: "TikTok", href: "#" }
    ],

    /* ------------------------------------------------------------ Messaging */
    ANNOUNCEMENT: "Free US shipping on orders over $75 · 30-day easy returns"
  };

  /* -------------------------------------------------------------- Helpers */

  var moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  /** Format a number as US currency, e.g. 128 -> "$128.00". */
  SITE_CONFIG.formatMoney = function (amount) {
    return moneyFormatter.format(Number(amount) || 0);
  };

  /** Shipping rate lookup by id, defaulting to Standard. */
  SITE_CONFIG.getShippingRate = function (id) {
    var rates = SITE_CONFIG.SHIPPING_RATES;
    for (var i = 0; i < rates.length; i++) {
      if (rates[i].id === id) return rates[i];
    }
    return rates[0];
  };

  /**
   * Shipping cost for a given merchandise subtotal and service level.
   * Standard shipping is free at or above the free-shipping threshold.
   */
  SITE_CONFIG.getShippingCost = function (subtotal, rateId) {
    var rate = SITE_CONFIG.getShippingRate(rateId);
    if (rate.id === "standard" && subtotal >= SITE_CONFIG.FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return rate.price;
  };

  /** Human-readable shipping options, e.g. "Standard (5–7 business days): $6.95". */
  SITE_CONFIG.describeShipping = function (rate) {
    return rate.label + " (" + rate.estimate + "): " + SITE_CONFIG.formatMoney(rate.price);
  };

  global.SITE_CONFIG = SITE_CONFIG;
})(window);
