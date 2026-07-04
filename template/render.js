/* 목향농원 호스타 브로셔 — 데이터(JSON) → 카드 렌더링
   데이터 정본은 data/hostas.json. file:// 로도 열리도록 data/hostas.data.js(window.HOSTA_DATA) 미러를 우선 사용. */
(function () {
  "use strict";

  var SIZE_KO = { mini:"미니", small:"소형", medium:"중형", large:"대형", giant:"초대형" };
  var SIZE_EN = { mini:"Miniature", small:"Small", medium:"Medium", large:"Large", giant:"Giant" };
  var RATE_KO = { slow:"느림", medium:"보통", fast:"빠름" };
  var RATE_EN = { slow:"Slow", medium:"Medium", fast:"Fast" };
  var RESIST_KO = { low:"낮음", medium:"보통", high:"높음" };
  var RESIST_EN = { low:"Low", medium:"Medium", high:"High" };
  var BLOOM_KO = { "early":"초여름","early-mid":"초·중간","mid":"한여름","mid-late":"중·늦여름","late":"늦여름" };
  var BLOOM_EN = { "early":"Early","early-mid":"Early–mid","mid":"Mid","mid-late":"Mid–late","late":"Late" };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  // 한/영 병기 스팬
  function bi(ko, en) {
    var f = document.createDocumentFragment();
    if (ko) f.appendChild(el("span", { class:"ko", text:ko }));
    if (en) f.appendChild(el("span", { class:"en", text:en }));
    if (!ko && !en) f.appendChild(document.createTextNode("—"));
    return f;
  }
  function range(arr, unit) {
    if (!arr || arr.length !== 2 || arr[0] == null) return null;
    return arr[0] === arr[1] ? (arr[0] + unit) : (arr[0] + "–" + arr[1] + unit);
  }

  function imageSlot(kind, data) {
    var slot = el("div", { class:"imgslot" });
    var labelKo = kind === "farm" ? "농원" : "참고";
    var labelEn = kind === "farm" ? "Farm" : "Reference";
    slot.appendChild(el("span", { class:"tag" }, [bi(labelKo, labelEn)]));
    var src = kind === "farm" ? (data.src || data.placeholder) : data.url;
    if (src) {
      var img = el("img", { src:src, alt:"", loading:"lazy" });
      img.onerror = function () {
        slot.classList.add("noimg");
        img.remove();
        slot.appendChild(el("div", { class:"credit", text: kind === "farm" ? "" : "이미지 링크 오류 / broken link" }));
      };
      slot.appendChild(img);
      if (kind === "ref" && data.credit) slot.appendChild(el("div", { class:"credit", text: data.credit + (data.license ? " · " + data.license : "") }));
    } else {
      // 참고 이미지 미확보
      slot.appendChild(el("div", { class:"credit", text:"참고 이미지 없음 / no reference image" }));
    }
    return slot;
  }

  function spec(labelKo, labelEn, valueNode) {
    if (valueNode == null) return null;
    var dt = el("dt", null, [bi(labelKo, labelEn)]);
    var dd = el("dd", null, [typeof valueNode === "string" ? document.createTextNode(valueNode) : valueNode]);
    return [dt, dd];
  }

  function card(h) {
    var c = el("article", { class:"card" });
    c.dataset.tags = (h.tags || []).join(" ");

    // 이미지 2슬롯
    var imgs = el("div", { class:"images" });
    imgs.appendChild(imageSlot("farm", (h.images && h.images.farm_photo) || {}));
    imgs.appendChild(imageSlot("ref", (h.images && h.images.reference_image) || {}));
    c.appendChild(imgs);

    var body = el("div", { class:"body" });

    // 이름
    var namerow = el("div", { class:"namerow" }, [
      el("span", { class:"ko-name", text:h.name_ko }),
      el("span", { class:"en-name", text:h.name_en })
    ]);
    body.appendChild(namerow);
    if (h.cultivar) body.appendChild(el("div", { class:"cultivar", text:h.cultivar }));

    // 배지
    var badges = el("div", { class:"badges" });
    if (h.size && h.size.class) badges.appendChild(el("span", { class:"badge" }, [bi(SIZE_KO[h.size.class], SIZE_EN[h.size.class])]));
    var hasHoty = false, hasAgm = false;
    (h.awards || []).forEach(function (a) {
      if (!hasHoty && /hosta of the year|올해의\s*호스타/i.test(a)) {
        hasHoty = true;
        var y = (a.match(/(19|20)\d\d/) || [])[0] || "";
        var b = el("span", { class:"badge gold" }); b.appendChild(document.createTextNode("🏆 "));
        b.appendChild(bi("올해의 호스타 " + y, "HOTY " + y)); badges.appendChild(b);
      } else if (!hasAgm && /garden merit|\bagm\b/i.test(a)) {
        hasAgm = true;
        var g = el("span", { class:"badge gold" }); g.appendChild(document.createTextNode("🏆 "));
        g.appendChild(bi("RHS 정원공로상", "RHS AGM")); badges.appendChild(g);
      }
    });
    if (h.flower && h.flower.fragrant) badges.appendChild(el("span", { class:"badge" }, [bi("향기", "Fragrant")]));
    var st = h.research_status || "draft";
    badges.appendChild(el("span", { class:"badge status-" + st }, [bi(st === "verified" ? "검증됨" : "초안", st === "verified" ? "verified" : "draft")]));
    body.appendChild(badges);

    // 스펙
    var specs = el("dl", { class:"specs" });
    function add(pair) { if (pair) { specs.appendChild(pair[0]); specs.appendChild(pair[1]); } }
    var sizeStr = null;
    if (h.size) {
      var hgt = range(h.size.height_cm, "cm"), spr = range(h.size.spread_cm, "cm");
      if (hgt || spr) sizeStr = (hgt ? ("높이 " + hgt) : "") + (hgt && spr ? " × " : "") + (spr ? ("폭 " + spr) : "");
    }
    add(spec("크기", "Size", sizeStr));
    if (h.culture) add(spec("광량", "Light", bi(h.culture.light_ko, h.culture.light_en)));
    if (h.leaf) {
      var leafKo = [h.leaf.color_ko, h.leaf.variegation].filter(Boolean).join(" · ");
      add(spec("잎", "Leaf", bi(leafKo, h.leaf.color_en)));
    }
    if (h.flower) {
      var b = h.flower.bloom_season;
      var fko = [h.flower.color_ko, b ? BLOOM_KO[b] + "개화" : null].filter(Boolean).join(" · ");
      var fen = [h.flower.color_en, b ? BLOOM_EN[b] : null].filter(Boolean).join(", ");
      add(spec("꽃", "Flower", bi(fko, fen)));
    }
    if (h.culture && h.culture.hardiness) add(spec("내한성", "Hardiness", h.culture.hardiness));
    if (h.culture && h.culture.growth_rate) add(spec("성장", "Growth", bi(RATE_KO[h.culture.growth_rate], RATE_EN[h.culture.growth_rate])));
    if (h.culture && h.culture.slug_resistance) add(spec("민달팽이 저항", "Slug resist.", bi(RESIST_KO[h.culture.slug_resistance], RESIST_EN[h.culture.slug_resistance])));
    if (specs.children.length) body.appendChild(specs);

    // 설명
    if (h.description_ko || h.description_en) {
      var desc = el("p", { class:"desc" });
      if (h.description_ko) desc.appendChild(el("span", { class:"ko", text:h.description_ko }));
      if (h.description_en) desc.appendChild(el("span", { class:"en", text:h.description_en }));
      body.appendChild(desc);
    }

    // provenance
    if (h.provenance) {
      var p = h.provenance, parts = [];
      if (p.hybridizer) parts.push(p.hybridizer);
      var yr = p.year_registered || p.year_discovered;
      if (p.year_discovered && p.year_registered && p.year_discovered !== p.year_registered)
        parts.push(p.year_discovered + "발견·" + p.year_registered + "등록");
      else if (yr) parts.push(yr + (p.year_registered ? "등록" : "발견"));
      if (p.parentage) parts.push(p.parentage);
      if (parts.length) body.appendChild(el("div", { class:"prov", text:parts.join(" · ") }));
    }

    // 레퍼런스
    if (h.references && h.references.length) {
      var det = el("details", { class:"refs" });
      det.appendChild(el("summary", null, [bi("레퍼런스 " + h.references.length, "References " + h.references.length)]));
      var ul = el("ul");
      h.references.forEach(function (r) {
        var li = el("li");
        li.appendChild(el("span", { class:"field", text:"[" + r.field + "] " }));
        li.appendChild(el("a", { href:r.url, target:"_blank", rel:"noopener", text:(r.source || r.url) }));
        ul.appendChild(li);
      });
      det.appendChild(ul);
      body.appendChild(det);
    }

    c.appendChild(body);
    return c;
  }

  // ---- 필터/토글 상태 ----
  var ALL = [], selected = new Set();

  function apply() {
    var cards = document.querySelectorAll(".card");
    var shown = 0;
    cards.forEach(function (c) {
      var tags = (c.dataset.tags || "").split(" ").filter(Boolean);
      var ok = selected.size === 0 || tags.some(function (t) { return selected.has(t); });
      c.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    var cnt = document.getElementById("count");
    if (cnt) { cnt.textContent = shown + "종 / " + shown + (shown === 1 ? " cultivar" : " cultivars"); }
  }

  function buildFilters() {
    var box = document.getElementById("filters");
    if (!box) return;
    var tags = {};
    ALL.forEach(function (h) { (h.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
    var all = el("button", { class:"chip", "aria-pressed":"true", text:"전체 / All" });
    all.onclick = function () { selected.clear(); box.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-pressed", b === all ? "true" : "false"); }); apply(); };
    box.appendChild(all);
    Object.keys(tags).sort().forEach(function (t) {
      var chip = el("button", { class:"chip", "aria-pressed":"false", text:t + " (" + tags[t] + ")" });
      chip.onclick = function () {
        if (selected.has(t)) selected.delete(t); else selected.add(t);
        chip.setAttribute("aria-pressed", selected.has(t) ? "true" : "false");
        all.setAttribute("aria-pressed", selected.size === 0 ? "true" : "false");
        apply();
      };
      box.appendChild(chip);
    });
  }

  function wireLang() {
    var sw = document.querySelector(".langswitch");
    if (!sw) return;
    var saved = null;
    try { saved = localStorage.getItem("hosta-lang"); } catch (e) {}
    if (saved) document.body.setAttribute("data-lang", saved);
    sw.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === document.body.getAttribute("data-lang") ? "true" : "false");
      b.onclick = function () {
        document.body.setAttribute("data-lang", b.dataset.lang);
        try { localStorage.setItem("hosta-lang", b.dataset.lang); } catch (e) {}
        sw.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      };
    });
  }

  function loadData() {
    if (window.HOSTA_DATA) return Promise.resolve(window.HOSTA_DATA);
    return fetch("data/hostas.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function init() {
    wireLang();
    var grid = document.getElementById("grid");
    loadData().then(function (data) {
      ALL = Array.isArray(data) ? data : (data.hostas || []);
      grid.innerHTML = "";
      ALL.forEach(function (h) { grid.appendChild(card(h)); });
      buildFilters();
      apply();
    }).catch(function (err) {
      grid.innerHTML = "";
      grid.appendChild(el("div", { class:"empty", html:
        "데이터를 불러오지 못했습니다 / Could not load data.<br><small>로컬 서버로 열거나(예: <code>python3 -m http.server</code>) " +
        "<code>data/hostas.data.js</code>가 있는지 확인하세요.<br>(" + err.message + ")</small>" }));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
