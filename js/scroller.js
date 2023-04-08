const container = document.getElementById("container");
const sections = document.querySelectorAll('.section');
const scrollers = document.querySelectorAll('.scroller');

const card = document.getElementById('.card');
const pageTitle = document.getElementById('.titleText');

let currentVisibleSection = getVisibleSection(sections);
let oldContent;

async function loadScroller(currentVisibleSection) {
    if (!currentVisibleSection) {
        return;
    }

    const visibleSectionId = currentVisibleSection.id;

    if (visibleSectionId === "section0" || visibleSectionId === "section4") {
        return;
    }

    // if (oldContent && oldContent !== currentVisibleSection) {
    //     const lastScrollerDiv = oldContent.querySelector('.scroller');
    //     lastScrollerDiv.classList.remove('slideRight');
    //     lastScrollerDiv.classList.add('slideRightBack');

    //     setTimeout(() => {
    //         lastScrollerDiv.innerHTML = '';
    //     }, 200);
    // }

    const primaryParentFolder = visibleSectionId.replace("section", "") + "img";
    const manifestUrl = `./images/${primaryParentFolder}/manifest.json`;

    const response = await fetch(manifestUrl);
    const projects = await response.json();

    let newContent = '';
    for (let i = 0; i < projects.length; i++) {
        const firstOrLast = i === 0 ? 'firstBox' : (i === projects.length - 1 ? 'lastBox' : '');
        newContent += `
            <div class="box ${firstOrLast}">
                <img src="./images/${primaryParentFolder}/${projects[i]}">
            </div>
        `;
        console.log(`Image URL: ./images/${primaryParentFolder}/${projects[i]}`);
    }

    const scrollerDiv = currentVisibleSection.querySelector('.scroller');
    scrollerDiv.classList.add('slideRight');
    scrollerDiv.innerHTML = newContent;

    // oldContent = currentVisibleSection;
}


function getVisibleSection(sections, threshold = 0.5) {
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
    const visibleSection = getVisibleSection(sections);

    if (visibleSection !== currentVisibleSection) {
        currentVisibleSection = visibleSection;
        const visibleSectionId = currentVisibleSection ? currentVisibleSection.id : 'none';
        console.log("Current visible section:", visibleSectionId);
        await loadScroller(currentVisibleSection);
    }
});

function handleClick(event) {
    if (isAnimating) return;

    try {
        if (event.target.tagName === 'IMG') {
            isAnimating = true;
            const value = event.target.getAttribute('data-value');

            if (!value) throw new Error('Value does not exist');

            if (document.head.id == 'page3') {
                textCard.classList.add('cardShowLeft');
            } else {
                textCard.classList.add('cardShow');
            }

            pageTitle.classList.add('hide');

            loadProjectScroller(value);

            images.forEach(image => {
                image.classList.add('hide');
            });

            setTimeout(() => {
                mainScroller.style.display = 'none';
                isAnimating = false;
            }, 400);
        }
    } catch (error) {
        console.error(error)
    }
}

// old variables

// const mainScroller = document.getElementById('mainScroller');
// const textCard = document.getElementById('card');

// const images = mainScroller.querySelectorAll('.box img');
// const imagesColored = projectScroller.querySelectorAll('.boxColored img');

// const projectTitle = document.getElementById('projectTitle');
// const projectBody = document.getElementById('projectBody');

// const projectTitleWrapper = document.getElementById('projectTitleWrapper');
// const projectBodyWrapper = document.getElementById('projectBodyWrapper');

// let isAnimating = false;


// mainScroller.addEventListener('click', handleClick);

// for (let i = 0; i < images.length; i++) {
//     images[i].setAttribute('data-value', i);
// }


// async function loadProjectScroller(value) {
//     isAnimating = true;

//     const primaryParentFolder = section.id.replace("section", "") + "img";
//     const secondaryParentFolder = `./images/${primaryParentFolder}/img${value}`;

//     const response = await fetch(`${secondaryParentFolder}/manifest.json`);
//     const imageNames = await response.json();

//     const titleResponse = await fetch(`./${primaryParentFolder}/titles.json`);
//     const projectTitles = await titleResponse.json();

//     const BodyResponse = await fetch(`./${primaryParentFolder}/text.json`);
//     const projectText = await BodyResponse.json();

//     let newContent = '';
//     for (let i = 0; i < imageNames.length; i++) {
//         const firstOrLast = i === 0 ? 'firstBox' : (i === imageNames.length - 1 ? 'lastBox' : '');
//         newContent += `
//             <div class="boxColored ${firstOrLast}">
//                 <img src="${secondaryParentFolder}/${imageNames[i]}">
//             </div>
//         `;
//     }

