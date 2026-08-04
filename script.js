/* Happy Birthday, Sofy — vanilla JS only. No build step. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    welcome();
    ageCounter();
    revealer();
    letterReveal();
    timelineLine();
    quotes();
    music();
    cake();
    finale();
    sakura();
  });

  /* ---------- Welcome overlay ---------- */
  function welcome() {
    var overlay = document.getElementById("welcome");
    var btn = document.getElementById("open-btn");
    var layer2 = document.getElementById("welcome2");
    var btn2 = document.getElementById("open-btn-2");
    if (!overlay || !btn) return;

    var seq = overlay.querySelectorAll(".w-seq");
    Array.prototype.forEach.call(seq, function (n, i) {
      setTimeout(function () { n.classList.add("in"); }, reduced ? 100 : 500 + i * 900);
    });
    setTimeout(function () { btn.classList.add("show"); btn.focus(); }, reduced ? 300 : 4000);

    function reveal() {
      document.body.classList.remove("locked");
      var audio = document.getElementById("bg-music");
      if (audio) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
        else setPlayingUI(true);
        audio.addEventListener("playing", function () { setPlayingUI(true); }, { once: true });
      }
      var hero = document.getElementById("hero");
      if (hero) hero.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }

    function showLayer2() {
      if (layer2 && btn2) {
        layer2.classList.add("show-layer");
        layer2.setAttribute("aria-hidden", "false");
        setTimeout(function () { btn2.classList.add("show"); btn2.focus(); }, reduced ? 100 : 900);
        btn2.addEventListener("click", function () {
          burst(120);
          layer2.classList.add("hide");
          layer2.setAttribute("aria-hidden", "true");
          setTimeout(function () { layer2.remove(); }, 1200);
          reveal();
        });
      } else {
        reveal();
      }
    }

    btn.addEventListener("click", function () {
      overlay.classList.add("popped");
      cannons();
      spawnBalloons(document.getElementById("hero-balloons"), 9);
      setTimeout(function () { overlay.classList.add("hide"); }, 520);
      setTimeout(function () { overlay.remove(); }, 1600);
      setTimeout(function () { trickQuiz(showLayer2); }, reduced ? 200 : 900);
    });
  }

  /* ---------- Trick question + runaway-button punishment ---------- */
  function trickQuiz(done) {
    var quiz = document.getElementById("quiz");
    var punish = document.getElementById("punish");
    if (!quiz || !punish) return done();

    quiz.classList.add("show-layer");
    quiz.setAttribute("aria-hidden", "false");

    var opts = quiz.querySelectorAll(".quiz-opt");
    Array.prototype.forEach.call(opts, function (o) {
      o.addEventListener("click", function () {
        quiz.classList.add("hide");
        quiz.setAttribute("aria-hidden", "true");
        setTimeout(function () { quiz.remove(); }, 900);
        setTimeout(startPunishment, reduced ? 100 : 600);
      });
    });

    function startPunishment() {
      punish.classList.add("show-layer");
      punish.setAttribute("aria-hidden", "false");

      var zone = document.getElementById("runaway-zone");
      var rbtn = document.getElementById("runaway-btn");
      var left = 10;
      var free = false;

      var tick = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(tick);
          free = true;
          rbtn.textContent = "Okay, okay, forgived it";
          rbtn.classList.add("caught");
          rbtn.style.left = "50%";
          rbtn.style.top = "50%";
        }
      }, 1000);

      function flee() {
        if (free || reduced) return;
        var zr = zone.getBoundingClientRect();
        var br = rbtn.getBoundingClientRect();
        var maxX = Math.max(10, zr.width - br.width);
        var x = Math.random() * maxX + br.width / 2;
        var y = Math.random() * Math.max(10, zr.height - br.height) + br.height / 2;
        rbtn.style.left = x + "px";
        rbtn.style.top = y + "px";
      }

      rbtn.addEventListener("mouseenter", flee);
      rbtn.addEventListener("mousemove", flee);
      rbtn.addEventListener("focus", flee);
      rbtn.addEventListener("click", function (e) {
        if (!free) { e.preventDefault(); flee(); return; }
        burst(90);
        punish.classList.add("hide");
        punish.setAttribute("aria-hidden", "true");
        setTimeout(function () { punish.remove(); }, 1000);
        done();
      });
    }
  }

  /* ---------- Live age counter ---------- */
  function ageCounter() {
    var el = document.getElementById("countdown");
    if (!el) return;
    var birth = new Date("2006-08-07T00:00:00");

    var units = ["years", "months", "days", "hours", "minutes", "seconds"];
    el.innerHTML = units.map(function (u) {
      return '<div class="unit"><span class="num" data-u="' + u + '">0</span><span class="lbl">' + u + "</span></div>";
    }).join("");

    function tick() {
      var now = new Date();
      var y = now.getFullYear() - birth.getFullYear();
      var mo = now.getMonth() - birth.getMonth();
      var d = now.getDate() - birth.getDate();
      var h = now.getHours() - birth.getHours();
      var mi = now.getMinutes() - birth.getMinutes();
      var s = now.getSeconds() - birth.getSeconds();
      if (s < 0) { s += 60; mi--; }
      if (mi < 0) { mi += 60; h--; }
      if (h < 0) { h += 24; d--; }
      if (d < 0) { d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); mo--; }
      if (mo < 0) { mo += 12; y--; }
      var vals = { years: y, months: mo, days: d, hours: h, minutes: mi, seconds: s };
      units.forEach(function (u) {
        var n = el.querySelector('[data-u="' + u + '"]');
        if (n) n.textContent = vals[u];
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Scroll reveal ---------- */
  var io = null;
  function revealer() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduced) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add("in"); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var delay = Math.min(i * 80, 400);
          setTimeout(function () { e.target.classList.add("in"); }, delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  function onceVisible(el, cb, threshold) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return cb();
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { cb(); o.disconnect(); } });
    }, { threshold: threshold || 0.25 });
    o.observe(el);
  }

  /* ---------- Letter reveal ---------- */
  function letterReveal() {
    onceVisible(document.getElementById("letter-card"), function () {
      document.getElementById("letter-card").classList.add("in");
    }, 0.2);
  }

  /* ---------- Timeline growing line ---------- */
  function timelineLine() {
    var tl = document.getElementById("timeline");
    if (!tl) return;
    var line = tl.querySelector(".line");
    if (!line) return;
    if (reduced) { line.style.setProperty("--p", 1); return; }
    var ticking = false;
    function update() {
      var r = tl.getBoundingClientRect();
      var p = (window.innerHeight * 0.75 - r.top) / r.height;
      line.style.setProperty("--p", Math.max(0, Math.min(1, p)));
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Quotes ---------- */
  var QUOTES = [
    ["A man's heart is a wretched, wretched thing. It isn't like a mother's womb.", "Khaled Hosseini"],
    ["Ah, Nastenka! Why, one thanks some people for being alive at the same time with one; I thank you for having met me, for my being able to remember you all my life!", "Fyodor Dostoevsky"],
    ["For you, a thousand times over.", "Khaled Hosseini"],
    ["We buy things we don't need with money we don't have to impress people we don't like.", "Unknown"],
    ["Hope is a good thing, maybe the best of things, and no good thing ever dies.", "Andy Dufresne"]
  ];
  function quotes() {
    var box = document.getElementById("quote-box");
    var t = document.getElementById("quote-text");
    var a = document.getElementById("quote-author");
    var btn = document.getElementById("next-quote");
    if (!box || !t || !a || !btn) return;
    var i = Math.floor(Math.random() * QUOTES.length);
    function paint() {
      t.textContent = "“" + QUOTES[i][0] + "”";
      a.textContent = "— " + QUOTES[i][1];
    }
    paint();
    btn.addEventListener("click", function () {
      var next = i;
      while (next === i && QUOTES.length > 1) next = Math.floor(Math.random() * QUOTES.length);
      i = next;
      box.classList.add("fading");
      setTimeout(function () { paint(); box.classList.remove("fading"); }, reduced ? 0 : 380);
    });
  }

  /* ---------- Music ---------- */
  function setPlayingUI(on) {
    var card = document.getElementById("music-card");
    var btn = document.getElementById("music-btn");
    if (card) card.classList.toggle("playing", on);
    if (btn) {
      btn.textContent = on ? "❚❚ Pause" : "▶ Play";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  function music() {
    var audio = document.getElementById("bg-music");
    var btn = document.getElementById("music-btn");
    if (!audio || !btn) return;
    btn.addEventListener("click", function () {
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () { btn.textContent = "Add music.mp3"; });
        setPlayingUI(true);
      } else {
        audio.pause();
        setPlayingUI(false);
      }
    });
    audio.addEventListener("pause", function () { setPlayingUI(false); });
  }

  /* ---------- Cake + confetti ---------- */
  function cake() {
    var c = document.getElementById("cake");
    var msg = document.getElementById("wish-msg");
    if (!c || !msg) return;
    c.addEventListener("click", function () {
      if (c.classList.contains("blown")) return;
      c.classList.add("blown");
      msg.classList.add("show");
      burst(160);
    });
  }

  function cannons() {
    var canvas = document.getElementById("confetti-canvas");
    if (!canvas || reduced) return;
    var w = window.innerWidth, h = window.innerHeight;
    shoot(w * 0.08, h * 0.95, -1.05, 110);
    shoot(w * 0.92, h * 0.95, -2.09, 110);
    setTimeout(function () {
      shoot(w * 0.2, h * 0.98, -1.2, 70);
      shoot(w * 0.8, h * 0.98, -1.94, 70);
    }, 260);
  }

  var confettiParticles = [];
  var confettiRunning = false;
  function shoot(x, y, angle, count) {
    var canvas = document.getElementById("confetti-canvas");
    if (!canvas || reduced) return;
    ensureCanvas(canvas);
    var colors = ["#a9d6f5", "#cdb4f6", "#7b6bd6", "#62c4c9", "#e8c88a", "#ffb7c5", "#ffffff"];
    for (var i = 0; i < count; i++) {
      var a = angle + (Math.random() - 0.5) * 0.7;
      var speed = 14 + Math.random() * 12;
      confettiParticles.push({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        w: 5 + Math.random() * 7,
        h: 8 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 220 + Math.random() * 120
      });
    }
    run();
  }

  function ensureCanvas(canvas) {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function run() {
    var canvas = document.getElementById("confetti-canvas");
    if (!canvas || confettiRunning) return;
    var ctx = canvas.getContext("2d");
    confettiRunning = true;
    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles = confettiParticles.filter(function (p) { return p.life-- > 0 && p.y < canvas.height + 60; });
      confettiParticles.forEach(function (p) {
        p.vy += 0.18;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 80));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (confettiParticles.length) requestAnimationFrame(loop);
      else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    })();
  }

  function burst(count) {
    var canvas = document.getElementById("confetti-canvas");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ["#ffb7c5", "#cdb4f6", "#a9d6f5", "#e8c88a", "#ffffff"];
    for (var i = 0; i < count; i++) {
      confettiParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * -8 - 2,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.24,
        color: colors[(Math.random() * colors.length) | 0],
        life: 200 + Math.random() * 100
      });
    }
    if (confettiRunning) return;
    confettiRunning = true;
    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles = confettiParticles.filter(function (p) { return p.life-- > 0 && p.y < canvas.height + 60; });
      confettiParticles.forEach(function (p) {
        p.vy += 0.16;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 80));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (confettiParticles.length) requestAnimationFrame(loop);
      else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    })();
  }

  /* ---------- Balloons ---------- */
  function spawnBalloons(wrap, n) {
    if (!wrap || reduced) return;
    var colors = ["#a9d6f5", "#cdb4f6", "#7b6bd6", "#62c4c9", "#e8c88a", "#ffb7c5"];
    for (var i = 0; i < n; i++) {
      var b = document.createElement("span");
      b.className = "balloon";
      b.style.left = Math.random() * 92 + "%";
      b.style.background = colors[i % colors.length];
      b.style.animationDuration = 9 + Math.random() * 7 + "s";
      b.style.animationDelay = Math.random() * 8 + "s";
      wrap.appendChild(b);
    }
  }

  /* ---------- Finale ---------- */
  function finale() {
    var fin = document.getElementById("finale");
    var wrap = document.getElementById("balloons");
    if (!fin) return;
    onceVisible(fin, function () {
      fin.classList.add("lit");
      burst(140);
      spawnBalloons(wrap, 10);
    }, 0.4);
  }

  /* ---------- Sakura petals ---------- */
  function sakura() {
    var canvas = document.getElementById("sakura-canvas");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var petals = [];
    var count = window.innerWidth < 700 ? 40 : 80;
    var PETAL_COLORS = ["#FFB7C5", "#CDB4F6", "#A9D6F5", "#E8C88A", "#7B6BD6", "#62C4C9", "#FFFFFF"];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    function Petal() { this.reset(true); }
    Petal.prototype.reset = function (init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : -30;
      this.w = 12 + Math.random() * 12;
      this.h = this.w * 0.8;
      this.opacity = 0.25 + Math.random() * 0.4;
      this.xs = 0.4 + Math.random() * 1.1;
      this.ys = 0.5 + Math.random() * 1.1;
      this.flip = Math.random();
      this.fs = Math.random() * 0.02;
      this.color = PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0];
    };
    Petal.prototype.step = function () {
      this.x += this.xs;
      this.y += this.ys;
      this.flip += this.fs;
      if (this.y > canvas.height + 30 || this.x > canvas.width + 30) this.reset(false);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      var w = this.w * Math.abs(Math.cos(this.flip));
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.bezierCurveTo(this.x + w / 2, this.y - this.h / 2, this.x + w, this.y, this.x + w / 2, this.y + this.h / 2);
      ctx.bezierCurveTo(this.x, this.y + this.h, this.x - w / 2, this.y, this.x, this.y);
      ctx.closePath();
      ctx.fill();
    };

    for (var i = 0; i < count; i++) petals.push(new Petal());

    (function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < petals.length; i++) petals[i].step();
      requestAnimationFrame(animate);
    })();
  }
})();
