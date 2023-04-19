const container = document.getElementById("container");
const sections = document.querySelectorAll('.section');
const scrollers = document.querySelectorAll('.scroller');
const sectionTitles = document.querySelectorAll('.title');
const infos = document.querySelectorAll('.info');

const card = document.getElementById('card');
const cardTitle = document.getElementById('cardTitle');
const cardText = document.getElementById('cardText');

const scrollPositionsX = {};
const scrollPositionsY = {};

let visibleSection = getCalledSection(sections);
let originalScrollers = {};
let originalTitleContent = {};
let proportions;
let previousProportions = false;
let previousVisibleSection = null;
let isSectionExpanded = false;


//onLoad

window.addEventListener("load", function () {
    const yOffset = (window.innerHeight / .95);
    container.scrollTo({ top: yOffset, behavior: "auto" });
    if (proportions) {
        createButtons(visibleSection);
    } else {
        return;
    }

});


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
        removeButtons(visibleSection);
    }
}

window.addEventListener('resize', resize);

resize();


//Debouncer

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}


//Event listeners

container.addEventListener("click", async (event) => {
    const targetElement = event.target;

    if (hasProjectScrollerContent(visibleSection)) {
        const boxDivs = visibleSection.querySelectorAll(".projectScroller .box");
        const outsideClick = !Array.from(boxDivs).some((boxDiv) => boxDiv.contains(targetElement));

        if (outsideClick) {
            await removeProjectScrollerContent(visibleSection);
        }
    } else {
        await loadProjectScroller(event);
    }


});
container.addEventListener("scroll", async () => {
    const calledSection = getCalledSection(sections);

    if (calledSection !== visibleSection) {
        removeButtons(visibleSection);
        previousVisibleSection = visibleSection;
        visibleSection = calledSection;
        const calledSectionId = visibleSection ? visibleSection.id : 'none';
        console.log("Current visible section:", calledSectionId);

        previousProportions = proportions;

        if (proportions) {
            createButtons(visibleSection);
        }

        await loadScroller(visibleSection);
    }

    //runs createButtons in the event the user goes from proportions being false to true

    if (!previousProportions && proportions) {
        createButtons(visibleSection);
        location.reload();
    }

    if (previousProportions && !proportions) {
        location.reload();
    }

    previousProportions = proportions;

});

function handleWheelScroll(e) {
    if (!proportions) {
        e.preventDefault();

        const scrollFactor = 3;

        e.currentTarget.scrollBy({
            top: 0,
            left: e.deltaY * scrollFactor,
            behavior: 'smooth'
        });

    } else {
        e.preventDefault();

        const scrollFactor = 6;

        e.currentTarget.scrollBy({
            top: e.deltaY * scrollFactor,
            left: 0,
            behavior: 'smooth'
        });
    }
}
function handleWheelScrollY(e) {
    const isInsideScroller = e.target.closest('.scroller') !== null;
    // const isInsideContainer = e.target.closest('.container') !== null;
    if (isSectionExpanded) {
        return;
        // e.preventDefault();
    }


    if (!proportions && !isInsideScroller) {
        e.preventDefault();

        const scrollFactor = 6;

        e.currentTarget.scrollBy({
            top: e.deltaY * scrollFactor,
            left: 0,
            behavior: 'smooth'
        });
    }
}
document.querySelectorAll('.scroller').forEach(scroller => {
    scroller.addEventListener('wheel', handleWheelScroll, { passive: false });
});
document.querySelectorAll('.projectScroller').forEach(scroller => {
    scroller.addEventListener('wheel', handleWheelScroll, { passive: false });
});

if (!proportions) {
    container.addEventListener('wheel', handleWheelScrollY);
}


//Defines the section that is currently in view (visibleSection)

function getCalledSection(sections, threshold = 0.5) {
    const viewportHeight = window.innerHeight;

    for (let section of sections) {
        const sectionRect = section.getBoundingClientRect();

        if (sectionRect.top < viewportHeight * (1 - threshold) && sectionRect.bottom > viewportHeight * threshold) {
            return section;
        } else {
            const title = section.querySelector('.title');
            if (title) {
                title.classList.remove('slideIn');
                title.classList.remove('slideOut');
            }
        }
    }

    return null;
}


//Loads the black and white images when scrolling over visibleSection

