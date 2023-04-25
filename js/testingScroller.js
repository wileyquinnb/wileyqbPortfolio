const container = document.getElementById("container");
const containers = document.querySelectorAll('.container');
const sections = document.querySelectorAll('.section');
const scrollers = document.querySelectorAll('.scroller');
const projectScrollers = document.querySelectorAll('.projectScroller');

const sectionTitles = document.querySelectorAll('.title');
const infos = document.querySelectorAll('.info');

const card = document.getElementById('card');
const cardTitle = document.getElementById('cardTitle');
const cardText = document.getElementById('cardText');

const scrollPositionsX = {};
const scrollPositionsY = {};

const sectionSpacing = 8;
const sectionHeight = 68;
const initialOffset = 24;
const boxSpacing = 10;
const boxHeight = 60;
const boxOffset = 33.2;
const expandSpacing = 6;
const expandHeight = 80;
const expandOffset = 12;

let originalScrollers = {};
let originalTitleContent = {};
let proportions;
let previousProportions = false;
let previousVisibleSection = null;
let isSectionExpanded = false;

class Carousel {
    container = undefined;
    items = [];
    index = 0;
    isHorizontal;
    isSections;
    itemHeight;
    itemSpacing;
    initialOffset;
    unit;

    constructor(options = { container: null, isHorizontal: null, isSections: null, itemHeight: null, itemSpacing: null, initialOffset: null }) {
        if (!container) {
            throw new Error("the fuck, where's the container?");
        }

        this.container = options.container;

        this.container.setAttribute('data-carousel', true);

        this.items = Array.from(options.container.children);
        options.container.addEventListener("wheel", this.handleScroll.bind(this));

        this.isHorizontal = options.isHorizontal;
        this.isSections = options.isSections;
        this.itemHeight = options.itemHeight;
        this.itemSpacing = options.itemSpacing;
        this.initialOffset = options.initialOffset;
        this.unit = options.unit;

        this.container.addEventListener("touchstart", this.handleTouchStart.bind(this));
        this.container.addEventListener("touchmove", this.handleTouchMove.bind(this));
        this.container.addEventListener("touchend", this.handleTouchEnd.bind(this));

        this.touchStartY = null;
        this.touchStartIndex = null;
        this.touchStartTime = null;
        this.easing = 0.9;
        this.velocity = 10;
        this.animationFrameId = null;

        this.#positionItems();
    }

    handleScroll(e) {
        e.stopPropagation();

        if (e.deltaY > 0 && this.index < this.items.length - 1) {
            this.index++;
        } else if (e.deltaY < 0 && this.index > 0) {
            this.index--;
        }

        const sectionElement = this.items[this.index];

        if (this.isSections) {
            e.stopPropagation();
            console.log(this.index);
            loadScroller(sectionElement);
        }

        this.#positionItems();
    }

    // handleTouchMove(e) {
    //     // e.stopPropagation();
    //     e.preventDefault();

    //     const touchDeltaY = this.touchStartY - e.touches[0].clientY;
    //     const touchMoveThreshold = 80;

    //     if (touchDeltaY > touchMoveThreshold && this.index < this.items.length - 1) {
    //         this.index++;
    //     } else if (touchDeltaY < -touchMoveThreshold && this.index > 0) {
    //         this.index--;
    //     }

    //     if (this.index !== this.touchStartIndex) {
    //         const sectionElement = this.items[this.index];

    //         if (this.isSections) {
    //             e.stopPropagation();
    //             console.log(this.index);
    //             loadScroller(sectionElement);
    //         }

    //         this.#positionItems();
    //         this.touchStartY = e.touches[0].clientY;
    //         this.touchStartIndex = this.index;
    //     }
    // }


