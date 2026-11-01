/**
 * Mounir Smart LMS — High-End Branded Popup & Alert Modal Engine (v2.0 Production)
 * Replaces browser native alert() and confirm() with gorgeous, modern, branded modals.
 */
(function() {
    // SVG Icons
    const ICONS = {
        question: `
            <div class="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10 animate-bounce">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </div>
        `,
        warning: `
            <div class="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        `,
        success: `
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        `,
        error: `
            <div class="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        `,
        info: `
            <div class="w-16 h-16 rounded-2xl bg-[#41519C]/25 border border-[#57BA9E]/40 text-[#57BA9E] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#41519C]/15">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        `
    };

    function ensureContainer() {
        let root = document.getElementById('monir-popup-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'monir-popup-root';
            root.style.position = 'relative';
            root.style.zIndex = '999999';
        }
        const target = document.body || document.documentElement;
        if (target && root.parentNode !== target) {
            target.appendChild(root);
        }
        return root;
    }

    function createModalElement(options) {
        const {
            title = 'أكاديمية منير الذكية',
            message = '',
            type = 'info',
            isConfirm = false,
            confirmText = 'تأكيد',
            cancelText = 'إلغاء'
        } = options;

        const iconHtml = ICONS[type] || ICONS.info;

        const overlay = document.createElement('div');
        overlay.className = 'monir-modal-backdrop fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[999999] opacity-0 transition-opacity duration-200';
        overlay.setAttribute('dir', 'rtl');

        const card = document.createElement('div');
        card.className = 'monir-modal-card bg-[#1F274B] text-white border-2 border-[#2D396E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl transform scale-90 opacity-0 transition-all duration-200 text-center relative overflow-hidden font-sans';
        card.style.fontFamily = "'Cairo', sans-serif";

        // Subtle decorative background glow
        const glow = document.createElement('div');
        glow.className = 'absolute -top-24 -left-24 w-48 h-48 bg-[#57BA9E]/15 rounded-full blur-3xl pointer-events-none';
        card.appendChild(glow);

        // Header Badge with logo accent
        const badge = document.createElement('div');
        badge.className = 'inline-flex items-center gap-1.5 bg-[#41519C]/30 border border-[#57BA9E]/40 px-3.5 py-1 rounded-full text-[11px] font-extrabold text-[#73C8AF] mb-3 select-none';
        badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-[#57BA9E] animate-pulse"></span>
            أكاديمية منير الذكية
        `;
        card.appendChild(badge);

        // Icon
        const iconWrapper = document.createElement('div');
        iconWrapper.innerHTML = iconHtml;
        card.appendChild(iconWrapper);

        // Title
        const titleEl = document.createElement('h3');
        titleEl.className = 'text-lg sm:text-xl font-black text-white mb-2 leading-snug';
        titleEl.innerText = title;
        card.appendChild(titleEl);

        // Message
        const msgEl = document.createElement('p');
        msgEl.className = 'text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-semibold whitespace-pre-line';
        msgEl.innerText = message;
        card.appendChild(msgEl);

        // Buttons Container
        const btnContainer = document.createElement('div');
        btnContainer.className = isConfirm 
            ? 'flex items-center justify-center gap-3 w-full' 
            : 'w-full';

        let confirmBtn;
        let cancelBtn;

        if (isConfirm) {
            confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            const isDestructive = type === 'question' || type === 'error';
            confirmBtn.className = isDestructive
                ? 'flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-rose-600/25 transition text-xs sm:text-sm cursor-pointer'
                : 'flex-1 bg-[#41519C] hover:bg-[#2D396E] text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-[#41519C]/25 transition text-xs sm:text-sm cursor-pointer';
            confirmBtn.innerText = confirmText;

            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition border border-slate-700 text-xs sm:text-sm cursor-pointer';
            cancelBtn.innerText = cancelText;

            btnContainer.appendChild(confirmBtn);
            btnContainer.appendChild(cancelBtn);
        } else {
            confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.className = 'w-full bg-[#41519C] hover:bg-[#2D396E] text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-[#41519C]/20 transition text-sm cursor-pointer';
            confirmBtn.innerText = confirmText || 'حسناً، فهمت';
            btnContainer.appendChild(confirmBtn);
        }

        card.appendChild(btnContainer);
        overlay.appendChild(card);

        return { overlay, card, confirmBtn, cancelBtn };
    }

    function showModal(options) {
        // Guard: If called before document.body is available, wait for DOMContentLoaded
        if (!document.body && document.readyState === 'loading') {
            return new Promise((resolve) => {
                document.addEventListener('DOMContentLoaded', () => {
                    showModal(options).then(resolve);
                });
            });
        }

        return new Promise((resolve) => {
            const container = ensureContainer();
            const { overlay, card, confirmBtn, cancelBtn } = createModalElement(options);

            container.appendChild(overlay);

            // Animate in
            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
                overlay.classList.add('opacity-100');
                card.classList.remove('scale-90', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            });

            function closeWith(val) {
                overlay.classList.remove('opacity-100');
                overlay.classList.add('opacity-0');
                card.classList.remove('scale-100');
                card.classList.add('scale-90', 'opacity-0');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    resolve(val);
                }, 200);
            }

            confirmBtn.onclick = () => closeWith(true);
            if (cancelBtn) {
                cancelBtn.onclick = () => closeWith(false);
            }

            // Outside click to close
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    closeWith(options.isConfirm ? false : true);
                }
            };

            // Keyboard navigation
            const keyHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', keyHandler);
                    closeWith(options.isConfirm ? false : true);
                } else if (e.key === 'Enter') {
                    document.removeEventListener('keydown', keyHandler);
                    closeWith(true);
                }
            };
            document.addEventListener('keydown', keyHandler);

            setTimeout(() => confirmBtn.focus(), 50);
        });
    }

    // Floating Toast Pill Notification
    function showToast(message, type = 'info', duration = 3500) {
        if (!document.body && document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => showToast(message, type, duration));
            return;
        }

        let toastBox = document.getElementById('monir-toast-container');
        if (!toastBox) {
            toastBox = document.createElement('div');
            toastBox.id = 'monir-toast-container';
            toastBox.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-2 items-center pointer-events-none';
            toastBox.setAttribute('dir', 'rtl');
            document.body.appendChild(toastBox);
        }

        const pill = document.createElement('div');
        const colorMap = {
            success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-900/30',
            error: 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-900/30',
            warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-900/30',
            info: 'bg-[#1F274B]/95 border-[#57BA9E]/50 text-slate-100 shadow-[#1F274B]/40'
        };
        const colorClass = colorMap[type] || colorMap.info;

        pill.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${colorClass} shadow-2xl backdrop-blur-md text-xs font-black transform -translate-y-4 opacity-0 transition-all duration-300`;
        pill.style.fontFamily = "'Cairo', sans-serif";
        pill.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span>${message}</span>
        `;

        toastBox.appendChild(pill);

        requestAnimationFrame(() => {
            pill.classList.remove('-translate-y-4', 'opacity-0');
            pill.classList.add('translate-y-0', 'opacity-100');
        });

        setTimeout(() => {
            pill.classList.remove('translate-y-0', 'opacity-100');
            pill.classList.add('-translate-y-4', 'opacity-0');
            setTimeout(() => {
                if (pill.parentNode) pill.parentNode.removeChild(pill);
            }, 300);
        }, duration);
    }

    // Public API
    window.MonirPopup = {
        alert: function(message, title, type = 'info', confirmText) {
            return showModal({
                title: title || 'تنبيه النظام',
                message: message,
                type: type,
                isConfirm: false,
                confirmText: confirmText || 'حسناً، فهمت'
            });
        },

        confirm: function(message, title, type = 'question', confirmText = 'تأكيد', cancelText = 'إلغاء') {
            return showModal({
                title: title || 'تأكيد الإجراء',
                message: message,
                type: type,
                isConfirm: true,
                confirmText: confirmText,
                cancelText: cancelText
            });
        },

        success: function(message, title = 'تم بنجاح') {
            return this.alert(message, title, 'success', 'متابعة');
        },

        warning: function(message, title = 'تنبيه أمني') {
            return this.alert(message, title, 'warning', 'موافق');
        },

        error: function(message, title = 'حدث خطأ') {
            return this.alert(message, title, 'error', 'إغلاق');
        },

        toast: function(message, type = 'info', duration = 3500) {
            showToast(message, type, duration);
        }
    };

    // Override browser native alert to automatically show MonirPopup
    const originalAlert = window.alert;
    window.alert = function(msg) {
        if (typeof msg === 'string') {
            let type = 'info';
            let title = 'تنبيه النظام';
            if (msg.includes('عذراً') || msg.includes('تنبيه') || msg.includes('يرجى') || msg.includes('غير صالح') || msg.includes('حجب')) {
                type = 'warning';
                title = 'تنبيه';
            } else if (msg.includes('نجاح') || msg.includes('تم') || msg.includes('مؤكد') || msg.includes('أحسنت')) {
                type = 'success';
                title = 'تم بنجاح';
            } else if (msg.includes('خطأ') || msg.includes('تعذر') || msg.includes('فشل')) {
                type = 'error';
                title = 'حدث خطأ';
            }
            return window.MonirPopup.alert(msg, title, type);
        }
        return originalAlert.apply(window, arguments);
    };

})();
