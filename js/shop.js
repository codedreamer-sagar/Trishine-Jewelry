/*=========================================
        SHOP CUSTOMER REVIEWS
=========================================*/

const shopReviewTrack =
    document.querySelector(".shop-reviews-track");

const shopReviewCards =
    document.querySelectorAll(".shop-review-card");

const shopReviewPrev =
    document.getElementById("shopReviewPrev");

const shopReviewNext =
    document.getElementById("shopReviewNext");

const shopReviewDots =
    document.querySelectorAll(".shop-review-dot");

const shopReviewSlider =
    document.querySelector(".shop-reviews-slider");


/*=========================================
        CHECK SHOP REVIEW SECTION
=========================================*/

if (
    shopReviewTrack &&
    shopReviewCards.length > 0 &&
    shopReviewPrev &&
    shopReviewNext
) {


    /*=====================================
            VARIABLES
    =====================================*/

    let shopReviewIndex = 0;


    /*=====================================
            CARDS PER VIEW
    =====================================*/

    function getShopCardsPerView() {

        if (window.innerWidth <= 576) {

            return 1;

        }

        if (window.innerWidth <= 1100) {

            return 2;

        }

        return 3;

    }


    /*=====================================
            UPDATE SLIDER
    =====================================*/

    function updateShopReviewSlider() {

        const cardsPerView =
            getShopCardsPerView();


        const maxIndex =
            Math.max(
                0,
                shopReviewCards.length -
                cardsPerView
            );


        if (shopReviewIndex > maxIndex) {

            shopReviewIndex = 0;

        }


        const cardWidth =
            shopReviewCards[0].getBoundingClientRect().width;


        const trackStyle =
            window.getComputedStyle(
                shopReviewTrack
            );


        const gap =
            parseFloat(trackStyle.gap) || 0;


        const move =
            (cardWidth + gap) *
            shopReviewIndex;


        shopReviewTrack.style.transform =
            "translateX(-" + move + "px)";


        updateShopReviewDots();

    }


    /*=====================================
            UPDATE DOTS
    =====================================*/

    function updateShopReviewDots() {

        shopReviewDots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === shopReviewIndex
                );

            }
        );

    }


    /*=====================================
            NEXT
    =====================================*/

    shopReviewNext.addEventListener(
        "click",
        () => {

            const cardsPerView =
                getShopCardsPerView();


            const maxIndex =
                Math.max(
                    0,
                    shopReviewCards.length -
                    cardsPerView
                );


            if (
                shopReviewIndex <
                maxIndex
            ) {

                shopReviewIndex++;

            }
            else {

                shopReviewIndex = 0;

            }


            updateShopReviewSlider();

        }
    );


    /*=====================================
            PREVIOUS
    =====================================*/

    shopReviewPrev.addEventListener(
        "click",
        () => {

            const cardsPerView =
                getShopCardsPerView();


            const maxIndex =
                Math.max(
                    0,
                    shopReviewCards.length -
                    cardsPerView
                );


            if (shopReviewIndex > 0) {

                shopReviewIndex--;

            }
            else {

                shopReviewIndex = maxIndex;

            }


            updateShopReviewSlider();

        }
    );


    /*=====================================
            DOT CLICK
    =====================================*/

    shopReviewDots.forEach(
        (dot, index) => {

            dot.addEventListener(
                "click",
                () => {

                    const cardsPerView =
                        getShopCardsPerView();


                    const maxIndex =
                        Math.max(
                            0,
                            shopReviewCards.length -
                            cardsPerView
                        );


                    shopReviewIndex =
                        Math.min(
                            index,
                            maxIndex
                        );


                    updateShopReviewSlider();

                }
            );

        }
    );


    /*=====================================
            AUTO SLIDE
    =====================================*/

    let shopReviewAutoPlay =
        setInterval(
            () => {

                shopReviewNext.click();

            },
            5000
        );


    /*=====================================
            PAUSE ON HOVER
    =====================================*/

    if (shopReviewSlider) {

        shopReviewSlider.addEventListener(
            "mouseenter",
            () => {

                clearInterval(
                    shopReviewAutoPlay
                );

            }
        );


        shopReviewSlider.addEventListener(
            "mouseleave",
            () => {

                shopReviewAutoPlay =
                    setInterval(
                        () => {

                            shopReviewNext.click();

                        },
                        5000
                    );

            }
        );

    }


    /*=====================================
            RESIZE
    =====================================*/

    window.addEventListener(
        "resize",
        () => {

            shopReviewIndex = 0;

            updateShopReviewSlider();

        }
    );


    /*=====================================
            INITIALIZE
    =====================================*/

    updateShopReviewSlider();

}

