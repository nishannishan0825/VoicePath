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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let currentStep = 0;
let currentAnswer = "";
let isRunning = false;
let retryCount = 0;
let answerHandled = false;
let latestResults = null;

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
    "healthcare": "الرعاية الصحية",
    "employment": "التوظيف",
    "transport_and_utilities": "النقل والمرافق",
    "housing": "الإسكان",
    "potential_match": "مطابقة محتملة",
    "needs_more_information": "مطلوب مزيد من المعلومات",
    "not_matched": "غير مطابق",
    "This scheme is limited to certain nationalities or residency types.": "هذا البرنامج مخصص لجنسيات أو فئات إقامة محددة.",
    "This scheme is only available in specific emirates.": "هذا البرنامج متاح في إمارات محددة فقط.",
    "This support is specifically for People of Determination.": "هذا الدعم مخصص لأصحاب الهمم.",
    "This scheme is targeted at senior citizens.": "هذا البرنامج مخصص لكبار المواطنين.",
    "This support is for students.": "هذا الدعم مخصص للطلاب.",
    "Age": "العمر",
    "Nationality": "الجنسية",
    "Residency status": "حالة الإقامة",
    "Emirate of residence": "إمارة الإقامة",
    "Monthly income": "الدخل الشهري",
    "Household income": "دخل الأسرة",
    "Student status": "الحالة الدراسية",
    "People of Determination status": "حالة أصحاب الهمم",
    "Disability percentage": "نسبة الإعاقة",
    "Senior citizen status": "حالة كبار المواطنين",
    "Housing situation": "الحالة السكنية",
    "Healthcare support is more relevant when there is a medical need.": "تكون خدمات الرعاية الصحية أنسب عند وجود حاجة طبية.",
    "Use Arabic or English and specify your support category to improve matching accuracy.": "يرجى استخدام العربية أو الإنجليزية وتحديد فئة الدعم لتحسين دقة المطابقة.",
    "These are preliminary matches only. Confirm the latest eligibility rules and application windows with the official government portal.": "هذه النتائج أولية فقط. يرجى التحقق من أحدث شروط الأهلية ومواعيد التقديم عبر البوابة الحكومية الرسمية.",
    "The requested support does not align with the selected service category.": "نوع الدعم المطلوب لا يتوافق مع فئة الخدمة المحددة."
};

function t(key) {
    const localized = translations[voiceLanguage.value];
    return (localized && localized[key]) || defaultTranslations.get(key) || englishMessages[key] || key;
}

const defaultTranslations = new Map(
    Array.from(document.querySelectorAll("[data-i18n]"))
        .map((element) => [element.dataset.i18n, element.textContent])
);
const englishMessages = {
    brandHome: "VoicePath Dubai home",
    heroVisualLabel: "Dubai skyline overview",
    navLabel: "Main navigation",
    selectLanguage: "Select language",
    supportCategory: "Support category",
    startVoiceAssistant: "Start voice assistant",
    heroImageAlt: "Dubai skyline and public service cityscape",
    readyStatus: "Ready to listen",
    listening: "Listening... Please speak now.",
    microphoneBusy: "Microphone is busy. Please try again.",
    retryAnswer: "Sorry, I could not understand that answer. Please say it again.",
    retryNoSpeech: "I could not hear you. Please answer the same question again.",
    noSpeech: "No speech was detected after several attempts.",
    speechUnsupported: "Speech recognition is not supported in this browser.",
    microphoneError: "Microphone error:",
    findingBenefits: "Finding relevant government benefits...",
    checkingServices: "Checking services...",
    recommendationsReady: "Your recommendations are ready.",
    noMatches: "No matching programmes were found in the current database. Try another service category or refine your profile.",
    governmentService: "Government service",
    categoryLabel: "Category:",
    statusLabel: "Status:",
    reasonHeading: "Why this may match:",
    missingHeading: "Additional information needed:",
    officialSource: "Official source",
    applicationPortal: "Application portal",
    loadError: "Could not load scheme matches. Please check the server.",
    errorLabel: "Error:",
    statusPotential: "Potential match",
    statusNeedsInfo: "Needs more information",
    statusNotMatched: "Not matched",
    statusToVerify: "To be verified",
    notSpecified: "Not specified",
    speechDisplayed: "Your recommendations are displayed on the screen.",
    speechChecking: "Thank you. We are checking the services that may match your profile.",
    speechError: "An error occurred while loading the results."
};

