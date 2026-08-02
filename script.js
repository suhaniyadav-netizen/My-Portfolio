(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Platform handles — update these in one place. */
  var HANDLES = {
    leetcode: "suhaniyadavv",
    codeforces: "suhaniyadavv",
    tryhackme: "suhaniyadavv",
    github: "suhaniyadav-netizen"
  };

  /* ---------- Small helpers ---------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /** Runs a callback at most once per animation frame while scrolling. */
  function onScroll(handler) {
    var scheduled = false;

    function run() {
      scheduled = false;
      handler();
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!scheduled) {
          scheduled = true;
          window.requestAnimationFrame(run);
        }
      },
      { passive: true }
    );

    handler();
  }

  /** Fetches JSON with a timeout; resolves to null on any failure. */
  function fetchJson(url, timeoutMs) {
    if (typeof window.fetch !== "function") return Promise.resolve(null);

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, timeoutMs || 7000);

    return window
      .fetch(url, controller ? { signal: controller.signal } : undefined)
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .catch(function () {
        return null;
      })
      .then(function (data) {
        window.clearTimeout(timer);
        return data;
      });
  }

  function formatCount(value) {
    if (typeof value !== "number" || !isFinite(value)) return null;
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (value >= 10000) return Math.round(value / 1000) + "k";
    return String(value);
  }

  /* ---------- 1. Theme ---------- */
  function initTheme() {
    var toggle = $("#theme-toggle");
    if (!toggle) return;

    var icon = toggle.querySelector("i");
    var stored = null;

    try {
      stored = localStorage.getItem("theme");
    } catch (error) {
      stored = null;
    }

    var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : systemPrefersDark;

    function apply(dark) {
      document.body.classList.toggle("dark-mode", dark);
      toggle.setAttribute("aria-pressed", dark ? "true" : "false");
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");

      if (icon) {
        icon.classList.toggle("fa-sun", dark);
        icon.classList.toggle("fa-moon", !dark);
      }
    }

    apply(isDark);

    toggle.addEventListener("click", function () {
      isDark = !isDark;
      apply(isDark);

      try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (error) {
        /* storage unavailable — theme still applies for this session */
      }
    });
  }

  /* ---------- 2. Typing animation ---------- */
  function initTypewriter() {
    var target = $("#roles");
    if (!target) return;

    var roles = [
      "Computer Science Student",
      "Web Developer",
      "Cybersecurity Enthusiast",
      "Open Source Contributor"
    ];

    if (prefersReducedMotion) {
      target.textContent = roles[0];
      return;
    }

    var TYPE_SPEED = 92;
    var ERASE_SPEED = 40;
    var HOLD_FULL = 1900;
    var HOLD_EMPTY = 420;

    var roleIndex = 0;
    var charIndex = 0;
    var erasing = false;

    function tick() {
      var role = roles[roleIndex];

      charIndex += erasing ? -1 : 1;
      target.textContent = role.slice(0, charIndex);

      var delay = erasing ? ERASE_SPEED : TYPE_SPEED;

      if (!erasing && charIndex === role.length) {
        erasing = true;
        delay = HOLD_FULL;
      } else if (erasing && charIndex === 0) {
        erasing = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = HOLD_EMPTY;
      }

      window.setTimeout(tick, delay);
    }

    tick();
  }

  /* ---------- 3. Scroll reveal + stagger ---------- */
  function initReveal() {
    var blocks = $all(".reveal");
    if (!blocks.length) return;

    var STAGGER_SELECTOR =
      ".highlight-card, .project-card, .exp-item, .poster-card, .skills-row, .grind-card, .cert-chip";

    blocks.forEach(function (block) {
      $all(STAGGER_SELECTOR, block).forEach(function (child, index) {
        child.style.setProperty("--stagger", index * 70 + "ms");
      });
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      blocks.forEach(function (block) {
        block.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    blocks.forEach(function (block) {
      observer.observe(block);
    });
  }

  /* ---------- 4 & 5. Active nav indicator + nav elevation ---------- */
  function initNav() {
    var nav = $(".floating-nav");
    var links = $all(".nav-link");

    var targets = links
      .map(function (link) {
        var id = link.getAttribute("href") || "";
        var section = id.charAt(0) === "#" ? document.getElementById(id.slice(1)) : null;
        return section ? { link: link, section: section } : null;
      })
      .filter(Boolean);

    onScroll(function () {
      if (nav) {
        nav.classList.toggle("is-scrolled", window.scrollY > 8);
      }

      if (!targets.length) return;

      var offset = (nav ? nav.offsetHeight : 0) + 48;
      var current = targets[0];

      targets.forEach(function (item) {
        if (item.section.getBoundingClientRect().top - offset <= 0) {
          current = item;
        }
      });

      // Near the page bottom, favour the last section (usually contact).
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 24) {
        current = targets[targets.length - 1];
      }

      targets.forEach(function (item) {
        var active = item === current;
        item.link.classList.toggle("active", active);

        if (active) {
          item.link.setAttribute("aria-current", "true");
        } else {
          item.link.removeAttribute("aria-current");
        }
      });
    });
  }

  /* ---------- 6. Back to top ---------- */
  function initBackToTop() {
    var button = $("#backToTop");
    if (!button) return;

    onScroll(function () {
      button.classList.toggle("is-visible", window.scrollY > 320);
    });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      var logo = $(".logo");
      if (logo) logo.focus({ preventScroll: true });
    });
  }

  /* ---------- 7. Currently Grinding ---------- */
  var GRIND_SOURCES = {
    leetcode: function () {
      return fetchJson("https://leetcode-api-faisalshohag.vercel.app/" + HANDLES.leetcode).then(function (data) {
        if (!data || typeof data.totalSolved !== "number") return null;
        return {
          solved: formatCount(data.totalSolved),
          rating: formatCount(data.contestRating),
          rank: formatCount(data.ranking)
        };
      });
    },


    codeforces: function () {
      return fetchJson("https://codeforces.com/api/user.info?handles=" + HANDLES.codeforces).then(function (data) {
        var user = data && data.status === "OK" && data.result && data.result[0];
        if (!user) return null;
        return {
          rating: formatCount(user.rating),
          max: formatCount(user.maxRating),
          rank: user.rank ? user.rank.replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : null
        };
      });
    },

    tryhackme: function () {
      return fetchJson("https://tryhackme-badge.vercel.app/api/user/" + HANDLES.tryhackme).then(function (data) {
        if (!data) return null;
        return {
          rank: formatCount(data.userRank || data.rank),
          rooms: formatCount(data.completedRooms || data.rooms),
          streak: data.streak ? String(data.streak) : null
        };
      });
    },

    github: function () {
      return Promise.all([
        fetchJson("https://api.github.com/users/" + HANDLES.github),
        fetchJson("https://api.github.com/users/" + HANDLES.github + "/repos?per_page=100&sort=updated")
      ]).then(function (results) {
        var user = results[0];
        var repos = results[1];
        if (!user) return null;

        var stars = Array.isArray(repos)
          ? repos.reduce(function (total, repo) {
              return total + (repo.stargazers_count || 0);
            }, 0)
          : null;

        return {
          repos: formatCount(user.public_repos),
          stars: stars === null ? null : formatCount(stars),
          followers: formatCount(user.followers)
        };
      });
    }
  };

  function renderGrindStats(card, stats) {
    var filled = 0;

    $all("[data-field]", card).forEach(function (node) {
      var value = stats ? stats[node.getAttribute("data-field")] : null;

      if (value) {
        node.textContent = value;
        filled += 1;
      } else {
        // Drop stats a platform does not expose rather than showing an empty slot.
        var slot = node.closest(".grind-stat");
        if (slot) slot.remove();
      }
    });

    return filled;
  }

  function initGrinding() {
    var strip = $("#grind-strip");
    if (!strip) return;

    var note = $("#grind-note");
    var cards = $all(".grind-card", strip);
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.classList.add("is-loading");
    });

    var requests = cards.map(function (card) {
      var key = card.getAttribute("data-grind");
      var source = GRIND_SOURCES[key];
      var request = source ? source() : Promise.resolve(null);

      return request
        .catch(function () {
          return null;
        })
        .then(function (stats) {
          card.classList.remove("is-loading");
          var filled = renderGrindStats(card, stats);

          if (!filled) {
            // No public stat available: keep the card balanced with a quiet fallback.
            var container = $("[data-stats]", card);
            if (container) {
              container.textContent = "View profile →";
              container.className = "grind-fallback";
            }
          }


          return filled > 0;
        });
    });

    Promise.all(requests).then(function (results) {
      if (!note) return;

      var anyLive = results.some(Boolean);
      note.textContent = anyLive
        ? "Stats pulled live from each platform."
        : "Live stats are unavailable right now — the profile links stay current.";
    });
  }

  /* ---------- 8. Current year ---------- */
  function initYear() {
    var yearEl = $("#year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function init() {
    initTheme();
    initTypewriter();
    initReveal();
    initNav();
    initBackToTop();
    initGrinding();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
