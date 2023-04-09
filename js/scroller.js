const container = document.getElementById("container");
const sections = document.querySelectorAll('.section');
const scrollers = document.querySelectorAll('.scroller');

const card = document.getElementById('.card');
const pageTitle = document.getElementById('.titleText');

let visibleSection = getCalledSection(sections);
let oldContent;
let originalScrollers = {};


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
        console.log(`Image URL: ./images/${primaryParentFolder}/${projects[i]}`);
    }

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.classList.add('slideRight');
    scrollerDiv.innerHTML = newContent;

}


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

container.addEventListener("scroll", async () => {
    const calledSection = getCalledSection(sections);

    if (calledSection !== visibleSection) {
        visibleSection = calledSection;
        const calledSectionId = visibleSection ? visibleSection.id : 'none';
        console.log("Current visible section:", calledSectionId);
        await loadScroller(visibleSection);
    }
});


async function loadProjectScroller(event) {
    const targetImage = event.target;

    if (!targetImage.matches('.scroller img')) {
        return;
    }

    const primaryParentFolder = visibleSection.id.replace("section", "") + "img";
    const clickedImageName = targetImage.src.split('/').pop().split('.')[0];
    const clickedImageIndex = clickedImageName.replace('project', '');
    const secondaryParentFolder = primaryParentFolder + "/img" + clickedImageIndex;

    const manifestUrl = `./images/${secondaryParentFolder}/manifest.json`;

    const response = await fetch(manifestUrl);
    const projects = await response.json();

    let newContent = '';
    for (let i = 0; i < projects.length; i++) {
        const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
        newContent += `
            <div class="box fadeIn ${firstOrLast}" style="z-index: 100;">
                <img src="./images/${secondaryParentFolder}/${projects[i]}">
            </div>
        `;
        console.log(`Image URL: ./images/${secondaryParentFolder}/${projects[i]}`);
    }

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.classList.remove('slideRight');

    setTimeout(() => {
        scrollerDiv.classList.add('fadeOut');
    }, 100);

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


function hasProjectScrollerContent(visibleSection) {
    if (!visibleSection) {
        return false;
    }

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');

    return projectScrollerDiv.innerHTML.trim() !== '';
}

function hasScrollerContent(visibleSection) {
    if (!visibleSection) {
        return false;
    }

    const projectScrollerDiv = visibleSection.querySelector('.scroller');

    return projectScrollerDiv.innerHTML.trim() !== '';
}

async function removeProjectScrollerContent(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const projectScrollerDiv = visibleSection.querySelector('.projectScroller');
    // projectScrollerDiv.classList.remove('fadeIn');
    // projectScrollerDiv.classList.add('fadeOut');

    setTimeout(() => {
        projectScrollerDiv.innerHTML = '';
        restoreScroller(visibleSection);
    }, 400);
}

function restoreScroller(visibleSection) {
    if (!visibleSection) {
        return;
    }

    const scrollerDiv = visibleSection.querySelector('.scroller');
    scrollerDiv.innerHTML = originalScrollers[visibleSection.id];
    scrollerDiv.classList.remove('fadeOut');
    scrollerDiv.classList.add('fadeIn');
}