const profile = {
    support_needed: "",
    support_category: "",
    nationality: "",
    residency_status: "",
    emirate: "",
    age: null,
    student_status: null,
    disability_status: null,
    monthly_income: null,
    household_income: null
};

const questions = {
    "en-AE": [
        "What is your age? Please say the number.",
        "Which emirate do you live in?",
        "What support do you need? Say housing, education, healthcare, employment, disability support, family support, or senior support.",
        "How would you describe your residency status? Say UAE national, expatriate resident, GCC national, or visitor.",
        "Do you have a disability or People of Determination status? Say yes or no.",
        "What is your household monthly income in AED? Please say a number.",
        "Are you a student? Say yes or no."
    ],
    "ar-AE": [
        "ما هو عمرك؟ قل الرقم فقط.",
        "في أي إمارة تعيش؟",
        "ما نوع الدعم الذي تحتاجه؟ قل السكن أو التعليم أو الرعاية الصحية أو العمل أو دعم ذوي الإعاقة أو الأسرة.",
        "كيف تصف وضعك القانوني؟ قل مواطن إماراتي، مقيم، مواطن خليجي أو زائر.",
        "هل لديك إعاقة أو حالة ذوي الإعاقة؟ قل نعم أو لا.",
        "ما هو دخل الأسرة الشهري بالدراهم؟ قل الرقم فقط.",
        "هل أنت طالب؟ قل نعم أو لا."
    ],
    "ta-IN": [
        "உங்கள் வயது என்ன? எண்ணாகச் சொல்லுங்கள்.",
        "நீங்கள் எந்த எமிரேட்டில் வசிக்கிறீர்கள்?",
        "உங்களுக்கு எந்த உதவி தேவை? வீடு, கல்வி, சுகாதாரம், வேலை, மாற்றுத்திறன், குடும்பம் அல்லது மூத்தோர் உதவி என்று சொல்லுங்கள்.",
        "உங்கள் குடியுரிமை நிலை என்ன? UAE குடிமகன், வெளிநாட்டு குடியிருப்பாளர், GCC குடிமகன் அல்லது பார்வையாளர் என்று சொல்லுங்கள்.",
        "உங்களுக்கு மாற்றுத்திறன் அல்லது மக்கள் தேவைகள் உள்ளதா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.",
        "உங்கள் குடும்ப மாத வருமானம் AED-இல் என்ன? எண்ணாகச் சொல்லுங்கள்.",
        "நீங்கள் மாணவரா? ஆம் அல்லது இல்லை என்றே சொல்லுங்கள்."
    ]
};

function applyLanguage() {
    const language = voiceLanguage.value;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar-AE" ? "rtl" : "ltr";
    document.title = language === "ar-AE"
        ? "VoicePath Dubai | الخدمات الحكومية"
        : "VoicePath Dubai | Government Support";
    document.querySelector('meta[name="description"]').content = language === "ar-AE"
        ? "تساعد VoicePath Dubai السكان على استكشاف المزايا والخدمات الحكومية من خلال تجربة صوتية سهلة."
        : "VoicePath Dubai helps residents explore government benefits and services through a simple voice-first experience.";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        element.setAttribute("alt", t(element.dataset.i18nAlt));
    });

    if (!isRunning) {
        showStatus(!SpeechRecognition ? t("speechUnsupported") : t("readyToListen"));
        if (latestResults) {
            renderBenefits(latestResults);
            showStatus(t("recommendationsReady"));
        }
    }
}

function showStatus(message) {
    voiceStatus.textContent = message;
    voiceStatus.dir = "auto";
}

