"use strict";

/* =========================================================
   1. WEBSITE CONFIGURATION
   Edit these settings for your cafe.
========================================================= */

const CONFIG = {
  media: {
    loading: "loading-video.mp4",
    home: "cafe-architecture.mp4"
  },

  cafe: {
    name: "YOUR CAFE NAME",
    address: "Add your cafe address in script.js",
    mapUrl: "",
    openingHours: "Add opening hours in script.js",
    contact: "Add contact details in script.js"
  },

  // Replace with your actual WhatsApp number.
  // Use country code and digits only, without + or spaces.
  // Example format: 91XXXXXXXXXX
  whatsappNumber: "",

  currency: "INR",

  loaderDuration: 3200,

  heroMessages: [
    ["Eat Good.", "Feel Good."],
    ["More Than", "Just a Meal."],
    ["Your Table", "Awaits."],
    ["The Secret Ingredient", "Is Love."]
  ]
};

/* =========================================================
   2. MENU DATA
   Prices below are DEMO prices. Edit before using for a cafe.
   Only existing, confirmed video filenames are used.
========================================================= */

const MENU = [
  {
    id: "fast-food",
    name: "Fast Food",
    items: [
      {
        id: "momos",
        name: "Momos",
        price: 100,
        description: "Momos",
        video: "momos-video.mp4",
        available: true
      },
      {
        id: "pizza",
        name: "Pizza",
        price: 200,
        description: "Pizza",
        video: "pizza-video.mp4",
        available: true
      },
      {
        id: "burger",
        name: "Burger",
        price: 150,
        description: "Burger",
        video: "burger-video.mp4",
        available: true
      },
      {
        id: "samosa",
        name: "Samosa",
        price: 30,
        description: "Samosa",
        video: "samosa-video.mp4",
        available: true
      }
    ]
  },

  {
    id: "main-course",
    name: "Main Course",
    items: [
      {
        id: "thali",
        name: "Thali",
        price: 180,
        description: "Thali",
        video: "thali-video.mp4",
        available: true
      }
    ]
  },

  {
    id: "south-indian",
    name: "South Indian",
    items: [
      {
        id: "dosa",
        name: "Dosa",
        price: 140,
        description: "Dosa",
        video: "dosa-video.mp4",
        available: true
      }
    ]
  },

  {
    id: "beverages",
    name: "Beverages",
    items: [
      {
        id: "lemon-soda",
        name: "Lemon Soda",
        price: 60,
        description: "Lemon Soda",
        video: "lemom-soda.mp4",
        available: true
      }
    ]
  },

  {
    id: "sweets",
    name: "Sweets",
    items: [
      {
        id: "sweet-special",
        name: "Sweet Special",
        price: 100,
        description: "Sweet Special",
        video: "sweet-special.mp4",
        available: true
      }
    ]
  }
];

/*
  IMPORTANT:
  Prices and generic menu descriptions are demonstration values.
  Confirm real prices, names, ingredients and availability with the cafe.
*/

/* =========================================================
   3. STATE
========================================================= */

let activeCategoryIndex = 0;
let selectedFoodId = null;
let cart = {};
let toastTimeout = null;
let heroMessageIndex = 0;
let heroInterval = null;
let loaderFallbackTimeout = null;

/* =========================================================
   4. HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const money = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CONFIG.currency,
    maximumFractionDigits: 2
  }).format(amount);
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

function getAllFoods() {
  return MENU.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
}

function findFood(foodId) {
  return getAllFoods().find((item) => item.id === foodId);
}

function getCategoryItems(categoryIndex) {
  return MENU[categoryIndex]?.items ?? [];
}

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function setMessage(selector, message) {
  const element = $(selector);

  if (element) {
    element.textContent = message;
  }
}

function stopVideoWithin(container) {
  if (!container) return;

  container.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.removeAttribute("src");

    video.querySelectorAll("source").forEach((source) => {
      source.removeAttribute("src");
    });

    video.load();
  });
}

function closeModal(modalSelector) {
  const modal = $(modalSelector);

  if (!modal) return;

  if (modalSelector === "#foodModal") {
    stopVideoWithin($("#foodDetailMedia"));
    selectedFoodId = null;
  }

  modal.hidden = true;
  updateBodyModalState();
}

function openModal(modalSelector) {
  const modal = $(modalSelector);

  if (!modal) return;

  modal.hidden = false;
  updateBodyModalState();

  const closeButton = modal.querySelector(".modal-close");

  if (closeButton) {
    closeButton.focus();
  }
}

function updateBodyModalState() {
  const anyOpen = [...document.querySelectorAll(".modal-backdrop")]
    .some((modal) => !modal.hidden);

  document.body.classList.toggle("modal-open", anyOpen);
}

/* =========================================================
   5. LOADING SCREEN
========================================================= */

