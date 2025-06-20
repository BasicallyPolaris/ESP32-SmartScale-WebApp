// SmartScale WebApp - BLE Communication
class SmartScaleApp {
  constructor() {
    // BLE Service and Characteristics UUIDs (must match ESP32)
    this.SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
    this.WEIGHT_CHAR_UUID = "12345678-1234-1234-1234-123456789abd";
    this.NUTRITION_CHAR_UUID = "12345678-1234-1234-1234-123456789abe";
    this.EVENT_CHAR_UUID = "12345678-1234-1234-1234-123456789abf";
    this.WIFI_CHAR_UUID = "12345678-1234-1234-1234-123456789ac0";

    // BLE variables
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristics = {};

    // App state
    this.isConnected = false;
    this.currentWeight = 0.0;
    this.currentProduct = null;
    this.totalWeight = 0.0;
    this.totalKcal = 0.0;
    this.itemCount = 0;
    this.recentItems = [];
    this.nutritionTotals = {}; // Track accumulated nutrition data

    // DOM elements
    this.elements = {};

    // Initialize the app
    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.updateUI();
    this.checkBLESupport();
  }

  bindElements() {
    // Connection elements
    this.elements.connectBtn = document.getElementById("connectBtn");
    this.elements.statusText = document.getElementById("statusText");
    this.elements.connectionIcon = document.getElementById("connectionIcon");

    // Control buttons
    this.elements.settingsBtn = document.getElementById("settingsBtn");
    this.elements.settingsMenu = document.getElementById("settingsMenu");

    // Weight elements
    this.elements.currentWeight = document.getElementById("currentWeight");
    this.elements.tareBtn = document.getElementById("tareBtn");

    // Product elements
    this.elements.noProduct = document.getElementById("noProduct");
    this.elements.productInfo = document.getElementById("productInfo");
    this.elements.productName = document.getElementById("productName");
    this.elements.currentKcal = document.getElementById("currentKcal");
    this.elements.kcalPer100g = document.getElementById("kcalPer100g");
    this.elements.detailedNutrition =
      document.getElementById("detailedNutrition");

    // Summary elements
    this.elements.totalWeight = document.getElementById("totalWeight");
    this.elements.totalKcal = document.getElementById("totalKcal");
    this.elements.itemCount = document.getElementById("itemCount");
    this.elements.resetBtn = document.getElementById("resetBtn");

    // Recent items
    this.elements.recentItems = document.getElementById("recentItems");

    // Product actions
    this.elements.addProductBtn = document.getElementById("addProductBtn");

    // Nutrition summary modal elements
    this.elements.nutritionModal = document.getElementById("nutritionModal");
    this.elements.nutritionSummaryBtn = document.getElementById(
      "nutritionSummaryBtn"
    );
    this.elements.closeNutritionModal = document.getElementById(
      "closeNutritionModal"
    );
    this.elements.nutritionSummaryContent = document.getElementById(
      "nutritionSummaryContent"
    );

    // WiFi modal elements
    this.elements.wifiModal = document.getElementById("wifiModal");
    this.elements.wifiConfigBtn = document.getElementById("wifiConfigBtn");
    this.elements.closeWifiModal = document.getElementById("closeWifiModal");
    this.elements.wifiForm = document.getElementById("wifiForm");
    this.elements.ssidInput = document.getElementById("ssidInput");
    this.elements.passwordInput = document.getElementById("passwordInput");

    // Notifications
    this.elements.notifications = document.getElementById("notifications");

    // Reset modal elements
    this.elements.resetModal = document.getElementById("resetModal");
    this.elements.closeResetModal = document.getElementById("closeResetModal");
    this.elements.cancelResetBtn = document.getElementById("cancelResetBtn");
    this.elements.confirmResetBtn = document.getElementById("confirmResetBtn");
  }

