const container = document.getElementById("container");
const sections = document.querySelectorAll('.section');
const scrollers = document.querySelectorAll('.scroller');

const card = document.getElementById('card');
const cardTitle = document.getElementById('cardTitle');
const cardText = document.getElementById('cardText');

let visibleSection = getCalledSection(sections);
let oldContent;
let originalScrollers = {};
let originalTitleContent = {};
let proportions;
let previousProportions = false;


//onLoad

window.addEventListener("load", function () {
    const yOffset = (window.innerHeight / 1.23);
    container.scrollTo({ top: yOffset, behavior: "auto" });
    createButtons(visibleSection);
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


//Event listeners for the container

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
    }

    previousProportions = proportions;

});


//Defines the section that is currently in view (visibleSection)

function getCalledSection(sections, threshold = 0.5) {
    const viewportHeight = window.innerHeight;

    for (let section of sections) {
        const sectionRect = section.getBoundingClientRect();

        if (sectionRect.top < viewportHeight * (1 - threshold) && sectionRect.bottom > viewportHeight * threshold) {
            return section;
        }
    }

    return null;
}


//Loads the black and white images when scrolling over visibleSection

async function loadScroller(visibleSection) {
    if (!visibleSection) {
        return;
    }

    if (hasScrollerContent(visibleSection)) {
        return;
    }

    const calledSectionId = visibleSection.id;

    if (calledSectionId === "section0" || calledSectionId === "section4") {
        return;
    }

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');
    if (projectScrollerDiv.innerHTML.trim() !== '') {
        return;
    }

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
        // console.log(`Image URL: ./images/${primaryParentFolder}/${projects[i]}`);
    }

    const scrollerDiv = visibleSection.querySelector('.scroller');

    scrollerDiv.classList.add('slideRight');

    scrollerDiv.innerHTML = newContent;
}


//Loads the colored images when clicking on a b&w image and runs expandSection function

async function loadProjectScroller(event) {
    const targetImage = event.target;

    if (!targetImage.matches('.scroller img')) {
        return;
    }

    expandSection(visibleSection, targetImage);

    const primaryParentFolder = visibleSection.id.replace("section", "") + "img";
    const clickedImageName = targetImage.src.split('/').pop().split('.')[0];
    const clickedImageIndex = clickedImageName.replace('project', '');
    const secondaryParentFolder = primaryParentFolder + "/img" + clickedImageIndex;

    const manifestUrl = `./images/${secondaryParentFolder}/manifest.json`;

    const response = await fetch(manifestUrl);
    const projects = await response.json();

    // let newContent = '';
    // for (let i = 0; i < projects.length; i++) {
    //     const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
    //     newContent += `
    //         <div class="box fadeIn ${firstOrLast}" style="z-index: 100;">
    //             <img src="./images/${secondaryParentFolder}/${projects[i]}">
    //         </div>
    //     `;
    // }

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

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.innerHTML = originalScrollers[visibleSection.id];
    scrollerDiv.classList.remove('fadeOut');
    scrollerDiv.classList.add('fadeIn');

    // setTimeout(() => {
    //     scrollerDiv.innerHTML = originalScrollers[visibleSection.id];
    //     scrollerDiv.classList.remove('fadeOut');
    //     scrollerDiv.classList.add('slideRight');
    // }, 500);
}


//Expands and collapses section

async function expandSection(visibleSection, targetImage) {
    if (!visibleSection) {
        return;
    }

    const titleDiv = visibleSection.querySelector('.title');

    if (!titleDiv) {
        return;
    }

    container.style.overflow = 'hidden';
    titleDiv.classList.add('hideTitle');
    card.classList.add('cardShow');

    visibleSection.classList.add('sectionGrow');


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

    const titleDiv = visibleSection.querySelector('.title');
    const boxDivs = visibleSection.querySelectorAll('.projectScroller .box');

    if (!titleDiv) return;

    card.classList.remove('cardShow');
    card.classList.add('cardHide');


    titleDiv.classList.remove('hideTitle');
    titleDiv.classList.add('showTitle');


    for (const boxDiv of boxDivs) {
        boxDiv.classList.remove('enlargeBox');
    }

    for (const scroller of scrollers) {
        scroller.classList.remove('scroller100');
        scroller.classList.add('scroller106');
    }


    setTimeout(() => {
        visibleSection.classList.add('sectionShrink');
    }, 100);

    setTimeout(() => {
        for (const section of sections) {
            section.classList.remove('hidden');
        }
        container.style.overflow = 'auto';
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

// function createButtons(visibleSection) {
//     if (!visibleSection) {
//         return;
//     }

//     const calledSectionId = visibleSection.id;

//     if (calledSectionId === "section0") {
//         const buttonsHTML = `
//         <div id="hoverBox0" class="hoverBox">
//             <button id="button0" class="circle colorGreen"></button>
//         </div>
//         <div id="hoverBox1" class="hoverBox">
//             <button id="button1" class="circle colorYellow"></button>
//         </div>
//         <div id="hoverBox2" class="hoverBox">
//             <button id="button2" class="circle colorPurple"></button>
//         </div>
//         <div id="hoverBox3" class="hoverBox">
//             <button id="button3" class="circle colorRed"></button>
//         </div>
//     `;

//         visibleSection.insertAdjacentHTML('beforeend', buttonsHTML);

//     } else if (calledSectionId === "section1") {
//         const buttonsHTML = `
//         <div id="hoverBox2" class="hoverBox">
//             <button id="button2" class="circle colorWhite"></button>
//         </div>
//     `;

//         visibleSection.insertAdjacentHTML('beforeend', buttonsHTML);

//     } else if (calledSectionId === "section2") {
//         const buttonsHTML = `
//         <div id="hoverBox1" class="hoverBox">
//             <button id="button1" class="circle colorWhite"></button>
//         </div>
//     `;

//         visibleSection.insertAdjacentHTML('beforeend', buttonsHTML);

//     } else if (calledSectionId === "section3") {
//         const buttonsHTML = `
//         <div id="hoverBox0" class="hoverBox">
//             <button id="button0" class="circle colorWhite"></button>
//         </div>
//     `;

//         visibleSection.insertAdjacentHTML('beforeend', buttonsHTML);

//     } else if (calledSectionId === "section4") {
//         const buttonsHTML = `
//         <div id="hoverBox3" class="hoverBox">
//             <button id="button3" class="circle colorWhite"></button>
//         </div>
//     `;

//         visibleSection.insertAdjacentHTML('beforeend', buttonsHTML);

//     }


// }
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
                <button class="button0 circle colorGreen"></button>
            </div>
            <div class="hoverBox1 hoverBox">
                <button class="button1 circle colorYellow"></button>
            </div>
            <div class="hoverBox2 hoverBox">
                <button class="button2 circle colorPurple"></button>
            </div>
            <div class="hoverBox3 hoverBox">
                <button class="button3 circle colorRed"></button>
            </div>
        `;
    } else if (calledSectionId === "section1") {
        buttonsHTML = `
            <div class="hoverBox2 hoverBox">
                <button class="button2 circle colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section2") {
        buttonsHTML = `
            <div class="hoverBox1 hoverBox">
                <button class="button1 circle colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section3") {
        buttonsHTML = `
            <div class="hoverBox0 hoverBox">
                <button class="button0 circle colorWhite"></button>
            </div>
        `;
    } else if (calledSectionId === "section4") {
        buttonsHTML = `
            <div class="hoverBox3 hoverBox">
                <button class="button3 circle colorWhite"></button>
            </div>
        `;
    }

    buttonContainer.insertAdjacentHTML('beforeend', buttonsHTML);
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