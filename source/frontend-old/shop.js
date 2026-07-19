const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
let products = [];
let categories = [];
let logisticsCompanies = [];
let cart = JSON.parse(localStorage.getItem("homemart_cart") || "[]");

async function api(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Không thể tải dữ liệu từ hệ thống. Vui lòng thử lại sau.");
  return response.json();
}

async function sendApi(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Không thể xử lý yêu cầu. Vui lòng thử lại sau.");
  return body;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCategories() {
  const select = document.querySelector("#categoryFilter");
  select.innerHTML = '<option value="">Tất cả danh mục</option>' + categories
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("");
}

function renderLogistics() {
  const select = document.querySelector('[name="logisticsCompanyId"]');
  select.innerHTML = logisticsCompanies.map((item) => (
    `<option value="${item.id}">${escapeHtml(item.name)} - ${money.format(item.baseFee || 0)}</option>`
  )).join("");
}

function renderProducts() {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  const categoryId = document.querySelector("#categoryFilter").value;
  const visible = products.filter((product) => {
    const text = `${product.name} ${product.brand} ${product.shortDescription}`.toLowerCase();
    return (!query || text.includes(query)) && (!categoryId || String(product.categoryId) === categoryId);
  });

  document.querySelector("#productGrid").innerHTML = visible.map((product) => {
    const hasDiscount = product.finalPrice < product.price;
    const ratingText = product.commentCount > 0
      ? `<span>★</span> ${product.avgRating} (${product.commentCount} bình luận)`
      : `<span>★</span> Chưa có bình luận`;
    return `
      <article class="product-card" style="display: flex; flex-direction: column;">
        <img src="${escapeHtml(product.imageUrl || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80")}" alt="${escapeHtml(product.name)}">
        <div class="product-card-content" style="flex: 1; display: flex; flex-direction: column;">
          <div class="meta">${escapeHtml(product.categoryName)} &middot; ${escapeHtml(product.storeName)}</div>
          <h2>${escapeHtml(product.name)}</h2>
          <div class="product-rating-badge">${ratingText}</div>
          <p class="muted">${escapeHtml(product.shortDescription || "")}</p>
          <div class="price-row" style="margin-top: auto;">
            <span class="final-price">${money.format(product.finalPrice)}</span>
            ${hasDiscount ? `<span class="old-price">${money.format(product.price)}</span>` : ""}
          </div>
          ${product.promotion ? `<div class="promo-badge">${escapeHtml(product.promotion.name)}</div>` : ""}
          <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line);">
            <button type="button" style="flex: 1;" data-add-cart="${product.id}">Thêm vào giỏ hàng</button>
            <button type="button" style="background: var(--bg); color: var(--muted); border: 1px solid var(--line); padding: 0 12px;" data-view-comments="${product.id}" title="Xem bình luận & đánh giá">Bình luận</button>
          </div>
        </div>
      </article>
    `;
  }).join("") || '<p class="muted">Không tìm thấy sản phẩm phù hợp.</p>';
}

function saveCart() {
  localStorage.setItem("homemart_cart", JSON.stringify(cart));
}

// Cập nhật tổng số tiền giỏ hàng
function updateCartTotals(subtotal) {
  if (!cart.length) {
    document.querySelector("#cartSubtotal").textContent = money.format(0);
    document.querySelector("#cartShipping").textContent = money.format(0);
    document.querySelector("#cartGrandTotal").textContent = money.format(0);
    return;
  }
  if (subtotal === undefined) {
    subtotal = cart.reduce((sum, item) => {
      const product = products.find((entry) => Number(entry.id) === Number(item.productId));
      return product ? sum + product.finalPrice * item.quantity : sum;
    }, 0);
  }
  const logisticsSelect = document.querySelector('[name="logisticsCompanyId"]');
  const logisticsId = Number(logisticsSelect.value);
  const partner = logisticsCompanies.find((item) => Number(item.id) === logisticsId);
  const shipping = partner ? (partner.baseFee || 0) : 0;
  const grandTotal = subtotal + shipping;

  document.querySelector("#cartSubtotal").textContent = money.format(subtotal);
  document.querySelector("#cartShipping").textContent = money.format(shipping);
  document.querySelector("#cartGrandTotal").textContent = money.format(grandTotal);
}

function renderCart() {
  const container = document.querySelector("#cartItems");
  if (!cart.length) {
    container.innerHTML = '<p class="muted">Giỏ hàng hiện đang trống.</p>';
    document.querySelector("#cartSubtotal").textContent = money.format(0);
    document.querySelector("#cartShipping").textContent = money.format(0);
    document.querySelector("#cartGrandTotal").textContent = money.format(0);
    return;
  }
  const rows = cart.map((item) => {
    const product = products.find((entry) => Number(entry.id) === Number(item.productId));
    if (!product) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${escapeHtml(product.name)}</strong>
          <span class="cart-item-price">${money.format(product.finalPrice)}</span>
        </div>
        <div class="cart-item-controls">
          <input type="number" min="1" max="${product.stockQuantity}" value="${item.quantity}" data-cart-qty="${product.id}">
          <button type="button" class="danger" data-remove-cart="${product.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => Number(entry.id) === Number(item.productId));
    return product ? sum + product.finalPrice * item.quantity : sum;
  }, 0);
  container.innerHTML = rows;
  updateCartTotals(subtotal);
}

function addToCart(productId) {
  const product = products.find((p) => Number(p.id) === Number(productId));
  const maxQty = product ? product.stockQuantity : 0;
  if (maxQty <= 0) {
    alert("Sản phẩm hiện đã hết hàng.");
    return;
  }
  const current = cart.find((item) => Number(item.productId) === Number(productId));
  if (current) {
    if (current.quantity >= maxQty) {
      alert(`Không thể thêm sản phẩm. Hiện chỉ còn lại ${maxQty} sản phẩm trong kho.`);
      return;
    }
    current.quantity += 1;
  } else {
    cart.push({ productId: Number(productId), quantity: 1 });
  }
  saveCart();
  renderCart();
}

let activeProductId = null;

function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}
window.closeModal = closeModal;