  bindEvents() {
    // BLE connection
    this.elements.connectBtn.addEventListener("click", () =>
      this.toggleConnection()
    );

    // Settings dropdown
    this.elements.settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSettingsMenu();
    });

    // Close settings menu when clicking outside
    document.addEventListener("click", () => {
      this.hideSettingsMenu();
    });

    this.elements.settingsMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Tare button - send BLE command
    this.elements.tareBtn.addEventListener("click", () => {
      this.sendTareCommand();
    });

    // Reset button - send BLE command
    this.elements.resetBtn.addEventListener("click", () => {
      this.showResetModal();
    });

    // Add Product button - send BLE command
    this.elements.addProductBtn.addEventListener("click", () => {
      this.sendAddProductCommand();
    });

    // Nutrition summary modal
    this.elements.nutritionSummaryBtn.addEventListener("click", () =>
      this.showNutritionModal()
    );
    this.elements.closeNutritionModal.addEventListener("click", () =>
      this.hideNutritionModal()
    );

    // WiFi configuration
    this.elements.wifiConfigBtn.addEventListener("click", () =>
      this.showWiFiModal()
    );
    this.elements.closeWifiModal.addEventListener("click", () =>
      this.hideWiFiModal()
    );
    this.elements.wifiForm.addEventListener("submit", (e) =>
      this.handleWiFiSubmit(e)
    );

    // Add cancel button handler for WiFi modal
    const cancelWifiBtn = document.getElementById("cancelWifiBtn");
    if (cancelWifiBtn) {
      cancelWifiBtn.addEventListener("click", () => this.hideWiFiModal());
    }

    // Modal click outside to close
    this.elements.wifiModal.addEventListener("click", (e) => {
      if (e.target === this.elements.wifiModal) {
        this.hideWiFiModal();
      }
    });

    this.elements.nutritionModal.addEventListener("click", (e) => {
      if (e.target === this.elements.nutritionModal) {
        this.hideNutritionModal();
      }
    });

    // Reset modal
    this.elements.closeResetModal.addEventListener("click", () =>
      this.hideResetModal()
    );
    this.elements.cancelResetBtn.addEventListener("click", () =>
      this.hideResetModal()
    );
    this.elements.confirmResetBtn.addEventListener("click", () =>
      this.sendResetCommand()
    );

    this.elements.resetModal.addEventListener("click", (e) => {
      if (e.target === this.elements.resetModal) {
        this.hideResetModal();
      }
    });
  }

  checkBLESupport() {
    if (!navigator.bluetooth) {
      this.showNotification(
        "Bluetooth is not supported on this device/browser",
        "error"
      );
      this.elements.connectBtn.disabled = true;
      this.elements.statusText.textContent = "BLE Not Supported";
    }
  }

  async toggleConnection() {
    if (this.isConnected) {
      await this.disconnect();
    } else {
      await this.connect();
    }
  }

  async connect() {
    try {
      this.elements.connectBtn.disabled = true;
      this.elements.statusText.textContent = "Connecting...";

      // Request device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "SmartScale" }],
        optionalServices: [this.SERVICE_UUID],
      });

      // Connect to GATT server
      this.server = await this.device.gatt.connect();
      console.log("Connected to GATT server");

      // Get service
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
      console.log("Got SmartScale service");

      // Get characteristics
      this.characteristics.weight = await this.service.getCharacteristic(
        this.WEIGHT_CHAR_UUID
      );
      this.characteristics.nutrition = await this.service.getCharacteristic(
        this.NUTRITION_CHAR_UUID
      );
      this.characteristics.event = await this.service.getCharacteristic(
        this.EVENT_CHAR_UUID
      );
      this.characteristics.wifi = await this.service.getCharacteristic(
        this.WIFI_CHAR_UUID
      );

      // Start notifications
      await this.characteristics.weight.startNotifications();
      await this.characteristics.nutrition.startNotifications();
      await this.characteristics.event.startNotifications();

      // Add event listeners
      this.characteristics.weight.addEventListener(
        "characteristicvaluechanged",
        (e) => this.handleWeightData(e)
      );
      this.characteristics.nutrition.addEventListener(
        "characteristicvaluechanged",
        (e) => this.handleNutritionData(e)
      );
      this.characteristics.event.addEventListener(
        "characteristicvaluechanged",
        (e) => this.handleEventData(e)
      );

      // Handle disconnection
      this.device.addEventListener("gattserverdisconnected", () =>
        this.onDisconnected()
      );

      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.showNotification("Successfully connected to SmartScale!", "success");
    } catch (error) {
      console.error("Connection failed:", error);
      this.showNotification(`Connection failed: ${error.message}`, "error");
      this.updateConnectionStatus(false);
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
  }

  onDisconnected() {
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristics = {};
    this.updateConnectionStatus(false);
    this.showNotification("Disconnected from SmartScale", "warning");
  }

  updateConnectionStatus(connected) {
    this.isConnected = connected;

    const connectBtn = this.elements.connectBtn;
    const iconElement = this.elements.connectionIcon;
    const statusText = this.elements.statusText;

    if (connected) {
      connectBtn.classList.remove("disconnected");
      connectBtn.classList.add("connected");
      connectBtn.disabled = true;
      iconElement.outerHTML = createIcon("link", "icon").replace(
        '<svg class="icon"',
        '<svg id="connectionIcon" class="icon"'
      );
      // Get the new element after replacement
      this.elements.connectionIcon = document.getElementById("connectionIcon");
      statusText.textContent = "Connected";
      this.elements.wifiConfigBtn.disabled = false;
      this.elements.tareBtn.disabled = false;
      this.elements.resetBtn.disabled = false;
      this.elements.nutritionSummaryBtn.disabled = false;
      // Add product button enabled when we have a product
      this.updateAddProductButton();
    } else {
      connectBtn.classList.remove("connected");
      connectBtn.classList.add("disconnected");
      connectBtn.disabled = false;
      iconElement.outerHTML = createIcon("bluetooth", "icon").replace(
        '<svg class="icon"',
        '<svg id="connectionIcon" class="icon"'
      );
      // Get the new element after replacement
      this.elements.connectionIcon = document.getElementById("connectionIcon");
      statusText.textContent = "Connect to Scale";
      this.elements.wifiConfigBtn.disabled = true;
      this.elements.tareBtn.disabled = true;
      this.elements.resetBtn.disabled = true;
      this.elements.nutritionSummaryBtn.disabled = true;
      this.elements.addProductBtn.disabled = true;
    }
  }

  handleWeightData(event) {
    const value = new TextDecoder().decode(event.target.value);
    this.currentWeight = parseFloat(value);
    this.elements.currentWeight.textContent = this.currentWeight.toFixed(1);

    // Update current product kcal if we have product info
    if (this.currentProduct && this.currentProduct.kcal_per_100g) {
      const currentKcal =
        (this.currentWeight / 100.0) * this.currentProduct.kcal_per_100g;
      this.elements.currentKcal.textContent = `${Math.max(
        0,
        currentKcal
      ).toFixed(1)} kcal`;
    }
  }

  handleNutritionData(event) {
    try {
      const value = new TextDecoder().decode(event.target.value);
      const data = JSON.parse(value);

      console.log("Received nutrition data:", data);

      // Only process nutrition data if it contains meaningful information
      // Skip empty or clearing messages when no product is scanned
      if (
        data.name === "" &&
        data.kcal_per_100g === 0 &&
        data.product_found !== false
      ) {
        console.log("Ignoring empty nutrition data (no product scanned)");
        return;
      }

      this.currentProduct = data;
      this.displayProductInfo(data);
    } catch (error) {
      console.error("Error parsing nutrition data:", error);
    }
  }

  handleEventData(event) {
    try {
      const value = new TextDecoder().decode(event.target.value);
      const data = JSON.parse(value);

      console.log("Received event:", data);

      switch (data.event) {
        case "product_scanned":
          this.showNotification("Product scanned successfully!", "success");
          break;

        case "product_added":
          this.handleProductAdded(data);
          this.showNotification("Product added to summary!", "success");
          break;

        case "tare":
          this.showNotification("Scale tared", "info");
          break;

        case "full_reset":
          this.handleFullReset(data);
          this.showNotification("Scale reset complete", "info");
          break;

        case "wifi_config":
          this.handleWiFiConfigStatus(data);
          break;
      }

      // Update summary with data from scale
      if (data.total_weight !== undefined && data.total_kcal !== undefined) {
        this.totalWeight = data.total_weight;
        this.totalKcal = data.total_kcal;
        this.updateSummary();
      }
    } catch (error) {
      console.error("Error parsing event data:", error);
    }
  }

  displayProductInfo(data) {
    // Check if product was found
    if (data.product_found === false || !data.name || data.name === "") {
      this.showProductNotFound(data.name || "Unknown Product");
      this.updateAddProductButton();
      return;
    }

    this.elements.productName.textContent = data.name || "Unknown Product";
    this.elements.kcalPer100g.textContent = `${data.kcal_per_100g || 0} kcal`;
    this.elements.currentKcal.textContent = `${Math.max(
      0,
      data.current_kcal || 0
    ).toFixed(1)} kcal`;

    // Show essential nutrition if available
    if (data.nutrition && data.nutrition !== "{}") {
      this.displayEssentialNutrition(data.nutrition);
      this.elements.detailedNutrition.style.display = "block";
    } else {
      this.elements.detailedNutrition.style.display = "none";
    }

    this.elements.noProduct.style.display = "none";
    this.elements.productInfo.style.display = "block";

    // Update add product button state
    this.updateAddProductButton();
  }

  showProductNotFound(errorType) {
    // Hide normal product info
    this.elements.productInfo.style.display = "none";

    // Show custom not found message with error styling
    let message = "";
    let iconClass = "icon-exclamation-triangle";

    switch (errorType) {
      case "Product Not Found":
        message = "Sorry, this product could not be found in our database.";
        iconClass = "icon-search";
        break;
      case "No WiFi Connection":
        message = "No WiFi connection available. Cannot fetch product data.";
        iconClass = "icon-wifi";
        break;
      case "Network Error":
        message = "Network error occurred while fetching product data.";
        iconClass = "icon-exclamation-triangle";
        break;
      case "Data Error":
        message = "Error processing product data from server.";
        iconClass = "icon-exclamation-triangle";
        break;
      case "No Nutrition Data":
        message = "Product found but nutrition information is not available.";
        iconClass = "icon-info-circle";
        break;
      default:
        message = "Product information could not be retrieved.";
        iconClass = "icon-question-circle";
        break;
    }

    // Add error class to distinguish from initial state
    this.elements.noProduct.className = "no-product error-state";

    // Get the icon name from the class
    const iconName = iconClass.replace("icon-", "");

    this.elements.noProduct.innerHTML = `
      ${createIcon(iconName, "icon")}
      <h3>Product Not Available</h3>
      <p>${message}</p>
      <small>Try scanning another product or check your connection.</small>
    `;
    this.elements.noProduct.style.display = "block";
  }

  clearProductInfo(showScanAnotherMessage = false) {
    // Reset to initial state (not error state)
    this.elements.noProduct.className = "no-product";

    if (showScanAnotherMessage) {
      this.elements.noProduct.innerHTML = `
        ${createIcon("scan-barcode", "icon")}
        <p>Scan another product and add it to your Summary</p>
      `;
    } else {
      this.elements.noProduct.innerHTML = `
        ${createIcon("scan-barcode", "icon")}
        <p>Scan a barcode to see product information</p>
      `;
    }

    this.elements.noProduct.style.display = "block";
    this.elements.productInfo.style.display = "none";
    this.currentProduct = null;
    this.updateAddProductButton();
  }

  displayEssentialNutrition(nutritionString) {
    try {
      const nutrition =
        typeof nutritionString === "string"
          ? JSON.parse(nutritionString)
          : nutritionString;

      let html =
        '<h4>Nutrition Facts (per 100g)</h4><div class="nutrition-facts">';

      // Essential nutrition fields to display
      const nutritionMap = {
        fat_100g: "Total Fat",
        "saturated-fat_100g": "Saturated Fat",
        carbohydrates_100g: "Carbohydrates",
        sugars_100g: "Sugars",
        fiber_100g: "Dietary Fiber",
        proteins_100g: "Protein",
        salt_100g: "Salt",
        sodium_100g: "Sodium",
      };

      let hasNutrition = false;
      for (const [key, label] of Object.entries(nutritionMap)) {
        if (nutrition[key] !== undefined) {
          const value = parseFloat(nutrition[key]).toFixed(1);
          const unit = key.includes("sodium") ? "mg" : "g";
          html += `
            <div class="nutrition-fact">
              <span>${label}:</span>
              <span>${value}${unit}</span>
            </div>
          `;
          hasNutrition = true;
        }
      }

      if (!hasNutrition) {
        html +=
          '<p class="no-nutrition">Detailed nutrition data not available</p>';
      }

      html += "</div>";
      this.elements.detailedNutrition.innerHTML = html;
    } catch (error) {
      console.error("Error parsing nutrition:", error);
      this.elements.detailedNutrition.innerHTML =
        '<p class="nutrition-error">Error loading nutrition data</p>';
    }
  }

  // Keep the old function for backward compatibility
  displayDetailedNutrition(nutritionDataString) {
    this.displayEssentialNutrition(nutritionDataString);
  }

  handleProductAdded(data) {
    // Check if we have a valid current product that was successfully found
    const hasValidProduct =
      this.currentProduct &&
      this.currentProduct.product_found !== false &&
      this.currentProduct.name &&
      this.currentProduct.name !== "";

    if (hasValidProduct) {
      // Calculate current kcal based on weight
      const currentKcal =
        (this.currentWeight / 100.0) * (this.currentProduct.kcal_per_100g || 0);

      // Add to recent items
      const item = {
        name: this.currentProduct.name,
        weight: this.currentWeight,
        kcal: Math.max(0, currentKcal),
        timestamp: new Date(),
        nutrition: this.currentProduct.nutrition, // Store nutrition data
      };

      this.recentItems.unshift(item);
      if (this.recentItems.length > 10) {
        this.recentItems.pop(); // Keep only last 10 items
      }

      // Accumulate nutrition data
      this.accumulateNutritionData(item);

      this.itemCount++;
      this.updateRecentItems();

      console.log(
        `Added item: ${item.name}, ${item.weight}g, ${item.kcal.toFixed(
          1
        )} kcal`
      );

      // Clear current product display with "scan another" message only if we had a valid product
      this.clearProductInfo(true);
    } else {
      console.warn(
        "No current product or product not found when trying to add item. Current product:",
        this.currentProduct
      );
      // Clear current product display with default message if no valid product
      this.clearProductInfo(false);
    }
  }

  handleFullReset(data) {
    this.totalWeight = 0.0;
    this.totalKcal = 0.0;
    this.itemCount = 0;
    this.recentItems = [];
    this.currentProduct = null;
    this.nutritionTotals = {}; // Clear nutrition totals

    this.clearProductInfo(false);
    this.updateSummary();
    this.updateRecentItems();
  }

  handleWiFiConfigStatus(data) {
    const status = data.status;
    const message = data.message;

    switch (status) {
      case "testing":
        this.showNotification(message, "info");
        break;
      case "connecting":
        this.showNotification(message, "info");
        break;
      case "success":
        this.showNotification(message, "success");
        break;
      case "failed":
        this.showNotification(message, "warning");
        break;
      case "error":
        this.showNotification(message, "error");
        break;
      default:
        this.showNotification(`WiFi config update: ${message}`, "info");
    }
  }

  updateSummary() {
    this.elements.totalWeight.textContent = this.totalWeight.toFixed(1);
    this.elements.totalKcal.textContent = this.totalKcal.toFixed(1);
    this.elements.itemCount.textContent = this.itemCount.toString();
  }

  updateRecentItems() {
    const container = this.elements.recentItems;

    if (this.recentItems.length === 0) {
      container.innerHTML = `
        <div class="no-items">
          ${createIcon("history", "icon")}
          <p>No items added yet</p>
        </div>
      `;
      return;
    }

    const itemsHtml = this.recentItems
      .map((item) => {
        const timeStr = item.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
          <div class="recent-item">
            <div class="item-header">
              <div class="item-name">${item.name}</div>
              <div class="item-time">${timeStr}</div>
            </div>
            <div class="item-details">
              <div class="item-weight">${item.weight.toFixed(1)}g</div>
              <div class="item-kcal">${item.kcal.toFixed(1)} kcal</div>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = itemsHtml;
  }

  // Helper function to hide modal with animation
  hideModalWithAnimation(modal, callback = null) {
    modal.classList.add("hiding");
    modal.classList.remove("show");

    setTimeout(() => {
      modal.classList.remove("hiding");
      if (callback) callback();
    }, 300); // Match the CSS transition duration
  }

  // WiFi Configuration
  showWiFiModal() {
    this.elements.wifiModal.classList.add("show");
    this.elements.ssidInput.focus();
  }

  hideWiFiModal() {
    this.hideModalWithAnimation(this.elements.wifiModal, () => {
      this.elements.wifiForm.reset();
    });
  }

  async handleWiFiSubmit(event) {
    event.preventDefault();

    const ssid = this.elements.ssidInput.value.trim();
    const password = this.elements.passwordInput.value;

    if (!ssid) {
      this.showNotification("Please enter a network name", "error");
      return;
    }

    try {
      const wifiConfig = {
        ssid: ssid,
        password: password,
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(wifiConfig));

      await this.characteristics.wifi.writeValue(data);

      this.hideWiFiModal();
      this.showNotification(
        "WiFi configuration sent to SmartScale. Testing connection...",
        "info"
      );
    } catch (error) {
      console.error("Error sending WiFi config:", error);
      this.showNotification(
        `Failed to send WiFi configuration: ${error.message}`,
        "error"
      );
    }
  }

  // Notifications
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const iconName =
      type === "success"
        ? "check-circle"
        : type === "error"
        ? "exclamation-circle"
        : type === "warning"
        ? "exclamation-triangle"
        : "info-circle";

    notification.innerHTML = createIcon(iconName, "icon") + message;

    this.elements.notifications.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Click to dismiss
    notification.addEventListener("click", () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  updateUI() {
    this.updateConnectionStatus(this.isConnected);
    this.updateSummary();
    this.updateRecentItems();
  }

  // BLE Command Functions
  async sendTareCommand() {
    if (!this.isConnected || !this.characteristics.wifi) {
      this.showNotification("Please connect to scale first", "error");
      return;
    }

    try {
      const command = JSON.stringify({ command: "tare" });
      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      await this.characteristics.wifi.writeValue(data);
      this.showNotification("Zeroing the scale...", "success");
    } catch (error) {
      console.error("Error sending tare command:", error);
      this.showNotification("Failed to zero the scale", "error");
    }
  }

  async sendAddProductCommand() {
    if (!this.isConnected || !this.characteristics.wifi) {
      this.showNotification("Please connect to scale first", "error");
      return;
    }

    if (!this.currentProduct) {
      this.showNotification("No product scanned", "warning");
      return;
    }

    try {
      const command = JSON.stringify({ command: "add_product" });
      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      await this.characteristics.wifi.writeValue(data);
      this.showNotification("Adding product to summary...", "success");
    } catch (error) {
      console.error("Error sending add product command:", error);
      this.showNotification("Failed to add product", "error");
    }
  }

  showResetModal() {
    this.elements.resetModal.classList.add("show");
  }

  hideResetModal() {
    this.hideModalWithAnimation(this.elements.resetModal);
  }

  async sendResetCommand() {
    if (!this.isConnected || !this.characteristics.wifi) {
      this.showNotification("Please connect to scale first", "error");
      return;
    }

    try {
      const command = JSON.stringify({ command: "reset_session" });
      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      await this.characteristics.wifi.writeValue(data);
      this.showNotification("Resetting...", "success");
      this.hideResetModal();
    } catch (error) {
      console.error("Error sending reset command:", error);
      this.showNotification("Failed to reset", "error");
    }
  }

  updateAddProductButton() {
    // Only enable if connected, have a product, and product was found successfully
    if (
      this.isConnected &&
      this.currentProduct &&
      this.currentProduct.name &&
      this.currentProduct.product_found !== false
    ) {
      this.elements.addProductBtn.disabled = false;
    } else {
      this.elements.addProductBtn.disabled = true;
    }
  }

  // Nutritional Summary Functions
  accumulateNutritionData(item) {
    if (
      !item.nutrition ||
      (typeof item.nutrition === "string" && item.nutrition === "{}")
    ) {
      return;
    }

    try {
      const nutrition =
        typeof item.nutrition === "string"
          ? JSON.parse(item.nutrition)
          : item.nutrition;

      const weightFactor = item.weight / 100.0; // Convert to per 100g factor

      // List of nutrition keys to track
      const nutritionKeys = [
        "fat_100g",
        "saturated-fat_100g",
        "carbohydrates_100g",
        "sugars_100g",
        "fiber_100g",
        "proteins_100g",
        "salt_100g",
        "sodium_100g",
      ];

      nutritionKeys.forEach((key) => {
        if (nutrition[key] !== undefined) {
          const value = parseFloat(nutrition[key]) * weightFactor;
          if (!isNaN(value)) {
            this.nutritionTotals[key] =
              (this.nutritionTotals[key] || 0) + value;
          }
        }
      });
    } catch (error) {
      console.error("Error accumulating nutrition data:", error);
    }
  }

  showNutritionModal() {
    this.displayNutritionalSummary();
    this.elements.nutritionModal.classList.add("show");
  }

  hideNutritionModal() {
    this.hideModalWithAnimation(this.elements.nutritionModal);
  }

  displayNutritionalSummary() {
    const hasData = Object.keys(this.nutritionTotals).length > 0;

    if (!hasData) {
      this.elements.nutritionSummaryContent.innerHTML = `
        <div class="no-nutrition-data">
          ${createIcon("chart-pie", "icon")}
          <p>No nutritional data available yet. Add some products to see the summary!</p>
        </div>
      `;
      return;
    }

    // Create nutritional summary display
    let html = `
      <div class="nutrition-totals">
        <h4>${createIcon("calculator", "icon")} Total Nutritional Values</h4>
        <div class="totals-grid">
          <div class="total-item">
            <div class="total-value">${this.totalWeight.toFixed(1)}</div>
            <div class="total-label">Total Weight (g)</div>
          </div>
          <div class="total-item">
            <div class="total-value">${this.totalKcal.toFixed(1)}</div>
            <div class="total-label">Total Energy (kcal)</div>
          </div>
          <div class="total-item">
            <div class="total-value">${this.itemCount}</div>
            <div class="total-label">Items Added</div>
          </div>
        </div>
      </div>

      <div class="nutrition-summary-grid">
    `;

    // Organize nutrition data into categories
    const categories = {
      "Energy & Macronutrients": {
        icon: "icon-fire",
        items: {
          fat_100g: "Total Fat",
          "saturated-fat_100g": "Saturated Fat",
          carbohydrates_100g: "Carbohydrates",
          proteins_100g: "Protein",
        },
      },
      "Carbohydrate Details": {
        icon: "icon-cookie-bite",
        items: {
          sugars_100g: "Sugars",
          fiber_100g: "Dietary Fiber",
        },
      },
      "Minerals & Sodium": {
        icon: "icon-cube",
        items: {
          salt_100g: "Salt",
          sodium_100g: "Sodium",
        },
      },
    };

    Object.entries(categories).forEach(([categoryName, category]) => {
      const categoryHasData = Object.keys(category.items).some(
        (key) => this.nutritionTotals[key] !== undefined
      );

      if (categoryHasData) {
        html += `
          <div class="nutrition-category">
            <h4>${createIcon(
              category.icon.replace("icon-", ""),
              "icon"
            )} ${categoryName}</h4>
        `;

        Object.entries(category.items).forEach(([key, label]) => {
          if (this.nutritionTotals[key] !== undefined) {
            const value = this.nutritionTotals[key].toFixed(1);
            const unit = key.includes("sodium") ? "mg" : "g";
            html += `
              <div class="nutrition-summary-item">
                <span class="label">${label}:</span>
                <span class="value">${value}${unit}</span>
              </div>
            `;
          }
        });

        html += "</div>";
      }
    });

    html += "</div>";

    this.elements.nutritionSummaryContent.innerHTML = html;
  }

  // Settings Menu Functions
  toggleSettingsMenu() {
    this.elements.settingsMenu.classList.toggle("show");
  }

  hideSettingsMenu() {
    this.elements.settingsMenu.classList.remove("show");
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.smartScaleApp = new SmartScaleApp();

  // Handle PWA shortcut actions
  handlePWAShortcuts();
});

// Handle PWA shortcut functionality
function handlePWAShortcuts() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");

  if (action === "connect") {
    // Auto-connect when launched from "Connect Scale" shortcut
    setTimeout(() => {
      if (window.smartScaleApp && !window.smartScaleApp.isConnected) {
        console.log("PWA shortcut: Auto-connecting to scale...");
        window.smartScaleApp.toggleConnection();
      }
    }, 1000); // Small delay to ensure app is fully initialized
  }
}

// Service Worker registration for PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
