// Mounir Academy — Central Live Video & Meet Group Manager (v4.0 Google Meet Multi-Teacher Integration)
(function() {
    const STORAGE_KEY = 'monir_group_meet_links';

    // Official Teacher Google Meet Registry (45+ Confirmed Teachers)
    window.TEACHER_MEET_LINKS = {
        "52": "https://meet.google.com/qht-yoey-tpu",
        "محمد عاشور": "https://meet.google.com/qht-yoey-tpu",
        "51": "https://meet.google.com/fgk-pyvj-ipo",
        "محمد احمد محمود": "https://meet.google.com/fgk-pyvj-ipo",
        "65": "https://meet.google.com/ibo-ejpc-evq",
        "مصطفى محمد علام": "https://meet.google.com/ibo-ejpc-evq",
        "مصطفى علام": "https://meet.google.com/ibo-ejpc-evq",
        "9": "https://meet.google.com/ryf-qber-qui",
        "احمد حميد": "https://meet.google.com/ryf-qber-qui",
        "38": "https://meet.google.com/tqm-omcp-ftq",
        "عبدالرحمن سعيد": "https://meet.google.com/tqm-omcp-ftq",
        "59": "https://meet.google.com/gxt-jqac-aez",
        "محمود عبد المحسن": "https://meet.google.com/gxt-jqac-aez",
        "27": "https://meet.google.com/rpu-stjc-gqr",
        "حبيبة عاشور": "https://meet.google.com/rpu-stjc-gqr",
        "2": "https://meet.google.com/inn-ghui-roh",
        "أحمد طارق": "https://meet.google.com/inn-ghui-roh",
        "احمد طارق": "https://meet.google.com/inn-ghui-roh",
        "37": "https://meet.google.com/tcs-arvf-sjh",
        "عبدالرحمن أحمد مختار": "https://meet.google.com/tcs-arvf-sjh",
        "عبدالرحمن مختار": "https://meet.google.com/tcs-arvf-sjh",
        "72": "https://meet.google.com/kkc-qtxu-vdk",
        "هند مسعود": "https://meet.google.com/kkc-qtxu-vdk",
        "32": "https://meet.google.com/gui-hwed-sdc",
        "دعاء محمد": "https://meet.google.com/gui-hwed-sdc",
        "62": "https://meet.google.com/uoj-nfoa-hvr",
        "مصطفى سليمان": "https://meet.google.com/uoj-nfoa-hvr",
        "12": "https://meet.google.com/xnz-idom-cmd",
        "T012": "https://meet.google.com/xnz-idom-cmd",
        "احمد سيد احمد": "https://meet.google.com/xnz-idom-cmd",
        "أحمد سيد أحمد": "https://meet.google.com/xnz-idom-cmd",
        "احمد السيد": "https://meet.google.com/xnz-idom-cmd",
        "أحمد السيد": "https://meet.google.com/xnz-idom-cmd",
        "احمد سيد": "https://meet.google.com/xnz-idom-cmd",
        "أحمد سيد": "https://meet.google.com/xnz-idom-cmd",
        "46": "https://meet.google.com/zmf-qsvb-sxw",
        "عمر امام": "https://meet.google.com/zmf-qsvb-sxw",
        "عمر أمام": "https://meet.google.com/zmf-qsvb-sxw",
        "47": "https://meet.google.com/wzq-uhsd-dwh",
        "عمر حسين": "https://meet.google.com/wzq-uhsd-dwh",
        "أ. عمر حسين": "https://meet.google.com/wzq-uhsd-dwh",
        "الشيخ عمر حسين": "https://meet.google.com/wzq-uhsd-dwh",
        "75": "https://meet.google.com/nvi-nvfw-gbu",
        "يوسف سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "يوسف أحمد محمد سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "يوسف احمد محمد سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "يوسف أحمد سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "يوسف احمد سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "أ. يوسف سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "الشيخ يوسف سلام": "https://meet.google.com/nvi-nvfw-gbu",
        "55": "https://meet.google.com/gwt-pvko-pju",
        "محمد محمود المزين": "https://meet.google.com/gwt-pvko-pju",
        "35": "https://meet.google.com/boz-jqry-dzc",
        "ساره احمد": "https://meet.google.com/boz-jqry-dzc",
        "سارة احمد": "https://meet.google.com/boz-jqry-dzc",
        "1": "https://meet.google.com/zqy-fjbv-bpb",
        "أبو بكر": "https://meet.google.com/zqy-fjbv-bpb",
        "ابو بكر": "https://meet.google.com/zqy-fjbv-bpb",
        "29": "https://meet.google.com/oiq-sxpo-ojh",
        "حنان": "https://meet.google.com/oiq-sxpo-ojh",
        "45": "https://meet.google.com/irm-tiiw-quh",
        "عمار محمد": "https://meet.google.com/irm-tiiw-quh",
        "40": "https://meet.google.com/say-iwww-vdz",
        "عبدالرحمن وائل": "https://meet.google.com/say-iwww-vdz",
        "6": "https://meet.google.com/rdk-uzqh-kux",
        "إبراهيم محمد إبراهيم": "https://meet.google.com/rdk-uzqh-kux",
        "ابراهيم محمد ابراهيم": "https://meet.google.com/rdk-uzqh-kux",
        "50": "https://meet.google.com/fkh-poip-owd",
        "فاطمه مدكور": "https://meet.google.com/fkh-poip-owd",
        "فاطمة مدكور": "https://meet.google.com/fkh-poip-owd",
        "33": "https://meet.google.com/tuj-gccw-bvf",
        "رؤى اسماعيل": "https://meet.google.com/tuj-gccw-bvf",
        "رؤي": "https://meet.google.com/tuj-gccw-bvf",
        "58": "https://meet.google.com/ker-dgrd-uww",
        "محمود حمادة": "https://meet.google.com/ker-dgrd-uww",
        "محمود حماد": "https://meet.google.com/ker-dgrd-uww",
        "5": "https://meet.google.com/apa-gghv-fjp",
        "أسماء علي": "https://meet.google.com/apa-gghv-fjp",
        "اسماء": "https://meet.google.com/apa-gghv-fjp",
        "34": "https://meet.google.com/ndj-xxmh-qux",
        "روضة": "https://meet.google.com/ndj-xxmh-qux",
        "17": "https://meet.google.com/xpv-igai-hty",
        "امنية سعيد شعبان": "https://meet.google.com/xpv-igai-hty",
        "أمنية سعيد": "https://meet.google.com/xpv-igai-hty",
        "49": "https://meet.google.com/fdo-knot-aqj",
        "عمر فتحي": "https://meet.google.com/fdo-knot-aqj",
        "54": "https://meet.google.com/nnn-bcpx-ibf",
        "محمد مبروك الشامي": "https://meet.google.com/nnn-bcpx-ibf",
        "محمد مبروك": "https://meet.google.com/nnn-bcpx-ibf",
        "36": "https://meet.google.com/mux-tvsd-sno",
        "عبد الرحيم": "https://meet.google.com/mux-tvsd-sno",
        "عبدالرحيم": "https://meet.google.com/mux-tvsd-sno",
        "28": "https://meet.google.com/rns-inev-mqz",
        "حمزه العدوي": "https://meet.google.com/rns-inev-mqz",
        "حمزة العدوي": "https://meet.google.com/rns-inev-mqz",
        "أ. حمزه العدوي": "https://meet.google.com/rns-inev-mqz",
        "أ. حمزة العدوي": "https://meet.google.com/rns-inev-mqz",
        "61": "https://meet.google.com/ewy-njwm-dyo",
        "مريم حسن": "https://meet.google.com/ewy-njwm-dyo",
        "43": "https://meet.google.com/pxw-upui-xxj",
        "علي احمد": "https://meet.google.com/pxw-upui-xxj",
        "39": "https://meet.google.com/ptk-nwez-cpr",
        "عبدالرحمن سلامة": "https://meet.google.com/ptk-nwez-cpr",
        "عبدالرحمن سلامه": "https://meet.google.com/ptk-nwez-cpr",
        "14": "https://meet.google.com/bxc-uasz-rsb",
        "اسامة محمد": "https://meet.google.com/bxc-uasz-rsb",
        "أسامة محمد": "https://meet.google.com/bxc-uasz-rsb",
        "26": "https://meet.google.com/bto-bmbw-bnc",
        "حبيبة ابراهيم": "https://meet.google.com/bto-bmbw-bnc",
        "76": "https://meet.google.com/buo-obbv-sas",
        "يوسف محمد": "https://meet.google.com/buo-obbv-sas",
        "4": "https://meet.google.com/hpa-ndnt-msg",
        "أسامة ضلام": "https://meet.google.com/hpa-ndnt-msg",
        "63": "https://meet.google.com/vkp-wdxc-djk",
        "مصطفى شعبان  سليمان": "https://meet.google.com/vkp-wdxc-djk",
        "مصطفى شعبان سليمان": "https://meet.google.com/vkp-wdxc-djk",
        "19": "https://meet.google.com/jvm-hvxr-irb",
        "ايه عباس": "https://meet.google.com/jvm-hvxr-irb",
        "اية عباس": "https://meet.google.com/jvm-hvxr-irb",
        "70": "https://meet.google.com/cty-azes-pdf",
        "نادين": "https://meet.google.com/cty-azes-pdf",
        "23": "https://meet.google.com/wco-bpag-yra",
        "جنة علام": "https://meet.google.com/wco-bpag-yra",
        "جنه علام": "https://meet.google.com/wco-bpag-yra",
        "25": "https://meet.google.com/xmr-mzmn-gar",
        "جهاد مجدي": "https://meet.google.com/xmr-mzmn-gar",
        "18": "https://meet.google.com/nuz-nosx-qpr",
        "ايمان": "https://meet.google.com/nuz-nosx-qpr",
        "8": "https://meet.google.com/ppv-izmg-gzx",
        "ابراهيم محمد": "https://meet.google.com/ppv-izmg-gzx",
        "منة محمد": "https://meet.google.com/bcc-xdpm-emz",
        "منة الله": "https://meet.google.com/bcc-xdpm-emz",
        "69": "https://meet.google.com/bcc-xdpm-emz",
        "أحمد السيد": "https://meet.google.com/xnz-idom-cmd",
        "عبد الرحمن مختار": "https://meet.google.com/tcs-arvf-sjh",
        "أسماء": "https://meet.google.com/apa-gghv-fjp",
        "رؤى": "https://meet.google.com/tuj-gccw-bvf",
        "امنية سعيد": "https://meet.google.com/xpv-igai-hty",
        "10": "https://meet.google.com/eyx-qdbi-kus",
        "احمد خالد": "https://meet.google.com/eyx-qdbi-kus",
        "أحمد خالد": "https://meet.google.com/eyx-qdbi-kus",
        "11": "https://meet.google.com/igc-bqto-nih",
        "احمد سلطان": "https://meet.google.com/igc-bqto-nih",
        "أحمد سلطان": "https://meet.google.com/igc-bqto-nih",
        "13": "https://meet.google.com/fue-nphe-xhp",
        "احمد عصام": "https://meet.google.com/fue-nphe-xhp",
        "أحمد عصام": "https://meet.google.com/fue-nphe-xhp",
        "20": "https://meet.google.com/zza-nybg-yvz",
        "بسام الاسد": "https://meet.google.com/zza-nybg-yvz",
        "بسام الأسد": "https://meet.google.com/zza-nybg-yvz",
        "21": "https://meet.google.com/zqo-ygnf-fwt",
        "بلال": "https://meet.google.com/zqo-ygnf-fwt",
        "22": "https://meet.google.com/xbb-mkzs-zzi",
        "تسنيم": "https://meet.google.com/xbb-mkzs-zzi",
        "24": "https://meet.google.com/vog-zkia-tez",
        "جهاد صابر": "https://meet.google.com/vog-zkia-tez",
        "30": "https://meet.google.com/ivj-wfzi-qmf",
        "خالد عثمان": "https://meet.google.com/ivj-wfzi-qmf",
        "53": "https://meet.google.com/kpt-vkco-dec",
        "محمد عبد المنعم": "https://meet.google.com/kpt-vkco-dec",
        "محمد عبدالمنعم": "https://meet.google.com/kpt-vkco-dec",
        "56": "https://meet.google.com/rvo-daxt-rzi",
        "محمد مصطفى زهران": "https://meet.google.com/rvo-daxt-rzi",
        "محمد مصطفي زهران": "https://meet.google.com/rvo-daxt-rzi",
        "64": "https://meet.google.com/wbs-nxao-iuk",
        "مصطفى عيد": "https://meet.google.com/wbs-nxao-iuk",
        "مصطفي عيد": "https://meet.google.com/wbs-nxao-iuk",
        "66": "https://meet.google.com/fdf-geoo-ngp",
        "مصطفي مجدي": "https://meet.google.com/fdf-geoo-ngp",
        "مصطفى مجدي": "https://meet.google.com/fdf-geoo-ngp",
        "67": "https://meet.google.com/qkg-fezs-sct",
        "معاذ المنصوري": "https://meet.google.com/qkg-fezs-sct",
        "71": "https://meet.google.com/ouj-fzon-vgv",
        "هشام وهيب": "https://meet.google.com/ouj-fzon-vgv",
        "73": "https://meet.google.com/ygz-yjkh-avf",
        "ولاء حمدي": "https://meet.google.com/ygz-yjkh-avf",
        "41": "https://meet.google.com/uvg-ofnu-ebv",
        "T041": "https://meet.google.com/uvg-ofnu-ebv",
        "عبدالرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "عبد الرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "أ. عبدالرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "أ. عبد الرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "الشيخ عبدالرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "الشيخ عبد الرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "استاذ عبدالرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "أستاذ عبدالرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "أستاذ عبد الرحمن وليد": "https://meet.google.com/uvg-ofnu-ebv",
        "T-001": "https://meet.google.com/zqy-fjbv-bpb",
        "T001": "https://meet.google.com/zqy-fjbv-bpb",
        "T-002": "https://meet.google.com/zmf-qsvb-sxw",
        "T002": "https://meet.google.com/zmf-qsvb-sxw",
        "T-003": "https://meet.google.com/qht-yoey-tpu",
        "T003": "https://meet.google.com/qht-yoey-tpu",
        "T-004": "https://meet.google.com/jvm-hvxr-irb",
        "T004": "https://meet.google.com/jvm-hvxr-irb",
        "T-005": "https://meet.google.com/tcs-arvf-sjh",
        "T005": "https://meet.google.com/tcs-arvf-sjh",
        "عبدالرحمن احمد مختار": "https://meet.google.com/tcs-arvf-sjh",
        "T-006": "https://meet.google.com/rpu-stjc-gqr",
        "T006": "https://meet.google.com/rpu-stjc-gqr",
        "حبيبه عاشور": "https://meet.google.com/rpu-stjc-gqr",
        "T-007": "https://meet.google.com/gxt-jqac-aez",
        "T007": "https://meet.google.com/gxt-jqac-aez",
        "T-008": "https://meet.google.com/ptk-nwez-cpr",
        "T008": "https://meet.google.com/ptk-nwez-cpr",
        "T-010": "https://meet.google.com/kkc-qtxu-vdk",
        "T010": "https://meet.google.com/kkc-qtxu-vdk",
        "T-011": "https://meet.google.com/nuz-nosx-qpr",
        "T011": "https://meet.google.com/nuz-nosx-qpr",
        "T-012": "https://meet.google.com/tqm-omcp-ftq",
        "T-013": "https://meet.google.com/ndj-xxmh-qux",
        "T013": "https://meet.google.com/ndj-xxmh-qux",
        "روضه": "https://meet.google.com/ndj-xxmh-qux",
        "T-014": "https://meet.google.com/wco-bpag-yra",
        "T014": "https://meet.google.com/wco-bpag-yra",
        "T-015": "https://meet.google.com/ker-dgrd-uww",
        "T015": "https://meet.google.com/ker-dgrd-uww",
        "T-016": "https://meet.google.com/gui-hwed-sdc",
        "T016": "https://meet.google.com/gui-hwed-sdc",
        "T-017": "https://meet.google.com/bxc-uasz-rsb",
        "T017": "https://meet.google.com/bxc-uasz-rsb",
        "اسامه محمد": "https://meet.google.com/bxc-uasz-rsb",
        "T-018": "https://meet.google.com/xmr-mzmn-gar",
        "T018": "https://meet.google.com/xmr-mzmn-gar",
        "T-019": "https://meet.google.com/igc-bqto-nih",
        "T019": "https://meet.google.com/igc-bqto-nih",
        "T-020": "https://meet.google.com/apa-gghv-fjp",
        "T020": "https://meet.google.com/apa-gghv-fjp",
        "اسماء علي": "https://meet.google.com/apa-gghv-fjp",
        "T-021": "https://meet.google.com/cty-azes-pdf",
        "T021": "https://meet.google.com/cty-azes-pdf",
        "T-022": "https://meet.google.com/eqi-eori-cfn",
        "T022": "https://meet.google.com/eqi-eori-cfn",
        "محمود عرام": "https://meet.google.com/eqi-eori-cfn",
        "T-023": "https://meet.google.com/xbb-mkzs-zzi",
        "T023": "https://meet.google.com/xbb-mkzs-zzi",
        "T-024": "https://meet.google.com/bto-bmbw-bnc",
        "T024": "https://meet.google.com/bto-bmbw-bnc",
        "حبيبه ابراهيم": "https://meet.google.com/bto-bmbw-bnc",
        "T-025": "https://meet.google.com/ppv-izmg-gzx",
        "T025": "https://meet.google.com/ppv-izmg-gzx",
        "T-026": "https://meet.google.com/irm-tiiw-quh",
        "T026": "https://meet.google.com/irm-tiiw-quh",
        "T-027": "https://meet.google.com/xnz-idom-cmd",
        "T027": "https://meet.google.com/xnz-idom-cmd",
        "T-028": "https://meet.google.com/boz-jqry-dzc",
        "T028": "https://meet.google.com/boz-jqry-dzc",
        "T-029": "https://meet.google.com/oiq-sxpo-ojh",
        "T029": "https://meet.google.com/oiq-sxpo-ojh",
        "T-030": "https://meet.google.com/eyx-qdbi-kus",
        "T030": "https://meet.google.com/eyx-qdbi-kus",
        "T-031": "https://meet.google.com/buo-obbv-sas",
        "T031": "https://meet.google.com/buo-obbv-sas",
        "T-032": "https://meet.google.com/ryf-qber-qui",
        "T032": "https://meet.google.com/ryf-qber-qui",
        "T-033": "https://meet.google.com/qpe-zyzm-mij",
        "T033": "https://meet.google.com/qpe-zyzm-mij",
        "عبدالله محمد السعيد": "https://meet.google.com/qpe-zyzm-mij",
        "T-034": "https://meet.google.com/bcc-xdpm-emz",
        "T034": "https://meet.google.com/bcc-xdpm-emz",
        "منه الله": "https://meet.google.com/bcc-xdpm-emz",
        "T-035": "https://meet.google.com/ouj-fzon-vgv",
        "T035": "https://meet.google.com/ouj-fzon-vgv",
        "T-036": "https://meet.google.com/fdo-knot-aqj",
        "T036": "https://meet.google.com/fdo-knot-aqj",
        "T-037": "https://meet.google.com/inn-ghui-roh",
        "T037": "https://meet.google.com/inn-ghui-roh",
        "T-038": "https://meet.google.com/fue-nphe-xhp",
        "T038": "https://meet.google.com/fue-nphe-xhp",
        "T-039": "https://meet.google.com/etx-frjk-vzs",
        "T039": "https://meet.google.com/etx-frjk-vzs",
        "يحيى": "https://meet.google.com/etx-frjk-vzs",
        "T-040": "https://meet.google.com/rns-inev-mqz",
        "T040": "https://meet.google.com/rns-inev-mqz",
        "T-041": "https://meet.google.com/uei-iaqm-edg",
        "امنية ابراهيم": "https://meet.google.com/uei-iaqm-edg",
        "امنيه ابراهيم": "https://meet.google.com/uei-iaqm-edg",
        "T-042": "https://meet.google.com/zza-nybg-yvz",
        "T042": "https://meet.google.com/zza-nybg-yvz",
        "T-043": "https://meet.google.com/fgk-pyvj-ipo",
        "T043": "https://meet.google.com/fgk-pyvj-ipo",
        "T-044": "https://meet.google.com/nnn-bcpx-ibf",
        "T044": "https://meet.google.com/nnn-bcpx-ibf",
        "T-045": "https://meet.google.com/nvi-nvfw-gbu",
        "T045": "https://meet.google.com/nvi-nvfw-gbu",
        "T-046": "https://meet.google.com/rdk-uzqh-kux",
        "T046": "https://meet.google.com/rdk-uzqh-kux",
        "T-047": "https://meet.google.com/fkh-poip-owd",
        "T047": "https://meet.google.com/fkh-poip-owd",
        "T-048": "https://meet.google.com/agd-ster-ffe",
        "T048": "https://meet.google.com/agd-ster-ffe",
        "اماني": "https://meet.google.com/agd-ster-ffe",
        "T-049": "https://meet.google.com/wzq-uhsd-dwh",
        "T049": "https://meet.google.com/wzq-uhsd-dwh",
        "T-050": "https://meet.google.com/zbp-uyvk-een",
        "T050": "https://meet.google.com/zbp-uyvk-een",
        "محمود اشرف": "https://meet.google.com/zbp-uyvk-een",
        "T-051": "https://meet.google.com/rvo-daxt-rzi",
        "T051": "https://meet.google.com/rvo-daxt-rzi",
        "T-053": "https://meet.google.com/gwt-pvko-pju",
        "T053": "https://meet.google.com/gwt-pvko-pju",
        "T-054": "https://meet.google.com/tuj-gccw-bvf",
        "T054": "https://meet.google.com/tuj-gccw-bvf",
        "T-055": "https://meet.google.com/zqo-ygnf-fwt",
        "T055": "https://meet.google.com/zqo-ygnf-fwt",
        "T-057": "https://meet.google.com/wbs-nxao-iuk",
        "T057": "https://meet.google.com/wbs-nxao-iuk",
        "T-058": "https://meet.google.com/yjo-vdqi-edx",
        "T058": "https://meet.google.com/yjo-vdqi-edx",
        "عمر عبادة": "https://meet.google.com/yjo-vdqi-edx",
        "عمر عباده": "https://meet.google.com/yjo-vdqi-edx",
        "T-059": "https://meet.google.com/uoj-nfoa-hvr",
        "T059": "https://meet.google.com/uoj-nfoa-hvr",
        "T-060": "https://meet.google.com/vkp-wdxc-djk",
        "T060": "https://meet.google.com/vkp-wdxc-djk",
        "T-061": "https://meet.google.com/say-iwww-vdz",
        "T061": "https://meet.google.com/say-iwww-vdz",
        "T-062": "https://meet.google.com/fdf-geoo-ngp",
        "T062": "https://meet.google.com/fdf-geoo-ngp",
        "T-064": "https://meet.google.com/qkg-fezs-sct",
        "T064": "https://meet.google.com/qkg-fezs-sct",
        "T-065": "https://meet.google.com/ivj-wfzi-qmf",
        "T065": "https://meet.google.com/ivj-wfzi-qmf",
        "T-067": "https://meet.google.com/evq-ytra-zqg",
        "T067": "https://meet.google.com/evq-ytra-zqg",
        "احمد محمد سالم": "https://meet.google.com/evq-ytra-zqg",
        "T-069": "https://meet.google.com/ibo-ejpc-evq",
        "T069": "https://meet.google.com/ibo-ejpc-evq",
        "T-070": "https://meet.google.com/vog-zkia-tez",
        "T070": "https://meet.google.com/vog-zkia-tez",
        "T-071": "https://meet.google.com/kpt-vkco-dec",
        "T071": "https://meet.google.com/kpt-vkco-dec",
        "T-072": "https://meet.google.com/ygz-yjkh-avf",
        "T072": "https://meet.google.com/ygz-yjkh-avf",
        "T-073": "https://meet.google.com/uvg-ofnu-ebv",
        "T073": "https://meet.google.com/uvg-ofnu-ebv",
        "T-080": "https://meet.google.com/pxw-upui-xxj",
        "T080": "https://meet.google.com/pxw-upui-xxj",
        "T-126": "https://meet.google.com/xpv-igai-hty",
        "T126": "https://meet.google.com/xpv-igai-hty",
        "امنيه سعيد شعبان": "https://meet.google.com/xpv-igai-hty",
        "T-127": "https://meet.google.com/ntk-debc-jba",
        "T127": "https://meet.google.com/ntk-debc-jba",
        "خالد فرج": "https://meet.google.com/ntk-debc-jba",
        "T-128": "https://meet.google.com/ewy-njwm-dyo",
        "T128": "https://meet.google.com/ewy-njwm-dyo",
        "T-129": "https://meet.google.com/hpa-ndnt-msg",
        "T129": "https://meet.google.com/hpa-ndnt-msg",
        "اسامة ضلام": "https://meet.google.com/hpa-ndnt-msg",
        "أسامه ضلام": "https://meet.google.com/hpa-ndnt-msg",
    };

    // Teachers currently on leave (الأحمر في الشيت: معلمين في إجازة حالياً)
    window.TEACHERS_ON_LEAVE = [
        '3', 'أحمد محمد أحمد',
        '7', 'إسلام شريف',
        '42', 'عبدالله محمد السعيد',
        '44', 'علي فراج',
        '60', 'محمود عرام',
        '74', 'يحيى',
        '77', 'عبدالله ممدوح'
    ];


    // Official Group to Meet Mapping (257 Groups belonging to all configured Teachers)
    const OFFICIAL_GROUP_MEET_LINKS = {
        // Tajweed Official Zoom Meeting
        "CMP-T01": "https://zoom.us/j/98264506630",
        "CMP-H01": "https://zoom.us/j/98264506630",
        "CMP-F01": "https://zoom.us/j/98264506630",
        "CMP-TAJWEED": "https://zoom.us/j/98264506630",
        "CMP-HADITH": "https://zoom.us/j/98264506630",
        "CMP-TAFSIR": "https://zoom.us/j/98264506630",
        "CMP-TAJWEED": "https://zoom.us/j/98264506630",
        "TAJWEED": "https://zoom.us/j/98264506630",
        "مسار أحكام التجويد ومخارج الحروف": "https://zoom.us/j/98264506630",
        "أحكام التجويد ومخارج الحروف": "https://zoom.us/j/98264506630",
        "التجويد": "https://zoom.us/j/98264506630",
        // تسنيم (ID 22)
        "G019": "https://meet.google.com/xbb-mkzs-zzi",
        "G029": "https://meet.google.com/xbb-mkzs-zzi",
        "G235": "https://meet.google.com/xbb-mkzs-zzi",
        // احمد سلطان (ID 11)
        "G093": "https://meet.google.com/igc-bqto-nih",
        "G124": "https://meet.google.com/igc-bqto-nih",
        "G126": "https://meet.google.com/igc-bqto-nih",
        "G205": "https://meet.google.com/igc-bqto-nih",
        "G206": "https://meet.google.com/igc-bqto-nih",
        "G374": "https://meet.google.com/igc-bqto-nih",
        "G376": "https://meet.google.com/igc-bqto-nih",
        "G399": "https://meet.google.com/igc-bqto-nih",
        // هشام وهيب (ID 71)
        "G120": "https://meet.google.com/ouj-fzon-vgv",
        "G216": "https://meet.google.com/ouj-fzon-vgv",
        "G236": "https://meet.google.com/ouj-fzon-vgv",
        // احمد خالد (ID 10)
        "G134": "https://meet.google.com/eyx-qdbi-kus",
        "G221": "https://meet.google.com/eyx-qdbi-kus",
        "G241": "https://meet.google.com/eyx-qdbi-kus",
        "G279": "https://meet.google.com/eyx-qdbi-kus",
        "G385": "https://meet.google.com/eyx-qdbi-kus",
        "G418": "https://meet.google.com/eyx-qdbi-kus",
        "G432": "https://meet.google.com/eyx-qdbi-kus",
        // بسام الاسد (ID 20)
        "G146": "https://meet.google.com/zza-nybg-yvz",
        "G156": "https://meet.google.com/zza-nybg-yvz",
        "G262": "https://meet.google.com/zza-nybg-yvz",
        // مصطفى عيد (ID 64)
        "G175": "https://meet.google.com/wbs-nxao-iuk",
        "G383": "https://meet.google.com/wbs-nxao-iuk",
        "G392": "https://meet.google.com/wbs-nxao-iuk",
        "G403": "https://meet.google.com/wbs-nxao-iuk",
        "G414": "https://meet.google.com/wbs-nxao-iuk",
        // مصطفي مجدي (ID 66)
        "G181": "https://meet.google.com/fdf-geoo-ngp",
        // احمد عصام (ID 13)
        "G202": "https://meet.google.com/fue-nphe-xhp",
        "G295": "https://meet.google.com/fue-nphe-xhp",
        "G313": "https://meet.google.com/fue-nphe-xhp",
        "G334": "https://meet.google.com/fue-nphe-xhp",
        "G380": "https://meet.google.com/fue-nphe-xhp",
        // معاذ المنصوري (ID 67)
        "G248": "https://meet.google.com/qkg-fezs-sct",
        // محمد مصطفى زهران (ID 56)
        "G308": "https://meet.google.com/rvo-daxt-rzi",
        "G317": "https://meet.google.com/rvo-daxt-rzi",
        // خالد عثمان (ID 30)
        "G325": "https://meet.google.com/ivj-wfzi-qmf",
        // بلال (ID 21)
        "G377": "https://meet.google.com/zqo-ygnf-fwt",
        "G404": "https://meet.google.com/zqo-ygnf-fwt",
        // جهاد صابر (ID 24)
        "G411": "https://meet.google.com/vog-zkia-tez",
        "G433": "https://meet.google.com/vog-zkia-tez",
        "G434": "https://meet.google.com/vog-zkia-tez",
        // ولاء حمدي (ID 73)
        "G429": "https://meet.google.com/ygz-yjkh-avf",
        "G431": "https://meet.google.com/ygz-yjkh-avf",
        "G044": "https://meet.google.com/qht-yoey-tpu",
        "G140": "https://meet.google.com/qht-yoey-tpu",
        "G141": "https://meet.google.com/qht-yoey-tpu",
        "G154": "https://meet.google.com/qht-yoey-tpu",
        "G161": "https://meet.google.com/qht-yoey-tpu",
        "G178": "https://meet.google.com/qht-yoey-tpu",
        "G238": "https://meet.google.com/qht-yoey-tpu",
        "G256": "https://meet.google.com/qht-yoey-tpu",
        "G272": "https://meet.google.com/qht-yoey-tpu",
        "G287": "https://meet.google.com/qht-yoey-tpu",
        "G331": "https://meet.google.com/qht-yoey-tpu",
        "G426": "https://meet.google.com/qht-yoey-tpu",
        "G110": "https://meet.google.com/fgk-pyvj-ipo",
        "G173": "https://meet.google.com/fgk-pyvj-ipo",
        "G422": "https://meet.google.com/fgk-pyvj-ipo",
        "G314": "https://meet.google.com/ibo-ejpc-evq",
        "G053": "https://meet.google.com/ryf-qber-qui",
        "G068": "https://meet.google.com/ryf-qber-qui",
        "G270": "https://meet.google.com/ryf-qber-qui",
        "G364": "https://meet.google.com/ryf-qber-qui",
        "G398": "https://meet.google.com/ryf-qber-qui",
        "G022": "https://meet.google.com/tqm-omcp-ftq",
        "G036": "https://meet.google.com/tqm-omcp-ftq",
        "G150": "https://meet.google.com/tqm-omcp-ftq",
        "G157": "https://meet.google.com/tqm-omcp-ftq",
        "G199": "https://meet.google.com/tqm-omcp-ftq",
        "G343": "https://meet.google.com/tqm-omcp-ftq",
        "G371": "https://meet.google.com/tqm-omcp-ftq",
        "G096": "https://meet.google.com/gxt-jqac-aez",
        "G106": "https://meet.google.com/gxt-jqac-aez",
        "G112": "https://meet.google.com/gxt-jqac-aez",
        "G166": "https://meet.google.com/gxt-jqac-aez",
        "G277": "https://meet.google.com/gxt-jqac-aez",
        "G282": "https://meet.google.com/gxt-jqac-aez",
        "G288": "https://meet.google.com/gxt-jqac-aez",
        "G356": "https://meet.google.com/gxt-jqac-aez",
        "G032": "https://meet.google.com/rpu-stjc-gqr",
        "G042": "https://meet.google.com/rpu-stjc-gqr",
        "G091": "https://meet.google.com/rpu-stjc-gqr",
        "G101": "https://meet.google.com/rpu-stjc-gqr",
        "G109": "https://meet.google.com/rpu-stjc-gqr",
        "G137": "https://meet.google.com/rpu-stjc-gqr",
        "G164": "https://meet.google.com/rpu-stjc-gqr",
        "G179": "https://meet.google.com/rpu-stjc-gqr",
        "G193": "https://meet.google.com/rpu-stjc-gqr",
        "G033": "https://meet.google.com/inn-ghui-roh",
        "G078": "https://meet.google.com/inn-ghui-roh",
        "G244": "https://meet.google.com/inn-ghui-roh",
        "G011": "https://meet.google.com/tcs-arvf-sjh",
        "G052": "https://meet.google.com/tcs-arvf-sjh",
        "G132": "https://meet.google.com/tcs-arvf-sjh",
        "G135": "https://meet.google.com/tcs-arvf-sjh",
        "G145": "https://meet.google.com/tcs-arvf-sjh",
        "G162": "https://meet.google.com/tcs-arvf-sjh",
        "G170": "https://meet.google.com/tcs-arvf-sjh",
        "G210": "https://meet.google.com/tcs-arvf-sjh",
        "G316": "https://meet.google.com/tcs-arvf-sjh",
        "G386": "https://meet.google.com/tcs-arvf-sjh",
        "G018": "https://meet.google.com/kkc-qtxu-vdk",
        "G108": "https://meet.google.com/kkc-qtxu-vdk",
        "G125": "https://meet.google.com/kkc-qtxu-vdk",
        "G191": "https://meet.google.com/kkc-qtxu-vdk",
        "G198": "https://meet.google.com/kkc-qtxu-vdk",
        "G226": "https://meet.google.com/kkc-qtxu-vdk",
        "G252": "https://meet.google.com/kkc-qtxu-vdk",
        "G275": "https://meet.google.com/kkc-qtxu-vdk",
        "G133": "https://meet.google.com/gui-hwed-sdc",
        "G172": "https://meet.google.com/gui-hwed-sdc",
        "G350": "https://meet.google.com/gui-hwed-sdc",
        "G372": "https://meet.google.com/gui-hwed-sdc",
        "G306": "https://meet.google.com/uoj-nfoa-hvr",
        "G190": "https://meet.google.com/xnz-idom-cmd",
        "G307": "https://meet.google.com/xnz-idom-cmd",
        "G311": "https://meet.google.com/xnz-idom-cmd",
        "G346": "https://meet.google.com/xnz-idom-cmd",
        "G347": "https://meet.google.com/xnz-idom-cmd",
        "G360": "https://meet.google.com/xnz-idom-cmd",
        "G008": "https://meet.google.com/zmf-qsvb-sxw",
        "G026": "https://meet.google.com/zmf-qsvb-sxw",
        "G054": "https://meet.google.com/zmf-qsvb-sxw",
        "G055": "https://meet.google.com/zmf-qsvb-sxw",
        "G074": "https://meet.google.com/zmf-qsvb-sxw",
        "G099": "https://meet.google.com/zmf-qsvb-sxw",
        "G105": "https://meet.google.com/zmf-qsvb-sxw",
        "G131": "https://meet.google.com/zmf-qsvb-sxw",
        "G165": "https://meet.google.com/zmf-qsvb-sxw",
        "G185": "https://meet.google.com/zmf-qsvb-sxw",
        "G192": "https://meet.google.com/zmf-qsvb-sxw",
        "G223": "https://meet.google.com/zmf-qsvb-sxw",
        "G291": "https://meet.google.com/zmf-qsvb-sxw",
        "G338": "https://meet.google.com/zmf-qsvb-sxw",
        "G382": "https://meet.google.com/zmf-qsvb-sxw",
        "G420": "https://meet.google.com/zmf-qsvb-sxw",
        "G428": "https://meet.google.com/zmf-qsvb-sxw",
        "G312": "https://meet.google.com/gwt-pvko-pju",
        "G324": "https://meet.google.com/gwt-pvko-pju",
        "G025": "https://meet.google.com/boz-jqry-dzc",
        "G121": "https://meet.google.com/boz-jqry-dzc",
        "G342": "https://meet.google.com/boz-jqry-dzc",
        "G": "https://meet.google.com/zqy-fjbv-bpb",
        "G015": "https://meet.google.com/zqy-fjbv-bpb",
        "G034": "https://meet.google.com/zqy-fjbv-bpb",
        "G039": "https://meet.google.com/zqy-fjbv-bpb",
        "G041": "https://meet.google.com/zqy-fjbv-bpb",
        "G080": "https://meet.google.com/zqy-fjbv-bpb",
        "G104": "https://meet.google.com/zqy-fjbv-bpb",
        "G167": "https://meet.google.com/zqy-fjbv-bpb",
        "G183": "https://meet.google.com/zqy-fjbv-bpb",
        "G184": "https://meet.google.com/zqy-fjbv-bpb",
        "G219": "https://meet.google.com/zqy-fjbv-bpb",
        "G240": "https://meet.google.com/zqy-fjbv-bpb",
        "G250": "https://meet.google.com/zqy-fjbv-bpb",
        "G284": "https://meet.google.com/zqy-fjbv-bpb",
        "G301": "https://meet.google.com/zqy-fjbv-bpb",
        "G340": "https://meet.google.com/zqy-fjbv-bpb",
        "G406": "https://meet.google.com/zqy-fjbv-bpb",
        "G421": "https://meet.google.com/zqy-fjbv-bpb",
        "G436": "https://meet.google.com/zqy-fjbv-bpb",
        "G144": "https://meet.google.com/oiq-sxpo-ojh",
        "G213": "https://meet.google.com/oiq-sxpo-ojh",
        "G273": "https://meet.google.com/oiq-sxpo-ojh",
        "G296": "https://meet.google.com/oiq-sxpo-ojh",
        "G002": "https://meet.google.com/irm-tiiw-quh",
        "G059": "https://meet.google.com/irm-tiiw-quh",
        "G130": "https://meet.google.com/irm-tiiw-quh",
        "G189": "https://meet.google.com/irm-tiiw-quh",
        "G232": "https://meet.google.com/say-iwww-vdz",
        "G332": "https://meet.google.com/say-iwww-vdz",
        "G410": "https://meet.google.com/say-iwww-vdz",
        "G419": "https://meet.google.com/say-iwww-vdz",
        "G435": "https://meet.google.com/say-iwww-vdz",
        "G310": "https://meet.google.com/rdk-uzqh-kux",
        "G353": "https://meet.google.com/rdk-uzqh-kux",
        "G237": "https://meet.google.com/fkh-poip-owd",
        "G298": "https://meet.google.com/fkh-poip-owd",
        "G335": "https://meet.google.com/fkh-poip-owd",
        "G247": "https://meet.google.com/tuj-gccw-bvf",
        "G293": "https://meet.google.com/tuj-gccw-bvf",
        "G430": "https://meet.google.com/tuj-gccw-bvf",
        "G047": "https://meet.google.com/ker-dgrd-uww",
        "G182": "https://meet.google.com/ker-dgrd-uww",
        "G211": "https://meet.google.com/ker-dgrd-uww",
        "G263": "https://meet.google.com/ker-dgrd-uww",
        "G266": "https://meet.google.com/ker-dgrd-uww",
        "G423": "https://meet.google.com/ker-dgrd-uww",
        "G020": "https://meet.google.com/apa-gghv-fjp",
        "G118": "https://meet.google.com/apa-gghv-fjp",
        "G143": "https://meet.google.com/apa-gghv-fjp",
        "G177": "https://meet.google.com/apa-gghv-fjp",
        "G416": "https://meet.google.com/apa-gghv-fjp",
        "G013": "https://meet.google.com/ndj-xxmh-qux",
        "G058": "https://meet.google.com/ndj-xxmh-qux",
        "G195": "https://meet.google.com/ndj-xxmh-qux",
        "G370": "https://meet.google.com/ndj-xxmh-qux",
        "G394": "https://meet.google.com/ndj-xxmh-qux",
        "G031": "https://meet.google.com/xpv-igai-hty",
        "G249": "https://meet.google.com/xpv-igai-hty",
        "G322": "https://meet.google.com/xpv-igai-hty",
        "G339": "https://meet.google.com/xpv-igai-hty",
        "G357": "https://meet.google.com/xpv-igai-hty",
        "G389": "https://meet.google.com/xpv-igai-hty",
        "G393": "https://meet.google.com/xpv-igai-hty",
        "G437": "https://meet.google.com/xpv-igai-hty",
        "G438": "https://meet.google.com/xpv-igai-hty",
        "G197": "https://meet.google.com/fdo-knot-aqj",
        "G201": "https://meet.google.com/fdo-knot-aqj",
        "G225": "https://meet.google.com/fdo-knot-aqj",
        "G083": "https://meet.google.com/nnn-bcpx-ibf",
        "G348": "https://meet.google.com/nnn-bcpx-ibf",
        "G107": "https://meet.google.com/mux-tvsd-sno",
        "G229": "https://meet.google.com/mux-tvsd-sno",
        "G234": "https://meet.google.com/mux-tvsd-sno",
        "G253": "https://meet.google.com/mux-tvsd-sno",
        "G299": "https://meet.google.com/mux-tvsd-sno",
        "G001": "https://meet.google.com/rns-inev-mqz",
        "G071": "https://meet.google.com/rns-inev-mqz",
        "G285": "https://meet.google.com/rns-inev-mqz",
        "G320": "https://meet.google.com/ewy-njwm-dyo",
        "G365": "https://meet.google.com/ewy-njwm-dyo",
        "G391": "https://meet.google.com/ewy-njwm-dyo",
        "G396": "https://meet.google.com/ewy-njwm-dyo",
        "G375": "https://meet.google.com/pxw-upui-xxj",
        "G379": "https://meet.google.com/pxw-upui-xxj",
        "G413": "https://meet.google.com/pxw-upui-xxj",
        "G425": "https://meet.google.com/pxw-upui-xxj",
        "G102": "https://meet.google.com/ptk-nwez-cpr",
        "G129": "https://meet.google.com/ptk-nwez-cpr",
        "G209": "https://meet.google.com/ptk-nwez-cpr",
        "G230": "https://meet.google.com/ptk-nwez-cpr",
        "G292": "https://meet.google.com/ptk-nwez-cpr",
        "G330": "https://meet.google.com/ptk-nwez-cpr",
        "G046": "https://meet.google.com/bxc-uasz-rsb",
        "G075": "https://meet.google.com/bxc-uasz-rsb",
        "G082": "https://meet.google.com/bxc-uasz-rsb",
        "G122": "https://meet.google.com/bxc-uasz-rsb",
        "G358": "https://meet.google.com/bxc-uasz-rsb",
        "G045": "https://meet.google.com/bto-bmbw-bnc",
        "G117": "https://meet.google.com/bto-bmbw-bnc",
        "G139": "https://meet.google.com/bto-bmbw-bnc",
        "G168": "https://meet.google.com/bto-bmbw-bnc",
        "G027": "https://meet.google.com/buo-obbv-sas",
        "G095": "https://meet.google.com/buo-obbv-sas",
        "G200": "https://meet.google.com/buo-obbv-sas",
        "G009": "https://meet.google.com/hpa-ndnt-msg",
        "G361": "https://meet.google.com/hpa-ndnt-msg",
        "G381": "https://meet.google.com/hpa-ndnt-msg",
        "G208": "https://meet.google.com/vkp-wdxc-djk",
        "G309": "https://meet.google.com/vkp-wdxc-djk",
        "G387": "https://meet.google.com/vkp-wdxc-djk",
        "G037": "https://meet.google.com/jvm-hvxr-irb",
        "G040": "https://meet.google.com/jvm-hvxr-irb",
        "G111": "https://meet.google.com/jvm-hvxr-irb",
        "G115": "https://meet.google.com/jvm-hvxr-irb",
        "G160": "https://meet.google.com/jvm-hvxr-irb",
        "G163": "https://meet.google.com/jvm-hvxr-irb",
        "G176": "https://meet.google.com/jvm-hvxr-irb",
        "G280": "https://meet.google.com/jvm-hvxr-irb",
        "G023": "https://meet.google.com/cty-azes-pdf",
        "G254": "https://meet.google.com/cty-azes-pdf",
        "G305": "https://meet.google.com/cty-azes-pdf",
        "G344": "https://meet.google.com/cty-azes-pdf",
        "G352": "https://meet.google.com/cty-azes-pdf",
        "G373": "https://meet.google.com/cty-azes-pdf",
        "G079": "https://meet.google.com/wco-bpag-yra",
        "G081": "https://meet.google.com/wco-bpag-yra",
        "G087": "https://meet.google.com/wco-bpag-yra",
        "G147": "https://meet.google.com/wco-bpag-yra",
        "G215": "https://meet.google.com/wco-bpag-yra",
        "G390": "https://meet.google.com/wco-bpag-yra",
        "G417": "https://meet.google.com/wco-bpag-yra",
        "G264": "https://meet.google.com/xmr-mzmn-gar",
        "G267": "https://meet.google.com/xmr-mzmn-gar",
        "G359": "https://meet.google.com/xmr-mzmn-gar",
        "G362": "https://meet.google.com/xmr-mzmn-gar",
        "G407": "https://meet.google.com/xmr-mzmn-gar",
        "G409": "https://meet.google.com/xmr-mzmn-gar",
        "G415": "https://meet.google.com/xmr-mzmn-gar",
        "G427": "https://meet.google.com/xmr-mzmn-gar",
        "G439": "https://meet.google.com/xmr-mzmn-gar",
        "G030": "https://meet.google.com/nuz-nosx-qpr",
        "G038": "https://meet.google.com/nuz-nosx-qpr",
        "G092": "https://meet.google.com/nuz-nosx-qpr",
        "G186": "https://meet.google.com/nuz-nosx-qpr",
        "G222": "https://meet.google.com/nuz-nosx-qpr",
        "G227": "https://meet.google.com/nuz-nosx-qpr",
        "G294": "https://meet.google.com/nuz-nosx-qpr",
        "G395": "https://meet.google.com/nuz-nosx-qpr",
        "G397": "https://meet.google.com/nuz-nosx-qpr",
        "G412": "https://meet.google.com/nuz-nosx-qpr",
        "G113": "https://meet.google.com/ppv-izmg-gzx",
        "G214": "https://meet.google.com/ppv-izmg-gzx",
        "G217": "https://meet.google.com/ppv-izmg-gzx",
        "G328": "https://meet.google.com/bcc-xdpm-emz",
        "G336": "https://meet.google.com/bcc-xdpm-emz",
        "G337": "https://meet.google.com/bcc-xdpm-emz",
        "G400": "https://meet.google.com/bcc-xdpm-emz",
        "G405": "https://meet.google.com/bcc-xdpm-emz",
        "G-CKPW": "https://meet.google.com/zqy-fjbv-bpb",
        "G-OOH4": "https://meet.google.com/zqy-fjbv-bpb",
        "G-U54Z": "https://meet.google.com/zqy-fjbv-bpb",
        "G260": "https://meet.google.com/zqy-fjbv-bpb",
        "G127": "https://meet.google.com/ppv-izmg-gzx",
        "G069": "https://meet.google.com/tqm-omcp-ftq",
        "G097": "https://meet.google.com/tqm-omcp-ftq",
        "G158": "https://meet.google.com/tqm-omcp-ftq",
        "G441": "https://meet.google.com/tqm-omcp-ftq",
        "G442": "https://meet.google.com/tqm-omcp-ftq",
        "G440": "https://meet.google.com/qht-yoey-tpu",
        "G424": "https://meet.google.com/uoj-nfoa-hvr",
        "G063": "https://meet.google.com/wzq-uhsd-dwh",
        "G089": "https://meet.google.com/wzq-uhsd-dwh",
        "G012": "https://meet.google.com/nvi-nvfw-gbu",
        "G333": "https://meet.google.com/nvi-nvfw-gbu",
        "G384": "https://meet.google.com/nvi-nvfw-gbu",
        // عبدالرحمن وليد (ID 41)
        "G114": "https://meet.google.com/uvg-ofnu-ebv",
        "G367": "https://meet.google.com/uvg-ofnu-ebv",
        "G401": "https://meet.google.com/uvg-ofnu-ebv",
        "G402": "https://meet.google.com/uvg-ofnu-ebv",
        "G408": "https://meet.google.com/uvg-ofnu-ebv",
        "G457": "https://meet.google.com/uvg-ofnu-ebv"
};

    // Initialize global registry
    window.GROUP_MEET_LINKS = Object.assign(OFFICIAL_GROUP_MEET_LINKS, window.GROUP_MEET_LINKS || {});

    // Auto-clean any stale cache for teacher 41 groups
    try {
        const stored = getStoredLinks();
        let changed = false;
        ['G114', 'G367', 'G401', 'G402', 'G408', 'G457'].forEach(gid => {
            if (stored[gid] && stored[gid] !== 'https://meet.google.com/uvg-ofnu-ebv') {
                delete stored[gid];
                changed = true;
            }
        });
        // Auto-clean any stale cache for teacher 9 (Ahmed Hameed) groups
        ['G053', 'G068', 'G270', 'G364', 'G398'].forEach(gid => {
            if (stored[gid] && (stored[gid] !== 'https://meet.google.com/ryf-qber-qui' || stored[gid].includes('dee-yvud-mdz') || stored[gid].includes('meet.jit.si'))) {
                delete stored[gid];
                changed = true;
            }
        });
        // Clear any stale jit.si links for Tajweed and force Zoom for competition track CMP-T01
        ['CMP-T01', 'CMP-H01', 'CMP-F01', 'CMP-TAJWEED', 'CMP-HADITH', 'CMP-TAFSIR'].forEach(gid => {
            if (stored[gid] && stored[gid].includes('meet.jit.si')) {
                stored[gid] = 'https://zoom.us/j/98264506630';
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
    } catch(e) {}

    // Get all custom overrides from localStorage
    function getStoredLinks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch(e) {
            return {};
        }
    }

    function normalizeTeacherName(name) {
        if (!name) return '';
        return String(name)
            .trim()
            .replace(/^(أستاذ|استاذ|أ\.|ا\.|م\.|شيخ|الشيخ)\s*[\/\-]?\s*/gi, '')
            .replace(/عبد\s+/g, 'عبد')
            .replace(/أبو\s+/g, 'ابو')
            .replace(/[إأآا]/g, 'ا')
            .replace(/[ة]/g, 'ه')
            .replace(/[ى]/g, 'ي')
            .replace(/[ًٌٍَُِّْ]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }
    window.normalizeTeacherName = normalizeTeacherName;

    // Standardized Group Live Room generator (Google Meet / Zoom / Jitsi)
    window.getGroupMeetUrl = function(groupId, teacherIdOrName, courseName) {
        const cleanGid = groupId ? String(groupId).trim() : '';
        const cName = courseName ? String(courseName).trim() : '';

        // Strict Competition Course Check (Tajweed, Hadith, Tafsir - NEVER JITSI!)
        const isAnyCompetition = (
            cleanGid.startsWith('CMP-') ||
            cName.includes('مسابقة') || cName.includes('الحديث') || cName.includes('التجويد') || cName.includes('التفسير والتدبر') ||
            (typeof currentPortalTrack !== 'undefined' && currentPortalTrack === 'competition')
        );

        if (isAnyCompetition) {
            if (cleanGid === 'CMP-H01' || cName.includes('الحديث')) {
                // If student gender/age info is available via window
                if (typeof window !== 'undefined') {
                    const st = (window.currentStudentData && window.currentStudentData.student) || {};
                    const sName = st.name || '';
                    const sCode = st.student_code || st.id || '';
                    const sExplicit = st.gender || '';
                    const gender = typeof guessStudentGender === 'function' ? guessStudentGender(sName, sExplicit, sCode) : 'm';
                    const age = (window.currentStudentAge !== undefined) ? window.currentStudentAge : (parseInt(st.age) || 9);
                    if (gender === 'm') {
                        if (age < 10) {
                            return 'https://meet.google.com/che-nnub-mxf'; // Google Meet for boys under 10
                        } else {
                            return 'https://zoom.us/j/98264506630';
                        }
                    } else {
                        if (age >= 10) {
                            return 'https://zoom.us/j/99924246069';
                        } else {
                            return 'https://zoom.us/j/98264506630';
                        }
                    }
                }
                return 'https://zoom.us/j/98264506630';
            }
            if (cleanGid === 'CMP-F01' || cName.includes('التفسير والتدبر')) {
                return 'https://zoom.us/j/98264506630';
            }
            return 'https://zoom.us/j/98264506630';
        }

        // 1. Direct Teacher ID or Teacher Name match (Priority to assigned Teacher's Google Meet Room)
        // All Quran memorization circles (حلقات الحفظ) use their assigned Teacher's Google Meet room!
        if (teacherIdOrName) {
            const cleanT = String(teacherIdOrName).trim();
            // Direct match
            if (window.TEACHER_MEET_LINKS && window.TEACHER_MEET_LINKS[cleanT]) {
                return window.TEACHER_MEET_LINKS[cleanT];
            }
            // Normalized name match
            if (window.TEACHER_MEET_LINKS) {
                const normTarget = normalizeTeacherName(cleanT);
                if (normTarget) {
                    for (const [k, url] of Object.entries(window.TEACHER_MEET_LINKS)) {
                        if (normalizeTeacherName(k) === normTarget) {
                            return url;
                        }
                    }
                    // Substring / compound name match (e.g. 'عبدالرحمن أحمد مختار' vs 'عبدالرحمن مختار')
                    if (normTarget.length > 3) {
                        const targetParts = normTarget.split(' ').filter(p => p.length > 2);
                        for (const [k, url] of Object.entries(window.TEACHER_MEET_LINKS)) {
                            const normK = normalizeTeacherName(k);
                            if (!normK || normK.length <= 3) continue;
                            const kParts = normK.split(' ').filter(p => p.length > 2);
                            if (targetParts.length >= 2 && kParts.length >= 2) {
                                if (targetParts[0] === kParts[0] && targetParts[targetParts.length - 1] === kParts[kParts.length - 1]) {
                                    return url;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Pre-configured official Google Meet rooms by Group ID
        if (cleanGid && window.GROUP_MEET_LINKS && window.GROUP_MEET_LINKS[cleanGid]) {
            return window.GROUP_MEET_LINKS[cleanGid];
        }

        // 3. User/Teacher custom override in localStorage
        const stored = getStoredLinks();
        if (cleanGid && stored[cleanGid]) {
            const stVal = stored[cleanGid].trim();
            if (stVal.startsWith('http') && !stVal.includes('meet.jit.si/MounirAcademy_Group_')) {
                return stVal;
            }
        }

        if (!cleanGid || cleanGid === '—' || cleanGid === 'G000' || cleanGid === 'G') {
            return 'https://meet.jit.si/MounirAcademy_GeneralRoom';
        }

        // 4. Default fallback working live interactive video room
        const codeSuffix = cleanGid.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return 'https://meet.jit.si/MounirAcademy_Group_' + codeSuffix;
    };

    // Reset group meet URL to official default
    window.resetGroupMeetUrl = function(groupId, teacherIdOrName) {
        if (!groupId) return;
        const cleanGid = String(groupId).trim();
        try {
            const stored = getStoredLinks();
            delete stored[cleanGid];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch(e) {}
        const defaultUrl = window.getGroupMeetUrl(cleanGid, teacherIdOrName);
        window.dispatchEvent(new CustomEvent('monir-meet-updated', {
            detail: { groupId: cleanGid, url: defaultUrl }
        }));
        return defaultUrl;
    };

    // Update group meet link
    window.setGroupMeetUrl = function(groupId, newUrl) {
        if (!groupId) return false;
        const cleanGid = String(groupId).trim();
        let finalUrl = (newUrl || '').trim();

        if (!finalUrl) {
            finalUrl = window.getGroupMeetUrl(cleanGid);
        } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        try {
            const stored = getStoredLinks();
            stored[cleanGid] = finalUrl;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            if (!window.GROUP_MEET_LINKS) window.GROUP_MEET_LINKS = {};
            window.GROUP_MEET_LINKS[cleanGid] = finalUrl;

            // Trigger custom event for real-time reactivity in current tab
            window.dispatchEvent(new CustomEvent('monir-meet-updated', {
                detail: { groupId: cleanGid, url: finalUrl }
            }));

            // Sync to Supabase cloud in the background for all students in group
            try {
                if (window.MonirDB && window.MonirDB.client) {
                    window.MonirDB.client
                        .from('enrollments')
                        .update({ google_meet_url: finalUrl })
                        .eq('group_id', cleanGid)
                        .then(({ error }) => {
                            if (error) console.warn('[MeetManager] Supabase cloud sync warning:', error);
                            else console.log('[MeetManager] Synced meet URL to Supabase cloud for group', cleanGid);
                        })
                        .catch(err => console.warn('[MeetManager] Supabase sync err:', err));
                }
            } catch(e) {}

            return finalUrl;
        } catch(e) {
            console.error('[MeetManager] Failed to save link:', e);
            return false;
        }
    };

    // Link copying disabled for security and classroom privacy
    window.copyMeetLink = function(url, btnElement) {
        const msg = '🔒 عذراً، تم إيقاف ميزة نسخ الروابط لحماية خصوصية الحصص وحسابات الطلاب ومنع تداول الروابط خارج المنصة.\nيرجى الدخول مباشرة عبر زر (بدء الحصة / دخول الحصة) من داخل المنصة.';
        if (window.MonirPopup && window.MonirPopup.alert) {
            window.MonirPopup.alert(msg, 'ميزة نسخ الروابط متوقفة', 'warning');
        } else {
            alert(msg);
        }
    };

    // Prompt teacher or admin to edit the group meet link
    window.promptEditGroupMeetUrl = function(groupId, currentUrl, callback) {
        const input = prompt('أدخل رابط الحصة الجديد للمجموعة (' + groupId + ')\nيمكنك وضع رابط Google Meet أو Zoom أو أي رابط تختاره:', currentUrl || window.getGroupMeetUrl(groupId));
        if (input !== null) {
            const trimmed = input.trim();
            if (trimmed) {
                const saved = window.setGroupMeetUrl(groupId, trimmed);
                if (saved) {
                    alert('تم حفظ وتحديث رابط الحصة للمجموعة (' + groupId + ') بنجاح!\nسيظهر الرابط الآن فوراً لك ولجميع طلاب المجموعة:\n' + saved);
                    if (typeof callback === 'function') callback(saved);
                }
            }
        }
    };
})();
