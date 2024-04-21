function bindRoot(rootSelector){
    return (evt) => {
        evt.preventDefault();
        const root = document.querySelector(rootSelector);
        const element = evt.target;
        if(element.hasAttribute("path")){
            const path = element.getAttribute("path");
            history.pushState(State2.state, document.title, path);
            if(element.hasAttribute("href")){
                const href = element.getAttribute("href");
                Vanilla.loadPage(root, href);
                return;
            }
        }
        
    }
}
Vanilla.eventBind(
    "click",
    "link",
   bindRoot("#root-body")
   
);
Vanilla.eventBind(
    "click",
    "link-root",
   bindRoot("#root")
)
Vanilla.eventBind(
    "click",
    "link-home",
    bindRoot("#home-page")
)
Vanilla.render($("#root")[0]);
Vanilla.loadPage(document.querySelector("#root-body"), "/page.html");