function initLoader() {
  const loader = $("#loader");
  const video = $("#loaderVideo");
  const progress = $("#loaderProgress");
  const status = $("#loaderStatus");
  const enterButton = $("#enterSite");

  if (!loader) return;

  const startedAt = Date.now();
  let finished = false;

  function finishLoader() {
    if (finished) return;
    finished = true;

    clearTimeout(loaderFallbackTimeout);

    if (progress) progress.style.width = "100%";
    if (status) status.textContent = "Ready.";

    if (video) video.pause();

    loader.classList.add("is-done");

    setTimeout(() => {
      loader.hidden = true;

      const heroVideo = $("#heroVideo");

      if (heroVideo) {
        heroVideo.play().catch(() => {
          // Some browsers require a user interaction to start playback.
        });
      }
    }, 850);
  }

  if (enterButton) {
    enterButton.addEventListener("click", finishLoader);
  }

  if (video) {
    video.addEventListener("error", () => {
      if (status) {
        status.textContent = "Preparing your experience...";
      }
    });

    video.addEventListener("ended", () => {
      const remaining = CONFIG.loaderDuration - (Date.now() - startedAt);

      setTimeout(finishLoader, Math.max(0, remaining));
    });

    video.play().catch(() => {
      // Muted autoplay is attempted, but browser restrictions may apply.
    });
  }

  const tick = () => {
    if (finished) return;

    const elapsed = Date.now() - startedAt;
    const fraction = Math.min(elapsed / CONFIG.loaderDuration, 0.94);

    if (progress) {
      progress.style.width = `${fraction * 100}%`;
    }

    if (elapsed >= CONFIG.loaderDuration) {
      finishLoader();
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);

  loaderFallbackTimeout = setTimeout(finishLoader, 10000);
}

/* =========================================================
   6. HOME HERO MESSAGE ROTATION
========================================================= */

function updateHeroMessage() {
  const headline = $("#heroHeadline");
  const counter = $("#heroCounter");

  if (!headline || !CONFIG.heroMessages.length) return;

  const message = CONFIG.heroMessages[heroMessageIndex];

  headline.style.animation = "none";
  void headline.offsetWidth;
  headline.style.animation = "";

  headline.innerHTML = `${escapeHTML(message[0])}<br><em>${escapeHTML(message[1])}</em>`;

  if (counter) {
    counter.textContent =
      `${String(heroMessageIndex + 1).padStart(2, "0")} / ${String(CONFIG.heroMessages.length).padStart(2, "0")}`;
  }

  heroMessageIndex = (heroMessageIndex + 1) % CONFIG.heroMessages.length;
}

function initHero() {
  updateHeroMessage();

  heroInterval = setInterval(updateHeroMessage, 4200);

  const exploreButton = $("#exploreMenu");

  exploreButton?.addEventListener("click", () => {
    $("#menu")?.scrollIntoView({ behavior: "smooth" });
  });

  const homeVideo = $("#heroVideo");

  if (homeVideo) {
    homeVideo.addEventListener("error", () => {
      homeVideo.style.display = "none";
    });
  }
}

/* =========================================================
   7. CATEGORY NAVIGATION
========================================================= */

function renderCategories() {
  const container = $("#categoryList");

  if (!container) return;

  container.innerHTML = MENU.map((category, index) => `
    <button
      type="button"
      class="category-button ${index === activeCategoryIndex ? "active" : ""}"
      data-category-index="${index}"
      aria-pressed="${index === activeCategoryIndex}"
    >
      ${escapeHTML(category.name)}
    </button>
  `).join("");

  container.querySelectorAll("[data-category-index]").forEach((button) => {
    button.addEventListener("click", () => {
      selectCategory(Number(button.dataset.categoryIndex));
    });
  });
}

function selectCategory(index) {
  if (!MENU.length) return;

  activeCategoryIndex = (index + MENU.length) % MENU.length;

  renderCategories();
  renderFoodCards();
}

function initCategoryControls() {
  $("#previousCategory")?.addEventListener("click", () => {
    selectCategory(activeCategoryIndex - 1);
  });

  $("#nextCategory")?.addEventListener("click", () => {
    selectCategory(activeCategoryIndex + 1);
  });
}

/* =========================================================
   8. FOOD CARDS
========================================================= */

function placeholderHTML(label) {
  return `
    <div class="media-placeholder">
      <div>
        <span aria-hidden="true">✳</span>
        <strong>${escapeHTML(label)}</strong>
        <small>Media not configured</small>
      </div>
    </div>
  `;
}


/* =========================================================
   TEXT-ONLY MENU — NO FOOD IMAGES OR IMAGE CARDS
========================================================= */

function renderFoodMedia(item, mode = "card") {
  // Menu list mein video ya image nahi dikhegi.
  if (mode === "card") return "";

  // Video sirf food par click karne ke baad detail modal mein.
  if (!item.video) {
    return `
      <div class="food-video-message">
        Is item ki video abhi assign nahi ki gayi hai.
      </div>
    `;
  }

  const safeVideo = escapeHTML(item.video);

  return `
    <video controls autoplay muted playsinline preload="metadata">
      <source src="${safeVideo}" type="video/mp4">
      Your browser does not support this video.
    </video>
  `;
}

function renderFoodCards() {
  const container = document.querySelector("#foodGrid");
  const title = document.querySelector("#activeCategoryTitle");

  if (!container || !MENU.length) return;

  const category = MENU[activeCategoryIndex];
  const items = category.items;

  if (title) {
    title.textContent = category.name;
  }

  // Simple restaurant-style text list. No image boxes.
  container.innerHTML = items.map((item) => `
    <button
      type="button"
      class="menu-list-item"
      data-food-id="${escapeHTML(item.id)}"
      ${item.available ? "" : "disabled"}
    >
      <span class="menu-item-name">
        ${escapeHTML(item.name)}
      </span>

      <span class="menu-item-price">
        ${money(item.price)}
      </span>

      <span class="menu-item-arrow" aria-hidden="true">↗</span>
    </button>
  `).join("");

  container.querySelectorAll("[data-food-id]").forEach((button) => {
    button.addEventListener("click", () => {
      openFoodDetail(button.dataset.foodId);
    });
  });
}

/* =========================================================
   9. FOOD DETAIL MODAL
========================================================= */

function openFoodDetail(foodId) {
  const item = findFood(foodId);

  if (!item) {
    showToast("This menu item could not be found.");
    return;
  }

  selectedFoodId = foodId;

  setMessage("#foodDetailCategory", item.categoryName);
  setMessage("#foodDetailName", item.name);
  setMessage("#foodDetailDescription", item.description || "");
  setMessage("#foodDetailPrice", money(item.price));
  setMessage("#foodDetailMessage", "");

  const media = $("#foodDetailMedia");

  stopVideoWithin(media);
  media.innerHTML = renderFoodMedia(item, "detail");

  const video = media.querySelector("video");

  if (video) {
    video.addEventListener("error", () => {
      media.innerHTML = placeholderHTML("Video unavailable");
    });

    video.play().catch(() => {
      // The customer can start the video manually if needed.
    });
  }

  const addButton = $("#addToCart");

  if (addButton) {
    addButton.disabled = !item.available;
    addButton.textContent = item.available ? "ADD TO CART +" : "UNAVAILABLE";
  }

  openModal("#foodModal");
}

function initFoodDetail() {
  $("#closeFoodModal")?.addEventListener("click", () => {
    closeModal("#foodModal");
  });

  $("#addToCart")?.addEventListener("click", () => {
    if (!selectedFoodId) return;

    const item = findFood(selectedFoodId);

    if (!item || !item.available) {
      setMessage("#foodDetailMessage", "This item is currently unavailable.");
      return;
    }

    addItemToCart(selectedFoodId);
    closeModal("#foodModal");
    showToast(`${item.name} added to your cart.`);
  });
}

/* =========================================================
   10. CART LOGIC
========================================================= */

function addItemToCart(foodId) {
  const item = findFood(foodId);

  if (!item || !item.available) return;

  if (!cart[foodId]) {
    cart[foodId] = 0;
  }

  cart[foodId] += 1;

  renderCart();
}

function changeCartQuantity(foodId, delta) {
  const item = findFood(foodId);

  if (!item || !cart[foodId]) return;

  cart[foodId] += delta;

  if (cart[foodId] <= 0) {
    delete cart[foodId];
  }

  renderCart();
}

function removeCartItem(foodId) {
  delete cart[foodId];
  renderCart();
}

function getCartItems() {
  return Object.entries(cart)
    .map(([foodId, quantity]) => {
      const item = findFood(foodId);

      if (!item || quantity <= 0) return null;

      return {
        ...item,
        quantity,
        lineTotal: item.price * quantity
      };
    })
    .filter(Boolean);
}

function getCartTotal() {
  return getCartItems().reduce((total, item) => total + item.lineTotal, 0);
}

function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

function renderCart() {
  const container = $("#cartItems");
  const count = $("#cartCount");
  const total = $("#cartTotal");
  const checkoutTotal = $("#checkoutTotal");

  if (!container) return;

  const items = getCartItems();

  container.innerHTML = items.length
    ? items.map((item) => `
        <article class="cart-item">
          <div>
            <h4>${escapeHTML(item.name)}</h4>
            <p>${money(item.price)} each</p>

            <div class="cart-item-actions">
              <button type="button" class="quantity-button"
                      data-action="decrease"
                      data-id="${escapeHTML(item.id)}"
                      aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>

              <span>${item.quantity}</span>

              <button type="button" class="quantity-button"
                      data-action="increase"
                      data-id="${escapeHTML(item.id)}"
                      aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>

              <button type="button" class="remove-item-button"
                      data-action="remove"
                      data-id="${escapeHTML(item.id)}">Remove</button>
            </div>
          </div>

          <strong class="cart-line-total">${money(item.lineTotal)}</strong>
        </article>
      `).join("")
    : `<div class="cart-empty">Your cart is empty. Explore the menu to add something delicious.</div>`;

  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const foodId = button.dataset.id;
      const action = button.dataset.action;

      if (action === "increase") changeCartQuantity(foodId, 1);
      if (action === "decrease") changeCartQuantity(foodId, -1);
      if (action === "remove") removeCartItem(foodId);
    });
  });

  const cartTotal = getCartTotal();

  if (count) count.textContent = String(getCartCount());
  if (total) total.textContent = money(cartTotal);
  if (checkoutTotal) checkoutTotal.textContent = money(cartTotal);

  const checkoutButton = $("#goToCheckout");

  if (checkoutButton) {
    checkoutButton.disabled = items.length === 0;
  }
}