function speak(message, callback) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = voiceLanguage.value;
    utterance.rate = 0.9;

    utterance.onend = function () {
        if (callback && isRunning) {
            callback();
        }
    };

    utterance.onerror = function () {
        if (callback && isRunning) {
            callback();
        }
    };

    window.speechSynthesis.speak(utterance);
}

function getYesNo(text) {
    const value = text.toLowerCase().trim();
    if (/^(yes|yeah|yep|i do|نعم|اي نعم|ஆம்|ஆமாம்|ஆமா|உண்டு|இருக்கிறது|உள்ளது)$/i.test(value) || /yes|yeah|نعم|ஆம்|ஆமாம்|ஆமா|உண்டு|இருக்கிறது|உள்ளது/i.test(value)) {
        return true;
    }
    if (/^(no|nope|i do not|لا|ليس|இல்லை|இல்ல|கிடையாது)$/i.test(value) || /no|nope|لا|ليس|இல்லை|இல்ல|கிடையாது/i.test(value)) {
        return false;
    }
    return null;
}

function getNumber(text) {
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : null;
}

function resetProfile() {
    const selected = supportCategory.value || "housing";
    profile.support_needed = selected;
    profile.support_category = selected;
    profile.nationality = "";
    profile.residency_status = "";
    profile.emirate = "";
    profile.age = null;
    profile.student_status = null;
    profile.disability_status = null;
    profile.monthly_income = null;
    profile.household_income = null;
}

function askQuestion() {
    if (!isRunning) return;

    if (currentStep >= questions[voiceLanguage.value].length) {
        finishVoiceProfile();
        return;
    }

    const question = questions[voiceLanguage.value][currentStep];
    showStatus(question);
    speak(question, startListening);
}

function startListening() {
    if (!isRunning || !recognition) return;

    currentAnswer = "";
    answerHandled = false;

    showStatus(voiceLanguage.value === "ta-IN"
        ? "🎤 கேட்கிறது... இப்போது பதில் சொல்லுங்கள்."
        : "🎤 " + t("listening"));

    try {
        recognition.lang = voiceLanguage.value;
        recognition.start();
    } catch (error) {
        showStatus(t("microphoneBusy"));
        isRunning = false;
        voiceLanguage.disabled = false;
        supportCategory.disabled = false;
        startVoiceBtn.disabled = false;
        startVoiceBtnSecondary.disabled = false;
        stopVoiceBtn.disabled = true;
        retryVoiceBtn.disabled = true;
    }
}

