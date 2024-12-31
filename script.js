// Selectors and Global Variables
const featureItems = document.querySelectorAll(".feature-item");
const root = document.documentElement;
const navLeft = document.querySelector("#nav-left");
const navRight = document.querySelector("#nav-right");
const navBar = document.querySelector(".nav-bar");
const aboutText = document.querySelector('.about-scrolling-text');
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe (in pixels)
const TIME_THRESHOLD = 500; // Maximum time for a swipe (in milliseconds)
let startY = 0; // Starting Y coordinate of touch
let startTime = 0; // Starting time of touch
let quickNavDots;
let animationTimeout = null;
let activeYouTube = null;
let isScrolling = false;
let currentIndex = 0;


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


// Set Cover Video Starting State
document.addEventListener("DOMContentLoaded", () => {
    const coverFeatureItem = document.querySelector('.feature-item[data-role="cover"]');
    if (coverFeatureItem) {
        coverFeatureItem.style.transform = "translateY(0)";
        coverFeatureItem.style.opacity = "1";
    }
});


// Show a play button to manually start playback
window.addEventListener("load", () => {
    let userInteracted = false;

    // Track user interaction globally
    document.addEventListener("click", () => {
        userInteracted = true;
    });

    // Function to determine prompt text based on screen width
    const getPromptText = () => {
        return window.innerWidth >= 768 
            ? "Click to enable video playback." 
            : "Tap to enable video playback.";
    };

    // Function to show play prompt
    const showPlayPrompt = (video) => {
        console.log("Autoplay blocked. Requesting user interaction.");

        // Create and style the play prompt
        const playPrompt = document.createElement("div");
        playPrompt.textContent = getPromptText();
        playPrompt.style.position = "fixed";
        playPrompt.style.top = "50%";
        playPrompt.style.left = "50%";
        playPrompt.style.width = "267px";
        playPrompt.style.transform = "translate(-50%, -50%)";
        playPrompt.style.background = "rgba(0, 0, 0, 0.69)";
        playPrompt.style.color = "white";
        playPrompt.style.padding = "100%";
        playPrompt.style.borderRadius = "8px";
        playPrompt.style.cursor = "pointer";
        playPrompt.style.zIndex = "1000";
        document.body.appendChild(playPrompt);

        // Update prompt text dynamically on window resize
        const updatePromptText = () => {
            playPrompt.textContent = getPromptText();
        };
        window.addEventListener("resize", updatePromptText);

        // Play video and remove the prompt on click
        playPrompt.addEventListener("click", () => {
            video.muted = false; // Unmute video if needed
            video.play().catch(() => console.error("Playback failed."));
            playPrompt.remove(); // Remove the prompt
            window.removeEventListener("resize", updatePromptText); // Clean up listener
        });
                let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updatePromptText, 100);
        });
    };

    // Try to play the initial video immediately
    const initialFeature = featureItems[0]; // Assuming index 0 is the first feature
    const video = initialFeature.querySelector("video");
    if (video) {
        video.play().catch(() => {
            // Show play prompt if autoplay is blocked and no user interaction occurred
            if (!userInteracted) {
                showPlayPrompt(video);
            }
        });
    }
});