    handleTouchStart(e) {
        e.stopPropagation();
        this.touchStartY = e.touches[0].clientY;
        this.touchStartIndex = this.index;
        this.touchStartTime = performance.now();
        this.velocity = 0;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    handleTouchMove(e) {
        e.stopPropagation();
        e.preventDefault(); // Prevent default scrolling behavior

        const touchDeltaY = this.touchStartY - e.touches[0].clientY;
        const touchProgress = touchDeltaY / (this.itemHeight + this.itemSpacing);

        const currentTime = performance.now();
        const deltaTime = currentTime - this.touchStartTime;
        this.touchStartTime = currentTime;
        this.velocity = (touchProgress - this.velocity) / deltaTime;

        this.#positionItems(touchProgress);
    }

    handleTouchEnd(e) {
        e.stopPropagation();
        this.touchStartY = null;
        this.touchStartIndex = null;
        this.touchStartTime = null;

        this.animationFrameId = requestAnimationFrame(this.animateMomentum.bind(this));
    }

    animateMomentum() {
        this.velocity *= this.easing;
        const progress = this.index + this.velocity;
        const clampedProgress = Math.min(Math.max(progress, 0), this.items.length - 1);
        this.#positionItems(clampedProgress - this.index);

        if (Math.abs(this.velocity) > 0.001) {
            this.animationFrameId = requestAnimationFrame(this.animateMomentum.bind(this));
        } else {
            const newIndex = Math.min(Math.max(Math.round(clampedProgress), 0), this.items.length - 1);

            if (this.index !== newIndex) {
                this.index = newIndex;
                if (this.isSections) {
                    const sectionElement = this.items[this.index];
                    console.log(this.index);
                    loadScroller(sectionElement);
                }
            }

            this.#positionItems(0);
            this.velocity = 0;
            this.animationFrameId = null;
        }
    }

    #positionItems(progress = 0) {
        const axis = this.isHorizontal ? "X" : "Y";
        this.items.forEach((item, index) => {
            const offset = ((index - this.index) - progress) * (this.itemHeight + this.itemSpacing);
            item.style.transform = `translate${axis}(calc(${offset}${this.unit} + ${this.initialOffset}%))`;
        });
    }
}

for (const container of containers) {
    new Carousel({ container, isHorizontal: false, isSections: true, itemHeight: sectionHeight, itemSpacing: sectionSpacing, initialOffset: initialOffset, unit: 'vh' });
}


//Checks window proportions

function windowProportions() {
    const windowProportion = window.innerWidth / window.innerHeight;

    return windowProportion > 19 / 24;
}
function resize() {
    if (windowProportions()) {
        console.log('greaterThan');
        proportions = true;
    } else {
        console.log('lessThan');
        proportions = false;
        // removeButtons(sectionElement);
    }
}

window.addEventListener('resize', resize);

resize();


//Event listeners

container.addEventListener("click", async (event) => {
    const sectionElement = getSectionElementFromTarget(event.target);

    if (isSectionExpanded) {
        const boxDivs = document.querySelectorAll('.projectScroller .box');
        const outsideClick = !Array.from(boxDivs).some((boxDiv) => boxDiv.contains(event.target));

        if (outsideClick) {
            await removeProjectScrollerContent(sectionElement);
        }
    } else {
        await loadProjectScroller(event.target, sectionElement);
    }


});

function getSectionElementFromTarget(target) {
    return target.closest('.section');
}


//Loads the black and white images when scrolling over sectionElement

async function loadScroller(sectionElement) {
    if (!sectionElement) {
        return;
    }

    let scrollerVisible = false;

    if (sectionElement) {
        if (hasScrollerContent(sectionElement)) {
            scrollerVisible = true;
        }


        const calledSectionId = sectionElement.id;

        if (!(calledSectionId === "section0" || calledSectionId === "section1")) {
            const projectScrollerDiv = sectionElement.querySelector('.projectScroller');
            if (projectScrollerDiv.innerHTML.trim() === '') {
                const primaryParentFolder = calledSectionId.replace("section", "") + "img";
                const manifestUrl = `./images/${primaryParentFolder}/manifest.json`;

                const response = await fetch(manifestUrl);
                const projects = await response.json();

                let newContent = '';
                for (let i = 0; i < projects.length; i++) {
                    const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
                    newContent += `
                        <div class="box grey ${firstOrLast}">
                            <img src="./images/${primaryParentFolder}/${projects[i]}">
                        </div>
                    `;
                }

                const scrollerDiv = sectionElement.querySelector('.scroller');
                setTimeout(() => {
                    scrollerDiv.classList.add('slideRight');
                    scrollerDiv.classList.add('visible');
                    scrollerDiv.innerHTML = newContent;
                    for (const scroller of scrollers) {
                        if (scroller.childNodes.length) {
                            new Carousel({ container: scroller, isHorizontal: true, isSections: false, itemHeight: boxHeight, itemSpacing: boxSpacing, initialOffset: boxOffset, unit: 'vw' });
                        }
                    }
                }, 200);

                scrollerVisible = true;
            }
        }
    }

    for (let section of sections) {
        const otherScrollerDiv = section.querySelector('.scroller');
        const otherTitleDiv = section.querySelector('.title');
        const calledSectionId = sectionElement.id;

        if (otherScrollerDiv) {
            if (section !== sectionElement) {
                otherScrollerDiv.className = 'scroller scroller106';
                otherTitleDiv.classList.remove('slideIn');
            } else {
                console.log('scrollerVisible:', scrollerVisible);
                console.log('section.id:', section.id);
                otherTitleDiv.classList.add('slideIn');
            }
        }
    }

    for (let section of sections) {
        const otherScrollerDiv = section.querySelector('.scroller');
        const otherTitleDiv = section.querySelector('.title');

        if (otherScrollerDiv && section !== sectionElement) {
            otherScrollerDiv.classList.add('scrollerOut');
            otherTitleDiv.classList.add('slideOut');

            setTimeout(() => {
                otherScrollerDiv.className = 'scroller scroller106';
                otherTitleDiv.classList.remove('slideIn');
                otherTitleDiv.classList.remove('slideOut');
                otherScrollerDiv.classList.remove('scrollerOut');
                otherScrollerDiv.classList.remove('visible');
                otherScrollerDiv.innerHTML = '';
            }, 400);
        }
    }

    addSlideInToTitle(sectionElement);
}
function addSlideInToTitle(sectionElement) {

    if (sectionElement && (sectionElement.id === "section0" || sectionElement.id === "section1")) {
        const titleDiv = sectionElement.querySelector('.title');
        if (titleDiv) {
            titleDiv.classList.add('slideIn');
        }
    }

    for (let section of sections) {
        const titleDiv = section.querySelector('.title');
        // const infoDivs = section.querySelector('.info')
        if (section !== sectionElement) {
            titleDiv.classList.add('slideOut');
            setTimeout(() => {
                titleDiv.classList.remove('slideIn');
                titleDiv.classList.remove('slideOut');
                // for (let infoDiv of infoDivs) {
                //     infoDiv.classList.remove('slideText');
                // }
            }, 300);
        }
    }
}


