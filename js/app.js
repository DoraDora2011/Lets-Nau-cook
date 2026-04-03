const state = {
  currentPage: "home",
  currentRecipe: null,
  recipeSource: "search",
  currentSuggestion: null,
  ingredientSuggestions: [],
  currentScanSuggestion: null,
  scanSuggestions: [],
  scanIngredients: [],
  scanExtras: [],
  scanImageSrc: "",
  scanImageMimeType: "image/jpeg",
  scanSourceName: "",
  scanAnalysisSource: "",
  scanRecipeHints: [],
  scanStream: null,
  cart: [],
  history: ["home"],
  homeQuantities: {},
  cartReturnPage: "dish-search",
  paymentReturnPage: "cart",
};

const pageTitles = {
  home: "home",
  chooser: "chooser",
  "dish-search": "dish-search",
  "ingredients-search": "ingredients-search",
  "ingredient-suggestions": "ingredient-suggestions",
  "ingredient-detail": "ingredient-detail",
  cart: "cart",
  payment: "payment",
  recipe: "recipe",
  scan: "scan",
  "scan-suggestions": "scan-suggestions",
  "scan-detail": "scan-detail",
  "scan-cook": "scan-cook",
  "scan-cart": "scan-cart",
  notifications: "notifications",
  profile: "profile",
};

const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const headerPrimaryButton = document.getElementById("headerPrimaryButton");
const headerPrimaryBack = document.getElementById("headerPrimaryBack");
const headerPrimaryMenu = document.getElementById("headerPrimaryMenu");
const headerCartButton = document.getElementById("headerCartButton");
const homeSearchPrompt = document.getElementById("homeSearchPrompt");

const servingSlider = document.getElementById("servingSlider");
const servingValue = document.getElementById("servingValue");
const dishNameInput = document.getElementById("dishNameInput");
const dishAllergiesInput = document.getElementById("dishAllergiesInput");

const ingredientsInput = document.getElementById("ingredientsInput");
const ingredientSuggestionList = document.getElementById("ingredientSuggestionList");
const ingredientDetailImage = document.getElementById("ingredientDetailImage");
const ingredientDetailTitle = document.getElementById("ingredientDetailTitle");
const ingredientDetailDescription = document.getElementById("ingredientDetailDescription");

const allergyAlertBox = document.getElementById("allergyAlertBox");
const cartList = document.getElementById("cartList");

const recipeTitle = document.getElementById("recipeTitle");
const recipeMeta = document.getElementById("recipeMeta");
const recipeIngredients = document.getElementById("recipeIngredients");
const recipeSteps = document.getElementById("recipeSteps");
const recipeLinks = document.getElementById("recipeLinks");

const scanVideo = document.getElementById("scanVideo");
const scanPreviewImage = document.getElementById("scanPreviewImage");
const scanPreviewShell = document.querySelector(".scan-preview-shell");
const scanTargetFrame = document.querySelector(".scan-target-frame");
const scanStatusText = document.getElementById("scanStatusText");
const scanImportButton = document.getElementById("scanImportButton");
const scanCaptureButton = document.getElementById("scanCaptureButton");
const scanResetButton = document.getElementById("scanResetButton");
const scanFileInput = document.getElementById("scanFileInput");
const scanSuggestionList = document.getElementById("scanSuggestionList");
const scanDetailImage = document.getElementById("scanDetailImage");
const scanDetailTitle = document.getElementById("scanDetailTitle");
const scanDetailDescription = document.getElementById("scanDetailDescription");
const scanCookTitle = document.getElementById("scanCookTitle");
const scanCookDescription = document.getElementById("scanCookDescription");
const scanCookSteps = document.getElementById("scanCookSteps");
const scanCookLinks = document.getElementById("scanCookLinks");
const scanExtrasList = document.getElementById("scanExtrasList");
const scanCartList = document.getElementById("scanCartList");

init();

function init() {
  seedHomeQuantities();
  bindEvents();
  updateServingValue();
  navigate("home", { replaceHistory: true });
}

function bindEvents() {
  homeSearchPrompt.addEventListener("click", () => navigate("chooser"));

  document.querySelectorAll("[data-home-filter]").forEach((button) => {
    button.addEventListener("click", () => applyHomeFilter(button.dataset.homeFilter));
  });

  document.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => updateQuantity(button));
  });

  document.querySelectorAll("[data-open-search]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetPage = button.dataset.openSearch === "ingredients"
        ? "ingredients-search"
        : "dish-search";
      navigate(targetPage);
    });
  });

  document.getElementById("dishSearchBackButton").addEventListener("click", () => navigate("home"));
  document.getElementById("dishSearchCartButton").addEventListener("click", () => generateDishPlanAndGo("cart"));
  document.getElementById("clearDishButton").addEventListener("click", () => {
    dishNameInput.value = "";
  });
  document.getElementById("voiceButton").addEventListener("click", handleVoicePlaceholder);
  servingSlider.addEventListener("input", updateServingValue);

  document.getElementById("ingredientSearchBackButton").addEventListener("click", () => navigate("home"));
  document.getElementById("ingredientSearchSubmitButton").addEventListener("click", generateIngredientSuggestionsAndGo);
  document.getElementById("clearIngredientsButton").addEventListener("click", () => {
    ingredientsInput.value = "";
  });
  document.getElementById("ingredientsMicButton").addEventListener("click", handleVoicePlaceholder);
  document.getElementById("ingredientSuggestionsBackButton").addEventListener("click", () => navigate("ingredients-search"));
  document.getElementById("ingredientSuggestionsShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("ingredientDetailBackButton").addEventListener("click", () => navigate("ingredient-suggestions"));
  document.getElementById("ingredientDetailShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("ingredientTryOthersButton").addEventListener("click", () => navigate("ingredient-suggestions"));
  document.getElementById("ingredientLetsCookButton").addEventListener("click", openSelectedSuggestionRecipe);

  scanImportButton.addEventListener("click", () => scanFileInput.click());
  scanCaptureButton.addEventListener("click", handleScanCapture);
  scanResetButton.addEventListener("click", handleScanReset);
  scanFileInput.addEventListener("change", handleScanFileSelect);
  document.getElementById("scanSuggestionsBackButton").addEventListener("click", () => navigate("scan"));
  document.getElementById("scanSuggestionsShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("scanDetailBackButton").addEventListener("click", () => navigate("scan-suggestions"));
  document.getElementById("scanDetailShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("scanTryOthersButton").addEventListener("click", () => navigate("scan-suggestions"));
  document.getElementById("scanLetsCookButton").addEventListener("click", openScanCookPage);
  document.getElementById("scanCookBackButton").addEventListener("click", () => navigate("scan-detail"));
  document.getElementById("scanCookShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("scanCookHomeButton").addEventListener("click", () => navigate("home"));
  document.getElementById("scanBuyExtrasButton").addEventListener("click", handleOpenScanCart);
  document.getElementById("scanCartBackButton").addEventListener("click", () => navigate("scan-cook"));
  document.getElementById("scanCartShareButton").addEventListener("click", handleSharePlaceholder);
  document.getElementById("scanAddStripButton").addEventListener("click", () => navigate("scan-cook"));
  document.getElementById("scanCheckoutButton").addEventListener("click", handleScanCheckout);

  document.getElementById("cartBackButton").addEventListener("click", () => navigate(state.cartReturnPage || "dish-search"));
  document.getElementById("checkoutButton").addEventListener("click", handleCheckout);
  document.getElementById("removeFlaggedButton").addEventListener("click", removeFlaggedIngredients);
  document.getElementById("proceedAnywayButton").addEventListener("click", () => {
    allergyAlertBox.classList.add("hidden");
  });

  document.getElementById("paymentBackButton").addEventListener("click", () => navigate(state.paymentReturnPage || "cart"));
  document.getElementById("paymentHomeButton").addEventListener("click", () => navigate("home"));
  document.getElementById("paymentRecipeButton").addEventListener("click", () => {
    if (state.currentRecipe) {
      navigate("recipe");
    }
  });

  headerPrimaryButton.addEventListener("click", () => {
    if (state.currentPage === "home") {
      navigate("chooser");
      return;
    }

    navigate("home");
  });

  headerCartButton.addEventListener("click", () => {
    if (state.currentPage === "dish-search") {
      generateDishPlanAndGo("cart");
      return;
    }

    if (isScanFlowPage(state.currentPage)) {
      if (!state.scanExtras.length && state.currentScanSuggestion?.extras?.length) {
        state.scanExtras = cloneExtras(state.currentScanSuggestion.extras);
      }
      if (state.scanExtras.length) {
        navigate("scan-cart");
        return;
      }
    }

    if (state.cart.length) {
      navigate("cart");
    }
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetPage = item.dataset.route === "search"
        ? "chooser"
        : item.dataset.route;
      navigate(targetPage);
    });
  });
}

function navigate(page, options = {}) {
  const safePage = pageTitles[page] ? page : "home";
  const previousPage = state.currentPage;

  if (!options.replaceHistory) {
    const last = state.history[state.history.length - 1];
    if (last !== safePage) {
      state.history.push(safePage);
    }
  }

  if (safePage === "cart" && previousPage !== "cart") {
    state.cartReturnPage = previousPage;
  }

  if (previousPage === "scan" && safePage !== "scan") {
    stopScanCamera();
  }

  state.currentPage = safePage;

  pages.forEach((section) => {
    section.classList.toggle("active", section.dataset.page === safePage);
  });

  const activeRoute = getActiveNavRoute(safePage);
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.route === activeRoute);
  });

  headerPrimaryMenu.classList.remove("hidden");
  headerPrimaryBack.classList.add("hidden");

  if (safePage === "scan") {
    renderScanPreview();
    startScanCamera();
  }

  if (safePage === "ingredient-suggestions") renderIngredientSuggestions();
  if (safePage === "ingredient-detail") renderIngredientDetail();
  if (safePage === "scan-suggestions") renderScanSuggestions();
  if (safePage === "scan-detail") renderScanDetail();
  if (safePage === "scan-cook") renderScanCook();
  if (safePage === "scan-cart") renderScanCart();
  if (safePage === "cart") renderCart();
  if (safePage === "recipe") renderRecipe();
}