//     projectScroller.innerHTML = newContent;

    // if (section.id === 'section3') {
    //     projectScroller.classList.add('scrollerLeftColored');
    // } else {
    //     projectScroller.classList.add('scrollerRightColored');
    // }

    // projectScroller.classList.add('fadeIn');

    // document.addEventListener('click', handleOutsideClick);
    // document.addEventListener('keydown', handleEscapePress);

    // setTimeout(() => {

    //     projectTitle.textContent = projectTitles[value];
    //     projectBody.textContent = projectText[value];

    //     if (document.head.id == 'page3') {
    //         projectTitleWrapper.classList.add('projectTitleWrapper');
    //         projectBodyWrapper.classList.add('projectBodyWrapper');
    //         projectTitle.classList.add('projectTitleLeft');
    //         projectBody.classList.add('projectBodyLeft');
    //     } else {
    //         projectTitle.classList.add('projectTitle');
    //         projectBody.classList.add('projectBody');
    //     }

    //     isAnimating = false;
    // }, 400);
// }


// function handleClick(event) {
//     if (isAnimating) return;

//     try {
//         if (event.target.tagName === 'IMG') {
//             isAnimating = true;
//             const value = event.target.getAttribute('data-value');

//             if (!value) throw new Error('Value does not exist');

//             if (document.head.id == 'page3') {
//                 textCard.classList.add('cardShowLeft');
//             } else {
//                 textCard.classList.add('cardShow');
//             }

//             pageTitle.classList.add('hide');

//             loadProjectScroller(value);

//             images.forEach(image => {
//                 image.classList.add('hide');
//             });

//             setTimeout(() => {
//                 mainScroller.style.display = 'none';
//                 isAnimating = false;
//             }, 400);
//         }
//     } catch (error) {
//         console.error(error)
//     }
// }


// function revertPage() {
//     isAnimating = true;

//     projectTitle.classList.add('hide');
//     projectBody.classList.add('hide');

//     if (document.head.id == 'page3') {
//         projectBodyWrapper.classList.remove('projectBodyWrapper');
//         projectTitleWrapper.classList.remove('projectTitleWrapper');
//         mainScroller.classList.remove('scrollerLeft');
//         mainScroller.classList.add('scrollerLeftFade');
//     } else {
//         mainScroller.classList.remove('scrollerRight');
//         mainScroller.classList.add('scrollerRightFade');
//     }

//     mainScroller.style.display = '';

//     if (document.head.id == 'page3') {
//         textCard.classList.add('cardHideLeft');
//     } else {
//         textCard.classList.add('cardHide');
//     }

//     pageTitle.classList.remove('hide');
//     projectScroller.classList.remove('fadeIn');

//     projectScroller.classList.add('hide');

//     images.forEach(image => {
//         image.classList.remove('hide');
//     });

//     setTimeout(() => {
//         projectScroller.scrollTop = 0;
//         projectScroller.innerHTML = '';

//         projectTitle.textContent = '';
//         projectBody.textContent = '';
//         if (document.head.id === 'page3') {
//             projectTitle.classList.remove('projectTitleLeft');
//             projectTitle.classList.remove('hide');

//             projectBody.classList.remove('projectBodyLeft');
//             projectBody.classList.remove('hide');

//             projectScroller.classList.remove('scrollerLeftColored');
//             projectScroller.classList.remove('hide');

//             textCard.classList.remove('cardShowLeft');
//             textCard.classList.remove('cardHideLeft');
//         } else {
//             projectTitle.classList.remove('projectTitle');
//             projectTitle.classList.remove('hide');

//             projectBody.classList.remove('projectBody');
//             projectBody.classList.remove('hide');

//             projectScroller.classList.remove('scrollerRightColored');
//             projectScroller.classList.remove('hide');

//             textCard.classList.remove('cardShow');
//             textCard.classList.remove('cardHide');
//         }
//         isAnimating = false;
//     }, 500);
// }


// function handleOutsideClick(event) {
//     if (isAnimating) return;
//     if (!projectScroller.contains(event.target)) {
//         revertPage();
//         document.removeEventListener('click', handleOutsideClick);
//         document.removeEventListener('keydown', handleEscapePress);
//     }
// }
// function handleEscapePress(event) {
//     if (isAnimating) return;
//     if (event.key === 'Escape' || event.code === 'Escape') {
//         revertPage();
//         document.removeEventListener('click', handleOutsideClick);
//         document.removeEventListener('keydown', handleEscapePress);
//     }
// }
