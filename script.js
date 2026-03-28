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

        if (window.updateWaveTheme) {
            window.updateWaveTheme();
        }
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

document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
    initMinimalWaveBackground();
});

/* ---------------- MINIMAL PROFESSIONAL WAVE BACKGROUND ---------------- */

function initMinimalWaveBackground() {
    const container = document.getElementById("three-bg");
    if (!container || typeof THREE === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let scene, camera, renderer, mesh, geometry, material;
    let basePositions;
    let mouseX = 0;
    let mouseY = 0;
    let animationFrame;

    function getTheme() {
        const isDark = document.body.classList.contains("dark-mode");
        return {
            color: isDark ? 0x7fc4ff : 0x7bbcf3,
            opacity: isDark ? 0.09 : 0.055
        };
    }

    function buildScene() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        scene = new THREE.Scene();

        camera = new THREE.OrthographicCamera(
            width / -2,
            width / 2,
            height / 2,
            height / -2,
            1,
            1000
        );
        camera.position.z = 10;

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(width, height);

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const segX = width < 768 ? 26 : 42;
        const segY = height < 768 ? 18 : 28;

        geometry = new THREE.PlaneGeometry(width * 1.2, height * 1.2, segX, segY);

        const theme = getTheme();

        material = new THREE.MeshBasicMaterial({
            color: theme.color,
            wireframe: true,
            transparent: true,
            opacity: theme.opacity
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.z = -0.04;
        mesh.position.set(0, 0, 0);

        scene.add(mesh);

        basePositions = geometry.attributes.position.array.slice();
    }

    function animate(time) {
        const positions = geometry.attributes.position.array;
        const t = time * 0.00022;

        for (let i = 0; i < positions.length; i += 3) {
            const x = basePositions[i];
            const y = basePositions[i + 1];

            positions[i + 2] =
                Math.sin(x * 0.008 + t * 1.4) * 4 +
                Math.cos(y * 0.010 + t * 1.1) * 3;
        }

        geometry.attributes.position.needsUpdate = true;

        mesh.rotation.z += ((mouseX * 0.015) - mesh.rotation.z) * 0.015;
        mesh.position.x += (mouseX * 4 - mesh.position.x) * 0.01;
        mesh.position.y += (-mouseY * 3 - mesh.position.y) * 0.01;

        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(animate);
    }

    function handleMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function handleResize() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        buildScene();
        updateWaveTheme();
        animate(0);
    }

    function updateWaveTheme() {
        if (!material) return;
        const theme = getTheme();
        material.color.set(theme.color);
        material.opacity = theme.opacity;
    }

    window.updateWaveTheme = updateWaveTheme;

    buildScene();
    updateWaveTheme();
    animate(0);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
}