function getActiveNavRoute(page) {
  if (page === "home") return "home";
  if (["scan", "scan-suggestions", "scan-detail", "scan-cook", "scan-cart"].includes(page)) return "scan";
  if (page === "payment") return state.paymentReturnPage === "scan-cart" ? "scan" : "search";
  if (page === "cart") return "search";
  if (page === "recipe" && state.recipeSource === "scan") return "scan";
  if (["chooser", "dish-search", "ingredients-search", "ingredient-suggestions", "ingredient-detail", "recipe"].includes(page)) return "search";
  if (page === "notifications") return "notifications";
  if (page === "profile") return "profile";
  return "";
}

function isScanFlowPage(page) {
  return ["scan", "scan-suggestions", "scan-detail", "scan-cook", "scan-cart"].includes(page);
}

function seedHomeQuantities() {
  document.querySelectorAll("[data-qty-value]").forEach((valueNode) => {
    state.homeQuantities[valueNode.dataset.qtyValue] = Number(valueNode.textContent) || 1;
  });
}

function updateQuantity(button) {
  const key = button.dataset.qtyTarget;
  const output = document.querySelector(`[data-qty-value="${key}"]`);
  if (!output) return;

  const currentValue = state.homeQuantities[key] || 1;
  const nextValue = button.dataset.qtyAction === "increase"
    ? currentValue + 1
    : Math.max(0, currentValue - 1);

  state.homeQuantities[key] = nextValue;
  output.textContent = String(nextValue);
}

function applyHomeFilter(filterName) {
  document.querySelectorAll("[data-home-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.homeFilter === filterName);
  });

  document.querySelectorAll('.page[data-page="home"] .product-tile[data-category]').forEach((tile) => {
    const shouldShow = filterName === "all" || tile.dataset.category === filterName;
    tile.classList.toggle("is-filtered-out", !shouldShow);
  });
}

function updateServingValue() {
  servingValue.textContent = servingSlider.value;
}


async function generateDishPlanAndGo(targetPage) {
  const dishName = dishNameInput.value.trim();
  const servings = Number(servingSlider.value) || 1;
  const allergies = normalizeList(dishAllergiesInput.value);

  if (!dishName) {
    alert("Please enter a dish name first.");
    return;
  }

  try {
    const recipe = await requestGeminiDishPlan({ dishName, servings, allergies });
    state.currentRecipe = recipe;
    state.recipeSource = "search";
    state.cart = buildCartFromRecipe(recipe, allergies);
    renderRecipe();
    renderCart();
    navigate(targetPage);
  } catch (error) {
    alert(error?.message || "Could not generate a real recipe right now.");
  }
}

async function requestGeminiDishPlan({ dishName, servings, allergies }) {
  const recipe = await requestGroundedDishRecipe({ dishName, servings, allergies });
  if (!recipe) {
    throw new Error("Gemini could not build a grounded recipe right now. Please try again in a moment.");
  }

  recipe.allergyWarnings = findAllergyWarnings(recipe.ingredients, allergies);
  return recipe;
}

async function generateIngredientSuggestionsAndGo() {
  const rawIngredients = ingredientsInput.value.trim();

  if (!rawIngredients) {
    alert("Please enter the ingredients you already have.");
    return;
  }

  const suggestions = await requestGeminiIngredientSuggestions(rawIngredients);
  state.ingredientSuggestions = suggestions;
  state.currentSuggestion = suggestions[0] || null;
  renderIngredientSuggestions();
  navigate("ingredient-suggestions");
}

async function requestGeminiIngredientSuggestions(rawIngredients) {
  await wait(320);
  return buildIngredientSuggestions(rawIngredients);
}

function renderIngredientSuggestions() {
  renderSuggestionCards({
    container: ingredientSuggestionList,
    suggestions: state.ingredientSuggestions,
    emptyMessage: "No suggestions yet. Enter your ingredients and let the mock AI analyze them.",
    onOpen: openIngredientSuggestion,
  });
}

function openIngredientSuggestion(index) {
  state.currentSuggestion = state.ingredientSuggestions[index] || null;
  renderIngredientDetail();
  navigate("ingredient-detail");
}

function renderIngredientDetail() {
  if (!state.currentSuggestion) {
    ingredientDetailTitle.textContent = "Suggested dish";
    ingredientDetailDescription.innerHTML = "<p>Select a suggestion to see more detail.</p>";
    ingredientDetailImage.src = "./assets/9.png";
    return;
  }

  ingredientDetailTitle.textContent = state.currentSuggestion.title;
  ingredientDetailImage.src = state.currentSuggestion.heroImage || state.currentSuggestion.image;
  ingredientDetailImage.alt = state.currentSuggestion.title;
  ingredientDetailDescription.innerHTML = `
    <p>${state.currentSuggestion.description}</p>
    <ul>
      ${state.currentSuggestion.ingredients.slice(0, 4).map((ingredient) => `<li>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</li>`).join("")}
    </ul>
  `;
}

