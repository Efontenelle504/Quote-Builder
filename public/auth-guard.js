// Simple front-end guard for JWT auth.
(function () {
  const tokenKey = "authToken";

  function getToken() {
    return localStorage.getItem(tokenKey);
  }

  function setToken(token) {
    if (token) localStorage.setItem(tokenKey, token);
  }

  function clearToken() {
    localStorage.removeItem(tokenKey);
  }

  // Wrap fetch to always send Authorization if we have a token
  const origFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    const token = getToken();
    if (token) {
      options.headers = options.headers || {};
      if (options.headers instanceof Headers) {
        options.headers.set("Authorization", `Bearer ${token}`);
      } else if (Array.isArray(options.headers)) {
        options.headers.push(["Authorization", `Bearer ${token}`]);
      } else {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return origFetch(url, options);
  };

  // Expose helpers for login page
  window.authGuard = { getToken, setToken, clearToken };

  // Redirect to login if no token and not already on login page
  const isLoginPage = location.pathname.endsWith("/login.html") || location.pathname === "/login";
  if (!getToken() && !isLoginPage) {
    window.location.href = "/login.html";
  }
})();
