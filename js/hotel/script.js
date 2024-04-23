const sliderUl = Array.from(document.querySelector("#slider > ul").children);
setInterval(() => {
    const curr = sliderUl.shift();
    curr.style.order = "";
    sliderUl.push(curr);
    sliderUl[0].style.order = "1";
}, 8000);