function openSelectedSuggestionRecipe() {
  if (!state.currentSuggestion) {
    return;
  }

  state.currentRecipe = convertSuggestionToRecipe(state.currentSuggestion);
  state.recipeSource = "search";
  state.cart = buildCartFromRecipe(state.currentRecipe, []);
  renderRecipe();
  navigate("recipe");
}

async function startScanCamera() {
  if (state.scanImageSrc || state.scanStream) {
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    scanStatusText.textContent = "Camera is not available here. Import a photo from your device instead.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1440 },
        height: { ideal: 1920 },
      },
      audio: false,
    });

    state.scanStream = stream;
    scanVideo.srcObject = stream;
    scanVideo.classList.remove("hidden");
    scanPreviewImage.classList.add("hidden");
    scanStatusText.textContent = "Camera ready. Tap Scan to capture ingredients.";
  } catch (error) {
    scanStatusText.textContent = "Camera access failed. You can still import a photo from your device.";
  }
}

function stopScanCamera() {
  if (!state.scanStream) {
    return;
  }

  state.scanStream.getTracks().forEach((track) => track.stop());
  state.scanStream = null;
  scanVideo.srcObject = null;
}

function renderScanPreview() {
  if (state.scanImageSrc) {
    scanPreviewImage.src = state.scanImageSrc;
    scanPreviewImage.classList.remove("hidden");
    scanVideo.classList.add("hidden");
    if (state.scanIngredients.length) {
      const label = state.scanAnalysisSource === "gemini" ? "Gemini scan found" : "Quick scan found";
      scanStatusText.textContent = `${label}: ${state.scanIngredients.join(", ")}.`;
    } else {
      scanStatusText.textContent = "Image ready. Tap Scan to analyze this image.";
    }
    return;
  }

  scanPreviewImage.classList.add("hidden");
  scanVideo.classList.remove("hidden");
  scanStatusText.textContent = "Point the camera at ingredients or import a photo from your device.";
}

async function handleScanCapture() {
  if (state.scanImageSrc) {
    await analyzeCurrentScanImage();
    return;
  }

  if (!state.scanStream) {
    await startScanCamera();
    if (!state.scanStream) {
      return;
    }
  }

  await ensureVideoReady(scanVideo);
  const focusedCapture = captureFocusedScanFromElement(
    scanVideo,
    scanVideo.videoWidth || 720,
    scanVideo.videoHeight || 1280,
    "image/jpeg"
  );

  if (!focusedCapture) {
    alert("Camera preview is still getting ready. Please try the scan again.");
    return;
  }

  state.scanImageSrc = focusedCapture.dataUrl;
  state.scanImageMimeType = focusedCapture.mimeType;
  state.scanSourceName = "camera-capture";
  state.scanIngredients = [];
  state.scanAnalysisSource = "";
  state.scanRecipeHints = [];
  stopScanCamera();
  renderScanPreview();
  await analyzeCurrentScanImage();
}

function handleScanReset() {
  stopScanCamera();
  state.scanImageSrc = "";
  state.scanImageMimeType = "image/jpeg";
  state.scanSourceName = "";
  state.scanIngredients = [];
  state.scanAnalysisSource = "";
  state.scanRecipeHints = [];
  state.scanSuggestions = [];
  state.currentScanSuggestion = null;
  state.scanExtras = [];
  scanFileInput.value = "";
  renderScanPreview();
  if (state.currentPage === "scan") {
    startScanCamera();
  }
}

function handleScanFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    stopScanCamera();
    state.scanImageSrc = String(reader.result || "");
    state.scanImageMimeType = file.type || getMimeTypeFromDataUrl(state.scanImageSrc);
    state.scanSourceName = file.name.toLowerCase();
    state.scanIngredients = [];
    state.scanAnalysisSource = "";
    state.scanRecipeHints = [];
    renderScanPreview();
    await waitForImageReady(scanPreviewImage);

    const focusedImport = captureFocusedScanFromElement(
      scanPreviewImage,
      scanPreviewImage.naturalWidth || 720,
      scanPreviewImage.naturalHeight || 1280,
      state.scanImageMimeType
    );

    if (focusedImport) {
      state.scanImageSrc = focusedImport.dataUrl;
      state.scanImageMimeType = focusedImport.mimeType;
      renderScanPreview();
    }

    await analyzeCurrentScanImage();
  };
  reader.readAsDataURL(file);
}

async function analyzeCurrentScanImage() {
  if (!state.scanImageSrc) {
    alert("Capture or import an image first.");
    return;
  }

  scanStatusText.textContent = "Scanning ingredients from your image...";
  const scanResult = await requestOcrIngredientsFromImage();
  state.scanIngredients = scanResult.ingredients;
  state.scanAnalysisSource = scanResult.source;
  state.scanRecipeHints = scanResult.recipeHints || [];
  state.scanSuggestions = buildScanSuggestions(scanResult.ingredients, {
    imageSrc: state.scanImageSrc,
    sourceName: state.scanSourceName,
    recipeHints: state.scanRecipeHints,
  });
  state.currentScanSuggestion = state.scanSuggestions[0] || null;
  renderScanSuggestions();
  navigate("scan-suggestions");
}

async function requestOcrIngredientsFromImage() {
  await wait(220);

  const geminiResult = await requestGeminiScanAnalysis();
  if (geminiResult?.ingredients?.length) {
    return {
      ingredients: geminiResult.ingredients,
      source: "gemini",
      recipeHints: geminiResult.recipeHints || [],
    };
  }

  const source = state.scanSourceName.toLowerCase();
  if (hasAny(source, ["burger", "hamburger"])) {
    return {
      ingredients: ["burger bun", "beef patty", "cheese", "tomato", "lettuce"],
      source: "mock",
      recipeHints: [],
    };
  }
  if (hasAny(source, ["fish", "ca", "salmon"])) {
    return {
      ingredients: ["fish", "pepper", "tomato", "garlic"],
      source: "mock",
      recipeHints: [],
    };
  }
  if (hasAny(source, ["egg", "trung", "milk", "sua"])) {
    return {
      ingredients: ["eggs", "milk", "cheese", "tomato"],
      source: "mock",
      recipeHints: [],
    };
  }
  if (hasAny(source, ["fridge", "scan", "kitchen", "food"])) {
    return {
      ingredients: ["milk", "eggs", "cheese", "greens", "tomato"],
      source: "mock",
      recipeHints: [],
    };
  }

  return {
    ingredients: ["milk", "eggs", "cheese", "tomato", "lettuce"],
    source: "mock",
    recipeHints: [],
  };
}