//Loads the colored images when clicking on a b&w image and runs expandSection function

async function loadProjectScroller(target, sectionElement) {
    const targetImage = target.closest('.scroller img');
    if (!targetImage.matches('.scroller img')) {
        return;
    }

    const scroller = sectionElement.querySelector('.scroller');
    if (!scroller) {
        console.warn('Scroller not found in the visible section:', sectionElement);
        return;
    }

    const sectionId = sectionElement.id;

    scrollPositionsX[sectionId] = scroller.scrollLeft;
    scrollPositionsY[sectionId] = scroller.scrollTop;

    expandSection(sectionElement, targetImage);

    const primaryParentFolder = sectionElement.id.replace("section", "") + "img";
    const clickedImageName = targetImage.src.split('/').pop().split('.')[0];
    const clickedImageIndex = clickedImageName.replace('project', '');
    const secondaryParentFolder = primaryParentFolder + "/img" + clickedImageIndex;

    const manifestUrl = `./images/${secondaryParentFolder}/manifest.json`;

    const response = await fetch(manifestUrl);
    const projects = await response.json();

    const newContent = projects.map((project, i) => {
        const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
        return `
          <div class="box fadeInPS ${firstOrLast}" style="z-index: 100;">
            <img src="./images/${secondaryParentFolder}/${project}">
          </div>
        `;
    }).join('');

    const scrollerDiv = sectionElement.querySelector('.scroller');
    scrollerDiv.classList.remove('slideRight');


    setTimeout(() => {
        const projectScrollerDiv = sectionElement.querySelector('.projectScroller');
        projectScrollerDiv.classList.add('fadeInPS');
        projectScrollerDiv.innerHTML = newContent;
        for (const projectScroller of projectScrollers) {
            if (projectScroller.childNodes.length) {
                new Carousel({ container: projectScroller, isHorizontal: true, isSections: false, itemHeight: expandHeight, itemSpacing: expandSpacing, initialOffset: expandOffset, unit: 'vw' });
            }
        }
        sectionElement.appendChild(projectScrollerDiv);
    }, 50);

    setTimeout(() => {
        scrollerDiv.classList.add('fadeOut');
    }, 200);

    setTimeout(() => {
        scrollerDiv.innerHTML = '';
        scrollerDiv.className = 'scroller';
    }, 400);


    originalScrollers[sectionElement.id] = scrollerDiv.innerHTML;


}


//Excludes sections without a scroller and projectScroller

function hasScrollerContent(sectionElement) {
    if (!sectionElement) {
        return false;
    }

    const scrollerDiv = sectionElement.querySelector('.scroller');

    if (!scrollerDiv) {
        return false;
    }

    return scrollerDiv.innerHTML.trim() !== '';
}
function hasProjectScrollerContent(sectionElement) {
    if (!sectionElement) {
        return false;
    }

    const projectScrollerDiv = sectionElement.querySelector('.projectScroller');

    if (!projectScrollerDiv) {
        return false;
    }

    return projectScrollerDiv.innerHTML.trim() !== '';
}


