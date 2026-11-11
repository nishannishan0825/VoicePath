// ==========================================
// 🌐 GLOBAL CONFIGURATION: LOCALHOST BACKEND
// ==========================================
const API_URL = "http://127.0.0.1:8000";

// DOM Element Selectors
const startVoiceBtn = document.getElementById("startVoiceBtn");
const startVoiceBtnSecondary = document.getElementById("startVoiceBtnSecondary");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const retryVoiceBtn = document.getElementById("retryVoiceBtn");
const micButton = document.getElementById("micButton");
const voiceLanguage = document.getElementById("voiceLanguage");
const supportCategory = document.getElementById("supportCategory");
const voiceStatus = document.getElementById("voiceStatus");
const voiceTranscript = document.getElementById("voiceTranscript");
const results = document.getElementById("results");

// Global Audio Speech Variables
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let currentStep = 0;
let currentAnswer = "";
let isRunning = false;
let retryCount = 0;
let answerHandled = false;
let latestResults = null;

// Multi-language UI Translation Placeholders
const translations = {
    "ar-AE": {
        brandHome: "الصفحة الرئيسية لـ VoicePath Dubai",
        heroVisualLabel: "مشهد لأفق دبي",
        navLabel: "التنقل الرئيسي",
        navHome: "الرئيسية",
        navDiscover: "اكتشف الدعم",
        navServices: "الخدمات الحكومية",
        navAbout: "عن المنصة",
        navHelp: "المساعدة",
        language: "اللغة",
        selectLanguage: "اختر اللغة",
        heroEyebrow: "خدمات الدعم في دبي والإمارات",
        heroTitle: "الدعم الحكومي، أصبح أسهل.",
        heroLead: "اكتشف المزايا والخدمات الحكومية التي قد تكون متاحة لك من خلال تجربة سهلة تعتمد على الصوت.",
        talkToVoicePath: "تحدث إلى VoicePath",
        exploreBenefits: "استكشف المزايا الحكومية",
        heroImageAlt: "أفق دبي وخدمات المدينة",
        availableServices: "الخدمات المتاحة",
        curatedProgrammes: "أكثر من ١٢ برنامجاً مختاراً",
        voiceAssistant: "المساعد الصوتي",
        startConversation: "ابدأ المحادثة",
        supportCategory: "فئة الدعم",
        housingSupport: "دعم الإسكان",
        education: "التعليم",
        healthcare: "الرعاية الصحية",
        employment: "التوظيف",
        peopleOfDetermination: "أصحاب الهمم",
        seniorCitizens: "كبار المواطنين",
        familySupport: "دعم الأسرة",
        financialAssistance: "المساعدات المالية",
        transportation: "النقل والمرافق",
        otherServices: "خدمات حكومية أخرى",
        startVoiceAssistant: "بدء المساعد الصوتي",
        stopConversation: "إنهاء المحادثة",
        retryMicrophone: "إعادة محاولة استخدام الميكروفون",
        readyToListen: "جاهز للاستماع",
        recognisedSpeech: "الكلام الذي تم التعرّف عليه",
        transcriptPlaceholder: "ستظهر إجاباتك المنطوقة هنا.",
        howItWorks: "كيف تعمل المنصة",
        findSupportQuickly: "اعثر على الدعم المناسب بسرعة",
        stepOneTitle: "أخبرنا عن نفسك.",
        stepOneDescription: "شاركنا وضعك باللغة الإنجليزية أو العربية أو التاميلية.",
        stepTwoTitle: "تبحث VoicePath عن البرامج المناسبة.",
        stepTwoDescription: "نطابق البرامج ذات الصلة في دبي والإمارات مع ملفك.",
        stepThreeTitle: "راجع التوصيات.",
        stepThreeDescription: "اطّلع على النتائج الأولية وروابط التقديم الرسمية.",
        benefitsCategories: "فئات المزايا",
        servicesYouMayNeed: "خدمات حكومية قد تحتاج إليها",
        financialDescription: "دعم قصير الأجل ومساعدات نقدية وخيارات للرعاية الاجتماعية.",
        housingDescription: "مساعدات حكومية متعلقة بالسكن والإيجار وتجديد المنازل.",
        healthcareDescription: "دعم طبي ورعاية منزلية وخدمات الصحة العامة.",
        educationDescription: "منح دراسية ومساعدات للرسوم ودعم للطلاب.",
        determinationDescription: "دعم لأصحاب الهمم وإعادة التأهيل وخدمات إتاحة الوصول.",
        seniorDescription: "دعم لكبار المواطنين وخدمات صحية ومجتمعية.",
        familyDescription: "خدمات الزواج ورفاه الأسرة ودعم الأطفال.",
        employmentDescription: "التوظيف والتدريب ومبادرات العمل في الإمارات.",
        transportDescription: "مزايا هيئة الطرق والمواصلات ودعم النقل والمرافق.",
        otherServicesDescription: "إرشادات الإقامة والتأشيرات والهوية والخدمات الحكومية العامة.",
        explore: "استكشف",
        featuredServices: "خدمات حكومية مختارة",
        selectedProgrammes: "برامج وخدمات عامة مختارة",
        sanadCard: "بطاقة سند ودعم أصحاب الهمم",
        sanadAuthority: "الجهة المسؤولة: دبي / مؤسسة محمد بن راشد للإسكان",
        sanadDescription: "دعم لأصحاب الهمم المؤهلين، بما في ذلك خدمات إمكانية الوصول وإعادة التأهيل والخدمات ذات الصلة.",
        determinationBeneficiary: "الفئة المستفيدة: أصحاب الهمم",
        officialApplication: "رابط التقديم الرسمي",
        thukherCard: "بطاقة ثُخْر ودعم كبار المواطنين",
        thukherAuthority: "الجهة المسؤولة: حكومة دبي",
        thukherDescription: "برامج مخصصة لكبار المواطنين تشمل الدعم المجتمعي والصحي.",
        seniorBeneficiary: "الفئة المستفيدة: كبار المواطنين",
        enayaSupport: "دعم برنامج عناية للرعاية الصحية",
        enayaAuthority: "الجهة المسؤولة: هيئة الصحة بدبي",
        enayaDescription: "برامج للرعاية الصحية مخصصة للمقيمين المؤهلين والفئات الأكثر احتياجاً.",
        healthcareBeneficiary: "الفئة المستفيدة: احتياجات الرعاية الصحية",
        aboutVoicePath: "عن VoicePath",
        footerDescription: "هو نموذج مستقل لاكتشاف الخدمات الحكومية، وليس موقعاً رسمياً لحكومة دبي.",
        policies: "السياسات",
        privacyPolicy: "سياسة الخصوصية",
        termsOfUse: "شروط الاستخدام",
        accessibility: "إمكانية الوصول",
        contact: "تواصل معنا",
        support: "الدعم",
        officialSources: "مصادر المعلومات الحكومية الرسمية",
        readyStatus: "جاهز للاستماع",
        listening: "جارٍ الاستماع... تفضل بالتحدث.",
        microphoneBusy: "الميكروفون مشغول. حاول مرة أخرى.",
        retryAnswer: "عذراً، لم أتمكن من فهم الإجابة. يرجى تكرارها.",
        retryNoSpeech: "لم أسمع إجابتك. يرجى تكرار الإجابة.",
        noSpeech: "لم يتم رصد أي كلام بعد عدة محاولات.",
        speechUnsupported: "التعرّف على الكلام غير مدعوم في هذا المتصفح.",
        microphoneError: "خطأ في الميكروفون:",
        findingBenefits: "جارٍ البحث عن المزايا الحكومية المناسبة...",
        checkingServices: "جارٍ التحقق من الخدمات...",
        recommendationsReady: "أصبحت توصياتك جاهزة.",
        noMatches: "لم نعثر على برامج مطابقة في قاعدة البيانات الحالية. جرّب فئة خدمة أخرى أو حدّث معلوماتك.",
        governmentService: "خدمة حكومية",
        categoryLabel: "الفئة:",
        statusLabel: "الحالة:",
        reasonHeading: "لماذا قد تناسبك هذه الخدمة:",
        missingHeading: "معلومات إضافية مطلوبة:",
        officialSource: "المصدر الرسمي",
        applicationPortal: "بوابة التقديم",
        loadError: "تعذّر تحميل النتائج. يرجى التحقق من الخادم.",
        errorLabel: "خطأ:",
        statusPotential: "مطابقة محتملة",
        statusNeedsInfo: "مطلوب مزيد من المعلومات",
        statusNotMatched: "غير مطابق",
        statusToVerify: "يحتاج إلى التحقق",
        notSpecified: "غير محدد",
        additionalNote: "يرجى استخدام العربية أو الإنجليزية وتحديد فئة الدعم لتحسين دقة المطابقة.",
        sourceNotFinal: "هذه النتائج أولية وليست قراراً نهائياً بشأن الأهلية.",
        speechDisplayed: "تم عرض التوصيات على الشاشة.",
        speechChecking: "شكراً لك. نتحقق الآن من الخدمات التي قد تناسب ملفك.",
        speechError: "حدث خطأ أثناء تحميل النتائج."
    }
};