function buildScanSuggestions(detectedIngredients, context) {
  const text = detectedIngredients.join(" ").toLowerCase();
  const suggestions = [];
  const addSuggestion = (suggestion) => {
    if (!suggestions.some((entry) => entry.id === suggestion.id)) {
      suggestions.push(suggestion);
    }
  };

  const useImportedBurgerImage = context.imageSrc && hasAny(context.sourceName, ["burger", "hamburger"]);
  const useImportedFishImage = context.imageSrc && hasAny(context.sourceName, ["fish", "ca", "salmon"]);

  (context.recipeHints || []).slice(0, 2).forEach((hint, index) => {
    addSuggestion(buildAiBackedScanSuggestion(hint, detectedIngredients, context, index));
  });

  if (hasAny(text, ["burger bun", "bun", "beef patty", "lettuce", "cheese"])) {
    addSuggestion({
      id: "scan-hamburger",
      title: "Hamburger",
      image: useImportedBurgerImage ? context.imageSrc : "./assets/3.png",
      heroImage: useImportedBurgerImage ? context.imageSrc : "./assets/3.png",
      summary: "A juicy burger is a strong match for the ingredients seen in the scan.",
      description: "The scan suggests a burger build with bun, patty, cheese and fresh toppings. This is the quickest way to turn the scanned ingredients into a full meal.",
      ingredients: [
        { name: "burger bun", quantity: 2, unit: "pcs", category: "pantry" },
        { name: "beef patty", quantity: 2, unit: "pcs", category: "meat" },
        { name: "cheese", quantity: 2, unit: "slices", category: "dairy" },
        { name: "tomato", quantity: 1, unit: "whole", category: "vegetable" },
      ],
      steps: [
        "Season and sear the patties until browned on both sides.",
        "Toast the buns lightly and prep the toppings.",
        "Stack the burger with cheese, tomato and greens.",
        "Serve hot while the patty is still juicy.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=hamburger+recipe"],
      extras: [
        makeExtra("extra-bun", "extra buns", 1, "pack", "pantry"),
        makeExtra("extra-cheese", "cheese slices", 1, "pack", "dairy"),
      ],
    });
  }

  if (hasAny(text, ["fish", "pepper", "garlic"])) {
    addSuggestion({
      id: "scan-ca-kho-tieu",
      title: "Cá kho tiêu",
      image: useImportedFishImage ? context.imageSrc : "./assets/9.png",
      heroImage: useImportedFishImage ? context.imageSrc : "./assets/9.png",
      summary: "Braised pepper fish is a very natural fit for the scanned ingredients.",
      description: "The scan points to a rich braised fish dish with pepper and tomato. It is flavorful, simple to cook and works well with rice.",
      ingredients: [
        { name: "fish", quantity: 2, unit: "pieces", category: "fish" },
        { name: "pepper", quantity: 1, unit: "tbsp", category: "pantry" },
        { name: "garlic", quantity: 2, unit: "cloves", category: "vegetable" },
        { name: "tomato", quantity: 2, unit: "whole", category: "vegetable" },
      ],
      steps: [
        "Marinate the fish with pepper and seasoning.",
        "Build a savory sauce with garlic and tomato.",
        "Simmer the fish until the sauce reduces and coats the pieces.",
        "Serve warm with rice or fresh vegetables.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=ca+kho+tieu"],
      extras: [
        makeExtra("extra-scallion", "spring onion", 1, "bundle", "vegetable"),
        makeExtra("extra-rice", "rice", 1, "bag", "pantry"),
      ],
    });
  }

  if (hasAny(text, ["eggs", "milk", "cheese"])) {
    addSuggestion({
      id: "scan-creamy-omelette",
      title: "Creamy omelette",
      image: "./assets/11.png",
      heroImage: "./assets/11.png",
      summary: "Eggs, milk and cheese can become a quick fluffy omelette.",
      description: "This is a fast comfort dish for leftover dairy and eggs. It uses a short ingredient list and gives you a warm meal with very little prep.",
      ingredients: [
        { name: "eggs", quantity: 3, unit: "whole", category: "egg" },
        { name: "milk", quantity: 80, unit: "ml", category: "dairy" },
        { name: "cheese", quantity: 2, unit: "slices", category: "dairy" },
        { name: "tomato", quantity: 1, unit: "whole", category: "vegetable" },
      ],
      steps: [
        "Whisk the eggs with milk until smooth.",
        "Cook slowly so the eggs stay soft.",
        "Fold in cheese and finish with tomato.",
        "Serve immediately while fluffy.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=creamy+omelette"],
      extras: [
        makeExtra("extra-butter", "butter", 1, "pack", "dairy"),
        makeExtra("extra-herbs", "fresh herbs", 1, "bundle", "vegetable"),
      ],
    });
  }

  addSuggestion({
    id: "scan-leftover-bowl",
    title: "Leftover skillet bowl",
    image: "./assets/7.png",
    heroImage: "./assets/7.png",
    summary: "A flexible pan meal that uses whatever the OCR found in your fridge.",
    description: "If you want the safest all-purpose option, turn the scanned ingredients into a skillet bowl. It is forgiving and ideal for mixed leftovers.",
    ingredients: detectedIngredients.slice(0, 4).map((name, index) => ({
      name,
      quantity: index + 1,
      unit: "portion",
      category: inferCategory(name),
    })),
    steps: [
      "Group ingredients by how long they take to cook.",
      "Cook proteins first, then add vegetables and softer items.",
      "Finish with seasoning and a quick sauce.",
      "Serve hot in a bowl.",
    ],
    youtubeLinks: ["https://www.youtube.com/results?search_query=leftover+skillet+bowl"],
    extras: [
      makeExtra("extra-seasoning", "seasoning mix", 1, "pack", "pantry"),
      makeExtra("extra-greens", "fresh greens", 1, "bundle", "vegetable"),
    ],
  });

  return suggestions.slice(0, 4);
}

function renderScanSuggestions() {
  renderSuggestionCards({
    container: scanSuggestionList,
    suggestions: state.scanSuggestions,
    emptyMessage: "No scan suggestions yet. Capture or import an image first.",
    onOpen: openScanSuggestion,
  });
}

function openScanSuggestion(index) {
  state.currentScanSuggestion = state.scanSuggestions[index] || null;
  renderScanDetail();
  navigate("scan-detail");
}

function renderScanDetail() {
  if (!state.currentScanSuggestion) {
    scanDetailTitle.textContent = "Suggested dish";
    scanDetailDescription.innerHTML = "<p>Select a scanned suggestion to see more detail.</p>";
    scanDetailImage.src = state.scanImageSrc || "./assets/3.png";
    return;
  }

  scanDetailTitle.textContent = state.currentScanSuggestion.title;
  scanDetailImage.src = state.currentScanSuggestion.heroImage || state.currentScanSuggestion.image;
  scanDetailImage.alt = state.currentScanSuggestion.title;
  scanDetailDescription.innerHTML = `
    <p>${state.currentScanSuggestion.description}</p>
    <ul>
      ${state.currentScanSuggestion.ingredients.slice(0, 4).map((ingredient) => `<li>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</li>`).join("")}
    </ul>
  `;
}

function openScanCookPage() {
  if (!state.currentScanSuggestion) {
    return;
  }

  state.currentRecipe = convertSuggestionToRecipe(state.currentScanSuggestion);
  state.recipeSource = "scan";
  state.scanExtras = cloneExtras(state.currentScanSuggestion.extras);
  renderRecipe();
  renderScanCook();
  navigate("scan-cook");
}

function renderScanCook() {
  if (!state.currentScanSuggestion) {
    scanCookTitle.textContent = "Suggested dish";
    scanCookDescription.innerHTML = "<p>Select a scan suggestion to start cooking.</p>";
    scanCookSteps.innerHTML = "";
    scanCookLinks.innerHTML = "";
    scanExtrasList.innerHTML = "";
    return;
  }

  scanCookTitle.textContent = state.currentScanSuggestion.title;
  const detectedLabel = state.scanAnalysisSource === "gemini" ? "Detected by Gemini vision" : "Detected by quick scan";
  scanCookDescription.innerHTML = `
    <p>${state.currentScanSuggestion.description}</p>
    <p>${detectedLabel}: ${state.scanIngredients.join(", ")}.</p>
  `;
  scanCookSteps.innerHTML = state.currentScanSuggestion.steps.map((step) => `<li>${step}</li>`).join("");
  scanCookLinks.innerHTML = state.currentScanSuggestion.youtubeLinks
    .map((link) => `<a href="${link}" target="_blank" rel="noreferrer">Open YouTube cooking guide</a>`)
    .join("");

  renderScanExtrasGrid(scanExtrasList, state.scanExtras);
}

