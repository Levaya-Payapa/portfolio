document.addEventListener("DOMContentLoaded", () => {
    const featureItems = document.querySelectorAll(".feature-item");
    const navLeft = document.getElementById("nav-left");
    const navRight = document.getElementById("nav-right");
    const quickNav = document.getElementById("quick-nav");
    const body = document.body;
    let currentIndex = 0;

    // Initialize Quick Nav Dots
    featureItems.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => scrollToFeature(index));
        quickNav.appendChild(dot);
    });

    const updateView = () => {
        featureItems.forEach((item, index) => {
            item.classList.toggle("active", index === currentIndex);
        });

        // Update Quick Nav Dots
        const dots = quickNav.querySelectorAll(".dot");
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });

        // Change Background Color
        const currentColor = featureItems[currentIndex].dataset.color;
        body.style.backgroundColor = currentColor;
    };

    const scrollToFeature = (index) => {
        if (index < 0 || index >= featureItems.length) return;
        currentIndex = index;
        featureItems[index].scrollIntoView({ behavior: "smooth" });
        updateView();
    };

    // Navigation Button Handlers
    navLeft.addEventListener("click", () => scrollToFeature(currentIndex - 1));
    navRight.addEventListener("click", () => scrollToFeature(currentIndex + 1));

    // Detect Manual Scrolling
    let isScrolling = false;
    window.addEventListener("scroll", () => {
        if (isScrolling) return;
        let closestIndex = currentIndex;
        let minDistance = Infinity;

        featureItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const distance = Math.abs(rect.top - window.innerHeight / 2);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== currentIndex) {
            currentIndex = closestIndex;
            updateView();
        }
    });

    // Fade Effect for Feature Items
    window.addEventListener("scroll", () => {
        featureItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const midPoint = window.innerHeight / 2;
            const distance = Math.abs(rect.top - midPoint);
            const fadeThreshold = window.innerHeight / 3; // Adjust for more or less fade
            item.style.opacity = distance < fadeThreshold ? 1 : 1 - (distance - fadeThreshold) / fadeThreshold;
        });
    });

    // Prevent scrolling loop during auto-scroll
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const setIsScrollingFalse = debounce(() => {
        isScrolling = false;
    }, 100);

    window.addEventListener("scroll", () => {
        isScrolling = true;
        setIsScrollingFalse();
    });

    // Set Initial Background Color
    body.style.backgroundColor = featureItems[0].dataset.color;
});
