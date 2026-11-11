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

function setDocumentDirection() {
    const isArabic = voiceLanguage.value === "ar-AE";
    document.body.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = voiceLanguage.value;
}

function showStatus(message) {
    voiceStatus.textContent = message;
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

    showStatus(
        voiceLanguage.value === "ar-AE"
            ? "🎤 يستمع الآن... تحدث الآن."
            : voiceLanguage.value === "ta-IN"
                ? "🎤 கேட்கிறது... இப்போது பதில் சொல்லுங்கள்."
                : "🎤 Listening... Please speak now."
    );

    try {
        recognition.lang = voiceLanguage.value;
        recognition.start();
    } catch (error) {
        showStatus("Microphone is busy. Please try again.");
        isRunning = false;
        startVoiceBtn.disabled = false;
        startVoiceBtnSecondary.disabled = false;
        stopVoiceBtn.disabled = true;
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
        const retryMessage = voiceLanguage.value === "ar-AE"
            ? "عذراً، لم أستطع فهم الجواب بشكل واضح. الرجاء التكرار."
            : voiceLanguage.value === "ta-IN"
                ? "மன்னிக்கவும். பதிலை தெளிவாக மீண்டும் சொல்லுங்கள்."
                : "Sorry, I could not understand that answer. Please say it again.";
        showStatus(retryMessage);
        speak(retryMessage, startListening);
        return;
    }

    voiceTranscript.textContent = (voiceTranscript.textContent ? voiceTranscript.textContent + "\n" : "") + (currentStep + 1) + ". " + answer;
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

    showStatus("Finding relevant government benefits...");
    const spokenMessage = voiceLanguage.value === "ar-AE"
        ? "شكرًا لك. الآن نقارن ملفك مع البرامج الحكومية المتاحة."
        : voiceLanguage.value === "ta-IN"
            ? "நன்றி. உங்கள் விவரங்களுடன் பொருந்தக்கூடிய அரசு சேவைகளை சரிபார்க்கிறோம்."
            : "Thank you. We are checking the services that may match your profile.";
    speak(spokenMessage);
    findBenefits();
}

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
}

async function findBenefits() {
    results.textContent = "Checking services...";

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

        results.textContent = "";
        const heading = addText(results, "h3", "Your recommendations are ready.");
        heading.style.marginBottom = "16px";

        if (!Array.isArray(data.results) || data.results.length === 0) {
            addText(results, "p", "No matching programmes were found in the current database. Try another service category or refine your profile.");
        } else {
            data.results.forEach((result) => {
                const card = document.createElement("article");
                card.className = "result-card";

                addText(card, "h4", result.scheme_name || "Government service");
                addText(card, "p", "Category: " + (result.category || "Not specified"));
                addText(card, "p", "Status: " + ((result.status || "To be verified").replaceAll("_", " ")));

                if (Array.isArray(result.reasons) && result.reasons.length > 0) {
                    addText(card, "p", "Why this may match:");
                    result.reasons.forEach((reason) => addText(card, "p", "• " + reason));
                }

                if (Array.isArray(result.missing_information) && result.missing_information.length > 0) {
                    addText(card, "p", "Additional information needed:");
                    result.missing_information.forEach((item) => addText(card, "p", "• " + item));
                }

                if (result.official_source) {
                    const source = document.createElement("a");
                    source.href = result.official_source;
                    source.textContent = "Official source";
                    source.target = "_blank";
                    source.rel = "noopener noreferrer";
                    card.appendChild(source);
                }

                if (result.application_portal) {
                    const portal = document.createElement("a");
                    portal.href = result.application_portal;
                    portal.textContent = "Application portal";
                    portal.target = "_blank";
                    portal.rel = "noopener noreferrer";
                    card.appendChild(portal);
                }

                results.appendChild(card);
            });
        }

        if (data.important_note) {
            addText(results, "p", data.important_note);
        }

        showStatus("Your recommendations are ready.");
        speak(voiceLanguage.value === "ar-AE" ? "تم عرض النتائج على الشاشة." : voiceLanguage.value === "ta-IN" ? "உங்கள் பரிந்துரைகள் திரையில் காட்டப்பட்டுள்ளன." : "Your recommendations are displayed on the screen.");
    } catch (error) {
        results.textContent = "Error: " + error.message;
        showStatus("Could not load scheme matches. Please check the server.");
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
    showStatus("Ready to listen");
}

if (!SpeechRecognition) {
    showStatus("Speech recognition is not supported in this browser.");
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
            showStatus("Microphone error: " + error);
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
            const retryMessage = voiceLanguage.value === "ar-AE"
                ? "لم أسمع الجواب. الرجاء تكرار الإجابة."
                : voiceLanguage.value === "ta-IN"
                    ? "குரல் கேட்கவில்லை. அதே கேள்விக்கு மீண்டும் பதில் சொல்லுங்கள்."
                    : "I could not hear you. Please answer the same question again.";
            showStatus(retryMessage);
            setTimeout(function () {
                if (isRunning) {
                    speak(retryMessage, startListening);
                }
            }, 300);
        } else {
            isRunning = false;
            startVoiceBtn.disabled = false;
            startVoiceBtnSecondary.disabled = false;
            stopVoiceBtn.disabled = true;
            showStatus("No speech was detected after several attempts.");
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

voiceLanguage.addEventListener("change", setDocumentDirection);
setDocumentDirection();