function saveAnswer(answer) {
    const text = answer.trim();
    const value = text.toLowerCase();

    switch (currentStep) {
        case 0: {
            const age = getNumber(value);
            if (age === null || age < 0 || age > 120) return false;
            profile.age = age;
            break;
        }
        case 1: {
            if (!text) return false;
            profile.emirate = text;
            break;
        }
        case 2: {
            const selected = supportCategory.value;
            if (/housing|سكن|வீடு/i.test(value)) {
                profile.support_needed = "housing";
                supportCategory.value = "housing";
            } else if (/education|scholarship|study|تعليم|கல்வி|படிப்பு/i.test(value)) {
                profile.support_needed = "education";
                supportCategory.value = "education";
            } else if (/health|medical|care|صحة|சுகாதாரம்|மருத்துவம்/i.test(value)) {
                profile.support_needed = "healthcare";
                supportCategory.value = "healthcare";
            } else if (/employment|job|work|وظيفة|வேலை|தொழில்/i.test(value)) {
                profile.support_needed = "employment";
                supportCategory.value = "employment";
            } else if (/family|marriage|wedding|أسرة|خدمة عائلية|குடும்பம்|திருமணம்/i.test(value)) {
                profile.support_needed = "family_support";
                supportCategory.value = "family_support";
            } else if (/disability|sanad|access|people of determination|إعاقة|ذوي الإعاقة|மாற்றுத்திறன்/i.test(value)) {
                profile.support_needed = "people_of_determination";
                supportCategory.value = "people_of_determination";
            } else if (/senior|elder|old age|مسن|மூத்தோர்|வயதான/i.test(value)) {
                profile.support_needed = "senior_citizens";
                supportCategory.value = "senior_citizens";
            } else if (/financial|assist|benefit|low income|مال|நிதி|சமுதாய உதவி/i.test(value)) {
                profile.support_needed = "financial_assistance";
                supportCategory.value = "financial_assistance";
            } else if (/transport|utility|dewa|rta|نقل|مرافق|போக்குவரத்து/i.test(value)) {
                profile.support_needed = "transport_and_utilities";
                supportCategory.value = "transport_and_utilities";
            } else {
                profile.support_needed = selected || "housing";
                supportCategory.value = selected || "housing";
            }
            profile.support_category = supportCategory.value;
            break;
        }
        case 3: {
            if (/uae national|national|مواطن إماراتي|மக்கள்/i.test(value)) {
                profile.nationality = "UAE national";
                profile.residency_status = "UAE national";
            } else if (/gcc|gulf|مواطن خليجي/i.test(value)) {
                profile.nationality = "GCC national";
                profile.residency_status = "GCC national";
            } else if (/resident|expatriate|مقيم|வெளிநாட்டு குடியிருப்பாளர்|குடியிருப்பாளர்/i.test(value)) {
                profile.nationality = "UAE resident";
                profile.residency_status = "UAE resident";
            } else if (/visitor|tourist|زائر|பார்வையாளர்/i.test(value)) {
                profile.nationality = "Visitor";
                profile.residency_status = "Visitor";
            } else {
                return false;
            }
            break;
        }
        case 4: {
            const answerValue = getYesNo(value);
            if (answerValue === null) return false;
            profile.disability_status = answerValue;
            break;
        }
        case 5: {
            const monthly = getNumber(value);
            if (monthly === null || monthly < 0) return false;
            profile.monthly_income = monthly;
            profile.household_income = monthly;
            break;
        }
        case 6: {
            const answerValue = getYesNo(value);
            if (answerValue === null) return false;
            profile.student_status = answerValue;
            break;
        }
    }

    return true;
}

function handleAnswer(answer) {
    if (answerHandled || !isRunning) return;

    answerHandled = true;
    retryCount = 0;

    const accepted = saveAnswer(answer);
    if (!accepted) {
        answerHandled = false;
        const retryMessage = voiceLanguage.value === "ta-IN"
                ? "மன்னிக்கவும். பதிலை தெளிவாக மீண்டும் சொல்லுங்கள்."
                : t("retryAnswer");
        showStatus(retryMessage);
        speak(retryMessage, startListening);
        return;
    }

    if (voiceTranscript.textContent) {
        voiceTranscript.appendChild(document.createElement("br"));
    }
    const stepNumber = addText(voiceTranscript, "span", (currentStep + 1) + ".");
    stepNumber.dir = "ltr";
    voiceTranscript.appendChild(document.createTextNode(" "));
    voiceTranscript.appendChild(document.createTextNode(answer));
    currentStep++;

    if (currentStep < questions[voiceLanguage.value].length) {
        setTimeout(askQuestion, 300);
    } else {
        finishVoiceProfile();
    }
}

function finishVoiceProfile() {
    if (!isRunning) return;

    isRunning = false;
    answerHandled = true;

    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            // no-op
        }
    }

    window.speechSynthesis.cancel();
    stopVoiceBtn.disabled = true;
    voiceLanguage.disabled = false;
    supportCategory.disabled = false;
    startVoiceBtn.disabled = false;
    startVoiceBtnSecondary.disabled = false;

    showStatus(t("findingBenefits"));
    const spokenMessage = voiceLanguage.value === "ta-IN"
            ? "நன்றி. உங்கள் விவரங்களுடன் பொருந்தக்கூடிய அரசு சேவைகளை சரிபார்க்கிறோம்."
            : voiceLanguage.value === "ar-AE"
                ? "شكرًا لك. نتحقق الآن من الخدمات التي قد تناسب ملفك."
                : t("speechChecking");
    speak(spokenMessage);
    findBenefits();
}

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
}