function handleOpenScanCart() {
  if (!state.scanExtras.length) {
    alert("No extra ingredients were suggested for this recipe.");
    return;
  }

  renderScanCart();
  navigate("scan-cart");
}

function renderScanCart() {
  scanCartList.innerHTML = "";

  if (!state.scanExtras.length) {
    scanCartList.innerHTML = '<div class="scan-empty-message">No extras selected yet. Use the recipe page to add extras for this dish.</div>';
    return;
  }

  state.scanExtras.forEach((extra) => {
    const card = document.createElement("article");
    card.className = "scan-confirm-card";
    card.innerHTML = `
      <img src="${extra.image}" alt="${extra.name}">
      <div class="scan-confirm-card-body">
        <div class="scan-confirm-card-title">${extra.name}</div>
        <div class="scan-extra-controls">
          <button class="qty-button qty-minus" type="button" data-scan-extra-action="decrease" data-scan-extra-id="${extra.id}">-</button>
          <span class="qty-count">${extra.quantity}</span>
          <button class="qty-button qty-plus" type="button" data-scan-extra-action="increase" data-scan-extra-id="${extra.id}">+</button>
        </div>
      </div>
    `;
    scanCartList.appendChild(card);
  });

  scanCartList.querySelectorAll("[data-scan-extra-action]").forEach((button) => {
    button.addEventListener("click", () => updateScanExtraQuantity(button.dataset.scanExtraId, button.dataset.scanExtraAction));
  });
}

