const themeBtn = document.getElementById("theme-toggle");
const body = document.body;

if (themeBtn) {
    const icon = themeBtn.querySelector("i");

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (icon) {
            icon.classList.replace("fa-moon", "fa-sun");
        }
    }

    themeBtn.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");

        if (icon) {
            icon.classList.replace(
                isDark ? "fa-moon" : "fa-sun",
                isDark ? "fa-sun" : "fa-moon"
            );
        }

        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const roles = [
    "Computer Science Student",
    "Web Developer",
    "Cybersecurity Enthusiast",
    "Tech Enthusiast"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typeSpeed = 120;
const backSpeed = 50;
const delayBetweenRoles = 1800;

const rolesElement = document.getElementById("roles");

function typeEffect() {
    if (!rolesElement) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
        rolesElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        rolesElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let typingDelay = isDeleting ? backSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
        typingDelay = delayBetweenRoles;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingDelay = 500;
    }

    setTimeout(typeEffect, typingDelay);
}

document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

function setActiveNav() {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", setActiveNav);

const fadeSections = document.querySelectorAll(".fade-in-section");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.15
    }
);

fadeSections.forEach((section) => observer.observe(section));

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;

    if (window.scrollY > 300) {
        backToTopBtn.style.display = "grid";
    } else {
        backToTopBtn.style.display = "none";
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}