function resultText(value) {
    if (voiceLanguage.value !== "ar-AE") {
        return value;
    }

    if (arabicResultText[value]) {
        return arabicResultText[value];
    }

    let match = value.match(/^This programme requires (.+) residency\.$/);
    if (match) {
        return "يشترط هذا البرنامج توفر إقامة من فئة " + match[1] + ".";
    }
    match = value.match(/^Age must be at least (\d+) years\.$/);
    if (match) {
        return "يشترط ألا يقل العمر عن " + match[1] + " سنة.";
    }
    match = value.match(/^Age must be (\d+) or younger\.$/);
    if (match) {
        return "يجب ألا يتجاوز العمر " + match[1] + " سنة.";
    }
    match = value.match(/^Disability percentage must be at least (\d+)%\.$/);
    if (match) {
        return "يجب ألا تقل نسبة الإعاقة عن " + match[1] + "%.";
    }
    match = value.match(/^Monthly income exceeds the scheme limit of AED ([\d,]+)\.$/);
    if (match) {
        return "يتجاوز الدخل الشهري الحد المسموح به في البرنامج، وهو AED " + match[1] + ".";
    }
    match = value.match(/^Household income exceeds the scheme limit of AED ([\d,]+)\.$/);
    if (match) {
        return "يتجاوز دخل الأسرة الحد المسموح به في البرنامج، وهو AED " + match[1] + ".";
    }
    return value;
}

function renderBenefits(data) {
    results.replaceChildren();
    const heading = addText(results, "h3", t("recommendationsReady"));
    heading.style.marginBottom = "16px";

    if (!Array.isArray(data.results) || data.results.length === 0) {
        const message = addText(results, "p", t("noMatches"));
        message.dir = "auto";
    } else {
        data.results.forEach((result) => {
            const card = document.createElement("article");
            card.className = "result-card";

            const name = addText(card, "h4", resultText(result.scheme_name || t("governmentService")));
            name.dir = "auto";

            const categoryLine = document.createElement("p");
            categoryLine.append(document.createTextNode(t("categoryLabel") + " "));
            const category = addText(categoryLine, "span", resultText(result.category || t("notSpecified")));
            category.dir = "auto";
            card.appendChild(categoryLine);

            const statusValue = result.status || "to_be_verified";
            const statusKey = statusValue === "potential_match"
                ? "statusPotential"
                : statusValue === "needs_more_information"
                    ? "statusNeedsInfo"
                    : statusValue === "not_matched"
                        ? "statusNotMatched"
                        : "statusToVerify";
            const statusLine = document.createElement("p");
            statusLine.append(document.createTextNode(t("statusLabel") + " "));
            const status = addText(statusLine, "span", t(statusKey));
            status.dir = "auto";
            card.appendChild(statusLine);

            if (Array.isArray(result.reasons) && result.reasons.length > 0) {
                addText(card, "p", t("reasonHeading"));
                result.reasons.forEach((reason) => {
                    const item = addText(card, "p", "• " + resultText(reason));
                    item.dir = "auto";
                });
            }

            if (Array.isArray(result.missing_information) && result.missing_information.length > 0) {
                addText(card, "p", t("missingHeading"));
                result.missing_information.forEach((item) => {
                    const missing = addText(card, "p", "• " + resultText(item));
                    missing.dir = "auto";
                });
            }

            if (result.official_source) {
                const source = document.createElement("a");
                source.href = result.official_source;
                source.textContent = t("officialSource");
                source.target = "_blank";
                source.rel = "noopener noreferrer";
                source.dir = "auto";
                card.appendChild(source);
            }

            if (result.application_portal) {
                const portal = document.createElement("a");
                portal.href = result.application_portal;
                portal.textContent = t("applicationPortal");
                portal.target = "_blank";
                portal.rel = "noopener noreferrer";
                portal.dir = "auto";
                card.appendChild(portal);
            }

            results.appendChild(card);
        });
    }

    if (data.important_note) {
        const note = addText(results, "p", resultText(data.important_note));
        note.dir = "auto";
    }
}

