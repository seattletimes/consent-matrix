// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");

var $ = require("./lib/qsa");
var colors = require("./lib/colors");

var matrix = $.one(".matrix");
var key = $.one(".key");
var detail = $.one(".detail");

var { responses, categories, questions } = window.consent;

var groups = {
  how: "friend family school elsewhere never".split(" "),
  old: "child teen adult never".split(" ")
};

var getLong = function(n) {
  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    if (c.short == n) return c.long;
  }
  return n.trim();
}

var getShort = function(n) {
  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    if (c.long == n) return c.short;
  }
  return n.trim();
};

responses.sort(function(a, b) {
  var aIndex = groups.how.indexOf(getShort(a.how));
  var bIndex = groups.how.indexOf(getShort(b.how));
  if (aIndex != bIndex) return aIndex - bIndex;
  var aIndex = groups.old.indexOf(getShort(a.old));
  var bIndex = groups.old.indexOf(getShort(b.old));
  return aIndex - bIndex;
});

var palette = [colors.palette.stDarkBlue, colors.palette.stDarkGreen, colors.palette.stDarkPurple, colors.palette.stDarkOrange];

var onClick = function(e) {
  var index = this.getAttribute("data-index");
  var r = responses[index];
  var tag = [(r.name || "Anonymous").trim(), r.age].filter(d => d).join(", ");
  detail.innerHTML = `
<h1>${tag}</h1>
<h2>${r.occupation || ""}</h2>
<ul class="answers">
${["meaning", "teaching"].map(q => {
  if (!r[q]) return "";
  return `<li> <i>${questions[q].question}</i> <span class="answer">&ldquo;${r[q].trim().replace(/["“”]/g, "'")}&rdquo;</span>`;
}).join("\n")}
</ul>
  `;
  $(".response.selected").forEach(el => el.classList.remove("selected"));
  this.classList.add("selected");
};

responses.forEach(function(r, i) {
  r.index = i;
  var element = document.createElement("div");
  r.element = element;
  element.className = "response";
  element.setAttribute("data-index", i);
  element.addEventListener("click", onClick);
  // element.innerHTML = head;
});

var groupSelect = $.one(".group-by");

var onChange = function() {
  var value = groupSelect.value;
  var not = value == "how" ? "old" : "how";
  var containers = {};
  matrix.innerHTML = "";
  groups[value].forEach(function(g) {
    var div = document.createElement("div");
    div.className = "group";
    div.innerHTML = `<h2>${getLong(g)}</h2>`;
    matrix.appendChild(div);
    containers[g] = div;
  });
  var alts = {
    old: "Age the person learned about consent:",
    how: "Where the reader learned about consent:"
  }
  key.innerHTML = `<h2 class="secondary">${alts[not]}</h2>` + groups[not].map(function(g, i) {
    var color = g == "never" ? colors.palette.dfLightGray : palette[i];
    return `<span class="key-item">
      <div class="response" style="background: ${color}"></div>
      ${getLong(g)}
    </span>`;
  }).join("");
  responses.forEach(function(r) {
    var short = getShort(r[value]);
    var other = getShort(r[not]);
    containers[short].appendChild(r.element);
    var color = other == "never" ? colors.palette.dfLightGray : palette[groups[not].indexOf(other)];
    r.element.style.background = color;
  });
}

groupSelect.addEventListener("change", onChange);
onChange();