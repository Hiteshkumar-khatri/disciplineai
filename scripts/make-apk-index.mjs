// Replaces dist/index.html with a minimal page that instantly loads the live
// DisciplineAI site inside the Android wrapper APK (full-screen, like a real app).
// Used ONLY when packaging the Android app in CI.
import fs from 'node:fs';

const APP_URL = 'https://hiteshkumar-khatri.github.io/disciplineai/';

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DisciplineAI</title>
  <meta http-equiv="refresh" content="0; url=${APP_URL}" />
  <script>location.replace('${APP_URL}');</script>
  <style>
    html,body{height:100%;margin:0;background:#171717;color:#7c6af7;
      display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;}
  </style>
</head>
<body><div style="font-size:40px">⚡</div><p style="color:#9ca3af">Loading DisciplineAI…</p></body>
</html>
`;

fs.writeFileSync('dist/index.html', page, 'utf8');
console.log('dist/index.html replaced with remote redirect for APK packaging.');