function initCart() {
  $("#openCart")?.addEventListener("click", () => {
    setMessage("#cartMessage", "");
    renderCart();
    openModal("#cartModal");
  });

  $("#closeCart")?.addEventListener("click", () => {
    closeModal("#cartModal");
  });

  $("#goToCheckout")?.addEventListener("click", () => {
    if (getCartItems().length === 0) {
      setMessage("#cartMessage", "Add an item before continuing.");
      return;
    }

    closeModal("#cartModal");
    setMessage("#checkoutMessage", "");
    renderCart();
    openModal("#checkoutModal");
  });

  $("#closeCheckout")?.addEventListener("click", () => {
    closeModal("#checkoutModal");
  });
}

/* =========================================================
   11. WHATSAPP ORDER FLOW
========================================================= */

function buildOrderMessage(formData) {
  const items = getCartItems();

  const lines = [
    `NEW ORDER — ${CONFIG.cafe.name}`,
    "",
    `Customer: ${formData.name || "Not provided"}`,
    `Table: ${formData.table || "Not provided"}`,
    "",
    "ORDER ITEMS:"
  ];

  items.forEach((item) => {
    lines.push(
      `${item.name} x ${item.quantity} — ${money(item.lineTotal)}`
    );
  });

  lines.push("");
  lines.push(`TOTAL: ${money(getCartTotal())}`);
  lines.push(`Notes: ${formData.notes || "None"}`);
  lines.push("");
  lines.push("Please confirm availability and order details.");

  return lines.join("\n");
}