async function loadComments(productId) {
  activeProductId = productId;
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  document.getElementById("commentsModalTitle").textContent = `Đánh giá & Bình luận: ${product.name}`;
  openModal("commentsModal");
  
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = `<p class="comments-empty">Đang tải bình luận...</p>`;
  
  try {
    const list = await api(`/api/products/${productId}/comments`);
    if (!list.length) {
      commentsList.innerHTML = `<p class="comments-empty">Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>`;
    } else {
      commentsList.innerHTML = list.map(item => {
        const ratingStars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
        const formattedDate = new Date(item.createdAt).toLocaleDateString("vi-VN", {
          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
        return `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-author">${escapeHtml(item.customerName)}</span>
              <span class="comment-date">${escapeHtml(formattedDate)}</span>
            </div>
            <div class="comment-rating">${ratingStars}</div>
            <div class="comment-text">${escapeHtml(item.content)}</div>
          </div>
        `;
      }).join("");
    }
  } catch (error) {
    commentsList.innerHTML = `<p class="comments-empty" style="color: var(--accent);">${escapeHtml(error.message)}</p>`;
  }
}

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Đã giao",
  cancelled: "Đã hủy"
};

async function loadHistory(phone) {
  const resultsContainer = document.getElementById("historyResults");
  resultsContainer.innerHTML = `<p class="comments-empty">Đang tìm kiếm đơn hàng...</p>`;
  
  try {
    const orders = await api(`/api/orders/history?phone=${encodeURIComponent(phone)}`);
    if (!orders.length) {
      resultsContainer.innerHTML = `<p class="comments-empty">Không tìm thấy đơn hàng nào liên kết với số điện thoại này.</p>`;
      return;
    }
    
    resultsContainer.innerHTML = orders.map(order => {
      const itemsHtml = order.items.map(item => `
        <div class="order-history-product-line">
          <span>${escapeHtml(item.productName)} x ${item.quantity}</span>
          <span>${money.format(item.lineTotal)}</span>
        </div>
      `).join("");
      
      const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
      });
      
      const canCancel = order.status === "pending" || order.status === "confirmed";
      const cancelBtnHtml = canCancel
        ? `<button class="cancel-btn" data-cancel-order="${order.id}">Hủy đơn</button>`
        : "";
        
      const statusLabel = statusLabels[order.status] || order.status;
      
      return `
        <div class="order-history-item">
          <div class="order-history-item-header">
            <span class="order-history-code">${escapeHtml(order.orderCode)}</span>
            <span class="status-badge status-${order.status}">${statusLabel}</span>
            <div class="order-history-date">${escapeHtml(formattedDate)}</div>
          </div>
          <div class="order-history-item-body">
            <div class="order-history-products">${itemsHtml}</div>
            <div class="order-history-footer">
              <span class="muted">Phí giao nhận: ${money.format(order.shippingFee)}</span>
              <span class="order-history-total">Tổng thanh toán: ${money.format(order.grandTotal)}</span>
            </div>
            ${cancelBtnHtml ? `<div style="text-align: right; margin-top: 8px;">${cancelBtnHtml}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    resultsContainer.innerHTML = `<p class="comments-empty" style="color: var(--accent);">${escapeHtml(error.message)}</p>`;
  }
}

async function init() {
  [products, categories, logisticsCompanies] = await Promise.all([
    api("/api/products"),
    api("/api/categories"),
    api("/api/logistics-companies")
  ]);
  renderCategories();
  renderLogistics();
  renderProducts();
  renderCart();
  document.querySelector("#searchInput").addEventListener("input", renderProducts);
  document.querySelector("#categoryFilter").addEventListener("change", renderProducts);
  document.querySelector('[name="logisticsCompanyId"]').addEventListener("change", () => updateCartTotals());
  document.addEventListener("click", async (event) => {
    if (event.target.dataset.addCart) addToCart(event.target.dataset.addCart);
    if (event.target.dataset.removeCart) {
      cart = cart.filter((item) => Number(item.productId) !== Number(event.target.dataset.removeCart));
      saveCart();
      renderCart();
    }
    if (event.target.dataset.viewComments) {
      loadComments(Number(event.target.dataset.viewComments));
    }
    if (event.target.dataset.cancelOrder) {
      const orderId = event.target.dataset.cancelOrder;
      if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
      
      event.target.disabled = true;
      event.target.textContent = "Đang hủy...";
      try {
        await sendApi(`/api/orders/${orderId}/cancel`);
        alert("Hủy đơn hàng thành công!");
        
        products = await api("/api/products");
        renderProducts();
        
        const phone = document.getElementById("historyPhoneInput").value.trim();
        if (phone) await loadHistory(phone);
      } catch (error) {
        alert(error.message);
        event.target.disabled = false;
        event.target.textContent = "Hủy đơn";
      }
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.dataset.cartQty) {
      const item = cart.find((entry) => Number(entry.productId) === Number(event.target.dataset.cartQty));
      if (item) {
        const product = products.find((p) => Number(p.id) === Number(item.productId));
        const maxQty = product ? product.stockQuantity : 999;
        let qty = Math.max(1, Number(event.target.value || 1));
        if (qty > maxQty) {
          qty = maxQty;
          event.target.value = maxQty;
          alert(`Số lượng yêu cầu vượt quá tồn kho. Hiện chỉ còn lại ${maxQty} sản phẩm trong kho.`);
        }
        item.quantity = qty;
      }
      saveCart();
      renderCart();
    }
  });
  document.querySelector("#checkoutForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const result = await sendApi("/api/orders", {
      customer: {
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        address: payload.address
      },
      logisticsCompanyId: payload.logisticsCompanyId,
      items: cart
    });
    cart = [];
    saveCart();
    products = await api("/api/products");
    renderProducts();
    renderCart();
    document.querySelector("#checkoutMessage").textContent = `Đặt hàng thành công. Mã đơn hàng của bạn là: ${result.order.orderCode}.`;
    event.currentTarget.reset();
  });

  document.getElementById("viewHistoryLink").addEventListener("click", (event) => {
    event.preventDefault();
    openModal("historyModal");
  });
  document.getElementById("historySearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const phone = document.getElementById("historyPhoneInput").value.trim();
    if (phone) loadHistory(phone);
  });
  document.getElementById("commentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeProductId) return;
    const author = document.getElementById("commentAuthorInput").value.trim();
    const rating = Number(document.getElementById("commentRatingSelect").value);
    const content = document.getElementById("commentContentInput").value.trim();
    
    if (!author || !content) {
      alert("Vui lòng điền đầy đủ họ tên và nội dung bình luận.");
      return;
    }
    
    const submitBtn = event.currentTarget.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";
    
    try {
      await sendApi(`/api/products/${activeProductId}/comments`, {
        customerName: author,
        rating: rating,
        content: content
      });
      document.getElementById("commentAuthorInput").value = "";
      document.getElementById("commentContentInput").value = "";
      document.getElementById("commentRatingSelect").value = "5";
      
      products = await api("/api/products");
      renderProducts();
      await loadComments(activeProductId);
    } catch (error) {
      alert(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi bình luận";
    }
  });
}

init().catch((error) => {
  document.querySelector("#productGrid").innerHTML = `<p>${escapeHtml(error.message)}</p>`;
});
