// async function updateSection(visibleSection, previousSection) {
//     if (!visibleSection) {
//         return;
//     }

//     const title = visibleSection.querySelector(".title");
//     const bwScroller = visibleSection.querySelector(".scroller");

//     if (previousSection) {
//         const previousTitle = previousSection.querySelector(".title");
//         const previousScroller = previousSection.querySelector(".scroller");

//         if (previousTitle) {
//             previousTitle.classList.add("slideOut");
//         }

//         if (previousScroller) {
//             previousScroller.classList.add("scrollerOut");
//         }

//         await waitForNextFrame();

//         if (previousTitle) {
//             previousTitle.classList.remove("slideOut");
//             previousTitle.classList.remove("slideIn");
//         }

//         if (previousScroller) {
//             previousScroller.classList.remove("scrollerOut");
//             previousScroller.classList.remove("slideRight");
//             previousScroller.classList.remove("visible");
//         }
//     }

//     if (title) {
//         title.classList.add("slideIn");
//     }

//     if (bwScroller) {
//         bwScroller.classList.add("slideRight");
//         bwScroller.classList.add("visible");
//     }
// }