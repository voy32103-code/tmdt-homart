const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
let token = localStorage.getItem("homemart_admin_token") || "";
let categories = [];
let products = [];
let promotions = [];
let orders = [];
let orderFilter = "all";
let logisticsCompanies = [];
let partners = [];
let comments = [];

let chartRevenueByDateInstance = null;
let chartTopProductsInstance = null;
let chartRevenueByCategoryInstance = null;
let chartOrderStatusInstance = null;

async function api(path, options = {}, needsAuth = true) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (needsAuth && token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, { ...options, headers });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
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

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function resetForm(form) {
  form.reset();
  if (form.elements.id) form.elements.id.value = "";
}

function showAdmin(isLoggedIn) {
  document.querySelector("#loginPanel").classList.toggle("hidden", isLoggedIn);
  document.querySelector("#adminApp").classList.toggle("hidden", !isLoggedIn);
  document.querySelector("#logoutButton").classList.toggle("hidden", !isLoggedIn);
}

function fillSelects() {
  const categoryOptions = categories.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  document.querySelector('[name="categoryId"]').innerHTML = categoryOptions;

  const productOptions = products.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  document.querySelectorAll('[name="productId"]').forEach((select) => {
    select.innerHTML = productOptions;
  });

  const logisticsOptions = logisticsCompanies
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("");
  document.querySelector('#partnerForm [name="logisticsCompanyId"]').innerHTML = logisticsOptions;
}

function renderSummary(summary) {
  document.querySelector("#summary").innerHTML = `
    <div><strong>${summary.products}</strong>Sản phẩm</div>
    <div><strong>${summary.categories}</strong>Danh mục</div>
    <div><strong>${summary.activePromotions}</strong>Khuyến mại</div>
    <div><strong>${summary.logisticsCompanies}</strong>Giao nhận</div>
  `;
}