function initCheckout() {
  const form = $("#checkoutForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const items = getCartItems();

    if (items.length === 0) {
      setMessage("#checkoutMessage", "Your cart is empty.");
      return;
    }

    if (!CONFIG.whatsappNumber.trim()) {
      setMessage(
        "#checkoutMessage",
        "WhatsApp is not configured yet. Add the cafe's number in script.js."
      );
      return;
    }

    const phone = CONFIG.whatsappNumber.replace(/\D/g, "");

    if (phone.length < 8 || phone.length > 15) {
      setMessage(
        "#checkoutMessage",
        "Please enter a valid WhatsApp number with country code."
      );
      return;
    }

    const formData = {
      name: $("#customerName").value.trim(),
      table: $("#tableNumber").value.trim(),
      notes: $("#orderNotes").value.trim()
    };

    const message = buildOrderMessage(formData);
    const whatsappURL =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    const openedWindow = window.open(whatsappURL, "_blank", "noopener,noreferrer");

    if (openedWindow) {
      setMessage(
        "#checkoutMessage",
        "WhatsApp opened. Review the message and press Send to place your order."
      );
    } else {
      setMessage(
        "#checkoutMessage",
        "Your browser blocked the new tab. Use the button again or allow pop-ups."
      );

      return;
    }

    // Keep the cart until the customer decides to clear it.
    // Opening WhatsApp does not prove that the message was sent.
  });
}

