class FetchPage{
    constructor(url){
        this.url = ((/(https?\:\/\/([\w-]+\.\w+))?(\w*\/)?\w+\.html$/.test(url))?url:`${url}.html`);
        this.fetchPromise = fetch(
            url,
            {
                method : "GET",
            }
        );
    }
    /**
     * @param {HTMLElement} rootElement
     */
    async render(rootElement){
        if(rootElement === undefined || rootElement === null)
            throw new Error(`rootElement must be an HTMLElement.`)
        ;
        this.fetchPromise
            .then(
                (res) => {
                    if (res.ok)
                        return res.text();
                    else
                        throw new Error("There was an error on the request");
                }
            )
            .then(
                (text) => {
                    const parsedPage = BaseDOM.parser.parseFromString(text, "text/html");
                    console.log(parsedPage.baseURI);
                    const newRoot = rootElement.cloneNode(false);
                    newRoot.append(...parsedPage.body.childNodes);
                    BaseDOM.DOM_RECURSE_PARSE(newRoot);
                    rootElement.parentElement.replaceChild(newRoot, rootElement);
                }
            )
            .catch(
                (err) => {
                    console.log("Request Error");
                }
            )
    }
}
class BaseDOM{
    static parser = new DOMParser();
    static DOM_BIND = {};

    /**
     * @param {HTMLElement} child 
    */
    static DOM_PARSE(child){
        Object.entries(child.attributes)
            .map(
                ([,attr]) => {
                    if (attr.name.startsWith("event:")){
                        const eventName = attr.name.replace(/^event\:/,"");
                        const eventObject = BaseDOM.DOM_BIND[eventName];
                        if(eventObject !== undefined && eventObject[attr.value] !== undefined)
                            eventObject[attr.value].map((fn) => child.addEventListener(eventName, fn));
                    }
                }
            );
    }
    /**
     *  @param {HTMLElement} root
    */
    static DOM_RECURSE_PARSE(root){
        if(root === undefined || root === null)return;
        const DOM_CHILDREN = root.children;
        BaseDOM.DOM_PARSE(root);
        Array.from(DOM_CHILDREN).map(
            (child) => BaseDOM.DOM_RECURSE_PARSE(child)
        );
    }
    /**
     * @param {string} bindName
     * @param {string} fnName
     * @param {Function | Array} fn
    */
    static ATTACH_BIND(bindName, fnName, fn){
        const BIND_INDEX = BaseDOM.DOM_BIND[bindName];
        if(Array.isArray(BIND_INDEX[fnName]))
            BIND_INDEX[fnName].push(fn);
        else
            BIND_INDEX[fnName] = [fn];
    }
    static EXTEND_BIND(bindName, bindMap){
        var BIND_INDEX = BaseDOM.DOM_BIND[bindName];
        if(BIND_INDEX === undefined)
        {
            BaseDOM.DOM_BIND[bindName] = {};
            BIND_INDEX = BaseDOM.DOM_BIND[bindName];
        }
        Object.entries(bindMap).map(
            ([fnName, fn]) => 
                BaseDOM.ATTACH_BIND(bindName, fnName, fn)
        );
    }
}
class State{
    static stateChangeEvent = (target) => new Event("statechange",{target:target});
    static #value = {};
    static #bindSet = new Set();
    static #state = {
        changes : 0b00,
        global : this.#value,
        local : [],
        binds : this.#bindSet
    };
    static get current(){
        return this.#state.global;
    }
    static set current(newValue){
        this.#state.changes |= 0b01;
        this.#state.global = newValue;
    }
    static stateChange(element){

    }
    static createState(defaultValue, root = null){
        var rootBind = [];
        const localChange = () => this.#state.changes |= 0b10;
        const STATE_OBJECT = class {
            static #value = defaultValue;
            static {
                if (root === null);
                else
                    if (Array.isArray(root))
                        rootBind = root;
                else
                    if (root instanceof Element)
                        rootBind = [root];
                else
                    throw new Error("root must be an Element.");
            }
            static set value(newValue) {
                this.#value = newValue;
                rootBind.map(
                    /**
                     * @param {HTMLElement} element
                    */
                   (element) => {
                       element.dispatchEvent(State.stateChangeEvent(element));
                    }
                );
                localChange();
                
            }
            static get value(){
                return this.#value;
            }
            static bindState(elementOrArray){
                if(Array.isArray(elementOrArray))
                    elementOrArray.map(
                        element => {
                            if (element instanceof Element)
                                rootBind.push(element);
                            else
                                throw new Error(`array contains ${typeof element}, must be an element`)
                        }
                    )
                else
                    if (element instanceof Element)
                        rootBind.push(elementOrArray);
                else
                    throw new Error(`tried to bind ${typeof elementOrArray}, must be an array or an Element.`)
            }
        };
        this.#state.local.push(STATE_OBJECT);
        rootBind.map(
            element => this.#state.binds.add(element)
        )
        localChange();
        return STATE_OBJECT;
    }
    
    static push(title = "", url = "/"){
        this.#state.changes = 0b00;
        return history.pushState(this.#state, title, url);
    }
    static pushAndReset(title ="", url = "/"){
        this.push(title, url);
        this.#bindSet.forEach(
            /**
             * 
             * @param {HTMLElement} element 
             */
            (element) => {
                element.replaceWith(element.cloneNode(true));
            }
        )
    }
    static rebind(){
        this.#bindSet.forEach(
            (element) => 
                element.dispatchEvent(this.stateChangeEvent(element))
        );
    }

}
class State2{
    static #current_state = {
           path : window.location.pathname
    };
    static get state(){
        return this.#current_state;
    }
}
class Path {
    static #path = {

    }
    static add(path, href, rootSelector){
        if (this.#path[rootSelector] === undefined){
            this.#path[rootSelector] = {[path] : href};
            return;
        }
        const pathValue = this.#path[rootSelector][path];
        if (pathValue !== undefined)
            console.warn(`the path "${path} already has a value of ${pathValue}"`)
        this.#path[rootSelector][path] = href;
        console.log(this.#path);
    }
    static get(rootSelector, path){
        return this.#path[rootSelector][path];
    }
    static get path(){
        return this.#path;
    }
}
class Vanilla{
    static render = BaseDOM.DOM_RECURSE_PARSE;
    static eventMapBind = BaseDOM.EXTEND_BIND;
    static eventBind(bindName, fnName, fn){
        const BIND_INDEX = BaseDOM.DOM_BIND[bindName];
        if(BIND_INDEX === undefined){
            BaseDOM.DOM_BIND[bindName] = {
                [fnName] : Array.isArray(fn)?fn:[fn]
            };
        }
        else{
            if (BIND_INDEX[fnName] === undefined)
                BIND_INDEX[fnName] = [fn];
            else
                BIND_INDEX[fnName].push(fn);
        }
    }
    static async loadPage(parent, url){
        const urlFetch = new FetchPage(url);
        await urlFetch.render(parent);
    }
}
class ClientAnchor extends HTMLAnchorElement {
  constructor(){
    super();
  }
  onclick(){

  }
}
window.addEventListener("popstate", (evt) => {
    console.log(history.state, Path.path);
});
customElements.define("client-anchor", ClientAnchor, {extends:"a"});