function renderScanExtrasGrid(container, extras) {
  container.innerHTML = "";

  if (!extras.length) {
    container.innerHTML = '<div class="scan-empty-message">No extras are needed for this recipe right now.</div>';
    return;
  }

  extras.forEach((extra) => {
    const card = document.createElement("article");
    card.className = "scan-extra-card";
    card.innerHTML = `
      <img src="${extra.image}" alt="${extra.name}">
      <span class="scan-extra-label">${extra.name}</span>
      <div class="scan-extra-controls">
        <button class="qty-button qty-minus" type="button" data-scan-extra-action="decrease" data-scan-extra-id="${extra.id}">-</button>
        <span class="qty-count">${extra.quantity}</span>
        <button class="qty-button qty-plus" type="button" data-scan-extra-action="increase" data-scan-extra-id="${extra.id}">+</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-scan-extra-action]").forEach((button) => {
    button.addEventListener("click", () => updateScanExtraQuantity(button.dataset.scanExtraId, button.dataset.scanExtraAction));
  });
}

function updateScanExtraQuantity(extraId, action) {
  const target = state.scanExtras.find((extra) => extra.id === extraId);
  if (!target) {
    return;
  }

  target.quantity = action === "increase"
    ? target.quantity + 1
    : Math.max(0, target.quantity - 1);

  if (state.currentPage === "scan-cook") {
    renderScanCook();
  }
  if (state.currentPage === "scan-cart") {
    renderScanCart();
  }
}

function handleScanCheckout() {
  if (!state.scanExtras.some((extra) => extra.quantity > 0)) {
    alert("Choose at least one extra ingredient before checkout.");
    return;
  }

  state.paymentReturnPage = "scan-cart";
  navigate("payment");
}

function renderSuggestionCards({ container, suggestions, emptyMessage, onOpen }) {
  container.innerHTML = "";

  if (!suggestions.length) {
    container.innerHTML = `<div class="ingredient-suggestion-empty">${emptyMessage}</div>`;
    return;
  }

  suggestions.forEach((suggestion, index) => {
    const button = document.createElement("button");
    button.className = "ingredient-suggestion-card";
    button.type = "button";
    button.innerHTML = `
      <img src="${suggestion.image}" alt="${suggestion.title}">
      <div class="ingredient-suggestion-copy">
        <h3>${suggestion.title}</h3>
        <p>${suggestion.summary}</p>
      </div>
    `;
    button.addEventListener("click", () => onOpen(index));
    container.appendChild(button);
  });
}

function buildMockDishRecipe(dishName, servings) {
  const value = dishName.toLowerCase();

  const presets = {
    fish: {
      match: ["cá", "fish", "salmon", "ca kho", "ca bong"],
      title: titleCase(dishName),
      ingredients: [
        { name: "fish fillet", quantity: 1 * servings, unit: "piece", category: "fish" },
        { name: "fish sauce", quantity: 1 * servings, unit: "tbsp", category: "pantry" },
        { name: "garlic", quantity: 2 * servings, unit: "cloves", category: "vegetable" },
        { name: "spring onion", quantity: 1 * servings, unit: "stalk", category: "vegetable" },
        { name: "rice", quantity: 1 * servings, unit: "bowl", category: "pantry" },
      ],
    },
    meat: {
      match: ["beef", "pork", "thịt", "thit", "meat", "heo", "bò", "bo"],
      title: titleCase(dishName),
      ingredients: [
        { name: "meat", quantity: 140 * servings, unit: "g", category: "meat" },
        { name: "garlic", quantity: 2 * servings, unit: "cloves", category: "vegetable" },
        { name: "soy sauce", quantity: 1 * servings, unit: "tbsp", category: "pantry" },
        { name: "onion", quantity: 1 * servings, unit: "small", category: "vegetable" },
        { name: "rice", quantity: 1 * servings, unit: "bowl", category: "pantry" },
      ],
    },
    eggs: {
      match: ["egg", "trứng", "trung"],
      title: titleCase(dishName),
      ingredients: [
        { name: "eggs", quantity: 2 * servings, unit: "whole", category: "egg" },
        { name: "milk", quantity: 80 * servings, unit: "ml", category: "dairy" },
        { name: "pepper", quantity: 1, unit: "tsp", category: "pantry" },
        { name: "butter", quantity: 1, unit: "tbsp", category: "dairy" },
      ],
    },
  };

  const selected = Object.values(presets).find((preset) => preset.match.some((keyword) => value.includes(keyword)));
  const chosen = selected || {
    title: titleCase(dishName),
    ingredients: [
      { name: dishName, quantity: 1 * servings, unit: "portion", category: inferCategory(dishName) },
      { name: "garlic", quantity: 2 * servings, unit: "cloves", category: "vegetable" },
      { name: "oil", quantity: 1, unit: "tbsp", category: "pantry" },
      { name: "seasoning", quantity: 1, unit: "pack", category: "pantry" },
    ],
  };

  return {
    title: chosen.title,
    serves: servings,
    ingredients: chosen.ingredients,
    steps: [
      "Prepare the ingredients and portion them for the selected servings.",
      "Cook the aromatic base first to build flavor.",
      "Add the main ingredient and cook until done.",
      "Plate the dish and serve immediately.",
    ],
    youtubeLinks: [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${dishName} recipe`)}`],
    allergyWarnings: [],
  };
}

async function requestGroundedDishRecipe({ dishName, servings, allergies }) {
  const response = await fetch("/api/dish-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dishName,
      servings,
      allergies,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Server recipe generation failed.");
  }

  return payload;
}

function parseGroundedDishRecipePayload(rawText) {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return null;
  }
}

function normalizeGroundedDishRecipe(payload, { dishName, servings, groundingMetadata }) {
  if (!payload) {
    return null;
  }

  const ingredients = normalizeIngredientEntries(payload.ingredients);
  const steps = normalizeInstructionSteps(payload.steps);
  if (!ingredients.length || !steps.length) {
    return null;
  }

  const title = titleCase(payload.title || dishName);
  return {
    title,
    serves: Number(payload.serves) || servings,
    ingredients,
    steps,
    youtubeLinks: normalizeRecipeLinks(payload.youtubeLinks, title),
    sourceLinks: extractGroundingLinks(groundingMetadata),
    allergyWarnings: [],
  };
}

function normalizeIngredientEntries(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((entry) => {
      const name = String(entry?.name || entry?.ingredient || "").trim();
      if (!name) {
        return null;
      }

      const category = ["vegetable", "meat", "fish", "dairy", "pantry", "egg"].includes(String(entry?.category || "").toLowerCase())
        ? String(entry.category).toLowerCase()
        : inferCategory(name);

      return {
        name,
        quantity: parseQuantityValue(entry?.quantity),
        unit: String(entry?.unit || "item").trim() || "item",
        category,
      };
    })
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeInstructionSteps(values) {
  const list = Array.isArray(values)
    ? values
    : String(values || "").split(/\n+/);

  return list
    .map((step) => String(step).trim().replace(/^\d+[.)-]?\s*/, ""))
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeRecipeLinks(values, title) {
  const links = (Array.isArray(values) ? values : [values])
    .map((value) => String(value || "").trim())
    .filter((value) => /^https?:\/\//i.test(value));

  const uniqueLinks = [...new Set(links)];
  if (uniqueLinks.length) {
    return uniqueLinks.slice(0, 3);
  }

  return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} recipe`)}`];
}

function extractGroundingLinks(metadata) {
  const chunks = metadata?.groundingChunks || [];
  const links = [];

  chunks.forEach((chunk) => {
    const uri = chunk?.web?.uri;
    if (!/^https?:\/\//i.test(String(uri || ""))) {
      return;
    }

    links.push({
      url: uri,
      title: String(chunk?.web?.title || uri).trim(),
    });
  });

  return uniqueObjectsByKey(links, "url").slice(0, 6);
}

function parseQuantityValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value || "").trim();
  if (!text) {
    return 1;
  }

  const mixedFraction = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedFraction) {
    return Number(mixedFraction[1]) + Number(mixedFraction[2]) / Number(mixedFraction[3]);
  }

  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }

  const numeric = Number(text.replace(/,/g, "."));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}
function buildIngredientSuggestions(rawValue) {
  const text = rawValue.toLowerCase();
  const items = normalizeList(rawValue);
  const suggestions = [];

  const addSuggestion = (suggestion) => {
    if (!suggestions.some((entry) => entry.id === suggestion.id)) {
      suggestions.push(suggestion);
    }
  };

  if (hasAny(text, ["cá", "fish", "salmon", "ca bong", "ca kho"])) {
    addSuggestion({
      id: "ca-kho-tieu",
      title: "Cá kho tiêu",
      image: "./assets/9.png",
      heroImage: "./assets/9.png",
      summary: "A savory braised fish dish that fits fish, pepper and tomato very well.",
      description: "You already have a strong base for a rich braised fish dish. Pepper and tomato help round out the sauce and keep the fish tender while cooking.",
      serves: 2,
      ingredients: [
        { name: "fish", quantity: 2, unit: "pieces", category: "fish" },
        { name: "pepper", quantity: 1, unit: "tbsp", category: "pantry" },
        { name: "tomato", quantity: 2, unit: "whole", category: "vegetable" },
        { name: "fish sauce", quantity: 2, unit: "tbsp", category: "pantry" },
      ],
      steps: [
        "Marinate the fish with seasoning and cracked pepper.",
        "Build a light sauce with tomato and fish sauce.",
        "Simmer the fish gently until the sauce thickens.",
        "Serve hot with rice.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=ca+kho+tieu"],
    });

    addSuggestion({
      id: "canh-chua-ca",
      title: "Canh chua cá",
      image: "./assets/8.png",
      heroImage: "./assets/8.png",
      summary: "A lighter fish soup option if you want something fresh and less heavy.",
      description: "With fish and tomato already available, you can pivot into a bright sour soup style dish that is easy to cook and works well for leftovers.",
      serves: 2,
      ingredients: [
        { name: "fish", quantity: 2, unit: "pieces", category: "fish" },
        { name: "tomato", quantity: 2, unit: "whole", category: "vegetable" },
        { name: "pineapple", quantity: 0.5, unit: "portion", category: "vegetable" },
        { name: "herbs", quantity: 1, unit: "bundle", category: "vegetable" },
      ],
      steps: [
        "Prep the fish and vegetables.",
        "Bring the broth to a simmer with tomato.",
        "Add the fish and cook gently until tender.",
        "Finish with herbs and serve immediately.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=canh+chua+ca"],
    });
  }

  if (hasAny(text, ["heo", "pork", "thịt", "thit", "bò", "bo", "beef"])) {
    addSuggestion({
      id: "thit-kho-trung",
      title: "Thịt kho trứng",
      image: "./assets/3.png",
      heroImage: "./assets/3.png",
      summary: "A cozy braised meat dish that uses pork or beef with eggs for extra richness.",
      description: "If you have meat and eggs in the fridge, this is one of the easiest comforting dishes to turn them into. The sauce is forgiving and scales well.",
      serves: 2,
      ingredients: [
        { name: "meat", quantity: 250, unit: "g", category: "meat" },
        { name: "eggs", quantity: 2, unit: "whole", category: "egg" },
        { name: "onion", quantity: 1, unit: "small", category: "vegetable" },
        { name: "seasoning", quantity: 1, unit: "pack", category: "pantry" },
      ],
      steps: [
        "Brown the meat lightly.",
        "Build the braising sauce and simmer.",
        "Add boiled eggs and continue cooking.",
        "Serve when glossy and tender.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=thit+kho+trung"],
    });
  }

  if (hasAny(text, ["trứng", "trung", "egg"])) {
    addSuggestion({
      id: "trung-chien-ca-chua",
      title: "Tr?ng chiên cà chua",
      image: "./assets/11.png",
      heroImage: "./assets/11.png",
      summary: "Fast, simple and perfect for using eggs plus tomato from the fridge.",
      description: "This is the quickest route if you want something warm right away. Tomato keeps the eggs soft and gives the dish a light sweet-sour balance.",
      serves: 2,
      ingredients: [
        { name: "eggs", quantity: 3, unit: "whole", category: "egg" },
        { name: "tomato", quantity: 2, unit: "whole", category: "vegetable" },
        { name: "spring onion", quantity: 1, unit: "stalk", category: "vegetable" },
      ],
      steps: [
        "Beat the eggs and prep the tomato.",
        "Cook the tomato until lightly softened.",
        "Pour in the eggs and fold gently.",
        "Serve immediately.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=trung+chien+ca+chua"],
    });
  }

  if (hasAny(text, ["cà chua", "ca chua", "rau", "vegetable", "nấm", "nam", "garlic"])) {
    addSuggestion({
      id: "rau-xao-toi",
      title: "Rau xào tỏi",
      image: "./assets/1.png",
      heroImage: "./assets/1.png",
      summary: "A quick stir-fry option when you want to use extra vegetables before they spoil.",
      description: "This suggestion works well when your leftovers are mostly vegetables. It is quick, flexible and easy to adapt to whatever is still in the fridge.",
      serves: 2,
      ingredients: [
        { name: "mixed vegetables", quantity: 300, unit: "g", category: "vegetable" },
        { name: "garlic", quantity: 3, unit: "cloves", category: "vegetable" },
        { name: "oil", quantity: 1, unit: "tbsp", category: "pantry" },
      ],
      steps: [
        "Prep the vegetables into even pieces.",
        "Saute garlic briefly in hot oil.",
        "Add vegetables and stir-fry quickly.",
        "Season and serve warm.",
      ],
      youtubeLinks: ["https://www.youtube.com/results?search_query=rau+xao+toi"],
    });
  }

  addSuggestion({
    id: "mixed-leftover-bowl",
    title: "Leftover skillet bowl",
    image: "./assets/7.png",
    heroImage: "./assets/7.png",
    summary: "A flexible pan recipe that helps you use up small amounts of mixed ingredients.",
    description: "When the fridge has a little bit of everything, a skillet bowl keeps the process simple. Cook the stronger items first, then add the delicate ones at the end.",
    serves: 2,
    ingredients: items.slice(0, 4).map((name, index) => ({
      name,
      quantity: index + 1,
      unit: "portion",
      category: inferCategory(name),
    })),
    steps: [
      "Group ingredients by cooking time.",
      "Cook proteins first if needed.",
      "Add vegetables and finish with sauce.",
      "Serve hot in a bowl.",
    ],
    youtubeLinks: ["https://www.youtube.com/results?search_query=leftover+skillet+bowl"],
  });

  return suggestions.slice(0, 4);
}

function convertSuggestionToRecipe(suggestion) {
  return {
    title: suggestion.title,
    serves: suggestion.serves || 2,
    ingredients: suggestion.ingredients || [],
    steps: suggestion.steps || [],
    youtubeLinks: suggestion.youtubeLinks || [],
    allergyWarnings: [],
  };
}

function buildCartFromRecipe(recipe, allergies) {
  return recipe.ingredients.map((ingredient) => ({
    id: `${ingredient.name}-${ingredient.category}`,
    ...ingredient,
    flagged: allergies.some((allergy) => ingredient.name.toLowerCase().includes(allergy.toLowerCase())),
    image: ingredient.image || getImageForCategory(ingredient.category),
  }));
}

function renderCart() {
  cartList.innerHTML = "";

  if (!state.cart.length) {
    cartList.innerHTML = '<div class="cart-alert">Your dish ingredients will appear here after AI generates the recipe.</div>';
    allergyAlertBox.classList.add("hidden");
    return;
  }

  const warnings = state.cart.filter((item) => item.flagged).map((item) => item.name);
  allergyAlertBox.classList.toggle("hidden", warnings.length === 0);
  allergyAlertBox.textContent = warnings.length
    ? `Allergy warning: ${warnings.join(", ")}. Tap the white button to remove them from the checkout list.`
    : "";

  state.cart.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cart-visual-card";
    card.innerHTML = `
      <img src="${safeUrl(item.image)}" alt="${escapeHtml(item.name)}">
      <span class="cart-item-label">${escapeHtml(item.name)} • ${escapeHtml(item.quantity)} ${escapeHtml(item.unit)}</span>
      ${item.flagged ? '<span class="cart-item-flag">Allergy warning</span>' : ""}
      <div class="cart-visual-controls">
        <button class="qty-button qty-minus" type="button" data-cart-qty="decrease" data-cart-id="${escapeHtml(item.id)}">-</button>
        <span class="qty-count">${escapeHtml(item.quantity)}</span>
        <button class="qty-button qty-plus" type="button" data-cart-qty="increase" data-cart-id="${escapeHtml(item.id)}">+</button>
      </div>
    `;
    cartList.appendChild(card);
  });

  cartList.querySelectorAll("[data-cart-qty]").forEach((button) => {
    button.addEventListener("click", () => updateCartQuantity(button));
  });
}

function updateCartQuantity(button) {
  const item = state.cart.find((entry) => entry.id === button.dataset.cartId);
  if (!item) {
    return;
  }

  item.quantity = button.dataset.cartQty === "increase"
    ? item.quantity + 1
    : Math.max(0, item.quantity - 1);

  renderCart();
}

function removeFlaggedIngredients() {
  const removedNames = state.cart.filter((item) => item.flagged).map((item) => item.name);
  state.cart = state.cart.filter((item) => !item.flagged);

  if (state.currentRecipe) {
    state.currentRecipe.ingredients = state.currentRecipe.ingredients.filter((ingredient) => !removedNames.includes(ingredient.name));
    state.currentRecipe.allergyWarnings = [];
  }

  renderCart();
  renderRecipe();
}

function handleCheckout() {
  if (!state.cart.length) {
    alert("Your cart is empty.");
    return;
  }

  state.paymentReturnPage = "cart";
  navigate("payment");
}

function renderRecipe() {
  if (!state.currentRecipe) {
    recipeTitle.textContent = "Recipe";
    recipeMeta.innerHTML = "";
    recipeIngredients.innerHTML = "";
    recipeSteps.innerHTML = "";
    recipeLinks.innerHTML = "";
    return;
  }

  recipeTitle.textContent = state.currentRecipe.title;
  recipeMeta.innerHTML = `
    <span class="meta-pill">Serves ${escapeHtml(state.currentRecipe.serves)}</span>
    ${state.currentRecipe.allergyWarnings?.length ? `<span class="meta-pill">Warnings: ${escapeHtml(state.currentRecipe.allergyWarnings.join(", "))}</span>` : '<span class="meta-pill">Ready to cook</span>'}
  `;
  recipeIngredients.innerHTML = state.currentRecipe.ingredients
    .map((ingredient) => `<li>${escapeHtml(ingredient.quantity)} ${escapeHtml(ingredient.unit)} ${escapeHtml(ingredient.name)}</li>`)
    .join("");
  recipeSteps.innerHTML = state.currentRecipe.steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");

  const youtubeLinks = (state.currentRecipe.youtubeLinks || [])
    .map((link) => `<a href="${safeUrl(link)}" target="_blank" rel="noreferrer">Open YouTube guide</a>`);
  const sourceLinks = (state.currentRecipe.sourceLinks || [])
    .map((link) => `<a href="${safeUrl(link.url)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(link.title || link.url)}</a>`);

  recipeLinks.innerHTML = [...youtubeLinks, ...sourceLinks].join("");
}