//Removes projectScroller content

async function removeProjectScrollerContent(sectionElement) {
    if (!sectionElement) {
        return;
    }

    const projectScrollerDiv = sectionElement.querySelector('.projectScroller');
    projectScrollerDiv.classList.remove('fadeInPS');

    restoreScroller(sectionElement);
    collapseSection(sectionElement);

    setTimeout(() => {
        projectScrollerDiv.classList.add('fadeOutPS');
    }, 200);

    setTimeout(() => {
        projectScrollerDiv.classList.remove('fadeOutPS');
        projectScrollerDiv.innerHTML = '';
    }, 500);
}


//Restores b&w scroller images

function restoreScroller(sectionElement) {
    if (!sectionElement) {
        return;
    }

    const sectionId = sectionElement.id;
    const scrollPositionX = scrollPositionsX[sectionId] || 0;
    const scrollPositionY = scrollPositionsY[sectionId] || 0;

    setTimeout(() => {
        const scroller = sectionElement.querySelector('.scroller');
        scroller.scrollTo({ top: scrollPositionY, left: scrollPositionX, behavior: 'auto' });
    }, 50);

    const scrollerDiv = sectionElement.querySelector('.scroller');
    scrollerDiv.innerHTML = originalScrollers[sectionElement.id];
    scrollerDiv.classList.remove('fadeOut');
    scrollerDiv.classList.add('fadeIn');
    scrollerDiv.classList.add('visible');
}


//Expands and collapses section

async function expandSection(sectionElement, targetImage) {
    if (!sectionElement) {
        return;
    }

    if (isSectionExpanded && !proportions) {
        document.body.style.overflowY = 'hidden';
    }

    isSectionExpanded = true;

    sectionElement.style.transform = `translateY(calc(0vh + 0%))`;

    const titleDiv = sectionElement.querySelector('.title');

    if (!titleDiv) {
        return;
    }

    titleDiv.classList.add('hideTitle');
    titleDiv.classList.add('stopScroll');
    card.classList.add('cardShow');
    container.classList.add('stopScroll');

    sectionElement.classList.add('sectionGrow');
    // sectionElement.classList.add('stopScroll');

    for (const section of sections) {
        if (section !== sectionElement) {
            section.classList.add('hidden');
        }
    }

    for (const scroller of scrollers) {
        scroller.classList.remove('scroller106');
        scroller.classList.add('scroller100');
    }

    originalTitleContent[sectionElement.id] = titleDiv.innerHTML;

    setTimeout(() => {
        titleDiv.innerHTML = '';
    }, 400);

    const primaryParentFolder = sectionElement.id.replace("section", "") + "img";

    const [titles, texts] = await Promise.all([
        fetch(`./images/${primaryParentFolder}/titles.json`).then(r => r.json()),
        fetch(`./images/${primaryParentFolder}/text.json`).then(r => r.json())
    ]);

    const clickedImageName = targetImage.src.split('/').pop().split('.')[0];
    const clickedImageIndex = parseInt(clickedImageName.replace('project', ''));


    setTimeout(() => {
        cardTitle.classList.add('cardTitle');
        cardTitle.textContent = titles[clickedImageIndex];
        cardText.classList.add('cardText');
        cardText.textContent = texts[clickedImageIndex];
    }, 100);


    setTimeout(() => {
        const boxDivs = sectionElement.querySelectorAll('.projectScroller .box');

        for (const boxDiv of boxDivs) {
            boxDiv.classList.add('enlargeBox');
        }
    }, 420);
}
function collapseSection(sectionElement) {
    if (!sectionElement) return;

    if (isSectionExpanded && !proportions) {
        document.body.style.overflowY = 'hidden';
    }

    isSectionExpanded = false;

    sectionElement.style.transform = `translateY(calc(0vh + 24%))`;

    const titleDiv = sectionElement.querySelector('.title');
    const boxDivs = sectionElement.querySelectorAll('.projectScroller .box');

    if (!titleDiv) return;

    card.classList.remove('cardShow');
    card.classList.add('cardHide');
    container.classList.remove('stopScroll');
    titleDiv.classList.remove('stopScroll');
    titleDiv.classList.remove('hideTitle');
    titleDiv.classList.add('showTitle');
    // sectionElement.classList.remove('stopScroll');


    for (const boxDiv of boxDivs) {
        boxDiv.classList.remove('enlargeBox');
    }

    for (const scroller of scrollers) {
        scroller.classList.remove('scroller100');
        scroller.classList.add('scroller106');
    }

    setTimeout(() => {
        for (const section of sections) {
            section.classList.remove('hidden');
        }
        card.classList.remove('cardHide');
        titleDiv.classList.remove('showTitle');
        sectionElement.classList.remove('sectionGrow');
        titleDiv.innerHTML = originalTitleContent[sectionElement.id];
        cardTitle.textContent = '';
        cardText.textContent = '';
        cardTitle.classList.remove('cardTitle');
        cardText.classList.remove('cardText');
        for (const scroller of scrollers) {
            if (scroller.childNodes.length) {
                new Carousel({ container: scroller, isHorizontal: true, isSections: false, itemHeight: boxHeight, itemSpacing: boxSpacing, initialOffset: boxOffset, unit: 'vw' });
            }
        }
    }, 100);
    //Lol
}


