const sliderUl = Array.from(document.querySelector("#slider > ul").children);
sliderUl.map(e => {
    e.style.display = "none";
    e.style.opacity = "0";
});
setInterval(() => {
    const curr = sliderUl.shift();
    curr.style.order = "2";
    curr.style.display = "none";
    curr.style.opacity = "0";
    sliderUl.push(curr);
    sliderUl[0].style.order = "1";
    sliderUl[0].style.display = "initial";
    sliderUl[0].style.opacity = "1.0";

}, 3000);