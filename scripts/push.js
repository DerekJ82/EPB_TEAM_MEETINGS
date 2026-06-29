// Pushes project files directly to the Apps Script REST API using native https,
// bypassing clasp's node-fetch dependency which fails with "Premature close"
// on HTTP/2 responses from script.googleapis.com.
const https = require('https');
const fs    = require('fs');

const rc         = JSON.parse(fs.readFileSync(process.env.HOME + '/.clasprc.json', 'utf8'));
const accessToken = (rc.tokens && rc.tokens.default ? rc.tokens.default : rc.token).access_token;
const scriptId   = JSON.parse(fs.readFileSync('.clasp.json', 'utf8')).scriptId;

const files = [
  { name: 'appsscript', type: 'JSON',      source: fs.readFileSync('appsscript.json', 'utf8') },
  { name: 'code',       type: 'SERVER_JS',  source: fs.readFileSync('code.gs',         'utf8') },
  { name: 'index',      type: 'HTML',       source: fs.readFileSync('index.html',       'utf8') },
  { name: 'April2026',  type: 'HTML',       source: fs.readFileSync('April2026.html',   'utf8') },
];

const body = JSON.stringify({ files });
const len  = Buffer.byteLength(body);
console.log('Pushing', files.length, 'files (' + len + ' bytes) to script', scriptId);

const req = https.request({
  hostname: 'script.googleapis.com',
  path:     '/v1/projects/' + scriptId + '/content',
  method:   'PUT',
  headers:  {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type':  'application/json',
    'Content-Length': len,
  },
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('HTTP', res.statusCode);
    if (res.statusCode === 200) {
      const result = JSON.parse(d);
      console.log('Push succeeded —', (result.files || []).length, 'files live');
    } else {
      console.error('Push failed:', d);
      process.exit(1);
    }
  });
});

req.on('error', e => { console.error('Network error:', e.message); process.exit(1); });
req.write(body);
req.end();
