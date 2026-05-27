type GoogleAppIcon = {
  readonly id: string;
  readonly label: string;
  readonly matches: (url: URL) => boolean;
  readonly assetPath: string;
};

declare const chrome: {
  readonly runtime: {
    getURL(path: string): string;
  };
};

const MANAGED_LINK_ID = "old-google-favicon";
const MANAGED_ATTR = "data-old-google-favicon";

const iconDefinitions: readonly GoogleAppIcon[] = [
  {
    id: "gmail",
    label: "Gmail",
    matches: ({ hostname }) => hostname === "mail.google.com",
    assetPath: "assets/google-2020/gmail.svg"
  },
  {
    id: "calendar",
    label: "Google Calendar",
    matches: ({ hostname }) => hostname === "calendar.google.com",
    assetPath: "assets/google-2020/calendar.svg"
  },
  {
    id: "drive",
    label: "Google Drive",
    matches: ({ hostname }) => hostname === "drive.google.com",
    assetPath: "assets/google-2020/drive.svg"
  },
  {
    id: "docs",
    label: "Google Docs",
    matches: (url) =>
      url.hostname === "docs.google.com" &&
      (url.pathname === "/" || url.pathname.startsWith("/document")),
    assetPath: "assets/google-2020/docs.svg"
  },
  {
    id: "sheets",
    label: "Google Sheets",
    matches: (url) =>
      url.hostname === "docs.google.com" && url.pathname.startsWith("/spreadsheets"),
    assetPath: "assets/google-2020/sheets.svg"
  },
  {
    id: "slides",
    label: "Google Slides",
    matches: (url) =>
      url.hostname === "docs.google.com" && url.pathname.startsWith("/presentation"),
    assetPath: "assets/google-2020/slides.svg"
  },
  {
    id: "forms",
    label: "Google Forms",
    matches: (url) =>
      url.hostname === "docs.google.com" && url.pathname.startsWith("/forms"),
    assetPath: "assets/google-2020/forms.svg"
  },
  {
    id: "meet",
    label: "Google Meet",
    matches: ({ hostname }) => hostname === "meet.google.com",
    assetPath: "assets/google-2020/meet.svg"
  },
  {
    id: "chat",
    label: "Google Chat",
    matches: ({ hostname }) => hostname === "chat.google.com",
    assetPath: "assets/google-2020/chat.svg"
  },
  {
    id: "keep",
    label: "Google Keep",
    matches: ({ hostname }) => hostname === "keep.google.com",
    assetPath: "assets/google-2020/keep.svg"
  },
  {
    id: "tasks",
    label: "Google Tasks",
    matches: ({ hostname }) => hostname === "tasks.google.com",
    assetPath: "assets/google-2020/tasks.svg"
  },
  {
    id: "contacts",
    label: "Google Contacts",
    matches: ({ hostname }) => hostname === "contacts.google.com",
    assetPath: "assets/google-2020/contacts.svg"
  },
  {
    id: "voice",
    label: "Google Voice",
    matches: ({ hostname }) => hostname === "voice.google.com",
    assetPath: "assets/google-2020/voice.svg"
  }
];

let currentHref: string | undefined;
let currentIcon: GoogleAppIcon | undefined;
let observer: MutationObserver | undefined;
let pendingAnimationFrame = 0;
let lastSeenLocation = window.location.href;

install();

function install(): void {
  updateCurrentIcon();
  scheduleApply();
  startHeadObserver();
  watchLocationChanges();

  document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
  document.addEventListener("visibilitychange", scheduleApply);
}

function updateCurrentIcon(): void {
  const url = new URL(window.location.href);
  lastSeenLocation = url.href;
  currentIcon = iconDefinitions.find((definition) => definition.matches(url));
  currentHref = currentIcon ? chrome.runtime.getURL(currentIcon.assetPath) : undefined;
}

function scheduleApply(): void {
  if (pendingAnimationFrame) {
    return;
  }

  pendingAnimationFrame = window.requestAnimationFrame(() => {
    pendingAnimationFrame = 0;
    updateCurrentIcon();
    applyFavicon();
  });
}

function applyFavicon(): void {
  if (!currentHref || !currentIcon || !document.head) {
    return;
  }

  removePageFavicons();

  const managedLink = getOrCreateManagedLink();
  managedLink.href = currentHref;
  managedLink.title = currentIcon.label;
}

function removePageFavicons(): void {
  const faviconLinks = document.head.querySelectorAll<HTMLLinkElement>(
    "link[rel*='icon' i]"
  );

  for (const link of faviconLinks) {
    if (link.id !== MANAGED_LINK_ID && !link.hasAttribute(MANAGED_ATTR)) {
      link.remove();
    }
  }
}

function getOrCreateManagedLink(): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>(
    `link#${MANAGED_LINK_ID}[${MANAGED_ATTR}]`
  );

  if (existing) {
    return existing;
  }

  const link = document.createElement("link");
  link.id = MANAGED_LINK_ID;
  link.setAttribute(MANAGED_ATTR, "true");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.sizes = "any";
  document.head.append(link);
  return link;
}

function startHeadObserver(): void {
  const attach = (): void => {
    if (!document.head || observer) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      if (mutations.some(mutationTouchesFavicon)) {
        scheduleApply();
      }
    });

    observer.observe(document.head, {
      attributes: true,
      attributeFilter: ["href", "rel", "type", "sizes"],
      childList: true,
      subtree: true
    });

    scheduleApply();
  };

  attach();

  if (!observer) {
    const documentObserver = new MutationObserver(() => {
      attach();
      if (observer) {
        documentObserver.disconnect();
      }
    });

    documentObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

function mutationTouchesFavicon(mutation: MutationRecord): boolean {
  if (mutation.type === "attributes") {
    return isFaviconLink(mutation.target);
  }

  return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
    if (isFaviconLink(node)) {
      return true;
    }

    if (node instanceof Element) {
      return Boolean(node.querySelector("link[rel*='icon' i]"));
    }

    return false;
  });
}

function isFaviconLink(node: Node): node is HTMLLinkElement {
  return (
    node instanceof HTMLLinkElement &&
    node.rel.toLowerCase().split(/\s+/).some((token) => token.includes("icon"))
  );
}

function watchLocationChanges(): void {
  const notify = (): void => {
    window.setTimeout(scheduleApply, 0);
  };

  const originalPushState = history.pushState.bind(history);
  history.pushState = (...args) => {
    const result = originalPushState(...args);
    notify();
    return result;
  };

  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = (...args) => {
    const result = originalReplaceState(...args);
    notify();
    return result;
  };

  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);

  window.setInterval(() => {
    if (window.location.href === lastSeenLocation) {
      return;
    }

    lastSeenLocation = window.location.href;
    scheduleApply();
  }, 1000);
}