async function findBenefits() {
    results.textContent = t("checkingServices");

    try {
        const response = await fetch("/find-benefits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data));
        }

        latestResults = data;
        renderBenefits(data);
        showStatus(t("recommendationsReady"));
        speak(voiceLanguage.value === "ta-IN"
            ? "உங்கள் பரிந்துரைகள் திரையில் காட்டப்பட்டுள்ளன."
            : voiceLanguage.value === "ar-AE"
                ? "تم عرض التوصيات على الشاشة."
                : t("speechDisplayed"));
    } catch (error) {
        latestResults = null;
        results.replaceChildren();
        const errorMessage = addText(results, "p", t("errorLabel") + " " + error.message);
        errorMessage.dir = "auto";
        showStatus(t("loadError"));
        if (voiceLanguage.value === "ar-AE") {
            speak(t("speechError"));
        }
        console.error("VoicePath error:", error);
    }
}

function stopVoiceSession() {
    isRunning = false;
    answerHandled = true;

    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            // no-op
        }
    }

    window.speechSynthesis.cancel();
    startVoiceBtn.disabled = false;
    startVoiceBtnSecondary.disabled = false;
    stopVoiceBtn.disabled = true;
    voiceLanguage.disabled = false;
    supportCategory.disabled = false;
    showStatus(t("readyToListen"));
}

if (!SpeechRecognition) {
    showStatus(t("speechUnsupported"));
    startVoiceBtn.disabled = true;
    startVoiceBtnSecondary.disabled = true;
    retryVoiceBtn.disabled = true;
    micButton.disabled = true;
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
        if (!isRunning || answerHandled) return;
        const transcript = event.results[event.results.length - 1][0].transcript;
        currentAnswer = transcript.trim();
    };

    recognition.onerror = function (event) {
        if (!isRunning || answerHandled) return;
        const error = event.error || "unknown";
        if (error !== "no-speech" && error !== "aborted") {
            showStatus(t("microphoneError") + " " + error);
        }
    };

    recognition.onend = function () {
        if (!isRunning || answerHandled) return;

        if (currentAnswer.trim()) {
            const answer = currentAnswer.trim();
            currentAnswer = "";
            handleAnswer(answer);
            return;
        }

        retryCount++;

        if (retryCount <= 2) {
            const retryMessage = voiceLanguage.value === "ta-IN"
                ? "குரல் கேட்கவில்லை. அதே கேள்விக்கு மீண்டும் பதில் சொல்லுங்கள்."
                : t("retryNoSpeech");
            showStatus(retryMessage);
            setTimeout(function () {
                if (isRunning) {
                    speak(retryMessage, startListening);
                }
            }, 300);
        } else {
            isRunning = false;
            voiceLanguage.disabled = false;
            supportCategory.disabled = false;
            startVoiceBtn.disabled = false;
            startVoiceBtnSecondary.disabled = false;
            stopVoiceBtn.disabled = true;
            retryVoiceBtn.disabled = true;
            showStatus(t("noSpeech"));
        }
    };

    function beginVoiceFlow() {
        if (isRunning) return;

        currentStep = 0;
        currentAnswer = "";
        retryCount = 0;
        answerHandled = false;
        isRunning = true;
        resetProfile();

        results.textContent = "";
        latestResults = null;
        voiceTranscript.textContent = "";
        voiceLanguage.disabled = true;
        supportCategory.disabled = true;
        startVoiceBtn.disabled = true;
        startVoiceBtnSecondary.disabled = true;
        stopVoiceBtn.disabled = false;
        retryVoiceBtn.disabled = false;

        askQuestion();
    }

    startVoiceBtn.addEventListener("click", beginVoiceFlow);
    startVoiceBtnSecondary.addEventListener("click", beginVoiceFlow);
    micButton.addEventListener("click", beginVoiceFlow);
    retryVoiceBtn.addEventListener("click", function () {
        if (isRunning) startListening();
    });
    stopVoiceBtn.addEventListener("click", stopVoiceSession);

    stopVoiceBtn.disabled = true;
    retryVoiceBtn.disabled = true;
}

voiceLanguage.addEventListener("change", applyLanguage);
applyLanguage();