/* =========================================================
   12. CAFE INFORMATION
========================================================= */

function initCafeDetails() {
  setMessage("#cafeAddress", CONFIG.cafe.address);
  setMessage("#cafeHours", CONFIG.cafe.openingHours);
  setMessage("#cafeContact", CONFIG.cafe.contact);

  const mapLink = $("#mapLink");

  if (mapLink) {
    if (CONFIG.cafe.mapUrl.trim()) {
      mapLink.href = CONFIG.cafe.mapUrl;
      mapLink.hidden = false;
    } else {
      mapLink.hidden = true;
    }
  }

  /*
    Add genuine reviews here only after you have permission
    to publish them and have verified their wording.
  */
  const genuineReviews = [];

  const reviewsGrid = $("#reviewsGrid");
  const notice = $("#reviewsNotice");

  if (genuineReviews.length && reviewsGrid) {
    reviewsGrid.innerHTML = genuineReviews.map((review) => `
      <article class="review-card">
        <p>“${escapeHTML(review.text)}”</p>
        <strong>${escapeHTML(review.name)}</strong>
      </article>
    `).join("");

    if (notice) notice.hidden = true;
  }
}

/* =========================================================
   13. GIFT BOX SURPRISE
========================================================= */

function initGift() {
  const giftButton = $("#openGift");
  const giftMessage = $("#giftMessage");
  const smileButton = $("#makeMeSmile");
  const confetti = $("#giftConfetti");
  const smileMessage = $("#smileMessage");

  giftButton?.addEventListener("click", () => {
    giftButton.classList.add("is-open");

    if (giftMessage) {
      giftMessage.hidden = false;
      giftMessage.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center"
      });
    }

    giftButton.querySelector(".gift-label").textContent = "SURPRISE UNLOCKED";
  });

  smileButton?.addEventListener("click", () => {
    if (smileMessage) {
      smileMessage.textContent = "Mission complete. Keep that smile going! ✨";
    }

    if (!confetti) return;

    confetti.replaceChildren();

    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      const message = document.createElement("p");
      message.textContent = "✨ Have a lovely day!";
      confetti.appendChild(message);
      return;
    }

    for (let index = 0; index < 28; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 0.7}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      confetti.appendChild(piece);
    }
  });
}

/* =========================================================
   14. MODAL KEYBOARD SUPPORT
========================================================= */

function initModalAccessibility() {
  document.querySelectorAll(".modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(`#${modal.id}`);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach((modal) => {
        if (!modal.hidden) {
          closeModal(`#${modal.id}`);
        }
      });
    }
  });
}

/* =========================================================
   DEVELOPER CONTACT PANEL
========================================================= */

function initDeveloperContact() {
  const openButton = $("#openDeveloperContact");
  const closeButton = $("#closeDeveloperContact");
  const panel = $("#developerContact");

  if (!openButton || !closeButton || !panel) return;

  const openPanel = () => {
    panel.hidden = false;
    closeButton.focus();
  };

  const closePanel = () => {
    panel.hidden = true;
    openButton.focus();
  };

  openButton.addEventListener("click", openPanel);
  closeButton.addEventListener("click", closePanel);

  panel.addEventListener("click", (event) => {
    if (event.target === panel) closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });
}

/* =========================================================
   15. APP STARTUP
========================================================= */

function initApp() {
  initCafeDetails();
  initHero();
  renderCategories();
  renderFoodCards();
  initCategoryControls();
  initFoodDetail();
  initCart();
  renderCart();
  initCheckout();
  initGift();
  initDeveloperContact();
  initModalAccessibility();
  initLoader();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}