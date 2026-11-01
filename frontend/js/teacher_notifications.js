// =========================================================================
// Mounir Academy — Teacher Notifications Engine (نظام إشعارات المعلمين الذكي)
// v1.0 — Realtime updates for Student Addition, Removal, Transfer & Suspension
// =========================================================================
(function(window) {
    'use strict';

    const STORAGE_KEY = 'monir_teacher_notifications_v1';

    const TeacherNotifications = {
        // 1. Read all local notifications
        getAll() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch(e) {
                console.error('[TeacherNotifications] Storage read error:', e);
                return [];
            }
        },

        // 2. Persist to storage
        saveAll(list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            } catch(e) {
                console.error('[TeacherNotifications] Storage write error:', e);
            }
        },

        // 3. Create a new notification for a specific teacher
        async create({ teacherId, teacherName = '', type = 'student_added', title, message, studentName = '', studentCode = '', groupId = '' }) {
            if (!teacherId) return null;
            const tId = parseInt(teacherId);

            const notif = {
                id: 'tnotif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                teacher_id: tId,
                teacher_name: teacherName || '',
                type: type, // 'student_added' | 'student_removed' | 'student_paused' | 'student_transferred'
                title: title,
                message: message,
                student_name: studentName,
                student_code: studentCode,
                group_id: groupId,
                created_at: new Date().toISOString(),
                is_read: false
            };

            const all = this.getAll();
            all.unshift(notif);
            if (all.length > 250) all.length = 250;
            this.saveAll(all);

            // Supabase cloud synchronization if configured
            if (window.MonirDB && window.MonirDB.isConfigured()) {
                try {
                    const client = window.MonirDB.getClient();
                    if (client) {
                        const { error: insErr } = await client.from('notifications').insert([{
                            student_id: null,
                            course_name: groupId || 'إشعار المعلم',
                            title: title,
                            message: message,
                            type: 'teacher:' + tId + ':' + type,
                            action_url: 'teacher_id=' + tId + '&group=' + encodeURIComponent(groupId),
                            is_read: 0,
                            created_at: notif.created_at
                        }]);
                        if (insErr) {
                            console.warn('[TeacherNotifications] Supabase insert error:', insErr);
                        }
                    }
                } catch(err) {
                    console.warn('[TeacherNotifications] Supabase sync notice:', err);
                }
            }

            // Also broadcast window event for open tabs
            try {
                window.dispatchEvent(new CustomEvent('teacherNotificationAdded', { detail: notif }));
            } catch(e) {}

            return notif;
        },

        // 4. Retrieve notifications for a teacher
        async getForTeacher(teacherId) {
            if (!teacherId) return [];
            const tId = parseInt(teacherId);

            let list = this.getAll().filter(n => n.teacher_id === tId);

            // Fetch from Supabase as well to sync multi-device
            if (window.MonirDB && window.MonirDB.isConfigured()) {
                try {
                    const client = window.MonirDB.getClient();
                    if (client) {
                        const { data, error } = await client
                            .from('notifications')
                            .select('*')
                            .like('type', 'teacher:' + tId + ':%')
                            .order('id', { ascending: false })
                            .limit(60);

                        if (!error && Array.isArray(data) && data.length > 0) {
                            const existingMap = new Map();
                            list.forEach(n => existingMap.set(n.title + '_' + n.created_at.slice(0, 16), n));

                            data.forEach(row => {
                                const key = row.title + '_' + (row.created_at || '').slice(0, 16);
                                if (!existingMap.has(key)) {
                                    const parts = (row.type || '').split(':');
                                    const notifType = parts[2] || 'student_added';
                                    list.push({
                                        id: 'sb_' + row.id,
                                        teacher_id: tId,
                                        type: notifType,
                                        title: row.title,
                                        message: row.message,
                                        student_name: row.student_name || '',
                                        student_code: row.student_code || '',
                                        group_id: row.course_name || '',
                                        created_at: row.created_at || new Date().toISOString(),
                                        is_read: Boolean(row.is_read)
                                    });
                                }
                            });
                            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                        }
                    }
                } catch(e) {
                    console.warn('[TeacherNotifications] Supabase load warning:', e);
                }
            }

            return list;
        },

        // 5. Get unread count
        async getUnreadCount(teacherId) {
            const list = await this.getForTeacher(teacherId);
            return list.filter(n => !n.is_read).length;
        },

        // 6. Mark a single notification as read
        markAsRead(notifId) {
            const all = this.getAll();
            const target = all.find(n => n.id === notifId);
            if (target) {
                target.is_read = true;
                this.saveAll(all);
            }
        },

        // 7. Mark all notifications as read for a teacher
        markAllAsRead(teacherId) {
            const tId = parseInt(teacherId);
            const all = this.getAll();
            all.forEach(n => {
                if (n.teacher_id === tId) {
                    n.is_read = true;
                }
            });
            this.saveAll(all);

            // Also update Supabase in background
            if (window.MonirDB && window.MonirDB.isConfigured()) {
                try {
                    const client = window.MonirDB.getClient();
                    if (client) {
                        client.from('notifications')
                            .update({ is_read: 1 })
                            .like('type', 'teacher:' + tId + ':%')
                            .then(() => {});
                    }
                } catch(e) {}
            }
        },

        // Format relative timestamp in Arabic
        formatTimeAgo(isoString) {
            if (!isoString) return 'الآن';
            const date = new Date(isoString);
            const now = new Date();
            const diffSec = Math.floor((now - date) / 1000);

            if (diffSec < 60) return 'منذ لحظات';
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
            const diffHr = Math.floor(diffMin / 60);
            if (diffHr < 24) return `منذ ${diffHr} ساعة`;
            const diffDays = Math.floor(diffHr / 24);
            if (diffDays === 1) return 'أمس';
            if (diffDays < 7) return `منذ ${diffDays} أيام`;
            return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
        },

        // Visual helper: Get styling details for each notification type
        getVisualConfig(type) {
            switch(type) {
                case 'student_added':
                    return {
                        badge: 'طالب جديد',
                        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        bgClass: 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400',
                        iconBg: 'bg-emerald-500 text-white',
                        icon: '👤➕'
                    };
                case 'student_removed':
                    return {
                        badge: 'نقل / حذف',
                        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
                        bgClass: 'bg-amber-50/80 border-amber-200 hover:border-amber-400',
                        iconBg: 'bg-amber-500 text-slate-950',
                        icon: '🔄'
                    };
                case 'student_transferred':
                    return {
                        badge: 'نقل مجموعة',
                        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
                        bgClass: 'bg-blue-50/80 border-blue-200 hover:border-blue-400',
                        iconBg: 'bg-blue-600 text-white',
                        icon: '🔁'
                    };
                case 'student_paused':
                    return {
                        badge: 'طالب متوقف',
                        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
                        bgClass: 'bg-rose-50/80 border-rose-200 hover:border-rose-400',
                        iconBg: 'bg-rose-600 text-white',
                        icon: '⏸️'
                    };
                default:
                    return {
                        badge: 'تنبيه إداري',
                        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                        bgClass: 'bg-slate-50 border-slate-200 hover:border-slate-300',
                        iconBg: 'bg-indigo-600 text-white',
                        icon: '📢'
                    };
            }
        }
    };

    window.TeacherNotifications = TeacherNotifications;
})(window);