const arabicResultText = {
    "Sanad Card and Disability Support": "بطاقة سند ودعم أصحاب الهمم",
    "ENAYA Healthcare Support": "دعم برنامج عناية للرعاية الصحية",
    "Thukher Card and Senior Support": "بطاقة ثُخْر ودعم كبار المواطنين",
    "Dubai Housing Assistance": "مساعدات الإسكان في دبي",
    "Education Scholarship and Tuition Support": "منح دراسية ودعم الرسوم التعليمية",
    "Nafis Employment Support": "دعم التوظيف من نافس",
    "DEWA Utility and Concession Support": "دعم هيئة كهرباء ومياه دبي والمزايا",
    "Dubai Weddings and Family Support": "دعم الزواج والأسرة في دبي",
    "RTA Senior and Disability Transport Concessions": "مزايا النقل لكبار المواطنين وأصحاب الهمم",
    "Financial Assistance and Social Welfare": "المساعدات المالية والرعاية الاجتماعية",
    "financial_assistance": "المساعدات المالية",
    "people_of_determination": "أصحاب الهمم",
    "senior_citizens": "كبار المواطنين",
    "family_support": "دعم الأسرة",
    "education": "التعليم",
    "healthcare": "الرعاية الصحية"
};

const defaultUiText = new Map(
    Array.from(document.querySelectorAll("[data-i18n]"))
        .map((element) => [element.dataset.i18n, element.textContent])
);
const defaultAriaLabels = new Map(
    Array.from(document.querySelectorAll("[data-i18n-aria]"))
        .map((element) => [element.dataset.i18nAria, element.getAttribute("aria-label")])
);
const defaultAltText = new Map(
    Array.from(document.querySelectorAll("[data-i18n-alt]"))
        .map((element) => [element.dataset.i18nAlt, element.getAttribute("alt")])
);

