import { initialData } from './data.js';

class SalaryManager {
    constructor() {
        this.salary = 46000;
        this.extraIncome = parseFloat(localStorage.getItem('salary_extra')) || 0;
        this.savings = parseFloat(localStorage.getItem('salary_savings')) || 0;
        this.cart = JSON.parse(localStorage.getItem('salary_cart')) || [];
        this.customItems = JSON.parse(localStorage.getItem('salary_custom')) || [];
        this.inventory = [...initialData];
        
        this.isAuthenticated = sessionStorage.getItem('salary_auth') === 'true';
        this.currentView = 'inventory';
        this.activeItemName = null;
        this.activeCartItemId = null;
        this.activeCategory = null;
        this.activeWeek = 1;
        this.editingCustomItemOriginalName = null;

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.populateCategoryList();
        
        if (!this.isAuthenticated) {
            this.showAuthModal();
        } else {
            this.hideAuthModal();
        }
        
        this.render();
    }

    populateCategoryList() {
        this.newItemCategory.innerHTML = this.inventory.map(cat => 
            `<option value="${cat.category}">${cat.category}</option>`
        ).join('') + `<option value="إضافات مخصصة">إضافات مخصصة</option>`;
    }

    cacheDOM() {
        this.totalBudgetEl = document.getElementById('total-budget');
        this.totalSpentEl = document.getElementById('total-spent');
        this.balanceEl = document.getElementById('balance');
        this.balanceCard = document.getElementById('balance-card');
        this.balanceProgress = document.getElementById('balance-progress');
        this.balancePercent = document.getElementById('balance-percent');
        this.cartCountEl = document.getElementById('cart-count');
        this.categoriesContainer = document.getElementById('categories-container');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.emptyCartMsg = document.getElementById('empty-cart-msg');
        this.cartFooterSummary = document.getElementById('cart-footer-summary');
        this.footerTotalPrice = document.getElementById('footer-total-price');
        this.closeCartBtn = document.getElementById('close-cart');
        this.cartFooterClose = document.getElementById('cart-footer-close');
        
        this.closeInventoryBtn = document.getElementById('close-inventory');
        this.viewCartFromStoreBtn = document.getElementById('view-cart-from-store');
        this.storeCartCountEl = document.getElementById('store-cart-count');
        
        this.tabInventory = document.getElementById('tab-inventory');
        this.tabCart = document.getElementById('tab-cart');
        this.viewInventory = document.getElementById('view-inventory');
        this.viewCart = document.getElementById('view-cart');
        
        this.priceModal = document.getElementById('price-modal');
        this.modalItemName = document.getElementById('modal-item-name');
        this.modalItemNameDisplay = document.getElementById('modal-item-name-display');
        this.modalItemPrice = document.getElementById('modal-item-price');
        this.weekSelectors = document.querySelectorAll('.week-selector');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.modalCancel = document.getElementById('modal-cancel');

        this.newItemModal = document.getElementById('new-item-modal');
        this.newItemName = document.getElementById('new-item-name');
        this.newItemCategory = document.getElementById('new-item-category');
        this.newItemPrice = document.getElementById('new-item-price');
        this.newItemConfirm = document.getElementById('new-item-confirm');
        this.newItemCancel = document.getElementById('new-item-cancel');
        this.addCustomTrigger = document.getElementById('add-custom-trigger-header');

        this.incomeModal = document.getElementById('income-modal');
        this.incomeTrigger = document.getElementById('income-trigger');
        this.extraIncomeInput = document.getElementById('extra-income-input');
        this.incomeCancel = document.getElementById('income-cancel');
        this.incomeConfirm = document.getElementById('income-confirm');

        this.searchInput = document.getElementById('search-input');
        this.resetBtn = document.getElementById('reset-btn');
        this.endMonthBtn = document.getElementById('end-month-btn');
        
        this.confirmModal = document.getElementById('confirm-modal');
        this.confirmModalMessage = document.getElementById('confirm-modal-message');
        this.confirmModalOk = document.getElementById('confirm-modal-ok');
        this.confirmModalCancel = document.getElementById('confirm-modal-cancel');

        this.receiptModal = document.getElementById('receipt-modal');
        this.receiptWeeksContainer = document.getElementById('receipt-weeks-container');
        this.receiptDate = document.getElementById('receipt-date');
        this.receiptTotalBudget = document.getElementById('receipt-total-budget');
        this.receiptTotalSpent = document.getElementById('receipt-total-spent');
        this.receiptTotalBalance = document.getElementById('receipt-total-balance');
        this.printReceiptBtn = document.getElementById('print-receipt-btn');
        this.closeReceiptBtn = document.getElementById('close-receipt-btn');
        this.printNowBtn = document.getElementById('print-now-btn');

        this.authModal = document.getElementById('auth-modal');
        this.authUsername = document.getElementById('auth-username');
        this.authPassword = document.getElementById('auth-password');
        this.authSubmit = document.getElementById('auth-submit');
        this.authError = document.getElementById('auth-error');
        this.mainAppContainer = document.getElementById('main-app-container');

        this.totalSavingsEl = document.getElementById('total-savings');
        this.savingsCard = document.getElementById('savings-card');
        this.logoutBtn = document.getElementById('logout-btn');
        this.savingsToggleIcon = document.getElementById('savings-toggle-icon');
        this.savingsHidden = true;
    }

