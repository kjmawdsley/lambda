const COOKIE_NAME = "lambda_preview";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_MESSAGE = "lambda-private-preview-v1";

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sessionToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(TOKEN_MESSAGE));
  return toBase64Url(new Uint8Array(signature));
}

async function passwordsMatch(a, b) {
  const encoder = new TextEncoder();
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b))
  ]);
  const x = new Uint8Array(aHash);
  const y = new Uint8Array(bHash);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function loginPage({ next = "/", error = false } = {}) {
  const action = "/__auth?next=" + encodeURIComponent(safeNext(next));
  const errorMarkup = error
    ? '<p class="error" role="alert">That password isn\'t right.</p>'
    : '<p class="note">Private preview. Password required.</p>';

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Lambda — Private preview</title>
  <style>
    :root{--uv:#5a2dff;--uv-deep:#210b35;--ir:#ff415c;--ir-hot:#ff7255;--paper:#f3eff5;--ink:#170f1c}
    *{box-sizing:border-box} html,body{min-height:100%}
    body{margin:0;min-height:100vh;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);background:var(--paper);color:var(--ink);font-family:Arial,Helvetica,sans-serif}
    .panel{position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:30px clamp(24px,4vw,64px) 34px;overflow:hidden;background:var(--uv-deep);color:#fbf7ff}
    .brand{margin:0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.14em}
    .statement{position:relative;z-index:2;max-width:640px;margin:auto 0;padding:12vh 0}
    h1{margin:0;max-width:720px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(64px,8vw,132px);font-weight:400;line-height:.83;letter-spacing:-.045em}
    h1 em{display:block;font-weight:400;margin-left:7vw}
    .wave{position:absolute;z-index:1;left:-8%;bottom:20%;width:116%;height:120px;overflow:visible}
    .wave path{fill:none;stroke:var(--ir);stroke-width:3;stroke-linecap:round;vector-effect:non-scaling-stroke}
    .panel-foot{position:relative;z-index:2;display:flex;justify-content:space-between;gap:20px;font-size:11px;text-transform:uppercase;letter-spacing:.1em}
    .login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px clamp(28px,7vw,110px)}
    .form-wrap{width:min(480px,100%)} .kicker{margin:0 0 28px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#716976}
    h2{margin:0 0 44px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(46px,5vw,76px);font-weight:400;line-height:.92;letter-spacing:-.035em}
    form{display:grid;gap:14px} label{font-size:11px;text-transform:uppercase;letter-spacing:.1em}
    .field{display:grid;grid-template-columns:1fr auto;border-bottom:1px solid rgba(23,15,28,.35);transition:border-color .18s ease}
    .field:focus-within{border-color:var(--ir)}
    input{min-width:0;border:0;outline:0;padding:15px 0;background:transparent;color:var(--ink);font:inherit;font-size:18px}
    button{border:0;background:transparent;color:var(--ink);padding:0 0 0 24px;font:600 13px/1 Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;transition:color .18s ease,transform .18s ease}
    button:hover,button:focus-visible{color:var(--ir);transform:translateX(3px)}
    .note,.error{min-height:20px;margin:14px 0 0;font-size:13px}.note{color:#716976}.error{color:var(--ir)}
    @media(max-width:800px){body{grid-template-columns:1fr}.panel{min-height:48vh}.login{min-height:52vh;padding-top:58px;padding-bottom:70px}.statement{padding:8vh 0}h1{font-size:clamp(56px,18vw,92px)}.wave{bottom:16%;height:82px}}
  </style>
</head>
<body>
  <section class="panel">
    <p class="brand">Lambda</p>
    <div class="statement"><h1>Beyond the <em>visible.</em></h1></div>
    <svg class="wave" viewBox="0 0 1600 180" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-120 90 C-80 54 -40 54 0 90 C40 126 80 126 120 90 C160 54 200 54 240 90 C280 126 320 126 360 90 C400 54 440 54 480 90 C520 126 560 126 600 90 C640 54 680 54 720 90 C760 126 800 126 840 90 C880 54 920 54 960 90 C1000 126 1040 126 1080 90 C1120 54 1160 54 1200 90 C1240 126 1280 126 1320 90 C1360 54 1400 54 1440 90 C1480 126 1520 126 1560 90 C1600 54 1640 54 1680 90"/>
    </svg>
    <div class="panel-foot"><span>Creative direction + production</span><span>Private preview</span></div>
  </section>
  <main class="login">
    <div class="form-wrap">
      <p class="kicker">Restricted access</p>
      <h2>Enter the<br><em>preview.</em></h2>
      <form method="post" action="${action}">
        <label for="password">Password</label>
        <div class="field">
          <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
          <button type="submit">Enter →</button>
        </div>
        ${errorMarkup}
      </form>
    </div>
  </main>
</body>
</html>`;
}

function pageResponse(options, status = 200) {
  return new Response(loginPage(options), {
    status,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.SITE_PASSWORD) {
      return new Response("Lambda preview is not configured yet.", {
        status: 503,
        headers: {
          "content-type": "text/plain; charset=UTF-8",
          "cache-control": "no-store",
          "x-robots-tag": "noindex, nofollow, noarchive"
        }
      });
    }

    const expectedToken = await sessionToken(env.SITE_PASSWORD);
    const currentToken = readCookie(request.headers.get("cookie"), COOKIE_NAME);

    if (url.pathname === "/__auth") {
      if (request.method !== "POST") return Response.redirect(new URL("/", url), 303);

      const form = await request.formData();
      const submitted = String(form.get("password") || "");
      const next = safeNext(url.searchParams.get("next"));

      if (!(await passwordsMatch(submitted, env.SITE_PASSWORD))) {
        return pageResponse({ next, error: true }, 401);
      }

      return new Response(null, {
        status: 303,
        headers: {
          "location": next,
          "set-cookie": `${COOKIE_NAME}=${expectedToken}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store"
        }
      });
    }

    if (url.pathname === "/__logout") {
      return new Response(null, {
        status: 303,
        headers: {
          "location": "/",
          "set-cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store"
        }
      });
    }

    if (currentToken !== expectedToken) {
      return pageResponse({ next: url.pathname + url.search });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const response = new Response(assetResponse.body, assetResponse);
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    response.headers.set("referrer-policy", "strict-origin-when-cross-origin");

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) response.headers.set("cache-control", "private, no-store");

    return response;
  }
};
