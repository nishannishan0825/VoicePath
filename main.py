
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).resolve().parent
if PROJECT_ROOT.name == "backend":
    PROJECT_ROOT = PROJECT_ROOT.parent

app = FastAPI(
    title="VoicePath Dubai",
    description="Voice-first Government Benefits and Services Navigator for Dubai and UAE",
    version="2.0.0",
)


def load_schemes():
    candidates = [
        PROJECT_ROOT / "schemes.json",
        PROJECT_ROOT / "backend" / "schemes.json",
    ]
    for candidate in candidates:
        if candidate.exists():
            with candidate.open("r", encoding="utf-8") as file:
                return json.load(file)
    return []


SCHEMES = load_schemes()


@app.get("/")
def home():
    return FileResponse(PROJECT_ROOT / "index.html")


@app.get("/style.css")
def get_css():
    return FileResponse(PROJECT_ROOT / "style.css")


@app.get("/script.js")
def get_js():
    return FileResponse(PROJECT_ROOT / "script.js")


@app.get("/health")
def health():
    return {"status": "healthy", "service": "VoicePath Dubai"}


class UserProfile(BaseModel):
    support_needed: str = ""
    support_category: str | None = None
    nationality: str | None = None
    residency_status: str | None = None
    emirate: str | None = None
    age: int | None = Field(default=None, ge=0, le=120)
    gender: str | None = None
    employment_status: str | None = None
    monthly_income: int | None = Field(default=None, ge=0)
    household_income: int | None = Field(default=None, ge=0)
    family_size: int | None = Field(default=None, ge=1, le=50)
    marital_status: str | None = None
    dependants: int | None = Field(default=None, ge=0, le=50)
    student_status: bool | None = None
    disability_status: bool | None = None
    disability_percentage: int | None = Field(default=None, ge=0, le=100)
    senior_citizen: bool | None = None
    housing_status: str | None = None
    healthcare_needs: bool | None = None
    education_needs: bool | None = None
    existing_assistance: bool | None = None
    documents: list[str] = Field(default_factory=list)


@app.post("/profile")
def create_profile(profile: UserProfile):
    return {
        "message": "Profile received successfully",
        "profile": profile.model_dump(),
        "note": "This is not a final government eligibility decision.",
    }


@app.get("/schemes")
def get_schemes():
    return {
        "total_schemes": len(SCHEMES),
        "schemes": SCHEMES,
        "note": "Verify current eligibility and application details with official sources.",
    }


def normalize_text(value):
    return " ".join(str(value or "").lower().split())


def get_requested_categories(support):
    support_text = normalize_text(support)
    if not support_text:
        return []

    category_map = {
        "financial_assistance": [
            "financial assistance",
            "cash support",
            "benefit",
            "low income",
            "social support",
            "grants",
            "financial",
        ],
        "housing": [
            "housing",
            "home",
            "rent",
            "mortgage",
            "construction",
            "renovation",
            "apartment",
            "housing loan",
        ],
        "people_of_determination": [
            "people of determination",
            "disability",
            "sanad",
            "accessibility",
            "rehabilitation",
            "parking",
            "care",
            "wheelchair",
        ],
        "senior_citizens": [
            "senior",
            "elder",
            "thukher",
            "old age",
            "retirement",
            "age care",
        ],
        "family_support": [
            "family",
            "marriage",
            "wedding",
            "child",
            "women",
            "family support",
        ],
        "education": [
            "education",
            "scholarship",
            "student",
            "tuition",
            "university",
            "school",
        ],
        "healthcare": [
            "healthcare",
            "health",
            "medical",
            "enaya",
            "reaya",
            "homecare",
            "hospital",
        ],
        "employment": [
            "employment",
            "job",
            "nafis",
            "training",
            "entrepreneur",
            "economic",
            "work",
        ],
        "transport_and_utilities": [
            "transport",
            "rta",
            "dewa",
            "utility",
            "electricity",
            "water",
            "discount",
            "concession",
        ],
        "government_services": [
            "visa",
            "residency",
            "emirates id",
            "government service",
            "documents",
            "support services",
        ],
    }

    if support_text in category_map:
        return [support_text]

    categories = []
    for category, keywords in category_map.items():
        if any(keyword in support_text for keyword in keywords):
            categories.append(category)
    return categories


def is_supported_by_profile(profile, scheme):
    scheme_category = normalize_text(scheme.get("category", ""))
    selected_category = normalize_text(profile.support_category or profile.support_needed)
    if selected_category == scheme_category:
        return True

    keywords = [
        str(scheme.get("category", "")),
        *[str(keyword).lower() for keyword in scheme.get("keywords", [])],
    ]
    profile_text = normalize_text(
        " ".join(
            filter(
                None,
                [
                    profile.support_needed,
                    profile.support_category,
                    profile.nationality,
                    profile.residency_status,
                    profile.emirate,
                    profile.housing_status,
                    profile.employment_status,
                ],
            )
        )
    )
    if not profile_text:
        return True
    return any(keyword in profile_text for keyword in keywords)


