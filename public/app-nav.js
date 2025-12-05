(function () {
  if (window.__ZUpp_NAV_LOADED__) return;
  window.__ZUpp_NAV_LOADED__ = true;

  const style = document.createElement("style");
  style.textContent = `
    .app-nav {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      background: #111827;
      color: #f9fafb;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;
    }
    .app-nav .app-nav-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
    .app-nav .app-nav-left span {
      opacity: 0.9;
    }
    .app-nav .app-nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .app-nav .app-nav-link {
      border-radius: 9999px;
      padding: 4px 10px;
      border: 1px solid rgba(249,250,251,0.1);
      background: transparent;
      color: #f9fafb;
      text-decoration: none;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
    }
    .app-nav .app-nav-link:hover {
      background: #1f2937;
      border-color: rgba(249,250,251,0.3);
    }
    .app-nav .app-nav-link.active {
      background: #b11226;
      border-color: #b11226;
    }
    @media (max-width: 640px) {
      .app-nav {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(style);

  const currentPath = location.pathname.replace(/\/+$/, "") || "/";

  const linkDefs = [
    { href: "/final_quote_builder.html", label: "Quote Builder" },
    { href: "/catalog.html", label: "Catalog Manager" },
    { href: "/sales_management.html", label: "Sales Dashboard" },
    { href: "/admin-users.html", label: "User Management" },
    { href: "/system_packages.html", label: "System Packages" },
  ];

  const nav = document.createElement("div");
  nav.className = "app-nav";
  nav.innerHTML = `
    <div class="app-nav-left">
      <span>Zuppardo's Quote Platform</span>
    </div>
    <div class="app-nav-links"></div>
  `;

  const linksContainer = nav.querySelector(".app-nav-links");
  linkDefs.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    a.className = "app-nav-link";
    const normalized = link.href.replace(/\/+$/, "");
    if (normalized && currentPath.endsWith(normalized)) {
      a.classList.add("active");
    }
    linksContainer.appendChild(a);
  });

  const first = document.body.firstChild;
  if (first) {
    document.body.insertBefore(nav, first);
  } else {
    document.body.appendChild(nav);
  }
})();