function makeExtra(id, name, quantity, unit, category, image) {
  return {
    id,
    name,
    quantity,
    unit,
    category,
    image: image || getImageForCategory(category),
  };
}

function cloneExtras(extras = []) {
  return extras.map((extra, index) => ({
    ...extra,
    id: extra.id || `${extra.name}-${index}`,
    image: extra.image || getImageForCategory(extra.category),
  }));
}

function findAllergyWarnings(ingredients, allergies) {
  return ingredients
    .filter((ingredient) => allergies.some((allergy) => ingredient.name.toLowerCase().includes(allergy.toLowerCase())))
    .map((ingredient) => ingredient.name);
}

function getImageForCategory(category) {
  const mapping = {
    vegetable: "./assets/1.png",
    meat: "./assets/3.png",
    fish: "./assets/9.png",
    dairy: "./assets/10.png",
    pantry: "./assets/12.png",
    egg: "./assets/11.png",
  };

  return mapping[category] || "./assets/1.png";
}

function inferCategory(value) {
  const text = String(value).toLowerCase();
  if (hasAny(text, ["cá", "fish", "salmon", "ca kho", "ca bong"])) return "fish";
  if (hasAny(text, ["beef", "pork", "meat", "thịt", "thit", "heo", "bò", "bo", "patty"])) return "meat";
  if (hasAny(text, ["milk", "cheese", "sữa", "sua", "butter"])) return "dairy";
  if (hasAny(text, ["egg", "trứng", "trung"])) return "egg";
  if (hasAny(text, ["rice", "com", "gao", "gạo", "bun", "bread"])) return "pantry";
  return "vegetable";
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeList(value) {
  return String(value || "")
    .split(/[;\n]/)
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function handleVoicePlaceholder() {
  alert("Voice input can be connected later. For now, type your request.");
}

function handleSharePlaceholder() {
  alert("Share action can be connected later in the production version.");
}

async function ensureVideoReady(video) {
  if (video.videoWidth && video.videoHeight) {
    return;
  }

  await new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve();
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", done);
      video.removeEventListener("canplay", done);
    };

    video.addEventListener("loadedmetadata", done, { once: true });
    video.addEventListener("canplay", done, { once: true });
    setTimeout(done, 500);
  });
}

