var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
/*!
* suggestify v1.2.5
* (c) 2021 Max van der Schee
* @license MIT
*/
let nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    let byte = bytes[size] & 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte < 63) {
      id += "_";
    } else {
      id += "-";
    }
  }
  return id;
};
function sanitize(string) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&grave;",
    "/": "&#x2F;"
  };
  const reg = /[&<>"'/`]/gi;
  return string.replace(reg, (match) => map[match]);
}
const switchFn = (lookupObject, defaultCase = "_default") => (expression) => (lookupObject[expression] || lookupObject[defaultCase])();
function setAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
class Suggestify {
  constructor(selector, options) {
    __publicField(this, "engine");
    __publicField(this, "class");
    __publicField(this, "url");
    __publicField(this, "blur");
    __publicField(this, "instant");
    __publicField(this, "t");
    __publicField(this, "icon");
    __publicField(this, "onComplete");
    __publicField(this, "root");
    __publicField(this, "input");
    __publicField(this, "clearBtn");
    __publicField(this, "submitBtn");
    __publicField(this, "list", null);
    __publicField(this, "listItems", []);
    __publicField(this, "selectedIndex", -1);
    __publicField(this, "searchInput", "");
    __publicField(this, "cache", {});
    __publicField(this, "timeout", 250);
    __publicField(this, "handleBlur", () => {
      setTimeout(() => {
        this.deleteResultList();
      }, 100);
    });
    __publicField(this, "inputSelected", () => {
      this.request(this.searchInput).then((response) => {
        this.deleteResultList();
        this.createResultList(response);
      }).catch((e) => {
        throw new Error(e.message);
      });
    });
    __publicField(this, "clearInput", () => {
      this.searchInput = "";
      this.input.value = "";
      this.deleteResultList();
      if (this.clearBtn)
        this.clearBtn.hidden = true;
    });
    __publicField(this, "directSearch", () => {
      let result = "";
      if (this.selectedIndex !== -1) {
        const item = this.listItems[this.selectedIndex];
        result = item.title;
      } else if (this.searchInput)
        result = this.searchInput.toLowerCase();
      if (this.onComplete && result) {
        const item = this.listItems.find((item2) => item2.title === result);
        const success = item ? "HIT" : "MISS";
        this.onComplete({ value: result, success }).then(() => {
          window.location.href = `${this.url}${result}`;
        });
      } else
        window.location.href = `${this.url}${result}`;
    });
    __publicField(this, "selectItemUp", () => {
      if (this.listItems.length) {
        const total = this.listItems.length - 1;
        const current = this.listItems[this.selectedIndex];
        if (current)
          current.classList.remove("selected");
        if (this.selectedIndex <= 0)
          this.selectedIndex = total;
        else
          this.selectedIndex--;
        const prev = this.listItems[this.selectedIndex];
        if (prev) {
          this.input.setAttribute("aria-activedescendant", prev.id);
          prev.classList.add("selected");
        }
      }
    });
    __publicField(this, "selectItemDown", () => {
      if (this.listItems.length) {
        const total = this.listItems.length - 1;
        const current = this.listItems[this.selectedIndex];
        if (current)
          current.classList.remove("selected");
        if (this.selectedIndex === total)
          this.selectedIndex = 0;
        else
          this.selectedIndex++;
        const next = this.listItems[this.selectedIndex];
        if (next) {
          this.input.setAttribute("aria-activedescendant", next.id);
          next.classList.add("selected");
        }
      }
    });
    __publicField(this, "keyHandler", ({ key }) => {
      const cases = {
        Enter: this.directSearch,
        Escape: this.deleteResultList,
        ArrowUp: this.selectItemUp,
        ArrowDown: this.selectItemDown,
        _default: () => null
      };
      const keySwitch = switchFn(cases, "_default");
      keySwitch(key);
    });
    __publicField(this, "autoSuggest", () => {
      this.request(this.searchInput).then((response) => {
        if (this.instant) {
          this.createResultList(response);
        }
      }).catch((e) => {
        throw new Error(e.message);
      });
    });
    __publicField(this, "searchInputHandler", ({ target }) => {
      if (this.timeout)
        clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        const input = target.value.trim();
        this.searchInput = input ? sanitize(input) : "";
        if (input && this.clearBtn)
          this.clearBtn.hidden = false;
        else if (this.clearBtn)
          this.clearBtn.hidden = true;
        if (this.engine)
          this.request(this.searchInput).then((response) => {
            this.deleteResultList();
            this.createResultList(response);
          }).catch((e) => {
            throw new Error(e.message);
          });
      }, 250);
    });
    __publicField(this, "banner", (type) => {
      var _a, _b, _c, _d;
      const banner = document.createElement("li");
      banner.className = `${this.class}-banner`;
      if (type === "suggestions")
        banner.textContent = ((_a = this.t) == null ? void 0 : _a.suggestions) ? (_b = this.t) == null ? void 0 : _b.suggestions : "Suggestions";
      if (type === "empty")
        banner.textContent = ((_c = this.t) == null ? void 0 : _c.results) ? (_d = this.t) == null ? void 0 : _d.results : "No suggestions found";
      if (type !== "results")
        this.list.appendChild(banner);
    });
    __publicField(this, "linkHandler", (e, result) => {
      e.preventDefault();
      if (this.onComplete) {
        this.onComplete({ value: result, success: "HIT" }).then(() => {
          window.location.href = `${this.url}${result}`;
        });
      } else
        window.location.href = `${this.url}${result}`;
    });
    __publicField(this, "deleteResultList", () => {
      if (this.list) {
        this.root.classList.remove("expanded");
        this.input.setAttribute("aria-expanded", "false");
        this.input.setAttribute("aria-activedescendant", "");
        this.list.innerHTML = "";
        this.listItems = [];
        this.selectedIndex = -1;
      }
    });
    this.root = typeof selector === "string" ? document.querySelector(selector) : selector;
    this.input = this.root && this.root.querySelector("input");
    this.clearBtn = this.root && this.root.querySelector('button:not([type="submit"])');
    this.submitBtn = this.root && this.root.querySelector('button[type="submit"]');
    this.url = options.url || "?q=";
    this.class = options.class || "suggestify";
    this.blur = options.blur !== void 0 ? options.blur : true;
    this.instant = options.instant !== void 0 ? options.instant : false;
    this.icon = options.icon !== void 0 ? options.icon : true;
    this.t = options.translations || null;
    this.engine = options.engine;
    this.onComplete = options.onComplete;
    this.initialize();
  }
  initialize() {
    if (!this.root)
      throw new Error("Selector not found");
    if (!this.input)
      throw new Error("Input field missing");
    this.initializeDOM();
    this.input.addEventListener("keydown", this.keyHandler, { passive: true });
    this.input.addEventListener("input", this.searchInputHandler, { passive: true });
    this.clearBtn && this.clearBtn.addEventListener("click", this.clearInput, { passive: true });
    this.submitBtn && this.submitBtn.addEventListener("click", this.directSearch, { passive: true });
    if (this.engine) {
      this.input.addEventListener("click", this.inputSelected, { passive: true });
      if (this.blur)
        this.input.addEventListener("blur", this.handleBlur, { passive: true });
      if (this.instant)
        this.autoSuggest();
      else
        this.input.addEventListener("mouseover", this.autoSuggest, { once: true, passive: true });
    }
  }
  initializeDOM() {
    var _a;
    const listId = `${this.class}-results-${nanoid(5)}`;
    this.root.className = this.class;
    this.root.setAttribute("role", "search");
    setAttributes(this.input, {
      class: `${this.class}-input`,
      autocomplete: "off",
      autocapitalize: "off",
      autocorrect: "off",
      spellcheck: "off"
    });
    this.searchInput = this.input.value;
    if (this.icon) {
      const icon = document.createElement("i");
      setAttributes(icon, {
        class: `${this.class}-icon`,
        role: "presentation",
        focusable: "false",
        "aria-hidden": "true"
      });
      const _icon = icon.cloneNode(false);
      this.clearBtn.appendChild(icon);
      this.submitBtn.appendChild(_icon);
    }
    setAttributes(this.clearBtn, {
      class: `${this.class}-clear`,
      hidden: ""
    });
    this.submitBtn.className = `${this.class}-submit`;
    if (this.engine) {
      setAttributes(this.input, {
        role: "combobox",
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "aria-expanded": "false",
        "aria-owns": listId
      });
      this.list = document.createElement("ul");
      setAttributes(this.list, {
        id: listId,
        class: `${this.class}-results`,
        role: "listbox"
      });
      (_a = this.root) == null ? void 0 : _a.appendChild(this.list);
    }
  }
  async request(search) {
    const query = search ? search : null;
    const cacheKey = JSON.stringify(query);
    if (this.cache[cacheKey])
      return this.cache[cacheKey];
    const url = `${this.engine}${query ? `?q=${query}` : ""}`;
    const response = await fetch(url).then((response2) => response2.json());
    this.cache[cacheKey] = response;
    return response;
  }
  createResultList(result) {
    this.root.classList.add("expanded");
    this.input.setAttribute("aria-expanded", "true");
    this.input.setAttribute("aria-activedescendant", "");
    this.banner(result.type);
    if (result.items.length) {
      for (let i = 0; i < result.items.length; i++) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const item = result.items[i];
        const itemId = `${this.class}-item-${nanoid(6)}`;
        setAttributes(a, {
          class: `${this.class}-link`,
          href: `${this.url}${item}`
        });
        a.addEventListener("click", (e) => this.linkHandler(e, item), { passive: false });
        if (result.type === "results") {
          const words = this.searchInput ? this.searchInput.split(" ") : [];
          let text = item;
          for (let i2 = 0; i2 < words.length; i2++) {
            const word = words[i2];
            text = text.replace(word, `<b>${word}</b>`);
          }
          a.innerHTML = text;
        } else
          a.textContent = item;
        li.id = itemId;
        li.title = item;
        li.appendChild(a);
        this.listItems.push(li);
      }
    } else {
      const li = document.createElement("li");
      const a = document.createElement("a");
      setAttributes(a, {
        class: `${this.class}-link`,
        href: `${this.url}${this.searchInput}`
      });
      a.addEventListener("click", (e) => this.linkHandler(e, this.searchInput), { passive: false });
      a.textContent = this.searchInput;
      li.title = this.searchInput;
      li.appendChild(a);
      this.listItems.push(li);
    }
    for (let i = 0; i < this.listItems.length; i++) {
      this.list.appendChild(this.listItems[i]);
    }
  }
}
export { Suggestify as default };
