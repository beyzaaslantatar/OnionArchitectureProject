window.addEventListener("pageshow", function () {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
        window.location.href = "login.html";
    }
});

//Enter your own backend port
const API_BASE_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

//Sayfalama durumu: API'den gelen tüm kayıtlar bellekte tutulur, sayfalama frontendde yapılır
let allProducts = [];
let currentPage = 1;
let pageSize = 15; //varsayılan olarak bir sayfada 15 kayıt ("all" seçilirse tümü)

//İşlem butonlarının ikonları (ekstra ikon kütüphanesi kurmamak için satır içi SVG)
const ICON_EDIT = `<svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>`;
const ICON_DELETE = `<svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`;

//title gibi HTML özniteliklerine güvenli yazmak için
function escapeAttr(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

//onclick içindeki tek tırnaklı JS metinleri bozulmasın diye
function escapeJs(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;")
        .replace(/\r?\n/g, " ");
}

//Sayfa açılır açılmaz productlar ve brandler doldurulsun
document.addEventListener("DOMContentLoaded", () => {
    setupPaginationControls();
    fetchProducts();
    loadBrandsDropdown();
});

//productları yenileme fonksiyonu
async function fetchProducts() {
    const spinner = document.getElementById("loadingSpinner");
    const tableContainer = document.getElementById("tableContainer");
    const errorAlert = document.getElementById("dashboardError");

    try { //backenddeki GetAllProducts apime istek atıyorum
        const response = await fetch(`${API_BASE_URL}/Product/GetAllProducts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const products = await response.json(); //productları json a çeviriyorum

            allProducts = products; //tüm kayıtları saklıyoruz, sayfa değişiminde tekrar istek atmıyoruz
            renderProductTable(); //aktif sayfanın satırlarını ve sayfalama butonlarını basar

            spinner.classList.add("d-none");//loading spinner i gizle
            tableContainer.classList.remove("d-none");//Sayfa ilk açıldığında tablo boş görünmesin diye gizlidir. veriler geldikten sonra kaldırılır

        } else if (response.status === 401) {
            alert("Your session has ended, please log in again.");
            localStorage.clear();
            window.location.href = "login.html";
        } else {
            throw new Error("An error occurred while uploading the products.");
        }

    } catch (error) {
        spinner.classList.add("d-none");
        errorAlert.textContent = error.message || "Server connection error!";
        errorAlert.classList.remove("d-none");
    }
}

//Sadece aktif sayfaya düşen kayıtları tabloya basar
function renderProductTable() {
    const tableBody = document.getElementById("productTableBody");

    const totalItems = allProducts.length;
    //"Tümü" seçilirse tek sayfada bütün kayıtlar gösterilir
    const perPage = pageSize === "all" ? Math.max(totalItems, 1) : pageSize;
    const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);

    //Kayıt silindiğinde son sayfa boş kalabilir, o yüzden sayfa numarasını sınırlıyoruz
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * perPage;
    const pageProducts = allProducts.slice(startIndex, startIndex + perPage);

    tableBody.innerHTML = "";

    if (pageProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No products found.</td></tr>`;
    }

    pageProducts.forEach(product => {
        const id = product.id || product.Id || "0";
        const brandText = product.brand && product.brand.name ? product.brand.name : "No Brand";
        const brandId = product.brandId || (product.brand ? product.brand.id : 1);

        const title = product.title || "";
        const description = product.description || "";

        const row = `
            <tr>
                <td><span class="cell-ellipsis" title="${escapeAttr(title)}">${title}</span></td>
                <td><span class="badge bg-secondary cell-ellipsis">${brandText}</span></td>
                <td><span class="text-muted small cell-ellipsis" title="${escapeAttr(description)}">${description}</span></td>
                <td class="fw-bold text-primary text-nowrap">${product.price} TL</td>
                <td><span class="badge bg-danger">%${product.discount}</span></td>
                <td>
                    <div class="d-flex flex-nowrap justify-content-center gap-2">
                        <button type="button" class="btn-action btn-edit" title="Update product"
                            onclick="openUpdateModal(${id}, '${escapeJs(title)}', '${escapeJs(description)}', ${product.price}, ${product.discount || 0}, ${brandId})">
                            ${ICON_EDIT} Update
                        </button>
                        <button type="button" class="btn-action btn-delete" title="Delete product"
                            onclick="deleteProduct(${id}, '${escapeJs(title)}')">
                            ${ICON_DELETE} Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
        //hazırladığımız tablo içeriğini(row) tableBody yani tablonun satırlarına ekliyoruz
        tableBody.insertAdjacentHTML("beforeend", row); //
    });

    renderPaginationControls(totalItems, totalPages, startIndex, pageProducts.length);
}

//Sağ taraftaki 1, 2, 3... sayfa butonlarını ve soldaki kayıt bilgisini üretir
function renderPaginationControls(totalItems, totalPages, startIndex, shownCount) {
    const footer = document.getElementById("paginationFooter");
    const list = document.getElementById("paginationList");
    const info = document.getElementById("paginationInfo");

    footer.classList.remove("d-none");
    footer.classList.add("d-flex");

    info.textContent = totalItems === 0
        ? "0 kayıt"
        : `${startIndex + 1}-${startIndex + shownCount} / ${totalItems} kayıt`;

    list.innerHTML = "";

    //Tek sayfa varsa numaralara gerek yok
    if (totalPages <= 1) return;

    const addPageItem = (label, page, isDisabled, isActive) => {
        list.insertAdjacentHTML("beforeend", `
            <li class="page-item ${isDisabled ? "disabled" : ""} ${isActive ? "active" : ""}">
                <a class="page-link" href="#" data-page="${page}">${label}</a>
            </li>
        `);
    };

    addPageItem("&laquo;", currentPage - 1, currentPage === 1, false);

    //Sayfa sayısı çok olursa aktif sayfanın etrafındaki en fazla 5 numarayı gösteriyoruz
    const maxButtons = 5;
    let endPage = Math.min(totalPages, currentPage + Math.floor(maxButtons / 2));
    let startPage = Math.max(1, endPage - maxButtons + 1);
    endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let page = startPage; page <= endPage; page++) {
        addPageItem(page, page, false, page === currentPage);
    }

    addPageItem("&raquo;", currentPage + 1, currentPage === totalPages, false);
}

//Sayfalama butonlarının tıklama olayları (bir kez bağlanır)
function setupPaginationControls() {
    document.getElementById("pageSizeGroup").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-size]");
        if (!button) return;

        const selected = button.dataset.size;
        pageSize = selected === "all" ? "all" : parseInt(selected);
        currentPage = 1; //kayıt sayısı değişince baştan başlıyoruz

        //Seçili butonu işaretle
        document.querySelectorAll("#pageSizeGroup button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        renderProductTable();
    });

    document.getElementById("paginationList").addEventListener("click", (event) => {
        event.preventDefault();

        const link = event.target.closest("a[data-page]");
        if (!link || link.closest(".page-item").classList.contains("disabled")) return;

        currentPage = parseInt(link.dataset.page);
        renderProductTable();
    });
}

async function deleteProduct(productId, productTitle) {
    if (!confirm(`Are you sure you want to delete "${productTitle}" ?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Product/DeleteProduct`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id: productId })
        });

        if (response.ok) {
            fetchProducts();
        } else if (response.status === 401) {
            alert("Your session has ended, please log in again.");
            localStorage.clear();
            window.location.href = "login.html";
        } else {
            alert("An error occurred while deleting the product.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Couldn't connect to server.");
    }
}


document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        const userEmail = localStorage.getItem("userEmail") || ""; 

        const response = await fetch(`${API_BASE_URL}/Auth/Revoke`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: userEmail })
        });

        if (response.ok) {
            console.log("RefreshToken successfully reset.");
        } else {
            console.warn("Revoke didn't work but you will get logged out .");
        }
    } catch (error) {
        console.error("Revoke API connection error:", error);
    } finally {
        // API isteği başarılı olsa da olmasa da güvenlik için kullanıcının local verilerini silip yönlendiriyorum
        localStorage.clear();
        window.location.href = "login.html";
    }
});


function openUpdateModal(id, title, description, price, discount, brandId) {
    document.getElementById("updateProductId").value = id;
    document.getElementById("updateTitle").value = title;
    document.getElementById("updateDescription").value = description;
    document.getElementById("updatePrice").value = price;
    document.getElementById("updateDiscount").value = discount;

    // ELEMANI GÜVENLİ ŞEKİLDE BULUP DEĞER ATIYORUZ:
    const brandElement = document.getElementById("updateBrandId");
    if (brandElement) {
        brandElement.value = brandId || 1;
    } else {
        console.warn("updateBrandId id'li HTML elemanı bulunamadı!");
    }

    const updateModal = new bootstrap.Modal(document.getElementById('updateProductModal'));
    updateModal.show();
}


async function saveProductUpdate() {
    const id = document.getElementById("updateProductId").value;
    const title = document.getElementById("updateTitle").value;
    const description = document.getElementById("updateDescription").value;
    const price = parseFloat(document.getElementById("updatePrice").value);
    const discount = parseFloat(document.getElementById("updateDiscount").value);
    const brandId = parseInt(document.getElementById("updateBrandId").value);

    const updateData = {
        id: parseInt(id),
        title: title,
        description: description,
        brandId: brandId,
        price: price,
        discount: discount,
        categoryIds: [1] // Şimdilik varsayılan 1 ID'li kategoriyi yolluyoruz (Backend diziyi null almasın diye)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/Product/UpdateProduct`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const modalElement = document.getElementById('updateProductModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            fetchProducts();
        } else {
            alert("An error occurred while updating the product.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Couldn't connect to the server.");
    }
}

async function saveNewProduct() {
    const title = document.getElementById("addTitle").value.trim();
    const description = document.getElementById("addDescription").value.trim();
    const brandId = parseInt(document.getElementById("brandSelect").value);
    const price = parseFloat(document.getElementById("addPrice").value);
    const discount = parseFloat(document.getElementById("addDiscount").value) || 0;

    if (!title || isNaN(price)) {
        alert("Please enter the product name and price completely.");
        return;
    }

    const newProductData = {
        title: title,
        description: description,
        brandId: brandId || 1,
        price: price,
        discount: discount,
        categoryIds: [1]
    };

    try {
        const response = await fetch(`${API_BASE_URL}/Product/CreateProduct`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProductData)
        });

        if (response.ok) {
            document.getElementById("addProductForm").reset();

            const modalElement = document.getElementById('addProductModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            fetchProducts();
        } else {
            alert("An error occurred while adding new product.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Couldn't connect to the server.");
    }
}

async function loadBrandsDropdown() {
    const addBrandSelect = document.getElementById('brandSelect');
    const updateBrandSelect = document.getElementById('updateBrandId');

    console.log("1. Elemanlar bulundu mu?:", { addBrandSelect, updateBrandSelect });

    try {
        console.log("2. API'ye istek atılıyor...");
        const response = await fetch(`${API_BASE_URL}/Brand/GetAllBrands`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("3. API Yanıt Durumu (Status):", response.status);

        if (response.ok) {
            const brands = await response.json();
            console.log("4. Gelen Veri:", brands);
            
            // Doldurulacak HTML seçenekleri
            let optionsHtml = '<option value="">Select Brand...</option>';
            brands.forEach(brand => {
                optionsHtml += `<option value="${brand.id}">${brand.name}</option>`;
            });

            console.log("5. Oluşturulan HTML:", optionsHtml);

            // İki dropdown da HTML'de varsa içlerini dolduruyoruz
            if (addBrandSelect) addBrandSelect.innerHTML = optionsHtml;

            console.log("6. addBrandSelect içine yazıldı!");
            if (updateBrandSelect) updateBrandSelect.innerHTML = optionsHtml;

            console.log("7. updateBrandSelect içine yazıldı!");
        }
    } catch (error) {
        console.error('Markalar çekilemedi:', error);
    }
}