function renderCategories() {
  document.querySelector("#categoryTable").innerHTML = categories.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.slug)}</td>
      <td>${escapeHtml(item.seoTitle || "")}</td>
      <td class="row-actions">
        <button type="button" data-edit-category="${item.id}">Sửa</button>
        <button type="button" class="danger" data-delete-category="${item.id}">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function renderProducts() {
  document.querySelector("#productTable").innerHTML = products.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${escapeHtml(item.sku)}</span></td>
      <td>${escapeHtml(item.categoryName)}</td>
      <td>${money.format(item.finalPrice)}</td>
      <td>${item.stockQuantity}</td>
      <td class="row-actions">
        <button type="button" data-edit-product="${item.id}">Sửa</button>
        <button type="button" class="danger" data-delete-product="${item.id}">Xóa</button>
      </td>
    </tr>
  `).join("");
}

function renderPromotions() {
  document.querySelector("#promotionTable").innerHTML = promotions.map((item) => {
    const product = products.find((entry) => Number(entry.id) === Number(item.productId));
    const value = item.discountType === "percent" ? `${item.discountValue}%` : money.format(item.discountValue);
    const promoStatus = item.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động";
    return `
      <tr>
        <td>${escapeHtml(product ? product.name : "")}</td>
        <td><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${promoStatus}</span></td>
        <td>${value}</td>
        <td>${escapeHtml(item.startsAt)} - ${escapeHtml(item.endsAt)}</td>
        <td class="row-actions">
          <button type="button" data-edit-promotion="${item.id}">Sửa</button>
          <button type="button" class="danger" data-delete-promotion="${item.id}">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderOrders() {
  const statuses = ["pending", "confirmed", "processing", "shipping", "completed", "cancelled"];
  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy"
  };
  const filtered = orders.filter(item => orderFilter === "all" || item.status === orderFilter);
  document.querySelector("#orderTable").innerHTML = filtered.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.orderCode)}</strong><br><span class="muted">${escapeHtml(item.createdAt || "")}</span></td>
      <td>${escapeHtml(item.customerName)}<br><span class="muted">${escapeHtml(item.customerPhone)} - ${escapeHtml(item.customerAddress)}</span></td>
      <td>${escapeHtml(item.logisticsName || "")}</td>
      <td>${money.format(item.grandTotal)}</td>
      <td>
        <select data-order-status="${item.id}">
          ${statuses.map((status) => `<option value="${status}" ${status === item.status ? "selected" : ""}>${statusLabels[status] || status}</option>`).join("")}
        </select>
      </td>
      <td><button type="button" data-save-order="${item.id}">Lưu</button></td>
    </tr>
  `).join("");
}

function renderComments() {
  if (comments.length === 0) {
    document.querySelector("#commentTable").innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-light);">Không có bình luận nào.</td>
      </tr>
    `;
    return;
  }
  document.querySelector("#commentTable").innerHTML = comments.map((item) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString("vi-VN", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
    return `
      <tr>
        <td><strong>${escapeHtml(item.customerName)}</strong></td>
        <td>${escapeHtml(item.productName)}</td>
        <td style="color: var(--accent);">${"★".repeat(item.rating) + "☆".repeat(5 - item.rating)}</td>
        <td>${escapeHtml(item.content)}</td>
        <td class="muted">${escapeHtml(dateStr)}</td>
        <td class="row-actions">
          <button type="button" class="danger" data-delete-comment="${item.id}">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderLogistics() {
  document.querySelector("#logisticsTable").innerHTML = logisticsCompanies.map((item) => {
    const logStatus = item.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động";
    return `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${escapeHtml(item.phone || "")}</span></td>
        <td>${money.format(item.baseFee || 0)}</td>
        <td>${item.rating}</td>
        <td>${logStatus}</td>
        <td class="row-actions">
          <button type="button" data-edit-logistics="${item.id}">Sửa</button>
          <button type="button" class="danger" data-delete-logistics="${item.id}">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderPartners() {
  document.querySelector("#partnerTable").innerHTML = partners.map((item) => {
    const partnerStatus = item.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động";
    return `
      <tr>
        <td>${escapeHtml(item.storeName || `Cửa hàng #${item.storeId}`)}</td>
        <td><strong>${escapeHtml(item.logisticsName)}</strong><br><span class="muted">${partnerStatus}</span></td>
        <td>${money.format(item.baseFee || 0)}<br><span class="muted">${money.format(item.feePerKm || 0)}/km</span></td>
        <td>${escapeHtml(item.serviceArea || "")}</td>
        <td class="row-actions">
          <button type="button" data-edit-partner="${item.id}">Sửa</button>
          <button type="button" class="danger" data-delete-partner="${item.id}">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}

async function refresh() {
  const [summary, categoryData, productData, promotionData, orderData, logisticsData, partnerData, commentsData] = await Promise.all([
    api("/api/summary"),
    api("/api/categories"),
    api("/api/products"),
    api("/api/promotions"),
    api("/api/admin/orders"),
    api("/api/admin/logistics-companies"),
    api("/api/admin/store-logistics-partners"),
    api("/api/admin/comments")
  ]);
  categories = categoryData;
  products = productData;
  promotions = promotionData;
  orders = orderData;
  logisticsCompanies = logisticsData;
  partners = partnerData;
  comments = commentsData;
  renderSummary(summary);
  fillSelects();
  renderCategories();
  renderProducts();
  renderPromotions();
  renderOrders();
  renderComments();
  renderLogistics();
  renderPartners();
  
  await refreshReports();
}

async function refreshReports() {
  const fromDate = document.querySelector("#reportFromDate").value;
  const toDate = document.querySelector("#reportToDate").value;
  
  let queryParams = "";
  if (fromDate || toDate) {
    const params = new URLSearchParams();
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);
    queryParams = "?" + params.toString();
  }

  const [overview, revenueByDate, topProducts, revenueByCategory, orderStatus] = await Promise.all([
    api(`/api/admin/reports/overview${queryParams}`),
    api(`/api/admin/reports/revenue-by-date${queryParams}`),
    api(`/api/admin/reports/top-products${queryParams}`),
    api(`/api/admin/reports/revenue-by-category${queryParams}`),
    api(`/api/admin/reports/order-status-summary${queryParams}`)
  ]);

  document.querySelector("#kpiRevenue").textContent = money.format(overview.totalRevenue || 0);
  document.querySelector("#kpiOrders").textContent = overview.totalOrders || 0;
  document.querySelector("#kpiCompleted").textContent = overview.completedOrders || 0;
  document.querySelector("#kpiCancelled").textContent = overview.cancelledOrders || 0;

  if (chartRevenueByDateInstance) chartRevenueByDateInstance.destroy();
  const ctxRevenue = document.querySelector("#chartRevenueByDate").getContext("2d");
  chartRevenueByDateInstance = new Chart(ctxRevenue, {
    type: "line",
    data: {
      labels: revenueByDate.map(item => item.date),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueByDate.map(item => item.totalRevenue),
          borderColor: "#0284c7",
          backgroundColor: "rgba(2, 132, 199, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value.toLocaleString("vi-VN") + " đ"
          }
        }
      }
    }
  });

  if (chartTopProductsInstance) chartTopProductsInstance.destroy();
  const ctxProducts = document.querySelector("#chartTopProducts").getContext("2d");
  chartTopProductsInstance = new Chart(ctxProducts, {
    type: "bar",
    data: {
      labels: topProducts.map(item => item.name.length > 20 ? item.name.slice(0, 20) + "..." : item.name),
      datasets: [
        {
          label: "Số lượng bán",
          data: topProducts.map(item => item.totalQuantity),
          backgroundColor: "#f59e0b",
          borderColor: "#d97706",
          borderWidth: 1
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });

  if (chartRevenueByCategoryInstance) chartRevenueByCategoryInstance.destroy();
  const ctxCategory = document.querySelector("#chartRevenueByCategory").getContext("2d");
  chartRevenueByCategoryInstance = new Chart(ctxCategory, {
    type: "doughnut",
    data: {
      labels: revenueByCategory.map(item => item.categoryName),
      datasets: [
        {
          data: revenueByCategory.map(item => item.totalRevenue),
          backgroundColor: [
            "#06b6d4",
            "#10b981",
            "#6366f1",
            "#f43f5e",
            "#eab308",
            "#a855f7"
          ]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  if (chartOrderStatusInstance) chartOrderStatusInstance.destroy();
  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy"
  };
  const statusColors = {
    pending: "#eab308",
    confirmed: "#06b6d4",
    processing: "#3b82f6",
    shipping: "#a855f7",
    completed: "#22c55e",
    cancelled: "#ef4444"
  };
  const ctxStatus = document.querySelector("#chartOrderStatus").getContext("2d");
  chartOrderStatusInstance = new Chart(ctxStatus, {
    type: "pie",
    data: {
      labels: orderStatus.map(item => statusLabels[item.status] || item.status),
      datasets: [
        {
          data: orderStatus.map(item => item.count),
          backgroundColor: orderStatus.map(item => statusColors[item.status] || "#94a3b8")
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

document.querySelector("#btnFilterReport").addEventListener("click", async () => {
  try {
    await refreshReports();
  } catch (error) {
    alert("Lỗi khi tải báo cáo: " + error.message);
  }
});


document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData(event.currentTarget))
    }, false);
    token = result.token;
    localStorage.setItem("homemart_admin_token", token);
    showAdmin(true);
    await refresh();
  } catch (error) {
    document.querySelector("#loginMessage").textContent = error.message;
  }
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch { }
  token = "";
  localStorage.removeItem("homemart_admin_token");
  showAdmin(false);
});

document.querySelector("#categoryForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  await api(id ? `/api/categories/${id}` : "/api/categories", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  resetForm(form);
  await refresh();
});

document.querySelector("#productForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  await api(id ? `/api/products/${id}` : "/api/products", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  resetForm(form);
  await refresh();
});

document.querySelector("#priceForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/api/prices", {
    method: "POST",
    body: JSON.stringify(formData(event.currentTarget))
  });
  event.currentTarget.reset();
  await refresh();
});

document.querySelector("#promotionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  await api(id ? `/api/promotions/${id}` : "/api/promotions", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  resetForm(form);
  await refresh();
});

document.querySelector("#logisticsForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  await api(id ? `/api/admin/logistics-companies/${id}` : "/api/admin/logistics-companies", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  resetForm(form);
  await refresh();
});

document.querySelector("#partnerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  await api(id ? `/api/admin/store-logistics-partners/${id}` : "/api/admin/store-logistics-partners", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  resetForm(form);
  await refresh();
});

