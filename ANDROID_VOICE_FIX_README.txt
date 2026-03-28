ANDROID VOICE FIX VERSION (NETLIFY READY)

IMPORTANT TRUTH:
- A pure Netlify web app CANNOT force native Android TextToSpeech by itself.
- This version IMPROVES Android compatibility a lot for browser use.
- It uses:
  1) female-voice preference
  2) stronger speech retry logic
  3) user-interaction unlock
  4) voice warm-up
  5) Android-friendly speech settings
- BEST RESULT:
  Open in Chrome browser on Android (not APK WebView)

NETLIFY DROP:
1) npm install
2) npm run build
3) drag dist folder to https://app.netlify.com/drop

IF YOU STILL WANT REAL APK VOICE:
- Need Android Studio / Capacitor native TTS integration
- Web-only Netlify cannot fully solve WebView TTS limitations