function applyLanguage() {
    const language = voiceLanguage.value;
    const isArabic = language === "ar-AE";
    const localizedText = isArabic ? translations[language] : null;

    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = isArabic
        ? "VoicePath Dubai | الخدمات الحكومية"
        : "VoicePath Dubai | Government Support";

    const description = document.querySelector('meta[name="description"]');
    if (description) {
        description.content = isArabic
            ? "تساعد VoicePath Dubai السكان على استكشاف المزايا والخدمات الحكومية من خلال تجربة صوتية سهلة."
            : "VoicePath Dubai helps residents explore government benefits and services through a simple voice-first experience.";
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        element.textContent = (localizedText && localizedText[key]) || defaultUiText.get(key) || key;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        const key = element.dataset.i18nAria;
        element.setAttribute("aria-label", (localizedText && localizedText[key]) || defaultAriaLabels.get(key) || key);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const key = element.dataset.i18nAlt;
        element.setAttribute("alt", (localizedText && localizedText[key]) || defaultAltText.get(key) || key);
    });
}

// ==========================================
// 📡 NETWORK COMMUNICATIONS LAYER (FETCH)
// ==========================================
async function sendProfileToBackend(userProfile) {
    try {
        if (voiceStatus) voiceStatus.innerText = "Processing profile details...";
        
        // Dynamic path pointing directly to your local FastAPI server setup
        const response = await fetch(`${API_URL}/profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userProfile)
        });
        
        if (!response.ok) throw new Error("Server communication broken.");
        const data = await response.json();
        console.log("Backend profile response:", data);
        fetchSchemesAndMatch();
    } catch (err) {
        console.error("Network Error:", err);
        if (voiceStatus) voiceStatus.innerText = "Error sending data to localhost server.";
    }
}

async function fetchSchemesAndMatch() {
    try {
        if (voiceStatus) voiceStatus.innerText = "Matching eligible programs...";
        
        const response = await fetch(`${API_URL}/schemes`);
        if (!response.ok) throw new Error("Could not parse databases.");
        const data = await response.json();
        
        latestResults = data.schemes;
        renderResultsHTML(latestResults);
    } catch (err) {
        console.error("Matching Error:", err);