document.addEventListener("click", async (event) => {
  const categoryId = event.target.dataset.editCategory;
  const deleteCategoryId = event.target.dataset.deleteCategory;
  const productId = event.target.dataset.editProduct;
  const deleteProductId = event.target.dataset.deleteProduct;
  const promotionId = event.target.dataset.editPromotion;
  const deletePromotionId = event.target.dataset.deletePromotion;
  const logisticsId = event.target.dataset.editLogistics;
  const deleteLogisticsId = event.target.dataset.deleteLogistics;
  const partnerId = event.target.dataset.editPartner;
  const deletePartnerId = event.target.dataset.deletePartner;
  const saveOrderId = event.target.dataset.saveOrder;
  const deleteCommentId = event.target.dataset.deleteComment;

  if (categoryId) fillForm("#categoryForm", categories.find((item) => String(item.id) === categoryId));
  if (productId) {
    const product = products.find((item) => String(item.id) === productId);
    fillForm("#productForm", product);
    document.querySelector("#productForm").elements.price.value = product.price;
  }
  if (promotionId) fillForm("#promotionForm", promotions.find((item) => String(item.id) === promotionId));
  if (logisticsId) fillForm("#logisticsForm", logisticsCompanies.find((item) => String(item.id) === logisticsId));
  if (partnerId) fillForm("#partnerForm", partners.find((item) => String(item.id) === partnerId));

  if (deleteCategoryId && confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
    await api(`/api/categories/${deleteCategoryId}`, { method: "DELETE" });
    await refresh();
  }
  if (deleteProductId && confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
    await api(`/api/products/${deleteProductId}`, { method: "DELETE" });
    await refresh();
  }
  if (deletePromotionId && confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mại này không?")) {
    await api(`/api/promotions/${deletePromotionId}`, { method: "DELETE" });
    await refresh();
  }
  if (deleteLogisticsId && confirm("Bạn có chắc chắn muốn xóa công ty giao nhận này không?")) {
    await api(`/api/admin/logistics-companies/${deleteLogisticsId}`, { method: "DELETE" });
    await refresh();
  }
  if (deletePartnerId && confirm("Bạn có chắc chắn muốn xóa đối tác này không?")) {
    await api(`/api/admin/store-logistics-partners/${deletePartnerId}`, { method: "DELETE" });
    await refresh();
  }
  if (saveOrderId) {
    const status = document.querySelector(`[data-order-status="${saveOrderId}"]`).value;
    try {
      await api(`/api/admin/orders/${saveOrderId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      alert("Đã lưu thành công!");
      await refresh();
    } catch (error) {
      alert(error.message);
    }
  }
  if (deleteCommentId && confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
    try {
      await api(`/api/admin/comments/${deleteCommentId}`, { method: "DELETE" });
      alert("Đã xóa bình luận thành công!");
      await refresh();
    } catch (error) {
      alert(error.message);
    }
  }
});

// Event listeners for KPI card filters and status filter dropdown
document.querySelector("#orderFilterSelect")?.addEventListener("change", (e) => {
  orderFilter = e.target.value;
  renderOrders();
});

document.querySelector("#kpiCardOrders")?.addEventListener("click", () => {
  orderFilter = "all";
  const select = document.querySelector("#orderFilterSelect");
  if (select) select.value = "all";
  renderOrders();
  document.querySelector("#orderTable")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#kpiCardCompleted")?.addEventListener("click", () => {
  orderFilter = "completed";
  const select = document.querySelector("#orderFilterSelect");
  if (select) select.value = "completed";
  renderOrders();
  document.querySelector("#orderTable")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#kpiCardCancelled")?.addEventListener("click", () => {
  orderFilter = "cancelled";
  const select = document.querySelector("#orderFilterSelect");
  if (select) select.value = "cancelled";
  renderOrders();
  document.querySelector("#orderTable")?.scrollIntoView({ behavior: "smooth" });
});

function fillForm(selector, data) {
  if (!data) return;
  const form = document.querySelector(selector);
  Object.entries(data).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? "";
  });
}

if (token) {
  showAdmin(true);
  refresh().catch((error) => {
    alert(error.message);
    token = "";
    localStorage.removeItem("homemart_admin_token");
    showAdmin(false);
  });
} else {
  showAdmin(false);
}
