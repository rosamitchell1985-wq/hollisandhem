// DEMO MODE — payment always fails by design. No payment data is collected.
/* ============================================================================
 * checkout.js — Hollis & Hem
 * ----------------------------------------------------------------------------
 * A three-step checkout that never charges anyone:
 *
 *   Step 1  Contact and shipping address
 *   Step 2  Shipping method
 *   Step 3  Payment method selection only
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT DO
 * ---------------------------------------
 *   - It never asks for a card number, expiry date, CVV or cardholder name.
 *     Those inputs do not exist anywhere in checkout.html.
 *   - It never transmits anything: there is no fetch(), no XMLHttpRequest,
 *     no WebSocket, no form action, no third-party script, no analytics.
 *   - It never stores what you type. The address fields are read only to
 *     validate them in the browser and are discarded on reload.
 *
 * "Place order" shows a processing state for a few seconds and then always
 * shows the payment failure screen. There is no order confirmation page,
 * and the cart is left intact so nothing is lost.
 * ==========================================================================*/

(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var Cart = window.HollisCart;
  var Forms = window.HollisForms;

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function on(element, event, handler) {
    if (element) element.addEventListener(event, handler);
  }

  function money(value) {
    return CONFIG.formatMoney ? CONFIG.formatMoney(value) : "$" + Number(value).toFixed(2);
  }

  function setText(selector, value) {
    var node = $(selector);
    if (node) node.textContent = value;
  }

  var page = $("#checkout");
  if (!page || !Cart) return;

  /* ==========================================================================
   * US states — used for the address dropdown
   * ======================================================================= */
  var US_STATES = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
    ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
    ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
    ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
    ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
    ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
    ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
    ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
    ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
    ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
    ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"]
  ];

  function populateStates() {
    var select = $("#state");
    if (!select) return;
    US_STATES.forEach(function (entry) {
      var option = document.createElement("option");
      option.value = entry[0];
      option.textContent = entry[1];
      select.appendChild(option);
    });
  }

  /* ==========================================================================
   * Shipping methods
   * ======================================================================= */

  function populateShippingMethods() {
    var wrap = $("#shipping-methods");
    if (!wrap) return;
    wrap.innerHTML = "";

    CONFIG.SHIPPING_RATES.forEach(function (rate, index) {
      var id = "ship-" + rate.id;
      var subtotal = Cart.subtotal();
      var cost = CONFIG.getShippingCost(subtotal, rate.id);

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "shipping-method";
      input.id = id;
      input.value = rate.id;
      if (index === 0) input.checked = true;

      var label = document.createElement("label");
      label.setAttribute("for", id);

      var text = document.createElement("span");
      text.className = "method-card__text";
      text.innerHTML =
        "<strong>" + rate.label + "</strong><span>" + rate.estimate + "</span>";

      var price = document.createElement("span");
      price.className = "method-card__price";
      price.textContent = cost === 0 ? "Free" : money(cost);

      label.appendChild(text);
      label.appendChild(price);

      var card = document.createElement("div");
      card.className = "method-card";
      card.appendChild(input);
      card.appendChild(label);
      wrap.appendChild(card);

      on(input, "change", renderSummary);
    });
  }

  function selectedShippingId() {
    var checked = $('input[name="shipping-method"]:checked');
    return checked ? checked.value : "standard";
  }

  /* ==========================================================================
   * Order summary
   * ======================================================================= */

  function renderSummary() {
    var lines = Cart.detailed();
    var list = $("#checkout-items");

    if (list) {
      list.innerHTML = "";
      lines.forEach(function (line) {
        var image = line.product.images[0];
        var item = document.createElement("li");
        item.className = "checkout-item";
        item.innerHTML =
          '<div class="cart-line" style="grid-template-columns:64px 1fr auto">' +
          '<div class="cart-line__media"><img src="' +
          image.src +
          '" alt="' +
          image.alt.replace(/"/g, "&quot;") +
          '" width="' +
          image.width +
          '" height="' +
          image.height +
          '" loading="lazy" decoding="async"></div>' +
          "<div><p class=\"cart-line__meta\" style=\"margin:0\"><strong>" +
          line.product.name +
          "</strong><br>Size " +
          line.size +
          " · " +
          line.color +
          " · Qty " +
          line.qty +
          "</p></div>" +
          '<p class="cart-line__meta" style="margin:0">' +
          money(line.lineTotal) +
          "</p></div>";
        list.appendChild(item);
      });
    }

    var subtotal = Cart.subtotal();
    var shipping = CONFIG.getShippingCost(subtotal, selectedShippingId());
    var tax = Math.round(subtotal * CONFIG.ESTIMATED_TAX_RATE * 100) / 100;
    var total = subtotal + shipping + tax;

    setText("#summary-subtotal", money(subtotal));
    setText("#summary-shipping", shipping === 0 ? "Free" : money(shipping));
    setText("#summary-tax", money(tax));
    setText("#summary-total", money(total));
    setText("#summary-count", String(Cart.count()));

    /* An empty cart cannot be checked out. */
    var emptyNotice = $("#checkout-empty");
    var flow = $("#checkout-flow");
    if (!lines.length) {
      if (emptyNotice) emptyNotice.hidden = false;
      if (flow) flow.hidden = true;
    } else {
      if (emptyNotice) emptyNotice.hidden = true;
      if (flow) flow.hidden = false;
    }
  }

  /* ==========================================================================
   * Step navigation
   * ======================================================================= */

  var currentStep = 1;

  /**
   * @param {number} step
   * @param {boolean} moveFocus  Only true when the customer changed step, so
   *                             the first render does not put a focus ring on
   *                             a heading nobody asked for.
   */
  function showStep(step, moveFocus) {
    currentStep = step;
    $$(".checkout-step").forEach(function (node) {
      node.setAttribute("data-active", String(Number(node.getAttribute("data-step")) === step));
    });
    $$(".checkout-steps li").forEach(function (node) {
      var index = Number(node.getAttribute("data-step"));
      node.setAttribute("aria-current", index === step ? "step" : "false");
      node.setAttribute("data-complete", String(index < step));
    });

    if (moveFocus) {
      var heading = $("#checkout-step-heading-" + step);
      if (heading) heading.focus();
    }

    var announcer = $("#checkout-announcer");
    if (announcer) announcer.textContent = "Step " + step + " of 3.";
  }

  function validateStep(step) {
    var container = $('.checkout-step[data-step="' + step + '"]');
    if (!container || !Forms) return true;

    var fields = $$("input, select", container).filter(function (field) {
      return field.id && field.type !== "radio" && field.type !== "checkbox";
    });

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!Forms.validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  /* ==========================================================================
   * Payment: always fails, by design
   * ======================================================================= */

  function placeOrder() {
    var button = $("#place-order");
    var flow = $("#checkout-flow");
    var processing = $("#processing");
    var failure = $("#payment-failed");

    if (button) {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }
    if (flow) flow.hidden = true;
    if (processing) processing.setAttribute("data-active", "true");

    var announcer = $("#checkout-announcer");
    if (announcer) announcer.textContent = "Processing your payment. Please wait.";

    /* A short, honest delay: nothing is being sent anywhere. */
    window.setTimeout(function () {
      if (processing) processing.setAttribute("data-active", "false");
      if (failure) failure.setAttribute("data-active", "true");
      if (announcer) {
        announcer.textContent =
          "Payment failed. No charge has been made. Your cart has been kept.";
      }
      /* The panel carries role="alert" and the live region above announces the
         result, so screen readers hear it without us stealing focus — which
         would also paint a focus ring around the heading for mouse users. */
      if (failure) failure.scrollIntoView({ block: "center" });
      if (button) {
        button.disabled = false;
        button.removeAttribute("aria-disabled");
      }
      /* The cart is intentionally left untouched. */
    }, 2500);
  }

  function tryAgain() {
    var flow = $("#checkout-flow");
    var failure = $("#payment-failed");
    if (failure) failure.setAttribute("data-active", "false");
    if (flow) flow.hidden = false;
    showStep(3, true);
  }

  /* ==========================================================================
   * Boot
   * ======================================================================= */

  function init() {
    populateStates();
    populateShippingMethods();
    renderSummary();
    showStep(1, false);

    /* Inline validation: check a field when the customer leaves it, and clear
       the error as soon as they fix it. Nothing is transmitted. */
    $$(".checkout-step input, .checkout-step select").forEach(function (field) {
      if (!field.id || field.type === "radio" || field.readOnly) return;
      on(field, "blur", function () {
        if (Forms) Forms.validateField(field);
      });
      on(field, "input", function () {
        if (Forms && field.getAttribute("aria-invalid") === "true") Forms.validateField(field);
      });
      on(field, "change", function () {
        if (Forms && field.tagName === "SELECT") Forms.validateField(field);
      });
    });

    $$("[data-next-step]").forEach(function (button) {
      on(button, "click", function () {
        var next = Number(button.getAttribute("data-next-step"));
        if (next > currentStep && !validateStep(currentStep)) return;
        if (next === 3) renderSummary();
        showStep(next, true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    on($("#place-order"), "click", placeOrder);
    on($("#try-again"), "click", tryAgain);

    /* Keep the summary in step with any cart change from another tab. */
    document.addEventListener("cart:change", renderSummary);

    /* The shipping estimate on step 1 mirrors the chosen method. */
    $$('input[name="shipping-method"]').forEach(function (input) {
      on(input, "change", renderSummary);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