async function waitForImageReady(image) {
  if (image.complete && image.naturalWidth) {
    return;
  }

  await new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve();
    };
    const cleanup = () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
    };

    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
    setTimeout(done, 700);
  });
}

function captureFocusedScanFromElement(sourceElement, sourceWidth, sourceHeight, mimeType = "image/jpeg") {
  if (!scanPreviewShell || !scanTargetFrame || !sourceWidth || !sourceHeight) {
    return null;
  }

  const previewRect = scanPreviewShell.getBoundingClientRect();
  const frameRect = scanTargetFrame.getBoundingClientRect();
  if (!previewRect.width || !previewRect.height || !frameRect.width || !frameRect.height) {
    return null;
  }

  const cropRect = calculateCoverCropRect({
    containerWidth: previewRect.width,
    containerHeight: previewRect.height,
    sourceWidth,
    sourceHeight,
    targetLeft: frameRect.left - previewRect.left,
    targetTop: frameRect.top - previewRect.top,
    targetWidth: frameRect.width,
    targetHeight: frameRect.height,
  });

  const canvas = document.createElement("canvas");
  const longestEdge = 1600;
  const scale = Math.min(1, longestEdge / Math.max(cropRect.sourceWidth, cropRect.sourceHeight));
  canvas.width = Math.max(1, Math.round(cropRect.sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(cropRect.sourceHeight * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.drawImage(
    sourceElement,
    cropRect.sourceX,
    cropRect.sourceY,
    cropRect.sourceWidth,
    cropRect.sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const safeMimeType = mimeType === "image/png" ? "image/png" : "image/jpeg";
  return {
    dataUrl: canvas.toDataURL(safeMimeType, safeMimeType === "image/jpeg" ? 0.92 : undefined),
    mimeType: safeMimeType,
  };
}

function calculateCoverCropRect({
  containerWidth,
  containerHeight,
  sourceWidth,
  sourceHeight,
  targetLeft,
  targetTop,
  targetWidth,
  targetHeight,
}) {
  const scale = Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;
  const overflowX = (renderedWidth - containerWidth) / 2;
  const overflowY = (renderedHeight - containerHeight) / 2;

  const sourceX = clamp((targetLeft + overflowX) / scale, 0, sourceWidth - 1);
  const sourceY = clamp((targetTop + overflowY) / scale, 0, sourceHeight - 1);
  const sourceCropWidth = clamp(targetWidth / scale, 1, sourceWidth - sourceX);
  const sourceCropHeight = clamp(targetHeight / scale, 1, sourceHeight - sourceY);

  return {
    sourceX,
    sourceY,
    sourceWidth: sourceCropWidth,
    sourceHeight: sourceCropHeight,
  };
}

async function requestGeminiScanAnalysis() {
  const response = await fetch("/api/scan-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageDataUrl: state.scanImageSrc,
      mimeType: state.scanImageMimeType,
      sourceName: state.scanSourceName,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return null;
  }

  if (!Array.isArray(payload?.ingredients) || !payload.ingredients.length) {
    return null;
  }

  return payload;
}


function getInlineImageFromDataUrl(dataUrl, preferredMimeType) {
  if (!String(dataUrl).startsWith("data:")) {
    return null;
  }

  const [meta, base64Data] = String(dataUrl).split(",");
  if (!meta || !base64Data) {
    return null;
  }

  const mimeMatch = meta.match(/^data:(.*?);base64$/i);
  return {
    mimeType: mimeMatch?.[1] || preferredMimeType || "image/jpeg",
    data: base64Data,
  };
}

function getMimeTypeFromDataUrl(dataUrl) {
  return getInlineImageFromDataUrl(dataUrl, "image/jpeg")?.mimeType || "image/jpeg";
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text || "")
    .join("\n")
    .trim();
}

function parseGeminiScanPayload(rawText) {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    return { ingredients: [], recipeHints: [] };
  }

  try {
    const parsed = JSON.parse(jsonText);
    return {
      ingredients: normalizeDetectedIngredients(parsed.ingredients),
      recipeHints: normalizeRecipeHints(parsed.recipes),
    };
  } catch (error) {
    return { ingredients: [], recipeHints: [] };
  }
}

function extractJsonObject(text) {
  const firstBrace = String(text).indexOf("{");
  const lastBrace = String(text).lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return "";
  }

  return String(text).slice(firstBrace, lastBrace + 1);
}

function normalizeDetectedIngredients(values) {
  const list = Array.isArray(values)
    ? values
    : normalizeList(values);

  return [...new Set(list
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8))];
}

function normalizeRecipeHints(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((entry) => ({
      title: titleCase(entry?.title || entry?.name || ""),
      summary: String(entry?.summary || "").trim(),
    }))
    .filter((entry) => entry.title)
    .slice(0, 3);
}

function buildAiBackedScanSuggestion(hint, detectedIngredients, context, index) {
  const title = titleCase(hint.title || `Recipe ${index + 1}`);
  const leadCategory = inferCategory(`${title} ${detectedIngredients.join(" ")}`);
  const visual = context.imageSrc || getImageForCategory(leadCategory);

  return {
    id: `scan-ai-${slugify(title)}-${index}`,
    title,
    image: visual,
    heroImage: visual,
    summary: hint.summary || `${title} looks possible from the scanned ingredients.`,
    description: hint.summary
      ? `${hint.summary} This suggestion was assembled from the focused scan area.`
      : `${title} is a practical recipe idea built from the ingredients detected in your scan.`,
    ingredients: detectedIngredients.slice(0, 4).map((name, ingredientIndex) => ({
      name,
      quantity: ingredientIndex + 1,
      unit: "portion",
      category: inferCategory(name),
    })),
    steps: [
      "Prep the detected ingredients and group them by cooking time.",
      "Cook the main ingredient first until nearly done.",
      "Add softer ingredients, seasoning and finish the sauce.",
      "Taste, adjust and serve immediately.",
    ],
    youtubeLinks: [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} recipe`)}`],
    extras: buildGenericScanExtras(detectedIngredients, leadCategory),
  };
}

function buildGenericScanExtras(detectedIngredients, leadCategory) {
  const categories = new Set(detectedIngredients.map((item) => inferCategory(item)));
  const extras = [];

  if (!categories.has("pantry")) {
    extras.push(makeExtra("scan-extra-seasoning", "seasoning mix", 1, "pack", "pantry"));
  }
  if (!categories.has("vegetable")) {
    extras.push(makeExtra("scan-extra-greens", "fresh greens", 1, "bundle", "vegetable"));
  }
  if (leadCategory === "fish" && !detectedIngredients.some((item) => hasAny(item, ["rice", "gao", "gạo", "com", "cơm"]))) {
    extras.push(makeExtra("scan-extra-rice", "rice", 1, "bag", "pantry"));
  }

  return extras.slice(0, 2);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function uniqueObjectsByKey(values, key) {
  const seen = new Set();
  return values.filter((value) => {
    const marker = value?.[key];
    if (!marker || seen.has(marker)) {
      return false;
    }
    seen.add(marker);
    return true;
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value) {
  const text = String(value || "").trim();
  return /^https?:\/\//i.test(text) || text.startsWith("./assets/") ? text : "#";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

