    bindEvents() {
        this.closeCartBtn.onclick = () => this.switchView('inventory');
        this.cartFooterClose.onclick = () => this.switchView('inventory');

        this.closeInventoryBtn.onclick = () => this.switchView('home');
        this.viewCartFromStoreBtn.onclick = () => this.switchView('cart');

        this.savingsCard.onclick = () => {
            this.savingsHidden = !this.savingsHidden;
            this.updateSavingsVisibility();
        };

        this.tabInventory.onclick = () => this.switchView('inventory');
        this.tabCart.onclick = () => this.switchView('cart');
        
        this.modalCancel.onclick = () => this.closeModal();
        this.modalConfirm.onclick = () => this.addItemToCart();
        
        this.weekSelectors.forEach(btn => {
            btn.onclick = () => {
                this.activeWeek = parseInt(btn.dataset.week);
                this.updateWeekSelectorUI();
            };
        });

        this.addCustomTrigger.onclick = () => {
            this.editingCustomItemOriginalName = null;
            document.getElementById('new-item-modal-title').innerText = 'إضافة مادة جديدة';
            this.newItemName.value = '';
            this.newItemPrice.value = '';
            this.newItemModal.style.display = 'flex';
        };
        this.newItemCancel.onclick = () => this.newItemModal.style.display = 'none';
        this.newItemConfirm.onclick = () => this.handleAddNewItem();

        this.incomeTrigger.onclick = () => {
            this.extraIncomeInput.value = this.extraIncome;
            this.incomeModal.style.display = 'flex';
        };
        this.incomeCancel.onclick = () => this.incomeModal.style.display = 'none';
        this.incomeConfirm.onclick = () => {
            this.extraIncome = parseFloat(this.extraIncomeInput.value) || 0;
            this.save();
            this.updateStats();
            this.incomeModal.style.display = 'none';
        };

        this.searchInput.oninput = (e) => this.renderInventory(e.target.value);

        this.authSubmit.onclick = () => this.handleAuth();
        this.authPassword.onkeydown = (e) => { if(e.key === 'Enter') this.handleAuth(); };
        
        this.resetBtn.onclick = () => {
            this.showConfirmModal('هل تريد مسح كل المشتريات والمدخرات والبدء من جديد تماماً؟', () => {
                this.cart = [];
                this.customItems = [];
                this.extraIncome = 0;
                this.savings = 0;
                this.save();
                this.render();
            });
        };

        this.logoutBtn.onclick = () => {
            this.showConfirmModal('هل أنت متأكد من رغبتك في تسجيل الخروج؟', () => {
                this.isAuthenticated = false;
                sessionStorage.removeItem('salary_auth');
                this.showAuthModal();
                this.authUsername.value = '';
                this.authPassword.value = '';
                this.switchView('home');
            });
        };

        this.printReceiptBtn.onclick = () => this.openReceipt();
        this.closeReceiptBtn.onclick = () => this.receiptModal.style.display = 'none';
        this.printNowBtn.onclick = () => window.print();

        this.endMonthBtn.onclick = () => {
            const totalBudget = this.salary + this.extraIncome;
            const spent = this.cart.reduce((sum, item) => sum + item.price, 0);
            const balance = totalBudget - spent;
            
            const message = balance >= 0 
                ? `نهاية الشهر! سيتم ترحيل مبلغ ${balance.toLocaleString()} دج إلى خزينة المدخرات وتصفير السلة.`
                : `نهاية الشهر! يوجد عجز قدره ${Math.abs(balance).toLocaleString()} دج سيتم خصمه من رصيدك العام.`;

            this.showConfirmModal(message, () => {
                this.savings += balance;
                this.cart = [];
                this.extraIncome = 0;
                this.save();
                this.render();
            });
        };

        // Close modal on escape
        window.onkeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.newItemModal.style.display = 'none';
                this.incomeModal.style.display = 'none';
            }
        };
    }

    showAuthModal() {
        this.authModal.classList.remove('hidden');
        this.mainAppContainer.classList.add('app-blurred');
    }

    hideAuthModal() {
        this.authModal.classList.add('hidden');
        this.mainAppContainer.classList.remove('app-blurred');
    }

    handleAuth() {
        const user = this.authUsername.value;
        const pass = this.authPassword.value;

        if (user === 'admin' && pass === 'cea12#') {
            this.isAuthenticated = true;
            sessionStorage.setItem('salary_auth', 'true');
            this.hideAuthModal();
            this.authError.classList.add('hidden');
        } else {
            this.authError.classList.remove('hidden');
            this.authModal.classList.add('animate-shake');
            setTimeout(() => this.authModal.classList.remove('animate-shake'), 500);
        }
    }

    switchView(view) {
        this.currentView = view;
        
        if (view === 'inventory') {
            this.viewInventory.classList.add('open');
            this.viewCart.classList.remove('open');
            this.tabInventory.classList.add('tab-active', 'active');
            this.tabCart.classList.remove('tab-active', 'active');
            this.renderInventory(this.searchInput.value);
        } else if (view === 'cart') {
            this.viewCart.classList.add('open');
            this.viewInventory.classList.remove('open');
            this.tabCart.classList.add('tab-active', 'active');
            this.tabInventory.classList.remove('tab-active', 'active');
            this.renderCart();
        } else {
            this.viewInventory.classList.remove('open');
            this.viewCart.classList.remove('open');
            this.tabInventory.classList.remove('tab-active', 'active');
            this.tabCart.classList.remove('tab-active', 'active');
        }
    }

    render() {
        this.renderInventory();
        this.renderCart();
        this.updateStats();
    }

    updateSavingsVisibility() {
        if (this.savingsHidden) {
            this.totalSavingsEl.classList.add('blur-md', 'select-none');
            this.savingsToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>`;
            this.savingsToggleIcon.className = 'text-slate-300';
        } else {
            this.totalSavingsEl.classList.remove('blur-md', 'select-none');
            this.savingsToggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
            this.savingsToggleIcon.className = 'text-amber-500';
        }
    }

    updateStats() {
        const totalBudget = this.salary + this.extraIncome;
        const spent = this.cart.reduce((sum, item) => sum + item.price, 0);
        const balance = totalBudget - spent;
        const percentage = totalBudget > 0 ? Math.max(0, Math.min(100, (balance / totalBudget) * 100)) : 0;
        
        this.totalBudgetEl.innerText = totalBudget.toLocaleString();
        this.totalSpentEl.innerText = spent.toLocaleString() + ' دج';
        this.balanceEl.innerText = balance.toLocaleString();
        this.cartCountEl.innerText = this.cart.length;
        if (this.storeCartCountEl) this.storeCartCountEl.innerText = this.cart.length;
        this.balancePercent.innerText = Math.round(percentage) + '%';
        this.balanceProgress.style.width = percentage + '%';

        if (this.savings !== 0) {
            this.savingsCard.classList.remove('hidden');
            this.savingsCard.classList.add('flex');
            this.totalSavingsEl.innerText = this.savings.toLocaleString();
            this.updateSavingsVisibility();
        } else {
            this.savingsCard.classList.add('hidden');
            this.savingsCard.classList.remove('flex');
        }

        // Reset classes
        this.balanceCard.className = 'p-4 rounded-2xl shadow-lg transition-all duration-500 border border-white/20 flex flex-col justify-between relative overflow-hidden group';
        
        if (balance < 0) {
            this.balanceCard.classList.add('bg-rose-600', 'balance-critical');
        } else if (percentage < 20) {
            this.balanceCard.classList.add('bg-rose-500', 'balance-critical');
        } else if (percentage < 50) {
            this.balanceCard.classList.add('bg-amber-500', 'balance-warning');
        } else {
            this.balanceCard.classList.add('bg-emerald-500');
        }
    }

    renderInventory(searchQuery = '') {
        this.categoriesContainer.innerHTML = '';
        
        // Initial Active Tab State (First run)
        if (!this.tabInventory.classList.contains('active') && !this.tabCart.classList.contains('active')) {
            this.tabInventory.classList.add('tab-active', 'active');
        }
        
        const allData = this.inventory.map(cat => ({
            category: cat.category,
            items: [...cat.items]
        }));

        this.customItems.forEach(custom => {
            const name = typeof custom === 'object' ? custom.name : custom;
            const targetCat = typeof custom === 'object' ? custom.category : "إضافات مخصصة";
            
            let catObj = allData.find(c => c.category === targetCat);
            if (!catObj) {
                catObj = { category: targetCat, items: [] };
                allData.push(catObj);
            }
            if (!catObj.items.includes(name)) {
                catObj.items.push(name);
            }
        });

        allData.forEach((cat, idx) => {
            const filteredItems = cat.items.filter(item => 
                item.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return;

            const catDiv = document.createElement('div');
            catDiv.className = 'category-card bg-white p-5 mb-5 animate-scale-in';
            catDiv.style.animationDelay = `${idx * 0.05}s`;
            catDiv.innerHTML = `<h2 class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 border-r-4 border-indigo-500 pr-3">${cat.category}</h2>`;
            
            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'flex flex-wrap gap-2.5';
            
            filteredItems.forEach(item => {
                const isInCart = this.cart.some(c => c.name === item);
                const isCustom = this.customItems.some(ci => (typeof ci === 'object' ? ci.name : ci) === item);
                
                const chipContainer = document.createElement('div');
                chipContainer.className = 'relative group/chip';

                const btn = document.createElement('button');
                btn.className = `item-chip px-4 py-3 rounded-2xl border text-sm ${isInCart ? 'selected font-black' : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-white hover:border-indigo-100'}`;
                btn.innerText = item;
                btn.onclick = () => this.openPriceModal(item, null, cat.category);
                
                chipContainer.appendChild(btn);

                if (isCustom) {
                    const editBtn = document.createElement('button');
                    editBtn.className = 'absolute -top-1.5 -left-1.5 bg-white border border-slate-200 rounded-full p-1.5 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors';
                    editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.openEditCustomItemModal(item);
                    };
                    chipContainer.appendChild(editBtn);
                }

                itemsGrid.appendChild(chipContainer);
            });

            catDiv.appendChild(itemsGrid);
            this.categoriesContainer.appendChild(catDiv);
        });
    }

    renderCart() {
        this.cartItemsContainer.innerHTML = '';
        const totalSpent = this.cart.reduce((sum, item) => sum + item.price, 0);

        if (this.cart.length === 0) {
            this.emptyCartMsg.style.display = 'block';
            this.cartFooterSummary.classList.add('hidden');
            return;
        }
        this.emptyCartMsg.style.display = 'none';
        this.cartFooterSummary.classList.remove('hidden');
        this.footerTotalPrice.innerText = totalSpent.toLocaleString();

        // Monthly Total Summary Card
        const summaryCard = document.createElement('div');
        summaryCard.className = 'bg-indigo-600 text-white p-5 rounded-2xl sm:rounded-[2rem] shadow-lg mb-6 mx-1 sm:mx-2 flex justify-between items-center overflow-hidden relative group animate-scale-in';
        summaryCard.innerHTML = `
            <div class="relative z-10">
                <p class="text-[10px] opacity-80 font-bold uppercase tracking-widest mb-1">إجمالي مصاريف الشهر</p>
                <div class="flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black">${totalSpent.toLocaleString()}</span>
                    <span class="text-xs opacity-80">دج</span>
                </div>
            </div>
            <div class="bg-white/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/><path d="M16 8h-6a2 2 0 1 0 0 4"/></svg>
            </div>
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
        `;
        this.cartItemsContainer.appendChild(summaryCard);

        const weeks = [1, 2, 3, 4];
        weeks.forEach((weekNum, idx) => {
            const weekItems = this.cart.filter(item => (item.week || 1) === weekNum);
            
            const weekHeader = document.createElement('div');
            weekHeader.className = 'pt-6 pb-3 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-10';
            const weekTotal = weekItems.reduce((sum, i) => sum + i.price, 0);
            weekHeader.innerHTML = `
                <div class="flex justify-between items-center px-2">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-200">${weekNum}</div>
                        <h3 class="font-black text-slate-800 text-sm">مشتريات الأسبوع</h3>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-[11px] font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">${weekTotal.toLocaleString()} دج</span>
                    </div>
                </div>
            `;
            this.cartItemsContainer.appendChild(weekHeader);

            if (weekItems.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'text-[10px] text-slate-400 bg-slate-100/50 rounded-2xl py-6 text-center mx-2 border-2 border-dashed border-slate-200';
                empty.innerText = 'القائمة فارغة لهذا الأسبوع';
                this.cartItemsContainer.appendChild(empty);
            }

            weekItems.forEach((item, itemIdx) => {
                const div = document.createElement('div');
                div.className = 'group/item bg-white p-4 rounded-3xl shadow-sm hover:shadow-md border border-slate-100 flex justify-between items-center mb-3 mx-2 transition-all animate-scale-in';
                div.style.animationDelay = `${(idx * 0.1) + (itemIdx * 0.05)}s`;
                
                const categoryTag = item.category ? `<span class="category-badge bg-slate-100 text-slate-500 mb-1 inline-block">${item.category}</span>` : '';
                
                div.innerHTML = `
                    <div class="flex items-center gap-4 flex-1 cursor-pointer item-clickable-area">
                        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </div>
                        <div>
                            ${categoryTag}
                            <p class="font-black text-sm text-slate-700 mb-0.5">${item.name}</p>
                            <div class="flex items-center gap-2">
                                <span class="text-indigo-600 font-black text-sm">${item.price.toLocaleString()} <span class="text-[10px] opacity-60">دج</span></span>
                                <span class="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span class="text-[10px] font-bold text-slate-400">الأسبوع ${item.week || 1}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="edit-btn bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button class="delete-btn bg-slate-50 text-slate-400 p-3 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                `;
                
                div.querySelector('.delete-btn').onclick = (e) => {
                    e.stopPropagation();
                    this.showConfirmModal(`هل تريد حذف "${item.name}" من القائمة؟`, () => this.removeItem(item.id));
                };
                div.querySelector('.edit-btn').onclick = (e) => {
                    e.stopPropagation();
                    this.openPriceModal(item.name, item.id, item.category);
                };
                div.querySelector('.item-clickable-area').onclick = () => {
                    this.openPriceModal(item.name, item.id, item.category);
                };
                this.cartItemsContainer.appendChild(div);
            });
        });
    }

    updateWeekSelectorUI() {
        this.weekSelectors.forEach(btn => {
            if (parseInt(btn.dataset.week) === this.activeWeek) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    openPriceModal(itemName, cartItemId = null, category = null) {
        this.activeItemName = itemName;
        this.activeCartItemId = cartItemId;
        this.activeCategory = category;
        
        const existing = cartItemId 
            ? this.cart.find(c => c.id === cartItemId) 
            : null;
        
        this.modalItemName.value = itemName;
        
        this.modalItemPrice.value = existing ? existing.price : '';
        this.activeWeek = existing ? (existing.week || 1) : 1;
        this.updateWeekSelectorUI();
        
        // Update title based on mode
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.innerText = cartItemId ? 'تعديل السعر والأسبوع' : 'إضافة إلى القائمة';

        this.priceModal.style.display = 'flex';
        setTimeout(() => this.modalItemPrice.focus(), 100);
    }

    closeModal() {
        this.priceModal.style.display = 'none';
        this.activeItemName = null;
        this.activeCartItemId = null;
    }

    addItemToCart() {
        const name = this.modalItemName.value.trim();
        const price = parseFloat(this.modalItemPrice.value);
        if (!name) return;
        if (isNaN(price) || price <= 0) {
            alert('يرجى إدخال سعر صحيح');
            return;
        }

        if (this.activeCartItemId) {
            // Update existing instance
            const item = this.cart.find(c => c.id === this.activeCartItemId);
            if (item) {
                item.name = name;
                item.price = price;
                item.week = this.activeWeek;
            }
        } else {
            // Add new instance
            this.cart.push({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: name,
                price: price,
                week: this.activeWeek,
                category: this.activeCategory
            });
        }

        this.save();
        this.closeModal();
        this.render();
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.save();
        this.render();
    }

    openEditCustomItemModal(name) {
        const item = this.customItems.find(ci => (typeof ci === 'object' ? ci.name : ci) === name);
        if (!item) return;

        this.editingCustomItemOriginalName = name;
        document.getElementById('new-item-modal-title').innerText = 'تعديل المادة';
        this.newItemName.value = typeof item === 'object' ? item.name : item;
        this.newItemCategory.value = typeof item === 'object' ? item.category : "إضافات مخصصة";
        
        const existingInCart = this.cart.find(c => c.name === name);
        this.newItemPrice.value = existingInCart ? existingInCart.price : '';
        
        this.newItemModal.style.display = 'flex';
    }

    handleAddNewItem() {
        const name = this.newItemName.value.trim();
        const category = this.newItemCategory.value;
        const price = parseFloat(this.newItemPrice.value);

        if (!name) return;

        if (this.editingCustomItemOriginalName) {
            // Update existing custom item
            const idx = this.customItems.findIndex(ci => (typeof ci === 'object' ? ci.name : ci) === this.editingCustomItemOriginalName);
            if (idx > -1) {
                this.customItems[idx] = { name, category };
            }
            
            // Update all entries in the cart with this name
            this.cart.forEach(c => {
                if (c.name === this.editingCustomItemOriginalName) {
                    c.name = name;
                    if (!isNaN(price) && price > 0) c.price = price;
                }
            });

            // If it wasn't in cart but price provided, add as new
            const alreadyInCart = this.cart.some(c => c.name === name);
            if (!alreadyInCart && !isNaN(price) && price > 0) {
                this.cart.push({ 
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name, 
                    price, 
                    week: 1 
                });
            }
        } else {
            // New item logic
            const existingIndex = this.customItems.findIndex(i => (typeof i === 'object' ? i.name : i) === name);
            if (existingIndex > -1) {
                this.customItems[existingIndex] = { name, category };
            } else {
                this.customItems.push({ name, category });
            }

            if (!isNaN(price) && price > 0) {
                this.cart.push({ 
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name, 
                    price, 
                    week: 1 
                });
            }
        }

        this.save();
        this.newItemModal.style.display = 'none';
        this.editingCustomItemOriginalName = null;
        this.render();
    }

    showConfirmModal(message, onConfirm) {
        this.confirmModalMessage.innerText = message;
        this.confirmModal.style.display = 'flex';
        
        this.confirmModalOk.onclick = () => {
            onConfirm();
            this.confirmModal.style.display = 'none';
        };
        
        this.confirmModalCancel.onclick = () => {
            this.confirmModal.style.display = 'none';
        };
    }

    openReceipt() {
        const totalBudget = this.salary + this.extraIncome;
        const spent = this.cart.reduce((sum, item) => sum + item.price, 0);
        const balance = totalBudget - spent;
        
        this.receiptDate.innerText = new Date().toLocaleDateString('ar-DZ', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        this.receiptTotalBudget.innerText = totalBudget.toLocaleString() + ' دج';
        this.receiptTotalSpent.innerText = spent.toLocaleString() + ' دج';
        this.receiptTotalBalance.innerText = balance.toLocaleString() + ' دج';

        this.receiptWeeksContainer.innerHTML = '';
        
        const weeks = [1, 2, 3, 4];
        weeks.forEach(weekNum => {
            const weekItems = this.cart.filter(item => (item.week || 1) === weekNum);
            if (weekItems.length === 0) return;

            const weekTotal = weekItems.reduce((sum, i) => sum + i.price, 0);
            const section = document.createElement('div');
            section.innerHTML = `
                <div class="flex justify-between items-center pb-2 border-b-2 border-slate-800 mb-2">
                    <span class="font-black text-lg">الأسبوع ${weekNum}</span>
                    <span class="font-black text-sm text-slate-600">${weekTotal.toLocaleString()} دج</span>
                </div>
                <div class="space-y-1">
                    ${weekItems.map(item => `
                        <div class="receipt-item-row">
                            <span class="text-sm font-bold text-slate-700">${item.name}</span>
                            <span class="text-sm font-black text-slate-900">${item.price.toLocaleString()} دج</span>
                        </div>
                    `).join('')}
                </div>
            `;
            this.receiptWeeksContainer.appendChild(section);
        });

        if (this.cart.length === 0) {
            this.receiptWeeksContainer.innerHTML = '<p class="text-center py-10 italic text-slate-400">لا توجد مواد في قائمة التسوق</p>';
        }

        this.receiptModal.style.display = 'flex';
    }

    save() {
        localStorage.setItem('salary_cart', JSON.stringify(this.cart));
        localStorage.setItem('salary_custom', JSON.stringify(this.customItems));
        localStorage.setItem('salary_extra', this.extraIncome.toString());
        localStorage.setItem('salary_savings', this.savings.toString());
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    new SalaryManager();
});