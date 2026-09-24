/* ============================================================================
 * main.js — Hollis & Hem
 * ----------------------------------------------------------------------------
 * Vanilla JavaScript for the whole storefront. No frameworks, no build step.
 *
 *   1.  Small DOM helpers
 *   2.  Config injection (data-config attributes)
 *   3.  Cart (in-memory, mirrored to localStorage)
 *   4.  Header: mobile nav, search panel, cart count
 *   5.  Accordions
 *   6.  Product card rendering
 *   7.  Shop page: filters, sorting, results
 *   8.  Product page
 *   9.  Cart page
 *  10.  Home page dynamic sections
 *  11.  Forms: newsletter, contact, search
 *  12.  Cookie notice + toast
 *
 * NOTE ON PRIVACY: nothing in this file sends data anywhere. There is no
 * fetch(), no XMLHttpRequest, no form action, and no third-party script. The
 * cart is the only thing stored on the device, in localStorage.
 * ==========================================================================*/

(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var CATALOG = window.CATALOG || { products: [] };

  /* ==========================================================================
   * 1. Small DOM helpers
   * ======================================================================= */

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function on(element, event, handler) {
    if (element) element.addEventListener(event, handler);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "class") node.className = attrs[key];
        else if (key === "text") node.textContent = attrs[key];
        else if (key === "html") node.innerHTML = attrs[key];
        else if (attrs[key] !== null && attrs[key] !== undefined) {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function money(value) {
    return CONFIG.formatMoney ? CONFIG.formatMoney(value) : "$" + Number(value).toFixed(2);
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /** Resolve a site-root-relative path for pages that sit in a subfolder. */
  var BASE = document.body && document.body.getAttribute("data-base")
    ? document.body.getAttribute("data-base")
    : "";

  function url(path) {
    return BASE + path;
  }

  /* ==========================================================================
   * 2. Config injection
   * --------------------------------------------------------------------------
   * The HTML ships with the correct values already written out, so the page is
   * complete without JavaScript. This pass simply re-applies them from
   * site-config.js so there is one source of truth to edit.
   * ======================================================================= */

  function injectConfig() {
    $$("[data-config]").forEach(function (node) {
      var key = node.getAttribute("data-config");
      var value = CONFIG[key];
      if (value === undefined || value === null || value === "") return;
      var attr = node.getAttribute("data-config-attr");
      if (attr) {
        node.setAttribute(attr, value);
        return;
      }

      node.textContent = value;

      /* Keep a mailto: or tel: target in step with the text it labels, so that
         editing only site-config.js can never leave a link pointing at the old
         address while displaying the new one. */
      var href = node.getAttribute("href");
      if (href && href.indexOf("mailto:") === 0 && value.indexOf("@") !== -1) {
        node.setAttribute("href", "mailto:" + value);
      } else if (href && href.indexOf("tel:") === 0 && CONFIG.PHONE_HREF) {
        node.setAttribute("href", CONFIG.PHONE_HREF);
      }
    });

    $$("[data-config-href]").forEach(function (node) {
      var key = node.getAttribute("data-config-href");
      if (CONFIG[key]) node.setAttribute("href", CONFIG[key]);
    });

    /* Derived values used in a few places. */
    $$("[data-config-money]").forEach(function (node) {
      var key = node.getAttribute("data-config-money");
      if (CONFIG[key] !== undefined) node.textContent = money(CONFIG[key]);
    });
  }

  /* ==========================================================================
   * 3. Cart
   * ======================================================================= */

  var STORAGE_KEY = "hollis-hem-cart-v1";

  var Cart = {
    items: [],

    /** Read the saved cart. localStorage can throw in private modes. */
    load: function () {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        Cart.items = Array.isArray(parsed) ? parsed.filter(Cart.isValidLine) : [];
      } catch (err) {
        Cart.items = [];
      }
      return Cart.items;
    },

    isValidLine: function (line) {
      return (
        line &&
        typeof line.id === "string" &&
        CATALOG.getProductById &&
        CATALOG.getProductById(line.id) &&
        Number(line.qty) > 0
      );
    },

    save: function () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Cart.items));
      } catch (err) {
        /* Storage unavailable: the cart still works for this page session. */
      }
      Cart.emit();
    },

    emit: function () {
      document.dispatchEvent(new CustomEvent("cart:change", { detail: Cart.items }));
    },

    key: function (line) {
      return [line.id, line.size || "", line.color || ""].join("|");
    },

    add: function (line) {
      var existing = null;
      Cart.items.forEach(function (item) {
        if (Cart.key(item) === Cart.key(line)) existing = item;
      });
      if (existing) existing.qty = Math.min(20, existing.qty + line.qty);
      else Cart.items.push({ id: line.id, size: line.size, color: line.color, qty: line.qty });
      Cart.save();
    },

    setQty: function (key, qty) {
      Cart.items = Cart.items.filter(function (item) {
        if (Cart.key(item) !== key) return true;
        item.qty = Math.max(0, Math.min(20, qty));
        return item.qty > 0;
      });
      Cart.save();
    },

    remove: function (key) {
      Cart.items = Cart.items.filter(function (item) {
        return Cart.key(item) !== key;
      });
      Cart.save();
    },

    count: function () {
      return Cart.items.reduce(function (sum, item) {
        return sum + Number(item.qty || 0);
      }, 0);
    },

    /** Cart lines joined with the catalog record. */
    detailed: function () {
      return Cart.items
        .map(function (item) {
          var product = CATALOG.getProductById(item.id);
          if (!product) return null;
          return {
            key: Cart.key(item),
            product: product,
            size: item.size,
            color: item.color,
            qty: Number(item.qty),
            lineTotal: Number(item.qty) * product.price
          };
        })
        .filter(Boolean);
    },

    subtotal: function () {
      return Cart.detailed().reduce(function (sum, line) {
        return sum + line.lineTotal;
      }, 0);
    }
  };

  window.HollisCart = Cart; // used by checkout.js

  /* ==========================================================================
   * 4. Header
   * ======================================================================= */

  function initHeader() {
    var navToggle = $(".nav-toggle");
    var mobileNav = $("#mobile-nav");
    var searchToggle = $(".search-toggle");
    var searchPanel = $("#search-panel");

    on(navToggle, "click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      if (mobileNav) mobileNav.setAttribute("data-open", String(!open));
    });

    on(searchToggle, "click", function () {
      var open = searchToggle.getAttribute("aria-expanded") === "true";
      searchToggle.setAttribute("aria-expanded", String(!open));
      if (searchPanel) {
        searchPanel.setAttribute("data-open", String(!open));
        if (!open) {
          var input = $("input", searchPanel);
          if (input) input.focus();
        }
      }
    });

    /* Escape closes whichever panel is open. */
    on(document, "keydown", function (event) {
      if (event.key !== "Escape") return;
      [
        [navToggle, mobileNav],
        [searchToggle, searchPanel]
      ].forEach(function (pair) {
        if (pair[0] && pair[0].getAttribute("aria-expanded") === "true") {
          pair[0].setAttribute("aria-expanded", "false");
          if (pair[1]) pair[1].setAttribute("data-open", "false");
          pair[0].focus();
        }
      });
    });

    renderCartCount();
    document.addEventListener("cart:change", renderCartCount);
  }

  function renderCartCount() {
    var count = Cart.count();
    $$("[data-cart-count]").forEach(function (node) {
      node.textContent = String(count);
    });
    $$("[data-cart-label]").forEach(function (node) {
      node.textContent =
        count === 1 ? "Shopping cart, 1 item" : "Shopping cart, " + count + " items";
    });
  }

  /* ==========================================================================
   * 5. Accordions
   * ======================================================================= */

  function initAccordions() {
    $$(".accordion__trigger").forEach(function (trigger) {
      on(trigger, "click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* ==========================================================================
   * 6. Product card rendering
   * ======================================================================= */

  function productCard(product, options) {
    options = options || {};
    var image = product.images[0];
    var badges = [];

    if (product.tags.indexOf("new") !== -1) {
      badges.push(el("span", { class: "badge badge--new", text: "New" }));
    } else if (product.tags.indexOf("bestseller") !== -1) {
      badges.push(el("span", { class: "badge badge--bestseller", text: "Bestseller" }));
    }

    var media = el("div", { class: "product-card__media" }, [
      badges.length ? el("div", { class: "product-card__badges" }, badges) : null,
      el("img", {
        src: url(image.src),
        alt: image.alt,
        width: image.width,
        height: image.height,
        loading: options.eager ? "eager" : "lazy",
        decoding: "async"
      })
    ]);

    var swatches = el(
      "ul",
      { class: "swatch-row", "aria-label": "Available colors" },
      product.colors.map(function (color) {
        return el("li", {}, [
          el("span", {
            class: "swatch",
            style: "background-color:" + color.hex,
            title: color.name
          }),
          el("span", { class: "visually-hidden", text: color.name })
        ]);
      })
    );

    var body = el("div", { class: "product-card__body" }, [
      el("p", { class: "product-card__meta", text: product.category }),
      el("h3", { class: "product-card__title" }, [
        el("a", { href: url("product.html?id=" + product.id), text: product.name })
      ]),
      swatches,
      el("p", { class: "product-card__price", text: money(product.price) })
    ]);

    return el("li", {}, [el("article", { class: "product-card" }, [media, body])]);
  }

  function renderProductList(container, products, options) {
    if (!container) return;
    container.innerHTML = "";
    products.forEach(function (product, index) {
      container.appendChild(
        productCard(product, { eager: options && options.eager && index < 4 })
      );
    });
  }

  /* ==========================================================================
   * 7. Shop page
   * ======================================================================= */

  function initShop() {
    var form = $("#filters");
    var grid = $("#product-results");
    var countNode = $("#result-count");
    var sortSelect = $("#sort");
    var activeList = $("#active-filters");
    var emptyState = $("#empty-state");
    if (!form || !grid) return;

    /* Seed from the URL so category tiles and nav links can deep link. */
    var initialCategory = param("category");
    if (initialCategory) {
      $$('input[name="category"]', form).forEach(function (input) {
        if (input.value.toLowerCase() === initialCategory.toLowerCase()) input.checked = true;
      });
    }
    var initialTag = param("tag");
    var initialQuery = (param("q") || "").trim().toLowerCase();
    var searchInput = $("#shop-search");
    if (searchInput && initialQuery) searchInput.value = param("q");

    function selected(name) {
      return $$('input[name="' + name + '"]:checked', form).map(function (input) {
        return input.value;
      });
    }

    function matches(product) {
      var categories = selected("category");
      var sizes = selected("size");
      var colors = selected("color");
      var prices = selected("price");

      if (categories.length && categories.indexOf(product.category) === -1) return false;

      if (sizes.length) {
        var hasSize = sizes.some(function (size) {
          return product.sizes.indexOf(size) !== -1;
        });
        if (!hasSize) return false;
      }

      if (colors.length) {
        var hasColor = colors.some(function (family) {
          return product.colorFamilies.indexOf(family) !== -1;
        });
        if (!hasColor) return false;
      }

      if (prices.length) {
        var inRange = prices.some(function (id) {
          var range = null;
          CATALOG.priceRanges.forEach(function (candidate) {
            if (candidate.id === id) range = candidate;
          });
          return range && product.price >= range.min && product.price <= range.max;
        });
        if (!inRange) return false;
      }

      if (initialTag && product.tags.indexOf(initialTag) === -1) return false;

      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (query) {
        var haystack = [product.name, product.category, product.summary]
          .join(" ")
          .toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }

      return true;
    }

    function sorted(list) {
      var mode = sortSelect ? sortSelect.value : "featured";
      var copy = list.slice();
      if (mode === "price-asc") {
        copy.sort(function (a, b) {
          return a.price - b.price;
        });
      } else if (mode === "price-desc") {
        copy.sort(function (a, b) {
          return b.price - a.price;
        });
      } else if (mode === "newest") {
        copy.sort(function (a, b) {
          return b.released.localeCompare(a.released);
        });
      } else if (mode === "name") {
        copy.sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      }
      return copy;
    }

    function renderActiveFilters() {
      if (!activeList) return;
      activeList.innerHTML = "";
      var checked = $$("input[type=checkbox]:checked", form);
      checked.forEach(function (input) {
        var label = form.querySelector('label[for="' + input.id + '"]');
        var text = label ? label.textContent.trim() : input.value;
        var button = el("button", {
          type: "button",
          class: "filter-chip",
          text: text + " ×",
          "aria-label": "Remove filter: " + text
        });
        on(button, "click", function () {
          input.checked = false;
          apply();
        });
        activeList.appendChild(el("li", {}, [button]));
      });
      if (checked.length > 1) {
        var clear = el("button", { type: "button", text: "Clear all" });
        on(clear, "click", function () {
          form.reset();
          apply();
        });
        activeList.appendChild(el("li", {}, [clear]));
      }
    }

    function syncUrl() {
      var params = new URLSearchParams();
      var categories = selected("category");
      if (categories.length === 1) params.set("category", categories[0]);
      if (initialTag) params.set("tag", initialTag);
      var query = searchInput ? searchInput.value.trim() : "";
      if (query) params.set("q", query);
      var next = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (next ? "?" + next : "")
      );
    }

    function apply() {
      var results = sorted(CATALOG.products.filter(matches));
      renderProductList(grid, results, { eager: true });
      if (countNode) {
        countNode.textContent =
          results.length === 1 ? "1 product" : results.length + " products";
      }
      if (emptyState) emptyState.hidden = results.length > 0;
      renderActiveFilters();
      syncUrl();
    }

    on(form, "change", apply);
    on(sortSelect, "change", apply);
    if (searchInput) {
      on(searchInput, "input", apply);
      on(searchInput.form, "submit", function (event) {
        event.preventDefault();
        apply();
      });
    }

    var clearAll = $("#clear-filters");
    on(clearAll, "click", function () {
      form.reset();
      if (searchInput) searchInput.value = "";
      apply();
    });

    apply();
  }

  /* ==========================================================================
   * 8. Product page
   * ======================================================================= */

  function initProduct() {
    var root = $("#product-detail");
    if (!root) return;

    var product = CATALOG.getProductById(param("id") || "");
    var missing = $("#product-missing");

    if (!product) {
      root.hidden = true;
      if (missing) missing.hidden = false;
      /* The page keeps its single <h1>; only the wording changes. */
      setText("#pdp-category", "Shop");
      setText("#pdp-name", "Product not found");
      setText(
        "#pdp-summary",
        "We could not match that link to a product in the current collection."
      );
      setText("#pdp-breadcrumb-category", "Shop");
      setText("#pdp-breadcrumb-name", "Not found");
      document.title = "Product not found · " + CONFIG.STORE_NAME;
      return;
    }

    document.title = product.name + " · " + CONFIG.STORE_NAME + " · " + money(product.price);
    var metaDescription = $('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", product.summary);

    /* --- Breadcrumb + headings ------------------------------------------ */
    setText("#pdp-breadcrumb-category", product.category);
    var categoryLink = $("#pdp-breadcrumb-category-link");
    if (categoryLink) categoryLink.href = url("shop.html?category=" + product.category);
    setText("#pdp-breadcrumb-name", product.name);
    setText("#pdp-name", product.name);
    setText("#pdp-category", product.category);
    setText("#pdp-price", money(product.price));
    setText("#pdp-summary", product.summary);
    setText("#pdp-description", product.description);
    setText("#pdp-fabric", product.fabric);
    setText("#pdp-care", product.care);
    setText("#pdp-fit", product.fit);

    var detailList = $("#pdp-details");
    if (detailList) {
      detailList.innerHTML = "";
      product.details.forEach(function (detail) {
        detailList.appendChild(el("li", { text: detail }));
      });
    }

    /* --- Gallery --------------------------------------------------------- */
    var mainImage = $("#pdp-main-image");
    var thumbs = $("#pdp-thumbs");
    if (mainImage) {
      mainImage.src = url(product.images[0].src);
      mainImage.alt = product.images[0].alt;
      mainImage.width = product.images[0].width;
      mainImage.height = product.images[0].height;
    }
    if (thumbs) {
      thumbs.innerHTML = "";
      product.images.forEach(function (image, index) {
        var button = el("button", {
          type: "button",
          "aria-current": index === 0 ? "true" : "false",
          "aria-label": "Show image " + (index + 1) + " of " + product.images.length
        });
        button.appendChild(
          el("img", {
            src: url(image.src),
            alt: "",
            width: image.width,
            height: image.height,
            loading: "lazy",
            decoding: "async"
          })
        );
        on(button, "click", function () {
          if (mainImage) {
            mainImage.src = url(image.src);
            mainImage.alt = image.alt;
          }
          $$("button", thumbs).forEach(function (other) {
            other.setAttribute("aria-current", other === button ? "true" : "false");
          });
        });
        thumbs.appendChild(el("li", {}, [button]));
      });
    }

    /* --- Sizes ----------------------------------------------------------- */
    var sizeWrap = $("#pdp-sizes");
    var sizeHint = $("#pdp-size-hint");
    if (sizeWrap) {
      sizeWrap.innerHTML = "";
      product.sizes.forEach(function (size, index) {
        var id = "size-" + size.replace(/\s+/g, "-").toLowerCase();
        var input = el("input", {
          type: "radio",
          name: "size",
          id: id,
          value: size,
          checked: index === 0 ? "checked" : null
        });
        var label = el("label", { for: id, text: size });
        var item = el("span", { class: "size-chip" }, [input, label]);
        on(input, "change", function () {
          setText("#pdp-selected-size", size);
        });
        sizeWrap.appendChild(item);
      });
      setText("#pdp-selected-size", product.sizes[0]);
    }
    if (sizeHint) {
      if (product.numericSizes) {
        sizeHint.textContent =
          "Also available in US numeric sizes " +
          product.numericSizes[0] +
          "–" +
          product.numericSizes[product.numericSizes.length - 1] +
          ".";
      } else if (product.sizes.length === 1 && product.sizes[0] === "One Size") {
        sizeHint.textContent = "One size fits most. Dimensions are in the size guide.";
      } else {
        sizeHint.textContent =
          "US alpha sizing, " + product.sizes[0] + " to " + product.sizes[product.sizes.length - 1] + ".";
      }
    }

    var numericWrap = $("#pdp-numeric-sizes");
    if (numericWrap) {
      if (product.numericSizes) {
        numericWrap.hidden = false;
        var list = $("#pdp-numeric-list", numericWrap);
        if (list) {
          list.innerHTML = "";
          product.numericSizes.forEach(function (size) {
            var id = "numeric-" + size;
            list.appendChild(
              el("span", { class: "size-chip" }, [
                el("input", { type: "radio", name: "numeric-size", id: id, value: size }),
                el("label", { for: id, text: size })
              ])
            );
          });
        }
      } else {
        numericWrap.hidden = true;
      }
    }

    /* --- Colors ---------------------------------------------------------- */
    var colorWrap = $("#pdp-colors");
    if (colorWrap) {
      colorWrap.innerHTML = "";
      product.colors.forEach(function (color, index) {
        var id = "color-" + color.name.replace(/\s+/g, "-").toLowerCase();
        var input = el("input", {
          type: "radio",
          name: "color",
          id: id,
          value: color.name,
          checked: index === 0 ? "checked" : null
        });
        var label = el("label", {
          for: id,
          style: "background-color:" + color.hex,
          title: color.name
        });
        label.appendChild(el("span", { class: "visually-hidden", text: color.name }));
        on(input, "change", function () {
          setText("#pdp-selected-color", color.name);
        });
        colorWrap.appendChild(el("li", {}, [input, label]));
      });
      setText("#pdp-selected-color", product.colors[0].name);
    }

    /* --- Quantity + add to cart ------------------------------------------ */
    var qtyInput = $("#pdp-qty");
    on($("#pdp-qty-down"), "click", function () {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    });
    on($("#pdp-qty-up"), "click", function () {
      qtyInput.value = Math.min(20, Number(qtyInput.value) + 1);
    });

    on($("#add-to-cart"), "click", function () {
      var size = $('input[name="size"]:checked', root);
      var color = $('input[name="color"]:checked', root);
      var numeric = $('input[name="numeric-size"]:checked', root);
      var sizeLabel = size ? size.value : "One Size";
      if (numeric) sizeLabel = sizeLabel + " / US " + numeric.value;

      Cart.add({
        id: product.id,
        size: sizeLabel,
        color: color ? color.value : product.colors[0].name,
        qty: Math.max(1, Math.min(20, Number(qtyInput ? qtyInput.value : 1)))
      });

      showToast(
        product.name +
          " added to your cart. <a href=\"" +
          url("cart.html") +
          "\">View cart</a>"
      );
    });

    /* --- Related --------------------------------------------------------- */
    renderProductList($("#pdp-related"), CATALOG.getRelated(product, 4));

    /* --- Structured data -------------------------------------------------- */
    var jsonLd = $("#product-jsonld");
    if (jsonLd) {
      jsonLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.summary,
        category: product.category,
        sku: product.id,
        brand: { "@type": "Brand", name: CONFIG.STORE_NAME },
        image: product.images.map(function (image) {
          return CONFIG.SITE_URL + "/" + image.src;
        }),
        offers: {
          "@type": "Offer",
          url: CONFIG.SITE_URL + "/product.html?id=" + product.id,
          priceCurrency: "USD",
          price: product.price.toFixed(2),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "US"
            }
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "US",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: CONFIG.RETURN_WINDOW_DAYS,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn"
          }
        }
      });
    }
  }

  function setText(selector, value) {
    var node = $(selector);
    if (node) node.textContent = value;
  }

  /* ==========================================================================
   * 9. Cart page
   * ======================================================================= */

  function initCartPage() {
    var list = $("#cart-lines");
    if (!list) return;

    var empty = $("#cart-empty");
    var contents = $("#cart-contents");

    function render() {
      var lines = Cart.detailed();
      list.innerHTML = "";

      if (!lines.length) {
        if (empty) empty.hidden = false;
        if (contents) contents.hidden = true;
        return;
      }
      if (empty) empty.hidden = true;
      if (contents) contents.hidden = false;

      lines.forEach(function (line) {
        var image = line.product.images[0];

        var qtyInput = el("input", {
          type: "number",
          min: "1",
          max: "20",
          step: "1",
          value: String(line.qty),
          id: "qty-" + line.key,
          "aria-label": "Quantity for " + line.product.name
        });
        on(qtyInput, "change", function () {
          Cart.setQty(line.key, Number(qtyInput.value));
          render();
        });

        var down = el("button", {
          type: "button",
          "aria-label": "Decrease quantity of " + line.product.name,
          text: "−"
        });
        on(down, "click", function () {
          Cart.setQty(line.key, line.qty - 1);
          render();
        });

        var up = el("button", {
          type: "button",
          "aria-label": "Increase quantity of " + line.product.name,
          text: "+"
        });
        on(up, "click", function () {
          Cart.setQty(line.key, line.qty + 1);
          render();
        });

        var remove = el("button", {
          type: "button",
          class: "link-button",
          text: "Remove"
        });
        on(remove, "click", function () {
          Cart.remove(line.key);
          showToast(line.product.name + " removed from your cart.");
          render();
        });

        list.appendChild(
          el("li", {}, [
            el("div", { class: "cart-line" }, [
              el("div", { class: "cart-line__media" }, [
                el("img", {
                  src: url(image.src),
                  alt: image.alt,
                  width: image.width,
                  height: image.height,
                  loading: "lazy",
                  decoding: "async"
                })
              ]),
              el("div", {}, [
                el("h2", { class: "cart-line__title" }, [
                  el("a", {
                    href: url("product.html?id=" + line.product.id),
                    text: line.product.name
                  })
                ]),
                el("p", {
                  class: "cart-line__meta",
                  text: "Size " + line.size + " · " + line.color
                }),
                el("div", { class: "cart-line__controls" }, [
                  el("div", { class: "qty-control" }, [down, qtyInput, up]),
                  remove
                ])
              ]),
              el("p", {
                class: "product-card__price",
                text: money(line.lineTotal)
              })
            ])
          ])
        );
      });

      renderSummary();
    }

    function renderSummary() {
      var subtotal = Cart.subtotal();
      var shipping = CONFIG.getShippingCost(subtotal, "standard");
      setText("#cart-subtotal", money(subtotal));
      setText(
        "#cart-shipping",
        shipping === 0 ? "Free" : money(shipping)
      );
      setText("#cart-total", money(subtotal + shipping));

      var remaining = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
      var progress = $("#free-shipping-progress");
      if (progress) {
        progress.textContent =
          remaining > 0
            ? "Add " + money(remaining) + " more to qualify for free standard shipping."
            : "Your order qualifies for free standard shipping.";
      }
    }

    render();
    document.addEventListener("cart:change", renderSummary);
  }

  /* ==========================================================================
   * 10. Home page dynamic sections
   * ======================================================================= */

  function initHome() {
    var newArrivals = $("#new-arrivals");
    if (newArrivals) {
      renderProductList(newArrivals, CATALOG.getByTag("new").slice(0, 4), { eager: true });
    }
    var bestsellers = $("#bestsellers");
    if (bestsellers) {
      renderProductList(bestsellers, CATALOG.getByTag("bestseller").slice(0, 4));
    }
  }

  /* ==========================================================================
   * 11. Forms
   * --------------------------------------------------------------------------
   * All validation is client-side only. No data leaves the browser: these
   * handlers never call fetch(), and the forms have no action attribute.
   * ======================================================================= */

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var US_PHONE_PATTERN = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  function setFieldError(input, message) {
    var errorNode = document.getElementById(input.id + "-error");
    if (errorNode) errorNode.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function validateField(input) {
    var value = input.value.trim();
    var label = input.getAttribute("data-label") || input.name;

    if (input.required && !value) {
      return setFieldError(input, "Please enter your " + label + ".");
    }
    if (!value) return setFieldError(input, "");

    if (input.type === "email" && !EMAIL_PATTERN.test(value)) {
      return setFieldError(input, "Please enter a valid email address.");
    }
    if (input.type === "tel" && !US_PHONE_PATTERN.test(value)) {
      return setFieldError(input, "Please use a US phone format, for example (555) 010-4827.");
    }
    if (input.getAttribute("data-validate") === "zip" && !/^\d{5}$/.test(value)) {
      return setFieldError(input, "Please enter a 5-digit ZIP code.");
    }
    if (input.minLength > 0 && value.length < input.minLength) {
      return setFieldError(
        input,
        "Please use at least " + input.minLength + " characters."
      );
    }
    return setFieldError(input, "");
  }

  function validateForm(form) {
    var fields = $$("input, select, textarea", form).filter(function (field) {
      return field.type !== "hidden" && field.type !== "checkbox" && field.id;
    });
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  window.HollisForms = {
    validateField: validateField,
    validateForm: validateForm,
    setFieldError: setFieldError
  };

  function initForms() {
    $$("form[data-demo-form]").forEach(function (form) {
      var status = $(".form-status", form);
      var successMessage = form.getAttribute("data-success");

      $$("input, textarea, select", form).forEach(function (field) {
        if (!field.id) return;
        on(field, "blur", function () {
          validateField(field);
        });
        on(field, "input", function () {
          if (field.getAttribute("aria-invalid") === "true") validateField(field);
        });
      });

      on(form, "submit", function (event) {
        event.preventDefault(); // no backend: nothing is transmitted
        if (status) {
          status.className = "form-status";
          status.textContent = "";
        }
        if (!validateForm(form)) {
          if (status) {
            status.className = "form-status form-status--error";
            status.textContent = "Please check the highlighted fields and try again.";
          }
          return;
        }
        if (status) {
          status.className = "form-status form-status--success";
          status.textContent = successMessage || "Thanks — we have received your message.";
        }
        form.reset();
        $$("[aria-invalid]", form).forEach(function (field) {
          field.setAttribute("aria-invalid", "false");
        });
      });
    });

    /* Header search: a plain GET link to the shop page. */
    $$("form[data-search-form]").forEach(function (form) {
      on(form, "submit", function (event) {
        event.preventDefault();
        var input = $("input[type=search]", form);
        var query = input ? input.value.trim() : "";
        window.location.href = url("shop.html") + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  /* ==========================================================================
   * 12. Cookie notice + toast
   * ======================================================================= */

  var COOKIE_KEY = "hollis-hem-cookie-notice-v1";

  function initCookieNotice() {
    var notice = $("#cookie-notice");
    if (!notice) return;

    var stored = null;
    try {
      stored = window.localStorage.getItem(COOKIE_KEY);
    } catch (err) {
      stored = null;
    }
    if (!stored) notice.setAttribute("data-open", "true");

    function dismiss(choice) {
      try {
        window.localStorage.setItem(COOKIE_KEY, choice);
      } catch (err) {
        /* ignore */
      }
      notice.setAttribute("data-open", "false");
    }

    on($("#cookie-accept"), "click", function () {
      dismiss("accepted");
    });
    on($("#cookie-essential"), "click", function () {
      dismiss("essential-only");
    });
  }

  var toastTimer = null;

  function showToast(html) {
    var toast = $("#toast");
    if (!toast) return;
    toast.innerHTML = html;
    toast.setAttribute("data-open", "true");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.setAttribute("data-open", "false");
    }, 5000);
  }

  /* ==========================================================================
   * Boot
   * ======================================================================= */

  function init() {
    injectConfig();
    Cart.load();
    initHeader();
    initAccordions();
    initForms();
    initCookieNotice();
    initHome();
    initShop();
    initProduct();
    initCartPage();

    /* Footer year, kept in sync with the config. */
    $$("[data-copyright-year]").forEach(function (node) {
      node.textContent = String(CONFIG.COPYRIGHT_YEAR);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
