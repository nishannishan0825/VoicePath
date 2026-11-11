# VoicePath Dubai

A voice-first government services navigator for Dubai and the wider UAE. The app is designed to help residents search for support programmes and public services in Arabic and English, with Tamil retained as an optional additional language.

## What changed
- Reframed the product from an India-only benefits prototype to a Dubai/UAE service navigator.
- Added Arabic as a first-class interface language alongside English.
- Added multi-category matching for housing, education, healthcare, employment, family support, financial assistance, and People of Determination support.
- Updated the backend profile model and scheme database to better reflect UAE eligibility logic.

## Features
- Voice-based intake and guidance
- Arabic and English primary experiences
- Dubai/UAE programme matching
- Manual category selection and voice fallback
- FastAPI backend with structured profile processing

## Technologies Used
- Python
- FastAPI
- HTML
- CSS
- JavaScript
- JSON

## Target Region
Dubai and the United Arab Emirates

## How to Run
1. Install dependencies:
   pip install -r backend/requirements.txt
2. Start the app:
   uvicorn main:app --reload
3. Open:
   http://127.0.0.1:8000

## Notes
The scheme catalogue is maintained in `schemes.json` and mirrored in `backend/schemes.json`. It includes Dubai and UAE government programmes and public services with official authority links. The matching engine is only a preliminary guide; confirm eligibility, deadlines, and application processes with the relevant official source.
