// Selectors
const featureItems = document.querySelectorAll(".feature-item");
const navLeft = document.querySelector("#nav-left");
const navRight = document.querySelector("#nav-right");
const quickNavDots = document.querySelectorAll(".dot");
const AnimateItemOffDelay = 175;
const AnimateItemOnDelay = 275 + AnimateItemOffDelay;
const SrollDistancePerTransition = 200;

let currentIndex = 0;
let targetIndex = 0; // Tracks the final destination index
let animationTimeout = null; // Tracks ongoing animation timeout

// Function to get CSS variable value
const getCSSVariable = (variableName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${variableName}`).trim();
};

// Function to navigate between Feature Items
const navigateToFeature = (newIndex, direction) => {
    // Clear any ongoing animations
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }

    // Looping behavior
    if (newIndex < 0) {
        newIndex = featureItems.length - 1; // Go to the last item
    } else if (newIndex >= featureItems.length) {
        newIndex = 0; // Go to the first item
    }

    // Update target index
    targetIndex = newIndex;

    if (targetIndex === currentIndex) return; // Do nothing if no change in index

    const currentItem = featureItems[currentIndex];
    const nextItem = featureItems[targetIndex];

    // Animate current item off-screen
    const outAnimation = direction === "right" ? "keyOutFromAbove" : "keyOutFromBelow";
    currentItem.style.animation = `${outAnimation} 0.2s ease-in forwards`;

    // Schedule incoming item animation after a brief delay
    animationTimeout = setTimeout(() => {
        const inAnimation = direction === "right" ? "keyInFromBelow" : "keyInFromAbove";
        nextItem.style.animation = `${inAnimation} 0.2s ease-out forwards`;

        // Update background color based on the data-color attribute
        const newColorVariable = nextItem.getAttribute("data-color");
        const newColor = getCSSVariable(newColorVariable);
        document.body.style.backgroundColor = newColor;

        // Update Quick Nav Dot state
        quickNavDots[currentIndex].classList.remove("active");
        quickNavDots[targetIndex].classList.add("active");

        // Update current index
        currentIndex = targetIndex;
    }, AnimateItemOffDelay);
};

// Initialize Quick Nav Dots
quickNavDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        const direction = index > currentIndex ? "right" : "left";
        navigateToFeature(index, direction);
    });
});

// Event listeners for Nav Buttons
navLeft.addEventListener("click", () => navigateToFeature(currentIndex - 1, "left"));
navRight.addEventListener("click", () => navigateToFeature(currentIndex + 1, "right"));

let scrollTimeout = null;
let lastScrollPosition = window.scrollY;

window.addEventListener("wheel", (event) => {
    // Clear any ongoing scroll timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    const scrollDirection = event.deltaY > 0 ? "down" : "up"; // Determine scroll direction
    const steps = Math.ceil(Math.abs(event.deltaY) / SrollDistancePerTransition); // Determine steps based on scroll distance

    // Calculate new index based on scroll direction
    const newIndex = currentIndex + (scrollDirection === "down" ? steps : -steps);

    // Navigate to the new index
    scrollTimeout = setTimeout(() => {
        navigateToFeature(newIndex, scrollDirection === "down" ? "right" : "left");
    }, 100); // Small delay to allow for smoother handling
});


// Set initial background color and Quick Nav Dot state
document.body.style.backgroundColor = getCSSVariable("color-1");
quickNavDots[currentIndex].classList.add("active");
