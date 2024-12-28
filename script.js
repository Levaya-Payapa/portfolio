// Selectors and Global Variables
const featureItems = document.querySelectorAll(".feature-item");
const root = document.documentElement;
const navLeft = document.querySelector("#nav-left");
const navRight = document.querySelector("#nav-right");
const navBar = document.querySelector(".nav-bar");
const aboutText = document.querySelector('.about-scrolling-text');
const swipeThreshold = 30;
let quickNavDots;
let animationTimeout = null;
let activeYouTube = null;
let isScrolling = false;
let currentIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;


// Generate Quick Navigation Dots
function generateQuickNavDots() {
    const quickNavContainer = document.querySelector("#quick-nav");
    quickNavContainer.innerHTML = "";

    featureItems.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.dataset.index = index;
        quickNavContainer.appendChild(dot);

        dot.addEventListener("click", () => {
            const direction = index > currentIndex ? "right" : "left";
            navigateToFeature(index, direction);
        });
    });

    quickNavDots = document.querySelectorAll(".dot");
    quickNavDots[currentIndex].classList.add("active");
}


// Update Dynamic Color
function updateDynamicColor(index) {
    const colorVariable = `--color-${index + 1}`;
    const newColor = getComputedStyle(root).getPropertyValue(colorVariable).trim();
    root.style.setProperty("--dynamic-color", newColor);
}


// Feature Item Navigation
function navigateToFeature(newIndex, direction) {
    // Remove the active YouTube player if it exists
    if (activeYouTube) {
        activeYouTube.innerHTML = ""; // Remove iframe
        activeYouTube.style.display = "none"; // Hide container
        activeYouTube.classList.remove("active");
        activeYouTube = null; // Reset active player tracking
    }

    if (animationTimeout) clearTimeout(animationTimeout);

    // Loop navigation
    if (newIndex < 0) newIndex = featureItems.length - 1;
    if (newIndex >= featureItems.length) newIndex = 0;

    if (newIndex === currentIndex) return;

    const currentItem = featureItems[currentIndex];
    const nextItem = featureItems[newIndex];

    // Animate current and next items (video previews)
    currentItem.style.animation = direction === "right"
        ? "keyOutFromAbove 0.2s ease-in forwards"
        : "keyOutFromBelow 0.2s ease-in forwards";

    animationTimeout = setTimeout(() => {
        nextItem.style.animation = direction === "right"
            ? "keyInFromBelow 0.2s ease-out forwards"
            : "keyInFromAbove 0.2s ease-out forwards";
    }, 175);

    // Update current index and dynamic color
    currentIndex = newIndex;
    updateDynamicColor(newIndex);

    // Update active state of dots
    quickNavDots.forEach(dot => dot.classList.remove("active"));
    quickNavDots[currentIndex].classList.add("active");
}
navLeft.addEventListener("click", () => navigateToFeature(currentIndex - 1, "left"));
navRight.addEventListener("click", () => navigateToFeature(currentIndex + 1, "right"));
aboutText.addEventListener("wheel", (event) => {
    event.stopPropagation(); // Disable Scrolling in About Page
});

// Info Button
document.addEventListener("DOMContentLoaded", () => {
    const navBar = document.getElementById("nav-bar");
    const infoBtn = document.getElementById("info-btn");
    const infoIcon = document.getElementById("info-icon");
    let isInfoPageVisible = false; // Track state

    function toggleInfoPage() {
        if (isInfoPageVisible) {
            // Trigger InfoPageOff animation
            navBar.style.animation = "InfoPageOff 0.5s ease forwards";
            infoIcon.src = "Assets-Web/icon-info.svg"; // Change back to info icon
        } else {
            // Trigger InfoPageOn animation
            navBar.style.animation = "InfoPageOn 0.5s ease forwards";
            infoIcon.src = "Assets-Web/icon-close_window.svg"; // Change to close icon
        }
        isInfoPageVisible = !isInfoPageVisible; // Toggle state
    }

    // Button click toggles info page
    infoBtn.addEventListener("click", toggleInfoPage);

    // Helper function to simulate "click" animations
    function triggerButtonAnimation(button) {
        button.classList.add("active-simulated");
        setTimeout(() => button.classList.remove("active-simulated"), 100); // Match animation timing
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "i": // Open/close info page
                triggerButtonAnimation(infoBtn);
                infoBtn.click(); // Simulate button click
                break;
            case "Escape": // Close info page
                if (isInfoPageVisible) {
                    triggerButtonAnimation(infoBtn);
                    infoBtn.click(); // Simulate button click to close
                }
                break;
            case "ArrowLeft": // Navigate left
            case "ArrowUp":
                triggerButtonAnimation(navLeft);
                navLeft.click(); // Simulate left navigation button click
                break;
            case "ArrowRight": // Navigate right
            case "ArrowDown":
                triggerButtonAnimation(navRight);
                navRight.click(); // Simulate right navigation button click
                break;
        }
    });
});

// Add CSS dynamically to simulate :active animation
const style = document.createElement("style");
style.textContent = `
    .nav-buttons button.active-simulated:after {
        content: "";
        position: relative;
        left: 0;
        top: 0;
        opacity: 1;
        transition: 0s;
        transform: translateX(-11.5px);
        box-shadow: 0 0 0px 16px white;
    }
`;
document.head.appendChild(style);


// Scroll Navigation Support
let lastScrollTime = 0;
window.addEventListener("wheel", (event) => {
    const now = Date.now();
    const scrollDirection = event.deltaY > 0 ? "down" : "up"; // Determine scroll direction

    const nextIndex = currentIndex + (scrollDirection === "down" ? 1 : -1);
    navigateToFeature(nextIndex, scrollDirection === "down" ? "right" : "left");
});
// Detect scrolling and disable iframe interaction temporarily
window.addEventListener("scroll", () => {
    if (activeYouTube) {
        activeYouTube.classList.remove("active"); // Temporarily disable interactions
    }

    clearTimeout(isScrolling);

    isScrolling = setTimeout(() => {
        if (activeYouTube) {
            activeYouTube.classList.add("active"); // Re-enable interactions after scrolling
        }
    }, 250); // Re-enable after 250ms of no scrolling
});


// Swipe Gesture Support
window.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});
window.addEventListener("touchmove", (event) => {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
});
window.addEventListener("touchend", () => {
    handleSwipeGesture();
});
function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine if the swipe is mostly horizontal or vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        const direction = deltaX > 0 ? "right" : "left";
        navigateToFeature(currentIndex + (direction === "right" ? 1 : -1), direction);
    } else if (Math.abs(deltaY) > swipeThreshold) {
        const direction = deltaY > 0 ? "up" : "down"; // Down = swipe up, Up = swipe down (since touch Y is inverted)
        const steps = 1; // One swipe = one step

        if (direction === "down") {
            navigateToFeature(currentIndex + steps, "right");
        } else {
            navigateToFeature(currentIndex - steps, "left");
        }
    }
}


// Initialize
generateQuickNavDots();
updateBackgroundColor("color-1"); // Set initial background color