async function loadScroller(visibleSection) {
    if (!visibleSection) {
        return;
    }

    let scrollerVisible = false;

    if (visibleSection) {
        if (hasScrollerContent(visibleSection)) {
            scrollerVisible = true;
        }

        const calledSectionId = visibleSection.id;

        if (!(calledSectionId === "section0" || calledSectionId === "section4")) {
            const projectScrollerDiv = visibleSection.querySelector('.projectScroller');
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

                const scrollerDiv = visibleSection.querySelector('.scroller');
                setTimeout(() => {
                    scrollerDiv.classList.add('slideRight');
                    scrollerDiv.classList.add('visible');
                    scrollerDiv.innerHTML = newContent;
                }, 200);


                scrollerVisible = true;
            }
        }
    }

    for (let section of sections) {
        const otherScrollerDiv = section.querySelector('.scroller');
        const otherTitleDiv = section.querySelector('.title');
        const calledSectionId = visibleSection.id;

        if (otherScrollerDiv) {
            if (section !== visibleSection) {
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

        if (otherScrollerDiv && section !== visibleSection) {
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

    addSlideInToTitle(visibleSection);
}
function addSlideInToTitle(visibleSection) {

    if (visibleSection && (visibleSection.id === "section0" || visibleSection.id === "section4")) {
        const titleDiv = visibleSection.querySelector('.title');
        if (titleDiv) {
            titleDiv.classList.add('slideIn');
        }
    }

    for (let section of sections) {
        const titleDiv = section.querySelector('.title');
        // const infoDivs = section.querySelector('.info')
        if (section !== visibleSection) {
            titleDiv.classList.add('slideOut');
            setTimeout(() => {
                titleDiv.classList.remove('slideIn');
                titleDiv.classList.remove('slideOut');
                // for (let infoDiv of infoDivs) {
                //     infoDiv.classList.remove('slideText');
                // }
            }, 500);
        }
    }
}


//Loads the colored images when clicking on a b&w image and runs expandSection function

async function loadProjectScroller(event) {
    const targetImage = event.target;
    if (!targetImage.matches('.scroller img')) {
        return;
    }

    const scroller = visibleSection.querySelector('.scroller');
    if (!scroller) {
        console.warn('Scroller not found in the visible section:', visibleSection);
        return;
    }

    const sectionId = visibleSection.id;

    scrollPositionsX[sectionId] = scroller.scrollLeft;
    scrollPositionsY[sectionId] = scroller.scrollTop;

    expandSection(visibleSection, targetImage);

    const primaryParentFolder = visibleSection.id.replace("section", "") + "img";
    const clickedImageName = targetImage.src.split('/').pop().split('.')[0];
    const clickedImageIndex = clickedImageName.replace('project', '');
    const secondaryParentFolder = primaryParentFolder + "/img" + clickedImageIndex;

    const manifestUrl = `./images/${secondaryParentFolder}/manifest.json`;

    const response = await fetch(manifestUrl);
    const projects = await response.json();

    const newContent = projects.map((project, i) => {
        const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
        return `
          <div class="box fadeIn ${firstOrLast}" style="z-index: 100;">
            <img src="./images/${secondaryParentFolder}/${project}">
          </div>
        `;
    }).join('');

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.classList.remove('slideRight');

    setTimeout(() => {
        scrollerDiv.classList.add('fadeOut');
    }, 200);

    originalScrollers[visibleSection.id] = scrollerDiv.innerHTML;

    setTimeout(() => {
        scrollerDiv.innerHTML = '';
        scrollerDiv.className = 'scroller';
    }, 400);

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');
    projectScrollerDiv.classList.add('fadeIn');
    projectScrollerDiv.innerHTML = newContent;

    visibleSection.appendChild(projectScrollerDiv);
}


//Excludes sections without a scroller and projectScroller

function hasScrollerContent(visibleSection) {
    if (!visibleSection) {
        return false;
    }

    const scrollerDiv = visibleSection.querySelector('.scroller');

    if (!scrollerDiv) {
        return false;
    }

    return scrollerDiv.innerHTML.trim() !== '';
}
function hasProjectScrollerContent(visibleSection) {
    if (!visibleSection) {
        return false;
    }

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');

    if (!projectScrollerDiv) {
        return false;
    }

    return projectScrollerDiv.innerHTML.trim() !== '';
}


//Removes projectScroller content

async function removeProjectScrollerContent(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');
    projectScrollerDiv.classList.remove('fadeIn');

    restoreScroller(visibleSection);
    collapseSection(visibleSection);

    setTimeout(() => {
        projectScrollerDiv.classList.add('fadeOut');
    }, 200);

    setTimeout(() => {
        projectScrollerDiv.classList.remove('fadeOut');
        projectScrollerDiv.innerHTML = '';
    }, 500);
}


//Restores b&w scroller images

function restoreScroller(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const sectionId = visibleSection.id;
    const scrollPositionX = scrollPositionsX[sectionId] || 0;
    const scrollPositionY = scrollPositionsY[sectionId] || 0;

    setTimeout(() => {
        const scroller = visibleSection.querySelector('.scroller');
        scroller.scrollTo({ top: scrollPositionY, left: scrollPositionX, behavior: 'auto' });
    }, 50);

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.innerHTML = originalScrollers[visibleSection.id];
    scrollerDiv.classList.remove('fadeOut');
    scrollerDiv.classList.add('fadeIn');
    scrollerDiv.classList.add('visible');
}


//Expands and collapses section

async function expandSection(visibleSection, targetImage) {
    if (!visibleSection) {
        return;
    }

    if (isSectionExpanded && !proportions) {
        document.body.style.overflowY = 'hidden';
    }

    isSectionExpanded = true;

    const titleDiv = visibleSection.querySelector('.title');

    if (!titleDiv) {
        return;
    }

    titleDiv.classList.add('hideTitle');
    titleDiv.classList.add('stopScroll');
    card.classList.add('cardShow');
    container.classList.add('stopScroll');

    visibleSection.classList.add('sectionGrow');
    // visibleSection.classList.add('stopScroll');

    for (const section of sections) {
        if (section !== visibleSection) {
            section.classList.add('hidden');
        }
    }

    for (const scroller of scrollers) {
        scroller.classList.remove('scroller106');
        scroller.classList.add('scroller100');
    }

    originalTitleContent[visibleSection.id] = titleDiv.innerHTML;

    setTimeout(() => {
        titleDiv.innerHTML = '';
    }, 400);

    const primaryParentFolder = visibleSection.id.replace("section", "") + "img";

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
        const boxDivs = visibleSection.querySelectorAll('.projectScroller .box');

        for (const boxDiv of boxDivs) {
            boxDiv.classList.add('enlargeBox');
        }
    }, 420);
}
function collapseSection(visibleSection) {
    if (!visibleSection) return;

    if (isSectionExpanded && !proportions) {
        document.body.style.overflowY = 'hidden';
    }

    isSectionExpanded = false;

    const titleDiv = visibleSection.querySelector('.title');
    const boxDivs = visibleSection.querySelectorAll('.projectScroller .box');

    if (!titleDiv) return;

    card.classList.remove('cardShow');
    card.classList.add('cardHide');
    container.classList.remove('stopScroll');
    titleDiv.classList.remove('stopScroll');
    titleDiv.classList.remove('hideTitle');
    titleDiv.classList.add('showTitle');
    // visibleSection.classList.remove('stopScroll');


    for (const boxDiv of boxDivs) {
        boxDiv.classList.remove('enlargeBox');
    }

    for (const scroller of scrollers) {
        scroller.classList.remove('scroller100');
        scroller.classList.add('scroller106');
    }

    if (!proportions) {
        setTimeout(() => {
            visibleSection.classList.add('sectionShrink');
        }, 100);
    }

    setTimeout(() => {
        for (const section of sections) {
            section.classList.remove('hidden');
        }
        card.classList.remove('cardHide');
        titleDiv.classList.remove('showTitle');
        visibleSection.classList.remove('sectionGrow');
        visibleSection.classList.remove('sectionShrink');
        titleDiv.innerHTML = originalTitleContent[visibleSection.id];
        cardTitle.textContent = '';
        cardText.textContent = '';
        cardTitle.classList.remove('cardTitle');
        cardText.classList.remove('cardText');
    }, 420);
    //Lol
}


//Handles buttons

function createButtons(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const calledSectionId = visibleSection.id;
    const buttonContainer = visibleSection.querySelector('.buttonContainer');

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
            clickButton(visibleSection, button);
        });
    }

}
function removeButtons(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const buttonContainer = visibleSection.querySelector('.buttonContainer');

    if (!buttonContainer) {
        return;
    }

    buttonContainer.innerHTML = '';
}
function clickButton(visibleSection, clickedButton) {
    if (!visibleSection) {
        return;
    }

    const buttonContainer = visibleSection.querySelector('.buttonContainer');

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
            const currentSectionId = visibleSection.id;
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