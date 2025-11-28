// Front-end guard for cookie-based auth.
(function () {
  // Always send cookies
  const origFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    options.credentials = options.credentials || "include";
    return origFetch(url, options);
  };

  async function checkSession() {
    const isLoginPage = location.pathname.endsWith("/login.html") || location.pathname === "/login";
    if (isLoginPage) return;
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        throw new Error("unauthorized");
      }
    } catch {
      window.location.href = "/login.html";
    }
  }

  checkSession();
})();
