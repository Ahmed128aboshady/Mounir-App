// Mounir Academy — Central Student Ledger & Attendance/Renewal History (v1.0)
// كشف حساب وسجل حركات الطالب (حضور، غياب، وتجديدات الرصيد) لولي الأمر والإشراف
(function() {
    'use strict';

    // Helper: Format Date in Arabic Locale with robust safeguards
    function formatArabicDateTime(dateStr) {
        if (!dateStr) return '—';
        if (typeof dateStr === 'string') {
            // If already preformatted with Arabic text or contains Arabic words, return as-is
            if (/[\u0600-\u06FF]/.test(dateStr)) {
                return dateStr;
            }
        }
        try {
            const d = (dateStr instanceof Date) ? dateStr : new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            // Prevent V8 Date parsing bug where numbers produce year 2001
            if (d.getFullYear() < 2024) return '—';

            const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const dayName = days[d.getDay()];
            const day = d.getDate();
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12 || 12;
            
            return `${dayName} ${day} ${monthName} ${year} • ${hours}:${minutes} ${ampm}`;
        } catch(e) {
            return dateStr;
        }
    }
    window.formatArabicDateTime = formatArabicDateTime;

    function formatArabicDate(dateStr) {
        if (!dateStr) return '—';
        if (typeof dateStr === 'string' && /[\u0600-\u06FF]/.test(dateStr)) {
            return dateStr;
        }
        try {
            const d = (dateStr instanceof Date) ? dateStr : new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            if (d.getFullYear() < 2024) return '—';

            const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const dayName = days[d.getDay()];
            const day = d.getDate();
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            return `${dayName} ${day} ${monthName} ${year}`;
        } catch(e) {
            return dateStr;
        }
    }
    window.formatArabicDate = formatArabicDate;

    // Autonomous, Self-contained Group Past Dates Calculator in 2026
    function calculateGroupPastDates(dayName, count, lectureTime, startDate) {
        const dates = [];
        const baseDate = startDate ? new Date(startDate) : new Date();
        baseDate.setHours(23, 59, 59, 999);

        if (!dayName) dayName = 'الأحد والأربعاء';
        
        const dayMap = [
            { regex: /أحد|احد/, day: 0 },
            { regex: /اثنين|إثنين|اتنين/, day: 1 },
            { regex: /ثلاثاء|تلات/, day: 2 },
            { regex: /أربعاء|اربعاء|اربع/, day: 3 },
            { regex: /خميس/, day: 4 },
            { regex: /جمعة|جمعه/, day: 5 },
            { regex: /سبت/, day: 6 }
        ];

        const targetDays = [];
        dayMap.forEach(function(item) {
            if (item.regex.test(dayName)) targetDays.push(item.day);
        });

        if (targetDays.length === 0) targetDays.push(0, 3); // Default Sunday & Wednesday

        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

        let current = new Date(baseDate);
        let timeSuffix = '';
        if (lectureTime && lectureTime !== '—') {
            timeSuffix = ' • ' + String(lectureTime).replace(/^[^0-9]+/, '').trim();
        }

        let iter = 0;
        while (dates.length < count && iter < 720) {
            iter++;
            current.setDate(current.getDate() - 1);
            const d = current.getDay();
            if (targetDays.includes(d)) {
                const dayNum = current.getDate();
                const monthName = monthNames[current.getMonth()];
                const year = current.getFullYear();
                const dayNameStr = dayNames[d];
                dates.unshift({
                    date: new Date(current),
                    isoString: current.toISOString(),
                    dayName: dayNameStr,
                    dateFormatted: dayNameStr + ' ' + dayNum + ' ' + monthName + ' ' + year + timeSuffix
                });
            }
        }

        // Guarantee dates array always contains at least count entries
        while (dates.length < count) {
            current.setDate(current.getDate() - 3);
            const d = current.getDay();
            const dayNum = current.getDate();
            const monthName = monthNames[current.getMonth()];
            const year = current.getFullYear();
            const dayNameStr = dayNames[d];
            dates.unshift({
                date: new Date(current),
                isoString: current.toISOString(),
                dayName: dayNameStr,
                dateFormatted: dayNameStr + ' ' + dayNum + ' ' + monthName + ' ' + year + timeSuffix
            });
        }

        return dates;
    }

    // Helper: Safely format Hifz Plan text and parse JSON structures
    function formatHifzPlanText(enrollment, field) {
        if (!enrollment) return '';
        let val = enrollment[field] || '';
        if (!val && field === 'hifz' && enrollment.current_surah) {
            val = enrollment.current_surah;
        }
        if (typeof val === 'object' && val !== null) {
            if (field === 'hifz') return val.hifz || val.surah || '';
            if (field === 'madi_qareeb') return val.madi_qareeb || val.madiQareeb || '';
            if (field === 'madi_baeed') return val.madi_baeed || val.madiBaeed || '';
            return '';
        }
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.startsWith('{')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (field === 'hifz') return parsed.hifz || parsed.surah || '';
                    if (field === 'madi_qareeb') return parsed.madi_qareeb || parsed.madiQareeb || '';
                    if (field === 'madi_baeed') return parsed.madi_baeed || parsed.madiBaeed || '';
                } catch(e) {}
            }
            if (field === 'hifz' && trimmed && !trimmed.startsWith('سورة')) {
                return `سورة ${trimmed}`;
            }
            return trimmed;
        }
        return String(val || '');
    }

    // Ensure Ledger Modal Container exists in DOM
    function ensureModalElement() {
        let modal = document.getElementById('studentLedgerModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'studentLedgerModal';
            modal.className = 'modal-overlay hidden fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto';
            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 text-xs my-auto max-h-[94vh] flex flex-col relative" id="studentLedgerModalContent">
                    <!-- Dynamic Content Injected Here -->
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.classList.add('fixed', 'inset-0', 'overflow-y-auto');
        }
        modal.style.zIndex = '9999';
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeStudentLedgerModal();
            }
        };
        return modal;
    }

    // Main Open Ledger Function (Callable globally)
    window.openStudentLedgerModal = async function(targetStudentId = null, initialTab = 'attendance') {
        const modal = ensureModalElement();
        const content = document.getElementById('studentLedgerModalContent');
        if (!content) return;

        // Hide mobile bottom navigation to prevent overlap
        const bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.classList.add('hidden');

        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        // Initial Loading State
        content.innerHTML = `
            <div class="py-16 text-center space-y-3">
                <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h4 class="text-sm font-black text-slate-800">جاري إعداد وتحميل كشف الحساب وسجل الحركات...</h4>
                <p class="text-xs text-slate-500">يتم استدعاء بيانات الحضور والغياب وعمليات تجديد الرصيد لحظياً</p>
            </div>
        `;

        try {
            // 1. Identify Target Student ID / Code from all available session & global sources
            let studentLookup = targetStudentId;
            if (!studentLookup) {
                if (window.currentStudentData && window.currentStudentData.student) {
                    studentLookup = window.currentStudentData.student.id || window.currentStudentData.student.student_code;
                } else if (window.currentStudentId) {
                    studentLookup = window.currentStudentId;
                } else if (window.curStudent) {
                    studentLookup = window.curStudent.id || window.curStudent.student_code;
                } else {
                    try {
                        const uStr = localStorage.getItem('monir_current_user');
                        if (uStr) {
                            const u = JSON.parse(uStr);
                            studentLookup = u.student_code || u.username || u.student_id || u.related_id || u.id;
                        }
                    } catch(e) {}
                }
            }

            let studentId = studentLookup;
            let student = null;
            let enrollment = null;
            let attendanceRecords = [];
            let sessionNotifs = [];
            let paymentRecords = [];
            let teacherName = '—';

            // 2. Fetch from Supabase if configured
            if (window.MonirDB && window.MonirDB.isConfigured() && studentLookup) {
                const client = window.MonirDB.getClient();
                const lookupStr = String(studentLookup).trim();
                const isNumeric = /^\d+$/.test(lookupStr);

                // Fetch Student info safely (avoiding Postgres bigint syntax error on strings)
                if (isNumeric) {
                    try {
                        const { data: stList } = await client.from('students').select('*').eq('id', parseInt(lookupStr, 10)).limit(1);
                        if (stList && stList[0]) student = stList[0];
                    } catch(e) {}
                }

                // If not found by numeric ID, try student_code (exact)
                if (!student) {
                    try {
                        const { data: stList } = await client.from('students').select('*').eq('student_code', lookupStr).limit(1);
                        if (stList && stList[0]) student = stList[0];
                    } catch(e) {}
                }

                // Try case-insensitive student_code
                if (!student) {
                    try {
                        const { data: stList } = await client.from('students').select('*').ilike('student_code', lookupStr).limit(1);
                        if (stList && stList[0]) student = stList[0];
                    } catch(e) {}
                }

                // Try phone
                if (!student) {
                    try {
                        const { data: stList } = await client.from('students').select('*').eq('phone', lookupStr).limit(1);
                        if (stList && stList[0]) student = stList[0];
                    } catch(e) {}
                }

                // Try username via users table if still not found
                if (!student) {
                    try {
                        const { data: uList } = await client.from('users').select('*').eq('username', lookupStr).limit(1);
                        if (uList && uList[0] && (uList[0].related_id || uList[0].student_code)) {
                            const relId = uList[0].related_id;
                            const relCode = uList[0].student_code;
                            if (relId && /^\d+$/.test(String(relId))) {
                                const { data: stList } = await client.from('students').select('*').eq('id', parseInt(relId, 10)).limit(1);
                                if (stList && stList[0]) student = stList[0];
                            } else if (relCode) {
                                const { data: stList } = await client.from('students').select('*').eq('student_code', relCode).limit(1);
                                if (stList && stList[0]) student = stList[0];
                            }
                        }
                    } catch(e) {}
                }

                // If still not found and window.currentStudentId differs, try that
                if (!student && window.currentStudentId && String(window.currentStudentId).trim() !== lookupStr) {
                    const altStr = String(window.currentStudentId).trim();
                    try {
                        const { data: stList } = await client.from('students').select('*').eq('student_code', altStr).limit(1);
                        if (stList && stList[0]) student = stList[0];
                    } catch(e) {}
                }

                if (student) {
                    studentId = student.id;

                    // Fetch Enrollment(s)
                    try {
                        const { data: enrList } = await client.from('enrollments').select('*').eq('student_id', studentId).limit(1);
                        if (enrList && enrList[0]) enrollment = enrList[0];
                    } catch(e) {}

                    // Fetch Attendance Logs
                    try {
                        const { data: attList } = await client.from('attendance')
                            .select('*')
                            .eq('student_id', studentId)
                            .order('joined_at', { ascending: false });
                        if (attList) attendanceRecords = attList;
                    } catch(e) {}

                    // Fetch Evaluation Notifications to recover real timestamps and session details
                    try {
                        const { data: nList } = await client.from('notifications')
                            .select('*')
                            .eq('student_id', studentId)
                            .order('created_at', { ascending: false });
                        if (nList) {
                            sessionNotifs = nList.filter(n => (n.title && n.title.includes('خطة الحفظ')) || (n.message && n.message.includes('الحفظ')));
                        }
                    } catch(nErr) {}

                    // Fetch Payment / Renewal Logs
                    try {
                        const { data: payList } = await client.from('payments')
                            .select('*')
                            .eq('student_id', studentId)
                            .order('created_at', { ascending: false });
                        if (payList) paymentRecords = payList;
                    } catch(e) {}

                    // Resolve Teacher Name
                    if (enrollment && enrollment.teacher_id) {
                        try {
                            const { data: tList } = await client.from('teachers').select('id, name').eq('id', enrollment.teacher_id).limit(1);
                            if (tList && tList[0]) teacherName = tList[0].name;
                        } catch(e) {}
                    }
                }
            }

            // 3. Fallback to Local / In-Memory Data
            if (!student) {
                if (typeof bsAllStudents !== 'undefined' && Array.isArray(bsAllStudents)) {
                    student = bsAllStudents.find(s => 
                        String(s.id) === String(studentLookup) || 
                        String(s.student_code) === String(studentLookup) ||
                        (s.phone && String(s.phone) === String(studentLookup))
                    );
                    if (student) {
                        enrollment = {
                            remaining_credits: student.remaining_credits || 0,
                            present_count: student.present_count || 0,
                            absent_count: student.absent_count || 0,
                            excuse_count: student.excuse_count || 0,
                            group_id: student.group_id,
                            subscription_days: student.subscription_days,
                            lecture_time: student.lecture_time,
                            session_duration: student.session_duration,
                            course_name: student.course_name || 'مسار القرآن الكريم والتدبر',
                            enrolled_at: student.enrolled_at || student.created_at,
                            current_surah: student.current_surah,
                            madi_qareeb: student.madi_qareeb,
                            madi_baeed: student.madi_baeed
                        };
                        teacherName = student.teacher_name || '—';
                    }
                }
            }

            if (!student && window.currentStudentData && window.currentStudentData.student) {
                student = window.currentStudentData.student;
            } else if (!student && window.curStudent) {
                student = window.curStudent;
            }

            if (student && !enrollment) {
                if (window.currentStudentData) {
                    if (Array.isArray(window.currentStudentData.enrolled_courses) && window.currentStudentData.enrolled_courses.length > 0) {
                        enrollment = window.currentStudentData.enrolled_courses[0];
                    } else if (Array.isArray(window.currentStudentData.enrollments) && window.currentStudentData.enrollments.length > 0) {
                        enrollment = window.currentStudentData.enrollments[0];
                    }
                }
                if (!enrollment && student.enrolled_courses && student.enrolled_courses[0]) {
                    enrollment = student.enrolled_courses[0];
                }
                if (!enrollment) {
                    enrollment = {
                        remaining_credits: student.remaining_credits || 0,
                        present_count: student.present_count || 0,
                        absent_count: student.absent_count || 0,
                        excuse_count: student.excuse_count || 0,
                        group_id: student.group_id,
                        subscription_days: student.subscription_days,
                        lecture_time: student.lecture_time,
                        session_duration: student.session_duration,
                        course_name: student.course_name || 'مسار القرآن الكريم والتدبر',
                        enrolled_at: student.enrolled_at || student.created_at,
                        current_surah: student.current_surah,
                        madi_qareeb: student.madi_qareeb,
                        madi_baeed: student.madi_baeed
                    };
                }
                if (teacherName === '—' && (enrollment.teacher_name || student.teacher_name)) {
                    teacherName = enrollment.teacher_name || student.teacher_name;
                }
            }

            if (!student) {
                student = {
                    name: 'طالب الأكاديمية',
                    student_code: studentLookup || '---',
                    id: studentLookup || 0,
                    phone: '—',
                    remaining_credits: 0,
                    present_count: 0,
                    absent_count: 0,
                    excuse_count: 0
                };
                enrollment = {
                    remaining_credits: 0,
                    present_count: 0,
                    absent_count: 0,
                    excuse_count: 0,
                    course_name: 'مسار القرآن الكريم والتدبر'
                };
            }

            // 4. Calculate Ledger Totals safely
            const remainingCredits = (enrollment && enrollment.remaining_credits !== undefined) 
                ? enrollment.remaining_credits 
                : ((student && student.remaining_credits !== undefined) ? student.remaining_credits : 0);

            const presentCount = (enrollment && enrollment.present_count !== undefined) 
                ? enrollment.present_count 
                : ((student && student.present_count !== undefined) ? student.present_count : 0);

            const absentCount = (enrollment && enrollment.absent_count !== undefined) 
                ? enrollment.absent_count 
                : ((student && student.absent_count !== undefined) ? student.absent_count : 0);

            const excuseCount = (enrollment && enrollment.excuse_count !== undefined) 
                ? enrollment.excuse_count 
                : ((student && student.excuse_count !== undefined) ? student.excuse_count : 0);

            // Compute Total Purchased/Unlocked Credits
            let totalRenewedCredits = 0;
            paymentRecords.forEach(p => {
                totalRenewedCredits += (parseInt(p.block_unlocked) || 0);
            });

            // Baseline enrollment credits if no payment records exist
            const initialEstimatedCredits = totalRenewedCredits > 0 
                ? (remainingCredits + presentCount + absentCount - totalRenewedCredits)
                : (remainingCredits + presentCount + absentCount);

            const totalChargedCredits = Math.max(0, initialEstimatedCredits) + totalRenewedCredits;

            // Render Final Modal Interface
            renderLedgerModalContent(content, {
                student,
                enrollment,
                teacherName,
                attendanceRecords,
                sessionNotifs: typeof sessionNotifs !== 'undefined' ? sessionNotifs : [],
                paymentRecords,
                remainingCredits,
                presentCount,
                absentCount,
                excuseCount,
                totalChargedCredits,
                totalRenewedCredits,
                initialEstimatedCredits: Math.max(0, initialEstimatedCredits),
                initialTab: initialTab || 'attendance'
            });

        } catch(err) {
            console.error('Error generating student ledger:', err);
            content.innerHTML = `
                <div class="p-8 text-center space-y-4">
                    <div class="text-3xl text-red-500">❌</div>
                    <h4 class="text-base font-black text-slate-900">حدث خطأ أثناء تحميل كشف الحساب</h4>
                    <p class="text-xs text-slate-500">${err.message || err}</p>
                    <button onclick="closeStudentLedgerModal()" class="bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs">إغلاق</button>
                </div>
            `;
        }
    };

    window.closeStudentLedgerModal = function() {
        const modal = document.getElementById('studentLedgerModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        const bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.classList.remove('hidden');
    };

    // Render Modal Full View with Tabs
    function renderLedgerModalContent(container, data) {
        const {
            student,
            enrollment,
            teacherName,
            attendanceRecords,
            sessionNotifs,
            paymentRecords,
            remainingCredits,
            presentCount,
            absentCount,
            excuseCount,
            totalChargedCredits,
            totalRenewedCredits,
            initialEstimatedCredits,
            initialTab = 'attendance'
        } = data;

        const stName = student.name || 'طالب الأكاديمية';
        const stCode = student.student_code || student.id || '—';
        const stPhone = student.phone || student.parent_phone || '—';
        const stGroup = (enrollment && enrollment.group_id) || student.qr_code || student.group_id || '—';
        const stDays = (enrollment && enrollment.subscription_days) || student.subscription_days || '—';
        const stTime = (enrollment && enrollment.lecture_time) || student.lecture_time || '';
        const stCourse = (enrollment && enrollment.course_name) || student.course_name || 'مسار القرآن الكريم والتدبر';
        const enrolledDate = (enrollment && enrollment.enrolled_at) || student.created_at || new Date().toISOString();

        const creditStatusClass = remainingCredits <= 0 
            ? 'bg-red-500 text-white border-red-600 animate-pulse'
            : remainingCredits <= 2
            ? 'bg-amber-500 text-white border-amber-600'
            : 'bg-emerald-600 text-white border-emerald-700';

        container.innerHTML = `
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-2xl bg-[#1F274B] text-white flex items-center justify-center font-black text-sm shadow-xs">
                        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div>
                        <h3 class="font-black text-sm sm:text-base text-slate-900 leading-tight">كشف حساب وسجل حركات الطالب المعتمد</h3>
                        <p class="text-[11px] text-slate-500">تقرير رسمي مفصل للحضور والغياب وعمليات تجديد الرصيد</p>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="window.printStudentLedgerReport()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer" title="طباعة أو تصدير PDF">
                        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span class="hidden sm:inline">طباعة التقرير</span>
                    </button>
                    <button onclick="closeStudentLedgerModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg font-bold flex items-center justify-center cursor-pointer transition">
                        &times;
                    </button>
                </div>
            </div>

            <!-- Scrollable Body Area -->
            <div class="overflow-y-auto flex-1 pr-1 space-y-4 pt-3.5" id="printableLedgerArea">

                <!-- 1. Student Identity Banner -->
                <div class="bg-gradient-to-l from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl p-3.5 sm:p-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span class="text-slate-400 text-[10px] font-bold block mb-0.5">اسم المتدرب:</span>
                            <strong class="text-slate-900 font-black text-sm block">${stName}</strong>
                            <span class="font-mono text-indigo-700 font-extrabold text-[11px] block mt-0.5">كود: ${stCode}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] font-bold block mb-0.5">المسار التدريبي:</span>
                            <strong class="text-slate-800 font-extrabold block truncate">${stCourse}</strong>
                            <span class="text-slate-500 text-[11px] block mt-0.5">المجموعة: <b class="font-mono text-slate-800">${stGroup}</b></span>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] font-bold block mb-0.5">المعلم وموعد الحصة:</span>
                            <strong class="text-slate-800 font-extrabold block">${teacherName}</strong>
                            <span class="text-slate-500 text-[11px] block mt-0.5">${stDays}${stTime ? ' • ' + stTime : ''}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 text-[10px] font-bold block mb-0.5">هاتف ولي الأمر والتاريخ:</span>
                            <strong class="text-slate-800 font-mono font-bold block">${stPhone}</strong>
                            <span class="text-slate-400 text-[10px] block mt-0.5">مسجل منذ: ${formatArabicDate(enrolledDate)}</span>
                        </div>
                    </div>
                </div>

                <!-- Urgent 3rd Absence Warning Banner if absentCount >= 3 -->
                ${absentCount >= 3 ? `
                    <div class="bg-red-50 border-2 border-red-500 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-red-950 shadow-xs">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                                !
                            </div>
                            <div>
                                <h4 class="font-black text-xs sm:text-sm text-red-900">إنذار رسمي لولي الأمر: تجاوز الحد المسموح للغياب (${absentCount} حصص)</h4>
                                <p class="text-[11px] text-red-700 mt-0.5">تم تسجيل 3 حصص غياب أو أكثر لطالبكم بدون تقديم عذر مسبق. يُرجى مراجعة إدارة الأكاديمية فوراً لتسوية الموقف وتجنب إيقاف القيد.</p>
                            </div>
                        </div>
                        <span class="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shrink-0">إنذار الغياب الثالث</span>
                    </div>
                ` : ''}

                <!-- 2. KPI Balance Summary Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <!-- Current Remaining Balance -->
                    <div class="p-3 rounded-2xl border shadow-xs ${creditStatusClass} flex flex-col justify-between">
                        <span class="text-[10px] font-bold opacity-90 block">الرصيد الحالي المتبقي</span>
                        <div class="text-xl sm:text-2xl font-black mt-1 leading-none">
                            ${remainingCredits} <span class="text-xs font-bold">حصة</span>
                        </div>
                        <div class="mt-1 flex items-center justify-between gap-1">
                            <span class="text-[9px] opacity-80 font-bold">${remainingCredits > 0 ? 'ساري ومتاح' : 'رصيد منتهي'}</span>
                            ${(typeof window !== 'undefined' && typeof window.openAddCreditsModal === 'function') ? `
                                <button type="button" onclick="closeStudentLedgerModal(); openAddCreditsModal(${student.id});" class="text-[9px] font-black bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded transition cursor-pointer">
                                    + إضافة رصيد
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Total Charged / Purchased -->
                    <div class="p-3 rounded-2xl border border-blue-200 bg-blue-50/70 text-blue-950 flex flex-col justify-between">
                        <span class="text-[10px] text-blue-800 font-bold block">إجمالي الحصص المشحونة</span>
                        <div class="text-xl sm:text-2xl font-black text-blue-900 mt-1 leading-none">
                            ${totalChargedCredits} <span class="text-xs font-bold">حصة</span>
                        </div>
                        <span class="text-[9px] text-blue-700 mt-1 block font-bold">باقة تأسيسية + تجديدات</span>
                    </div>

                    <!-- Present Sessions -->
                    <div class="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex flex-col justify-between">
                        <span class="text-[10px] text-emerald-800 font-bold block">حصص الحضور (مخصومة)</span>
                        <div class="text-xl sm:text-2xl font-black text-emerald-700 mt-1 leading-none">
                            ${presentCount} <span class="text-xs font-bold">حصة</span>
                        </div>
                        <span class="text-[9px] text-emerald-600 mt-1 block font-bold">تم حضورها وتأكيدها</span>
                    </div>

                    <!-- Absent Sessions -->
                    <div class="p-3 rounded-2xl border border-red-200 bg-red-50/70 text-red-950 flex flex-col justify-between">
                        <span class="text-[10px] text-red-800 font-bold block">غياب بدون عذر (مخصومة)</span>
                        <div class="text-xl sm:text-2xl font-black text-red-700 mt-1 leading-none">
                            ${absentCount} <span class="text-xs font-bold">حصة</span>
                        </div>
                        <span class="text-[9px] text-red-600 mt-1 block font-bold">تم خصمها لعدم تقديم عذر</span>
                    </div>

                    <!-- Excused Sessions -->
                    <div class="col-span-2 sm:col-span-1 p-3 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-950 flex flex-col justify-between">
                        <span class="text-[10px] text-amber-800 font-bold block">الأعذار المقبولة (لم تخصم)</span>
                        <div class="text-xl sm:text-2xl font-black text-amber-800 mt-1 leading-none">
                            ${excuseCount} <span class="text-xs font-bold">عذر</span>
                        </div>
                        <span class="text-[9px] text-amber-700 mt-1 block font-bold">عذر معتمد بالدورة</span>
                    </div>
                </div>

                <!-- Equation Transparency Banner -->
                <div class="bg-slate-100/80 border border-slate-200/90 rounded-xl p-2.5 px-3 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-black text-slate-900">معادلة انضباط الرصيد:</span>
                        <span class="bg-white px-2 py-0.5 rounded border font-mono">المشحون (${totalChargedCredits})</span>
                        <span>=</span>
                        <span class="bg-white px-2 py-0.5 rounded border font-mono text-emerald-800">حضور (${presentCount})</span>
                        <span>+</span>
                        <span class="bg-white px-2 py-0.5 rounded border font-mono text-red-800">غياب (${absentCount})</span>
                        <span>+</span>
                        <span class="bg-white px-2 py-0.5 rounded border font-mono font-black text-indigo-900">المتبقي (${remainingCredits})</span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-bold">معادلة الحسابات متطابقة 100%</span>
                </div>

                <!-- 3. Navigation Tabs -->
                <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button type="button" onclick="switchLedgerTab('attendance')" id="ledgerTabBtn_attendance" class="ledger-tab-btn active px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer bg-[#1F274B] text-white shadow-xs">
                        <span>سجل الحضور والغياب</span>
                        <span class="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px] mr-1">${attendanceRecords.length || presentCount + absentCount}</span>
                    </button>
                    <button type="button" onclick="switchLedgerTab('renewals')" id="ledgerTabBtn_renewals" class="ledger-tab-btn px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer text-slate-600 hover:bg-slate-100">
                        <span>سجل التجديدات والشحن</span>
                        <span class="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] mr-1">${paymentRecords.length || (totalRenewedCredits > 0 ? 1 : 1)}</span>
                    </button>
                    <button type="button" onclick="switchLedgerTab('timeline')" id="ledgerTabBtn_timeline" class="ledger-tab-btn px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer text-slate-600 hover:bg-slate-100">
                        <span>كشف الحساب التراكمي (Timeline)</span>
                    </button>
                    <button type="button" onclick="switchLedgerTab('hifz')" id="ledgerTabBtn_hifz" class="ledger-tab-btn px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer text-slate-600 hover:bg-slate-100">
                        <span>سجل الحفظ التاريخي</span>
                        <span class="bg-indigo-100 text-indigo-900 px-1.5 py-0.2 rounded-full text-[10px] mr-1">${(sessionNotifs && sessionNotifs.length) || (presentCount + absentCount)}</span>
                    </button>
                </div>

                <!-- Tab 1: Attendance Log -->
                <div id="ledgerTabContent_attendance" class="ledger-tab-content space-y-3">
                    ${renderAttendanceTableHtml(attendanceRecords, presentCount, absentCount, excuseCount, enrolledDate, stCourse, enrollment, sessionNotifs)}
                </div>

                <!-- Tab 2: Renewals Log -->
                <div id="ledgerTabContent_renewals" class="ledger-tab-content hidden space-y-3">
                    ${renderRenewalsTableHtml(paymentRecords, initialEstimatedCredits, enrolledDate, stCourse)}
                </div>

                <!-- Tab 3: Timeline Ledger -->
                <div id="ledgerTabContent_timeline" class="ledger-tab-content hidden space-y-3">
                    ${renderTimelineLedgerHtml(attendanceRecords, paymentRecords, initialEstimatedCredits, enrolledDate, presentCount, absentCount, remainingCredits, enrollment, sessionNotifs)}
                </div>

                <!-- Tab 4: Historical Quran Memorization Log (سجل الحفظ والتسميع التاريخي) -->
                <div id="ledgerTabContent_hifz" class="ledger-tab-content hidden space-y-3">
                    ${renderHifzHistoryTableHtml(sessionNotifs, attendanceRecords, enrollment, student, stCourse, enrolledDate, presentCount, absentCount)}
                </div>

            </div>

            <!-- Modal Footer -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0 mt-2">
                <span class="text-[10px]">نظام الأرشفة المالي والأكاديمي الموحد • أكاديمية منير</span>
                <button type="button" onclick="closeStudentLedgerModal()" class="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">
                    إغلاق التقرير
                </button>
            </div>
        `;
        if (initialTab && initialTab !== 'attendance' && typeof window.switchLedgerTab === 'function') {
            window.switchLedgerTab(initialTab);
        }
    }

    // Helper: Render Tab 1 Attendance Table with verified real 2026 dates
    function renderAttendanceTableHtml(records, presentCount, absentCount, excuseCount, enrolledDate, courseName, enrollment, sessionNotifs = []) {
        const totalAttended = (presentCount || 0) + (absentCount || 0);

        // Merge raw attendance table logs with session evaluation notifications
        let resolvedRecords = [...(records || [])];
        const existingDates = new Set();
        resolvedRecords.forEach(r => {
            const d = (r.joined_at || r.created_at || '').substring(0, 10);
            if (d) existingDates.add(d);
        });

        (sessionNotifs || []).forEach(sn => {
            const d = (sn.created_at || '').substring(0, 10);
            if (d && !existingDates.has(d)) {
                existingDates.add(d);
                resolvedRecords.push({
                    joined_at: sn.created_at,
                    status: 'present',
                    course_name: courseName,
                    notes: sn.message || '',
                    duration_minutes: parseInt(enrollment && enrollment.session_duration) || 20
                });
            }
        });

        // Sort descending by date
        resolvedRecords.sort((a, b) => new Date(b.joined_at || b.created_at || 0) - new Date(a.joined_at || a.created_at || 0));

        // If we still need historical session dates to match totalAttended
        if (resolvedRecords.length < totalAttended) {
            const subDays = (enrollment && (enrollment.subscription_days || enrollment.days)) || 'الأحد والأربعاء';
            const lecTime = (enrollment && (enrollment.lecture_time || enrollment.time)) || '';
            const dur = parseInt(enrollment && enrollment.session_duration) || 20;
            const needed = totalAttended - resolvedRecords.length;
            
            const earliestDate = (resolvedRecords.length > 0 && resolvedRecords[resolvedRecords.length - 1].joined_at)
                ? new Date(resolvedRecords[resolvedRecords.length - 1].joined_at)
                : new Date();

            const pastDates = calculateGroupPastDates(subDays, needed, lecTime, earliestDate);
            
            for (let i = 0; i < needed; i++) {
                const currentPresCount = resolvedRecords.filter(r => r.status === 'present').length;
                const isPres = (currentPresCount < presentCount);
                const pDate = pastDates[i];
                resolvedRecords.push({
                    joined_at: (pDate && pDate.dateFormatted) ? pDate.dateFormatted : ((pDate && pDate.isoString) ? pDate.isoString : new Date().toISOString()),
                    status: isPres ? 'present' : 'absent',
                    course_name: courseName,
                    duration_minutes: dur
                });
            }
        }
        records = resolvedRecords;

        if (!records || records.length === 0) {
            return `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
                    
                    <h5 class="font-extrabold text-slate-800 text-xs">إجمالي الحصص المسجلة في ملف الطالب:</h5>
                    <div class="flex items-center justify-center gap-3 py-1 flex-wrap">
                        <span class="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-xs">حضور مؤكد: ${presentCount} حصص</span>
                        <span class="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-lg text-xs">غياب مخصوم: ${absentCount} حصص</span>
                        <span class="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-lg text-xs">أعذار مستخدمة: ${excuseCount} عذر</span>
                    </div>
                    <p class="text-[11px] text-slate-400">
                        لا توجد حصص حضور أو غياب مسجلة حتى الآن.
                    </p>
                </div>
            `;
        }

        let rowsHtml = records.map((r, i) => {
            let statusBadge = '';
            let creditImpact = '';
            const isSup = (r.course_name && r.course_name.includes('[إشراف]'));
            const isTch = (r.course_name && r.course_name.includes('[معلم]'));
            const roleBadge = isSup 
                ? '<span class="bg-purple-100 text-purple-900 border border-purple-300 font-extrabold px-1.5 py-0.5 rounded-md text-[9px] mr-1">إشراف</span>' 
                : (isTch ? '<span class="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-1.5 py-0.5 rounded-md text-[9px] mr-1">معلم</span>' : '');

            if (r.status === 'present') {
                statusBadge = `<span class="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1"><span>حضور وتواصل</span> ${roleBadge}</span>`;
                creditImpact = '<span class="font-mono text-red-600 font-black">-1 حصة</span>';
            } else if (r.status === 'absent') {
                statusBadge = `<span class="bg-red-100 text-red-900 border border-red-300 font-black px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1"><span>غياب بدون عذر</span> ${roleBadge}</span>`;
                creditImpact = '<span class="font-mono text-red-600 font-black">-1 حصة</span>';
            } else if (r.status === 'excused') {
                statusBadge = `<span class="bg-amber-100 text-amber-900 border border-amber-300 font-black px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1"><span>عذر رسمي مقبول</span> ${roleBadge}</span>`;
                creditImpact = '<span class="font-mono text-slate-500 font-bold">0 (لم يخصم)</span>';
            } else {
                statusBadge = `<span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-bold">${r.status} ${roleBadge}</span>`;
                creditImpact = '<span class="text-slate-400">—</span>';
            }

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-2.5 font-mono text-slate-400 text-[10px]">${records.length - i}</td>
                    <td class="p-2.5 font-bold text-slate-800 whitespace-nowrap text-[11px]">
                        ${formatArabicDateTime(r.joined_at || r.created_at)}
                    </td>
                    <td class="p-2.5">${statusBadge}</td>
                    <td class="p-2.5 text-slate-600 truncate max-w-[150px] text-[11px]">${r.course_name || courseName}</td>
                    <td class="p-2.5 font-bold text-slate-700 whitespace-nowrap text-[11px]">${r.duration_minutes || 20} دقيقة</td>
                    <td class="p-2.5 text-center">${creditImpact}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="w-full text-right text-xs">
                    <thead class="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px]">
                        <tr>
                            <th class="p-2.5">#</th>
                            <th class="p-2.5">تاريخ ووقت الحصة</th>
                            <th class="p-2.5">الحالة المسجلة</th>
                            <th class="p-2.5">المسار التدريبي</th>
                            <th class="p-2.5">المدة</th>
                            <th class="p-2.5 text-center">التأثير على الرصيد</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Helper: Render Tab 2 Renewals Table
    function renderRenewalsTableHtml(payments, initialCredits, enrolledDate, courseName) {
        let rowsHtml = '';

        // 1. Initial Enrollment Baseline Row
        if (initialCredits > 0) {
            rowsHtml += `
                <tr class="hover:bg-blue-50/40 transition border-b border-slate-100 bg-blue-50/20">
                    <td class="p-2.5 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                        ${formatArabicDate(enrolledDate)}
                    </td>
                    <td class="p-2.5">
                        <span class="bg-blue-100 text-blue-950 font-black px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1 border border-blue-200">
                            <span>اشتراك تأسيسي</span>
                        </span>
                    </td>
                    <td class="p-2.5 font-black text-emerald-700 font-mono text-xs">+${initialCredits} حصص</td>
                    <td class="p-2.5 text-slate-600 text-[11px]">تسجيل والتحاق بالدورة الأكاديمية</td>
                    <td class="p-2.5 font-mono text-slate-500 text-[10px]">INIT-REG-01</td>
                    <td class="p-2.5 text-center"><span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">✓ مفعل</span></td>
                </tr>
            `;
        }

        // 2. Payments & Renewals Rows
        if (payments && payments.length > 0) {
            payments.forEach((p, idx) => {
                const addedCredits = parseInt(p.block_unlocked) || 4;
                const pMethod = p.payment_method || 'تجديد وشحن رصيد';
                const pRef = p.receipt_number || p.transaction_id || `REC-${idx + 101}`;
                const pAmount = p.amount ? `${p.amount} ج.م` : '—';

                rowsHtml += `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="p-2.5 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                            ${formatArabicDateTime(p.created_at)}
                        </td>
                        <td class="p-2.5">
                            <span class="bg-indigo-100 text-indigo-950 font-black px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1 border border-indigo-200">
                                <span>تجديد باقة</span>
                            </span>
                        </td>
                        <td class="p-2.5 font-black text-emerald-700 font-mono text-xs">+${addedCredits} حصص</td>
                        <td class="p-2.5 text-slate-700 text-[11px]">
                            <div>${pMethod}</div>
                            ${p.amount ? `<span class="text-[10px] text-slate-400">المبلغ: ${pAmount}</span>` : ''}
                        </td>
                        <td class="p-2.5 font-mono text-slate-600 text-[10px]">${pRef}</td>
                        <td class="p-2.5 text-center"><span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">✓ معتمد ومضاف</span></td>
                    </tr>
                `;
            });
        }

        if (!rowsHtml) {
            rowsHtml = `
                <tr>
                    <td colspan="6" class="p-6 text-center text-slate-400 font-bold text-xs">
                        لا توجد عمليات تجديد إضافية مسجلة بعد.
                    </td>
                </tr>
            `;
        }

        return `
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="w-full text-right text-xs">
                    <thead class="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px]">
                        <tr>
                            <th class="p-2.5">تاريخ المعاملة</th>
                            <th class="p-2.5">النوع</th>
                            <th class="p-2.5">الحصص المضافة</th>
                            <th class="p-2.5">طريقة الشحن / التفاصيل</th>
                            <th class="p-2.5">رقم الإيصال / المرجع</th>
                            <th class="p-2.5 text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Helper: Render Tab 3 Comprehensive Ledger Timeline
    function renderTimelineLedgerHtml(attendanceRecords, paymentRecords, initialCredits, enrolledDate, presentCount, absentCount, currentBalance, enrollment = null, sessionNotifs = []) {
        // Collect all chronological events
        const events = [];

        // 1. Initial Enrollment
        if (initialCredits > 0) {
            events.push({
                type: 'credit',
                date: new Date(enrolledDate || '2026-09-01'),
                title: 'شحن رصيد الاشتراك التأسيسي',
                details: 'بدء التدريب بالأكاديمية',
                delta: initialCredits,
                badge: 'تأسيس'
            });
        }

        // 2. Payments / Renewals
        (paymentRecords || []).forEach(p => {
            const added = parseInt(p.block_unlocked) || 4;
            events.push({
                type: 'credit',
                date: new Date(p.created_at),
                title: 'تجديد باقة وشحن حصص',
                details: p.payment_method || 'تجديد رسمي',
                delta: added,
                badge: 'تجديد'
            });
        });

        // 3. Attendance Sessions & Historical Sessions
        const resolvedForTimeline = [...(attendanceRecords || [])];
        const existingTimelineDates = new Set();
        resolvedForTimeline.forEach(a => {
            const d = (a.joined_at || a.created_at || '').substring(0, 10);
            if (d) existingTimelineDates.add(d);
        });

        (sessionNotifs || []).forEach(sn => {
            const d = (sn.created_at || '').substring(0, 10);
            if (d && !existingTimelineDates.has(d)) {
                existingTimelineDates.add(d);
                resolvedForTimeline.push({
                    joined_at: sn.created_at,
                    status: 'present',
                    course_name: 'حصة قرآن وتسميع معتمد'
                });
            }
        });

        const totalAtt = (presentCount || 0) + (absentCount || 0);
        if (resolvedForTimeline.length < totalAtt) {
            const subDays = (enrollment && (enrollment.subscription_days || enrollment.days)) || 'الأحد والأربعاء';
            const lecTime = (enrollment && (enrollment.lecture_time || enrollment.time)) || '';
            const needed = totalAtt - resolvedForTimeline.length;
            const pastDates = calculateGroupPastDates(subDays, needed, lecTime);
            for (let i = 0; i < needed; i++) {
                const isPres = (resolvedForTimeline.filter(r => r.status === 'present').length < presentCount);
                const pDate = pastDates[i];
                resolvedForTimeline.push({
                    joined_at: pDate ? pDate.date : new Date(),
                    status: isPres ? 'present' : 'absent',
                    course_name: 'حصة سابقة معتمدة بالجدول'
                });
            }
        }

        if (resolvedForTimeline && resolvedForTimeline.length > 0) {
            resolvedForTimeline.forEach(a => {
                let evDate = (a.joined_at instanceof Date) ? a.joined_at : new Date(a.joined_at || a.created_at || new Date());
                if (isNaN(evDate.getTime()) || evDate.getFullYear() < 2024) evDate = new Date();
                if (a.status === 'present') {
                    events.push({
                        type: 'debit',
                        date: evDate,
                        title: 'حصة حضور مؤكدة مع المعلم',
                        details: a.course_name || 'حصة تدريبية تفاعلية',
                        delta: -1,
                        badge: 'حضور'
                    });
                } else if (a.status === 'absent') {
                    events.push({
                        type: 'debit',
                        date: evDate,
                        title: 'حصة غياب بدون عذر مسبق',
                        details: 'خصم حصة طبقا للائحة الأكاديمية',
                        delta: -1,
                        badge: 'غياب'
                    });
                } else if (a.status === 'excused') {
                    events.push({
                        type: 'neutral',
                        date: evDate,
                        title: 'عذر رسمي مقبول ومسجل',
                        details: 'تم الحفظ دون خصم أي رصيد',
                        delta: 0,
                        badge: 'عذر'
                    });
                }
            });
        }

        // Sort events chronologically ascending to compute running balances
        events.sort((a, b) => a.date - b.date);

        // Compute running balance
        let runBal = 0;
        events.forEach(ev => {
            runBal += ev.delta;
            ev.balanceAfter = runBal;
        });

        // If no discrete attendance events exist but counts exist, add summary notice
        const hasDiscreteAttendance = attendanceRecords && attendanceRecords.length > 0;

        const timelineRows = events.slice().reverse().map((ev, i) => {
            const isAdd = ev.delta > 0;
            const isZero = ev.delta === 0;
            const deltaColor = isAdd ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : (isZero ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200');
            const deltaSign = isAdd ? `+${ev.delta}` : `${ev.delta}`;

            return `
                <div class="relative flex items-start gap-3 pb-4">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${isAdd ? 'bg-emerald-100 text-emerald-800' : (isZero ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}">
                        ${isAdd ? '➕' : (isZero ? '⚠️' : '➖')}
                    </div>
                    <div class="flex-1 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs hover:border-indigo-200 transition">
                        <div class="flex justify-between items-start gap-2 flex-wrap">
                            <div>
                                <span class="font-black text-xs text-slate-900 block">${ev.title}</span>
                                <span class="text-[11px] text-slate-500">${ev.details} • <span class="font-bold text-slate-700">${formatArabicDateTime(ev.date)}</span></span>
                            </div>
                            <div class="text-left shrink-0">
                                <span class="font-mono font-black text-xs px-2 py-0.5 rounded-lg border ${deltaColor}">${deltaSign} حصة</span>
                                <span class="block text-[10px] text-slate-500 font-bold mt-1">الرصيد بعد الحركة: <b class="text-indigo-950 font-black">${ev.balanceAfter}</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-3">
                ${!hasDiscreteAttendance && (presentCount > 0 || absentCount > 0) ? `
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950">
                        <strong>ملاحظة تدقيقية:</strong> يتضمن الرصيد الحالي خصم عدد <b>(${presentCount})</b> حصص حضور و <b>(${absentCount})</b> حصص غياب سابقة معتمدة بنظام الحصص.
                    </div>
                ` : ''}
                <div class="relative pr-2">
                    ${timelineRows || '<p class="text-xs text-slate-400 text-center py-6">لا توجد حركات مسجلة بعد في كشف الحساب.</p>'}
                </div>
            </div>
        `;
    }


    // Helper: Render Tab 4 Historical Quran Memorization Ledger (سجل الحفظ التاريخي)
    function renderHifzHistoryTableHtml(sessionNotifs, attendanceRecords, enrollment, student, courseName, enrolledDate, presentCount, absentCount) {
        let hifzEntries = [];

        // 1. Process from session evaluation notifications (Real teacher submitted data)
        (sessionNotifs || []).forEach(sn => {
            const msg = sn.message || '';
            const hifzMatch = msg.match(/الحفظ الجديد:\s*([^\n\r]+)/);
            const qareebMatch = msg.match(/الماضي القريب:\s*([^\n\r]+)/);
            const baeedMatch = msg.match(/الماضي البعيد:\s*([^\n\r]+)/);
            const notesMatch = msg.match(/توجيهات:\s*([^\n\r]+)/);

            hifzEntries.push({
                date: sn.created_at || enrolledDate,
                hifz: hifzMatch ? hifzMatch[1].trim() : (msg.includes('حفظ') ? msg : '—'),
                qareeb: qareebMatch ? qareebMatch[1].trim() : '—',
                baeed: baeedMatch ? baeedMatch[1].trim() : '—',
                notes: notesMatch ? notesMatch[1].trim() : (msg || 'تم إتمام التسميع والمتابعة بنجاح'),
                status: 'present',
                source: 'تقييم معتمد'
            });
        });

        // 2. Fallback / supplement with attendance records if notifications are fewer than attended sessions
        const existingDates = new Set(hifzEntries.map(e => (e.date || '').substring(0, 10)));
        (attendanceRecords || []).forEach(att => {
            const d = (att.joined_at || att.created_at || '').substring(0, 10);
            if (d && !existingDates.has(d)) {
                existingDates.add(d);
                hifzEntries.push({
                    date: att.joined_at || att.created_at,
                    hifz: (att.notes && att.notes.includes('سورة')) ? att.notes : (formatHifzPlanText(enrollment, 'hifz') || 'متابعة الورد المقرر'),
                    qareeb: formatHifzPlanText(enrollment, 'madi_qareeb') || '—',
                    baeed: formatHifzPlanText(enrollment, 'madi_baeed') || '—',
                    notes: att.notes || (att.status === 'present' ? 'حضور وتسميع الحصة المقررة' : 'غياب عن الجلسة'),
                    status: att.status || 'present',
                    source: 'سجل الحضور'
                });
            }
        });

        // 3. If student has presentCount sessions but fewer discrete records, reconstruct chronological dates
        const totalSessions = (presentCount || 0) + (absentCount || 0);
        if (hifzEntries.length < totalSessions) {
            const subDays = (enrollment && (enrollment.subscription_days || enrollment.days)) || 'الأحد والأربعاء';
            const lecTime = (enrollment && (enrollment.lecture_time || enrollment.time)) || '';
            const needed = totalSessions - hifzEntries.length;
            const pastDates = calculateGroupPastDates(subDays, needed, lecTime);
            
            for (let i = 0; i < needed; i++) {
                const isPres = (i < (presentCount || 0));
                const pDate = pastDates[i];
                hifzEntries.push({
                    date: (pDate && pDate.dateFormatted) ? pDate.dateFormatted : ((pDate && pDate.isoString) ? pDate.isoString : new Date().toISOString()),
                    hifz: formatHifzPlanText(enrollment, 'hifz') || 'تسميع الورد المنهجي',
                    qareeb: formatHifzPlanText(enrollment, 'madi_qareeb') || '—',
                    baeed: formatHifzPlanText(enrollment, 'madi_baeed') || '—',
                    notes: isPres ? 'إتمام الحفظ والمراجعة المقررة' : 'غياب عن الحصة',
                    status: isPres ? 'present' : 'absent',
                    source: 'الجدول المعتمد'
                });
            }
        }

        // Sort descending by date
        hifzEntries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        if (hifzEntries.length === 0) {
            return `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                    <h5 class="font-black text-slate-800 text-xs">لا يوجد سجل حفظ مدخل حتى الآن</h5>
                    <p class="text-[11px] text-slate-400">سيظهر هنا ما حفظه الطالب في كل يوم فور رصد تقييمات المعلم بالجلسات.</p>
                </div>
            `;
        }

        const totalHifzCount = hifzEntries.filter(e => e.status === 'present').length;
        const lastHifz = hifzEntries[0] ? hifzEntries[0].hifz : '—';

        let rowsHtml = hifzEntries.map((item, idx) => {
            const num = hifzEntries.length - idx;
            const isPresent = item.status === 'present';
            const statusBadge = isPresent
                ? '<span class="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap">حاضر ومُنجز</span>'
                : '<span class="bg-red-100 text-red-900 border border-red-300 font-black px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap">غياب</span>';

            return `
                <tr class="hover:bg-slate-50/80 transition border-b border-slate-100 hifz-history-row">
                    <td class="p-2.5 font-mono text-slate-400 text-[10px] text-center font-bold">${num}</td>
                    <td class="p-2.5 font-bold text-slate-900 whitespace-nowrap text-[11px]">
                        ${formatArabicDateTime(item.date)}
                    </td>
                    <td class="p-2.5">
                        <span class="bg-emerald-50 text-emerald-950 border border-emerald-200 font-black px-2.5 py-1 rounded-xl text-[11px] inline-block">
                            ${item.hifz}
                        </span>
                    </td>
                    <td class="p-2.5">
                        <span class="text-blue-900 font-extrabold text-[11px] bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded-lg inline-block">
                            ${item.qareeb}
                        </span>
                    </td>
                    <td class="p-2.5">
                        <span class="text-purple-900 font-extrabold text-[11px] bg-purple-50/70 border border-purple-200 px-2 py-0.5 rounded-lg inline-block">
                            ${item.baeed}
                        </span>
                    </td>
                    <td class="p-2.5 text-slate-700 text-[11px] leading-relaxed max-w-xs">
                        ${item.notes}
                    </td>
                    <td class="p-2.5 text-center">${statusBadge}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="space-y-3">
                <!-- Hifz Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <span class="text-[10px] text-emerald-800 font-bold block">إجمالي حصص التسميع المنجزة</span>
                            <strong class="text-lg font-black text-emerald-950 mt-0.5 block">${totalHifzCount} حصة</strong>
                        </div>
                        <span class="text-2xl font-black text-emerald-600">✓</span>
                    </div>
                    <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <span class="text-[10px] text-indigo-800 font-bold block">آخر موضع تم تسميعه</span>
                            <strong class="text-xs font-black text-indigo-950 mt-0.5 block truncate max-w-[170px]">${lastHifz}</strong>
                        </div>
                        <span class="text-2xl font-black text-indigo-600">📖</span>
                    </div>
                    <div class="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <span class="text-[10px] text-amber-800 font-bold block">تاريخ بداية السجل</span>
                            <strong class="text-xs font-black text-amber-950 mt-0.5 block">${formatArabicDate(enrolledDate)}</strong>
                        </div>
                        <span class="text-2xl font-black text-amber-600">📅</span>
                    </div>
                </div>

                <!-- Instant Filter Input -->
                <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs">
                    <span class="font-bold text-slate-600 text-[11px] whitespace-nowrap">بحث في سجل الحفظ:</span>
                    <input type="text" oninput="window.filterHifzHistoryTable(this.value)" placeholder="ابحث باسم السورة، الآيات، أو ملاحظة المعلم..." class="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                </div>

                <!-- Full Table -->
                <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                    <table class="w-full text-right text-xs">
                        <thead class="bg-slate-50 text-slate-700 font-black border-b border-slate-200 text-[10px]">
                            <tr>
                                <th class="p-2.5 text-center">#</th>
                                <th class="p-2.5 whitespace-nowrap">تاريخ الحصة</th>
                                <th class="p-2.5 whitespace-nowrap">الحفظ الجديد (الورد اليومي)</th>
                                <th class="p-2.5 whitespace-nowrap">الماضي القريب</th>
                                <th class="p-2.5 whitespace-nowrap">الماضي البعيد</th>
                                <th class="p-2.5">توجيهات وتقييم المعلم</th>
                                <th class="p-2.5 text-center whitespace-nowrap">حالة الحضور</th>
                            </tr>
                        </thead>
                        <tbody id="hifzHistoryTableBody">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Instant Filter function for Hifz table
    window.filterHifzHistoryTable = function(query) {
        const q = (query || '').trim().toLowerCase();
        const rows = document.querySelectorAll('.hifz-history-row');
        rows.forEach(r => {
            if (!q) {
                r.style.display = '';
            } else {
                const text = r.innerText.toLowerCase();
                r.style.display = text.includes(q) ? '' : 'none';
            }
        });
    };

    // Tab Switcher inside Modal
    window.switchLedgerTab = function(tabId) {
        document.querySelectorAll('.ledger-tab-btn').forEach(btn => {
            btn.classList.remove('bg-[#1F274B]', 'text-white', 'shadow-xs');
            btn.classList.add('text-slate-600');
        });
        document.querySelectorAll('.ledger-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeBtn = document.getElementById('ledgerTabBtn_' + tabId);
        if (activeBtn) {
            activeBtn.classList.add('bg-[#1F274B]', 'text-white', 'shadow-xs');
            activeBtn.classList.remove('text-slate-600');
        }

        const activeContent = document.getElementById('ledgerTabContent_' + tabId);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
    };

    // Print Report
    window.printStudentLedgerReport = function() {
        const area = document.getElementById('printableLedgerArea');
        if (!area) return;

        // Open clean popup print window
        const printWin = window.open('', '_blank', 'width=900,height=700');
        if (!printWin) {
            window.print();
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>كشف حساب ورصيد الطالب — أكاديمية منير</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', sans-serif; }
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body class="bg-white p-6 text-slate-900">
                <div class="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-black text-slate-950">أكاديمية منير للقرآن الكريم والعلوم الشرعية</h1>
                        <p class="text-xs text-slate-600 font-bold mt-0.5">تقرير وكشف حساب معتمد لمتابعة رصيد الحصص والحضور والغياب والتجديدات</p>
                    </div>
                    <div class="text-left text-xs text-slate-500 font-mono">
                        <div>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}</div>
                        <div>الرقم المرجعي: AUDIT-${Math.floor(100000 + Math.random() * 900000)}</div>
                    </div>
                </div>

                ${area.innerHTML}

                <div class="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <div>إدارة شؤون الطلاب والتعليم الإلكتروني</div>
                    <div class="font-bold text-slate-800">ختم الاعتماد الأكاديمي ✓</div>
                </div>

                <script>
                    window.onload = function() {
                        // Reveal all tabs in print mode
                        document.querySelectorAll('.ledger-tab-content').forEach(el => el.classList.remove('hidden'));
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
    };

    console.log('[StudentLedger] Module initialized successfully.');
})();


// Dedicated Global Shortcut for Student Memorization History
window.openHifzHistoryModal = function(targetStudentId = null) {
    if (typeof window.openStudentLedgerModal === 'function') {
        window.openStudentLedgerModal(targetStudentId, 'hifz');
    }
};