//Handles buttons

function createButtons(sectionElement) {
    if (!sectionElement) {
        return;
    }

    const calledSectionId = sectionElement.id;
    const buttonContainer = sectionElement.querySelector('.buttonContainer');

    if (!buttonContainer) {
        return;
    }

    let buttonsHTML = '';

    if (calledSectionId === "section0") {
        buttonsHTML = `
            <div class="hoverBox0 hoverBox">
                <button class="button0 circle growIn colorGreen"></button>
            </div>
            <div class="hoverBox1 hoverBox">
                <button class="button1 circle growIn colorYellow"></button>
            </div>
            <div class="hoverBox2 hoverBox">
                <button class="button2 circle growIn colorPurple"></button>
            </div>
            <div class="hoverBox3 hoverBox">
                <button class="button3 circle growIn colorRed"></button>
            </div>
        `;
    } else if (calledSectionId === "section1") {
        buttonsHTML = `
            <div class="hoverBox2 hoverBox">
                <button class="button2 circle growIn colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section2") {
        buttonsHTML = `
            <div class="hoverBox1 hoverBox">
                <button class="button1 circle growIn colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section3") {
        buttonsHTML = `
            <div class="hoverBox0 hoverBox">
                <button class="button0 circle growIn colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section4") {
        buttonsHTML = `
            <div class="hoverBox3 hoverBox">
                <button class="button3 circle growIn colorWhite"></button>
            </div>
        `;
    }

    buttonContainer.insertAdjacentHTML('beforeend', buttonsHTML);

    const buttons = buttonContainer.querySelectorAll('button');
    for (const button of buttons) {
        button.addEventListener('click', () => {
            clickButton(sectionElement, button);
        });
    }

}
function removeButtons(sectionElement) {
    if (!sectionElement) {
        return;
    }

    const buttonContainer = sectionElement.querySelector('.buttonContainer');

    if (!buttonContainer) {
        return;
    }

    buttonContainer.innerHTML = '';
}
function clickButton(sectionElement, clickedButton) {
    if (!sectionElement) {
        return;
    }

    const buttonContainer = sectionElement.querySelector('.buttonContainer');

    if (!buttonContainer) {
        return;
    }

    buttonContainer.addEventListener('click', (event) => {
        const targetElement = event.target;
        if (targetElement.matches('.circle')) {
            let buttonClone = buttonContainer.querySelector('.expandCircle');
            if (!buttonClone) {
                buttonClone = targetElement.cloneNode(true);
                buttonClone.style.zIndex = '400';
                buttonContainer.appendChild(buttonClone);
            }
            buttonClone.classList.add('expandCircle');
            buttonClone.addEventListener('transitionend', () => {
                buttonClone.remove();
            });
        }

        setTimeout(() => {
            const currentSectionId = sectionElement.id;
            let targetSectionId;

            if (currentSectionId !== 'section0') {
                targetSectionId = 'section0';
            } else {
                const buttonClass = clickedButton.getAttribute('class');
                const buttonNumber = buttonClass.match(/button(\d)/)[1];

                if (buttonNumber === '0') {
                    targetSectionId = 'section4';
                } else {
                    targetSectionId = `section${buttonNumber}`;
                }
            }

            navigateToSection(targetSectionId);

        }, 420);
        //Lol again
    });
}

function navigateToSection(targetSectionId) {
    const targetSection = document.getElementById(targetSectionId);
    const yOffset = targetSection.offsetTop;

    container.scrollTo({ top: yOffset });
}