const menuBtn = document.querySelector(".menu-btn");

const navLinks = document.querySelector(".nav-links");

menuBtn.onclick = () =>{

    navLinks.classList.toggle("active");

};

/*=========================================
        TRISHINE NEW ARRIVALS SLIDER
=========================================*/

const wrapper = document.querySelector(".arrival-wrapper");
const cards = document.querySelectorAll(".arrival-card");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");
const dots = document.querySelectorAll(".dot");

let currentIndex = 0;
const totalCards = cards.length;

/*=========================================
        UPDATE ACTIVE CARD
=========================================*/

function updateSlider() {

    const cardWidth = cards[0].offsetWidth + 30;

    wrapper.scrollTo({

        left: currentIndex * cardWidth,

        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth"

    });

    cards.forEach((card, index) => {

        card.classList.remove("active-card");

        if (index === currentIndex) {

            card.classList.add("active-card");

        }

    });

    dots.forEach((dot, index) => {

        dot.classList.remove("active");

        if (index === currentIndex) {

            dot.classList.add("active");

        }

    });

}

/*=========================================
        NEXT
=========================================*/

nextBtn.addEventListener("click", () => {

    currentIndex++;

    if (currentIndex >= totalCards) {

        currentIndex = 0;

    }

    updateSlider();

});

/*=========================================
        PREVIOUS
=========================================*/

prevBtn.addEventListener("click", () => {

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex = totalCards - 1;

    }

    updateSlider();

});

/*=========================================
        DOT CLICK
=========================================*/

dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        currentIndex = index;

        updateSlider();

    });

});

/*=========================================
        WINDOW RESIZE
=========================================*/

window.addEventListener("resize", updateSlider);

/*=========================================
        INITIAL LOAD
=========================================*/

updateSlider();

/*=========================================
        AUTOPLAY
=========================================*/

let autoPlay;

/* Start Autoplay */

function startAutoPlay(){

    autoPlay = setInterval(() => {

        currentIndex++;

        if(currentIndex >= totalCards){

            currentIndex = 0;

        }

        updateSlider();

    },5000);

}

/* Stop Autoplay */

function stopAutoPlay(){

    clearInterval(autoPlay);

}

/*=========================================
        PAUSE ON HOVER
=========================================*/

const slider = document.querySelector(".arrival-slider");

slider.addEventListener("mouseenter",()=>{

    stopAutoPlay();

});

slider.addEventListener("mouseleave",()=>{

    startAutoPlay();

});

/*=========================================
        PAGE VISIBILITY
=========================================*/
/* Pause when the browser tab is inactive */

document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        stopAutoPlay();

    }

    else{

        startAutoPlay();

    }

});

/*=========================================
        WINDOW RESIZE
=========================================*/

window.addEventListener("resize",()=>{

    stopAutoPlay();

    updateSlider();

    startAutoPlay();

});

/*=========================================
        START AUTOPLAY
=========================================*/

startAutoPlay();

/*=========================================
        TOUCH SWIPE + MOUSE DRAG
=========================================*/

let isDragging = false;
let startPosition = 0;
let currentTranslate = 0;
let previousTranslate = 0;
let animationID;

/*=============================
        TOUCH EVENTS
=============================*/

wrapper.addEventListener("touchstart", touchStart);
wrapper.addEventListener("touchmove", touchMove);
wrapper.addEventListener("touchend", touchEnd);

function touchStart(e){

    stopAutoPlay();

    isDragging = true;

    startPosition = e.touches[0].clientX;

}

function touchMove(e){

    if(!isDragging) return;

    const currentPosition = e.touches[0].clientX;

    currentTranslate = previousTranslate + currentPosition - startPosition;

}

function touchEnd(){

    if(!isDragging) return;

    isDragging = false;

    const movedBy = currentTranslate - previousTranslate;

    if(movedBy < -80){

        currentIndex++;

        if(currentIndex >= totalCards){

            currentIndex = 0;

        }

    }

    else if(movedBy > 80){

        currentIndex--;

        if(currentIndex < 0){

            currentIndex = totalCards - 1;

        }

    }

    updateSlider();

    previousTranslate = currentTranslate;

    startAutoPlay();

}

/*=============================
        MOUSE DRAG
=============================*/

wrapper.addEventListener("mousedown", mouseDown);
wrapper.addEventListener("mousemove", mouseMove);
wrapper.addEventListener("mouseup", mouseUp);
wrapper.addEventListener("mouseleave", mouseLeave);

function mouseDown(e){

    stopAutoPlay();

    isDragging = true;

    wrapper.style.cursor = "grabbing";

    startPosition = e.clientX;

    cancelAnimationFrame(animationID);

}

function mouseMove(e){

    if(!isDragging) return;

    const currentPosition = e.clientX;

    currentTranslate = previousTranslate + currentPosition - startPosition;

}

function mouseUp(){

    finishDragging();

}

function mouseLeave(){

    finishDragging();

}

function finishDragging(){

    if(!isDragging) return;

    isDragging = false;

    wrapper.style.cursor = "grab";

    const movedBy = currentTranslate - previousTranslate;

    if(movedBy < -80){

        currentIndex++;

        if(currentIndex >= totalCards){

            currentIndex = 0;

        }

    }

    else if(movedBy > 80){

        currentIndex--;

        if(currentIndex < 0){

            currentIndex = totalCards - 1;

        }

    }

    updateSlider();

    previousTranslate = currentTranslate;

    startAutoPlay();

}

/*=============================
        PREVENT IMAGE DRAG
=============================*/

cards.forEach(card=>{

    const img = card.querySelector("img");

    if(img){

        img.addEventListener("dragstart",(e)=>{

            e.preventDefault();

        });

    }

});

/*=============================
        CURSOR STYLE
=============================*/

wrapper.style.cursor = "grab";

/*=============================
        MOBILE SCROLL PREVENTION
=============================*/

wrapper.addEventListener("touchmove",(e)=>{

    if(isDragging){

        e.preventDefault();

    }

},{passive:false});

/*=========================================
        SCROLL REVEAL
=========================================*/

const revealElements = document.querySelectorAll(

".arrival-card, .section-title"

);

const observer = new IntersectionObserver(

(entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},

{

    threshold:0.2

}

);

revealElements.forEach(element=>{

    observer.observe(element);

});

const testimonialCards = document.querySelectorAll(".testimonial-card");
const button = document.getElementById("loadMore");

if (button) {

    button.addEventListener("click", () => {

        testimonialCards.forEach((card, index) => {

            if (index >= 3) {
                card.classList.add("show");
            }

        });

        button.style.display = "none";

    });

}