// Youtube Player
featureItems.forEach((item) => {
    const videoPreview = item.querySelector(".video-preview");
    const youtubeContainer = item.querySelector(".youtube-container");
    const youtubeURL = item.dataset.youtubeUrl; // Fetch full YouTube URL from HTML

    if (youtubeURL && videoPreview) {
        videoPreview.addEventListener("click", () => {
            // Clear any previously active YouTube players
            if (activeYouTube) {
                activeYouTube.innerHTML = ""; // Remove old iframe
                activeYouTube.style.display = "none"; // Hide old container
                activeYouTube.classList.remove("active");
            }

            // Create and load the new YouTube iframe
            const iframe = document.createElement("iframe");
            iframe.src = `${youtubeURL}?rel=0`;
            iframe.allow = "autoplay; encrypted-media";
            iframe.allowFullscreen = true;

            youtubeContainer.appendChild(iframe);
            youtubeContainer.style.display = "block";
            youtubeContainer.classList.add("active");

            activeYouTube = youtubeContainer; // Track active player
        });
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const currentFeature = featureItems[currentIndex]; // Assume you have a way to track the current feature
        const youtubeURL = currentFeature.dataset.youtubeUrl; // Fetch YouTube URL for current feature
        const youtubeContainer = currentFeature.querySelector(".youtube-container");

        if (youtubeURL && youtubeContainer) {
            // Load the YouTube video for the current feature
            const videoPreview = currentFeature.querySelector(".video-preview");
            if (videoPreview) {
                videoPreview.click(); // Simulate a click on the video preview
            }
        }
    }

    if (event.key === "Escape" && activeYouTube) {
        activeYouTube.innerHTML = ""; // Remove iframe
        activeYouTube.style.display = "none"; // Hide container
        activeYouTube.classList.remove("active");
        activeYouTube = null; // Reset active player tracking
    }
});


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

    // Start video on the new feature
    const nextVideo = nextItem.querySelector("video");
    if (nextVideo) {
        nextVideo.play().catch((error) => {
            console.warn("Video playback blocked:", error);
        });
    }
}
navLeft.addEventListener("click", () => navigateToFeature(currentIndex - 1, "left"));
navRight.addEventListener("click", () => navigateToFeature(currentIndex + 1, "right"));
aboutText.addEventListener("wheel", (event) => { // Disable Scrolling in About Page
    event.stopPropagation(); 
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


// Keyboard Shortcuts Trigger Click Animation
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


// Trigger Video Hint When YouTube player Loads
function showVideoHint() {
    const videoHint = document.getElementById("video-hint");

    if (videoHint) {
        videoHint.classList.add("show");

        // Hide after 3 seconds
        setTimeout(() => {
            videoHint.classList.remove("show");
        }, 3000);
    }
}
featureItems.forEach((item) => {
    const videoPreview = item.querySelector(".video-preview");

    if (videoPreview) {
        videoPreview.addEventListener("click", () => {
            showVideoHint(); // Show the hint when the video starts
        });
    }
});
function updateVideoHintText() {
    const videoHint = document.getElementById("video-hint");

    if (videoHint) {
        if (window.innerWidth > 768) {
            videoHint.textContent = "Press ESC or navigate to close video";
        } else {
            videoHint.textContent = "Navigate to close video";
        }
    }
}
window.addEventListener("resize", updateVideoHintText);
document.addEventListener("DOMContentLoaded", updateVideoHintText);
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateVideoHintText, 100);
});


// Update Click-Prompt Text; Tap vs. Click
function updateClickPromptText() {
    const clickPrompts = document.querySelectorAll('.click-prompt');
    const isMediumScreen = window.matchMedia('(min-width: 768px)').matches;

    clickPrompts.forEach((element) => {
        element.textContent = isMediumScreen ? 'Click For Full Video' : 'Tap For Full Video';
    });
}
updateClickPromptText();
window.addEventListener('resize', updateClickPromptText);


// Scroll Navigation Support
let lastScrollTime = 0;
window.addEventListener("wheel", (event) => {
    const now = Date.now();
    const scrollDirection = event.deltaY > 0 ? "down" : "up"; // Determine scroll direction

    const nextIndex = currentIndex + (scrollDirection === "down" ? 1 : -1);
    navigateToFeature(nextIndex, scrollDirection === "down" ? "right" : "left");
    playPreviewVideo(currentIndex);
});


// Swipe Navigation Support
document.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    const targetElement = event.target.closest(".about-scrolling-text");

    // Disable swipe if the touch started inside '.about-scrolling-text'
    if (targetElement) {
        return; // Do nothing if touch originates from about info page
    }

    startY = touch.clientY; // Record the starting Y position
    startTime = Date.now(); // Record the starting time
});
document.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const targetElement = event.target.closest(".about-scrolling-text");

    // Disable swipe if the touch ended inside '.about-scrolling-text'
    if (targetElement) {
        return; // Do nothing if touch ends on about info page
    }

    const endY = touch.clientY; // Get the ending Y position
    const distanceY = endY - startY; // Calculate the vertical distance
    const elapsedTime = Date.now() - startTime; // Calculate the elapsed time

    // Check if the gesture qualifies as a swipe
    if (Math.abs(distanceY) > SWIPE_THRESHOLD && elapsedTime < TIME_THRESHOLD) {
        if (distanceY > 0) {
            // Swipe down detected
            navigateToFeature(currentIndex - 1, "up");
        } else {
            // Swipe up detected
            navigateToFeature(currentIndex + 1, "right");
        }
    }
});
document.addEventListener("touchmove", (event) => {
    const targetElement = event.target.closest(".about-scrolling-text");

    // Allow default scrolling behavior within '.about-scrolling-text'
    if (!targetElement) {
        event.preventDefault(); // Prevent accidental navigation during a move elsewhere
    }
});


// Initialize
generateQuickNavDots();
updateBackgroundColor("color-1"); // Set initial background color