def check_eligibility(profile, scheme):
    reasons = []
    missing = []

    if profile.nationality:
        allowed_nationalities = [
            str(item).lower() for item in scheme.get("eligible_nationalities", [])
        ]
        if allowed_nationalities and profile.nationality.lower() not in allowed_nationalities:
            reasons.append("This scheme is limited to certain nationalities or residency types.")
    elif scheme.get("eligible_nationalities"):
        missing.append("Nationality")

    required_residency = scheme.get("required_residency")
    if required_residency:
        if profile.residency_status is None:
            missing.append("Residency status")
        elif normalize_text(profile.residency_status) != normalize_text(required_residency):
            reasons.append(f"This programme requires {required_residency} residency.")

    emirates = scheme.get("emirates") or []
    if emirates:
        if profile.emirate is None:
            missing.append("Emirate of residence")
        elif normalize_text(profile.emirate) not in [normalize_text(item) for item in emirates]:
            reasons.append("This scheme is only available in specific emirates.")

    min_age = scheme.get("minimum_age")
    if min_age is not None:
        if profile.age is None:
            missing.append("Age")
        elif profile.age < min_age:
            reasons.append(f"Age must be at least {min_age} years.")

    max_age = scheme.get("maximum_age")
    if max_age is not None:
        if profile.age is None:
            missing.append("Age")
        elif profile.age > max_age:
            reasons.append(f"Age must be {max_age} or younger.")

    if scheme.get("requires_disability"):
        if profile.disability_status is None:
            missing.append("People of Determination status")
        elif profile.disability_status is not True:
            reasons.append("This support is specifically for People of Determination.")
        elif profile.disability_percentage is None:
            missing.append("Disability percentage")
        elif profile.disability_percentage < (scheme.get("minimum_disability_percentage") or 0):
            reasons.append(
                f"Disability percentage must be at least {scheme.get('minimum_disability_percentage')}%."
            )

    if scheme.get("requires_senior_citizen"):
        if profile.senior_citizen is None:
            missing.append("Senior citizen status")
        elif profile.senior_citizen is not True:
            reasons.append("This scheme is targeted at senior citizens.")

    if scheme.get("requires_student"):
        if profile.student_status is None:
            missing.append("Student status")
        elif profile.student_status is not True:
            reasons.append("This support is for students.")

    if scheme.get("income_limit_monthly") is not None:
        if profile.monthly_income is None:
            missing.append("Monthly income")
        elif profile.monthly_income > scheme["income_limit_monthly"]:
            reasons.append(
                f"Monthly income exceeds the scheme limit of AED {scheme['income_limit_monthly']}."
            )

    if scheme.get("income_limit_household") is not None:
        if profile.household_income is None:
            missing.append("Household income")
        elif profile.household_income > scheme["income_limit_household"]:
            reasons.append(
                f"Household income exceeds the scheme limit of AED {scheme['income_limit_household']}."
            )

    if scheme.get("requires_healthcare_need") and profile.healthcare_needs is not True:
        reasons.append("Healthcare support is more relevant when there is a medical need.")

    if scheme.get("requires_housing_need") and profile.housing_status is None:
        missing.append("Housing situation")

    if scheme.get("requires_support_category"):
        requested_text = normalize_text(profile.support_needed or profile.support_category or "")
        if requested_text:
            keywords = [normalize_text(item) for item in scheme.get("keywords", [])]
            if not any(k in requested_text for k in keywords):
                reasons.append("The requested support does not align with the selected service category.")

    if not reasons and not missing:
        status = "potential_match"
    elif missing:
        status = "needs_more_information"
    else:
        status = "not_matched"

    return {
        "scheme_name": scheme.get("scheme_name") or scheme.get("name") or "Government service",
        "category": scheme.get("category"),
        "status": status,
        "reasons": reasons,
        "missing_information": missing,
        "jurisdiction": scheme.get("jurisdiction", "UAE"),
        "official_source": scheme.get("official_source"),
        "application_portal": scheme.get("application_portal"),
    }


@app.post("/find-benefits")
def find_benefits(profile: UserProfile):
    requested_categories = get_requested_categories(profile.support_needed or profile.support_category or "")

    if not requested_categories:
        return {
            "message": "Please specify the type of support you need, such as housing, education, healthcare, employment, or disability support.",
            "total_matches": 0,
            "results": [],
            "important_note": "Use Arabic or English and specify your support category to improve matching accuracy.",
        }

    results = []
    for scheme in SCHEMES:
        scheme_category = str(scheme.get("category", "")).strip()
        if scheme_category and scheme_category not in requested_categories:
            continue
        if not is_supported_by_profile(profile, scheme):
            continue
        result = check_eligibility(profile, scheme)
        if result["status"] == "not_matched" and not result["missing_information"]:
            continue
        results.append(result)

    return {
        "message": "Preliminary scheme matching completed.",
        "total_matches": len(results),
        "results": results,
        "important_note": "These are preliminary matches only. Confirm the latest eligibility rules and application windows with the official government portal.",
    }