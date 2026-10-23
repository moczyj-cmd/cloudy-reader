/**
 * ==========================================================================
 * Cloudy Reader ☁️ Live Environment Injector (v1.7 Emoji-Safe Zero-Tofu Build)
 * ==========================================================================
 */

const isTopFrame = window === window.top;
let activeCloudyTimer = null;
let cachedCloudyState = null;
let cachedPageIsDark = null;
let cloudyAudioCtx = null;
let wave532 = null;
let wave582 = null;
let brownNoiseNode = null;
let brownFilterNode = null;
let pulseLfoNode = null;
let pulseLfoGain = null;
let mainAudioGain = null;
let domUpdateTimer = null;
let isUpdatingDOM = false;
let pendingMutationRoots = new Set();

if (isTopFrame && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

const EMOJI_STACK = ", 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'";

const MASTER_FONT_ROSTER = [
  { name: "Native UI", family: "", fontKey: "", file: "", spacing: "", variable: true },
  { name: "Source Sans 3", family: "'Source Sans 3', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Source Sans 3", file: "SourceSans3.woff2", spacing: "1.5", variable: true },
  { name: "Noto Sans", family: "'Noto Sans', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Noto Sans", file: "NotoSans.woff2", spacing: "1.5", variable: true },
  { name: "Atkinson Next", family: "'Atkinson Hyperlegible Next', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Atkinson Hyperlegible Next", file: "AtkinsonHyperlegibleNext.woff2", spacing: "1.6", variable: true },
  { name: "Ubuntu Sans", family: "'Ubuntu Sans', 'Noto Sans', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Ubuntu Sans", file: "UbuntuSans.woff2", spacing: "1.5", variable: true },
  { name: "IBM Plex Sans", family: "'IBM Plex Sans', system-ui, sans-serif" + EMOJI_STACK, fontKey: "IBM Plex Sans", file: "IBMPlexSans.woff2", multiFiles: { w300: "IBMPlexSans-300.woff2", w400: "IBMPlexSans.woff2", w500: "IBMPlexSans-500.woff2", w600: "IBMPlexSans-600.woff2" }, spacing: "1.55", variable: true },
  { name: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Plus Jakarta Sans", file: "PlusJakartaSans.woff2", spacing: "1.55", variable: true },
  { name: "Andika", family: "'Andika', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Andika", file: "Andika.woff2", boldFile: "Andika-700.woff2", spacing: "1.6", variable: false },
  { name: "Lexend", family: "'Lexend', system-ui, sans-serif" + EMOJI_STACK, fontKey: "Lexend", file: "Lexend.woff2", spacing: "1.6", variable: true },
  { name: "OpenDyslexic", family: "'OpenDyslexic', 'Comic Sans MS', sans-serif" + EMOJI_STACK, fontKey: "OpenDyslexic", file: "OpenDyslexic.woff2", boldFile: "OpenDyslexic-700.woff2", spacing: "1.6", customCSS: "text-align: left !important; letter-spacing: 0.15em !important; ", variable: false },
  { name: "Verdana", family: "'Verdana', Geneva, sans-serif" + EMOJI_STACK, fontKey: "", file: "", spacing: "1.8", variable: false },
  { name: "Cascadia Mono", family: "'Cascadia Mono', Consolas, monospace" + EMOJI_STACK, fontKey: "Cascadia Mono", file: "CascadiaMono.woff2", spacing: "1.6", variable: true },
  { name: "Ubuntu Sans Mono", family: "'Ubuntu Sans Mono', monospace" + EMOJI_STACK, fontKey: "Ubuntu Sans Mono", file: "UbuntuSansMono.woff2", spacing: "1.6", variable: true },
  { name: "Fira Code", family: "'Fira Code', monospace" + EMOJI_STACK, fontKey: "Fira Code", file: "FiraCode.woff2", spacing: "1.6", variable: true },
  { name: "Source Code Pro", family: "'Source Code Pro', monospace" + EMOJI_STACK, fontKey: "Source Code Pro", file: "SourceCodePro.woff2", spacing: "1.6", variable: true },
  { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace" + EMOJI_STACK, fontKey: "IBM Plex Mono", file: "IBMPlexMono.woff2", multiFiles: { w300: "IBMPlexMono-300.woff2", w400: "IBMPlexMono.woff2", w500: "IBMPlexMono-500.woff2", w600: "IBMPlexMono-600.woff2" }, spacing: "1.6", variable: true },
  { name: "Source Serif 4", family: "'Source Serif 4', Georgia, serif" + EMOJI_STACK, fontKey: "Source Serif 4", file: "SourceSerif4.woff2", spacing: "1.6", variable: true },
  { name: "Literata", family: "'Literata', Georgia, serif" + EMOJI_STACK, fontKey: "Literata", file: "Literata.woff2", spacing: "1.65", variable: true },
  { name: "EB Garamond", family: "'EB Garamond', Georgia, serif" + EMOJI_STACK, fontKey: "EB Garamond", file: "EBGaramond.woff2", spacing: "1.7", variable: true },
  { name: "Palatino", family: "'Palatino', 'Palatino Linotype', 'Book Antiqua', Georgia, serif" + EMOJI_STACK, fontKey: "", file: "", spacing: "1.65", variable: false },
  { name: "Lora", family: "'Lora', Georgia, serif" + EMOJI_STACK, fontKey: "Lora", file: "Lora.woff2", spacing: "1.65", variable: true },
];

function buildLocalFontFaceCSS(fontObj) {
  if (!fontObj || !fontObj.file || !fontObj.fontKey) return "";
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.getURL) return "";

  if (fontObj.multiFiles) {
    const u300 = chrome.runtime.getURL("fonts/" + fontObj.multiFiles.w300);
    const u400 = chrome.runtime.getURL("fonts/" + fontObj.multiFiles.w400);
    const u500 = chrome.runtime.getURL("fonts/" + fontObj.multiFiles.w500);
    const u600 = chrome.runtime.getURL("fonts/" + fontObj.multiFiles.w600);
    return (
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + u300 + "') format('woff2'), url('" + u400 + "') format('woff2'); font-weight: 300; font-style: normal; font-display: swap; } " +
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + u400 + "') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; } " +
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + u500 + "') format('woff2'), url('" + u400 + "') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; } " +
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + u600 + "') format('woff2'), url('" + u400 + "') format('woff2'); font-weight: 600 700; font-style: normal; font-display: swap; } "
    );
  }

  if (fontObj.boldFile) {
    const uReg = chrome.runtime.getURL("fonts/" + fontObj.file);
    const uBold = chrome.runtime.getURL("fonts/" + fontObj.boldFile);
    return (
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + uReg + "') format('woff2'); font-weight: 300 400; font-style: normal; font-display: swap; } " +
      "@font-face { font-family: '" + fontObj.fontKey + "'; src: url('" + uBold + "') format('woff2'), url('" + uReg + "') format('woff2'); font-weight: 500 900; font-style: normal; font-display: swap; } "
    );
  }

  const localAssetUrl = chrome.runtime.getURL("fonts/" + fontObj.file);
  return (
    "@font-face { font-family: '" +
    fontObj.fontKey +
    "'; src: url('" +
    localAssetUrl +
    "') format('woff2'); font-weight: 100 900; font-style: normal; font-display: swap; } "
  );
}

// -------------------------------------------------------------
// Cross-Platform Offline Female Text-To-Speech Waterfall
// -------------------------------------------------------------
function speakTextLocally(rawText) {
  if (!isTopFrame || !rawText || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(rawText);
  const allVoices = window.speechSynthesis.getVoices() || [];
  let strictlyLocalVoices = allVoices.filter((v) => v.localService === true);
  if (strictlyLocalVoices.length === 0) {
    strictlyLocalVoices = allVoices;
  }

  if (strictlyLocalVoices.length > 0) {
    const preferredFemaleNames = [
      "Microsoft Jenny",
      "Microsoft Aria",
      "Microsoft Zira",
      "Samantha",
      "Victoria",
      "Karen",
      "Fiona",
      "Moira",
      "Tessa",
      "Serena",
    ];
    let selectedVoice = null;

    for (let i = 0; i < preferredFemaleNames.length; i++) {
      const target = preferredFemaleNames[i].toLowerCase();
      selectedVoice = strictlyLocalVoices.find(
        (v) => v.name && v.name.toLowerCase().includes(target)
      );
      if (selectedVoice) break;
    }

    if (!selectedVoice) {
      selectedVoice = strictlyLocalVoices.find(
        (v) =>
          v.lang &&
          v.lang.toLowerCase().startsWith("en") &&
          v.name &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("woman") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("jenny"))
      );
    }

    if (!selectedVoice) {
      selectedVoice =
        strictlyLocalVoices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) ||
        strictlyLocalVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

// -------------------------------------------------------------
// Non-Intrusive 20-Minute Calibration Toast Banner
// -------------------------------------------------------------
function showCalibrationToast() {
  if (!isTopFrame || !document.body) return;
  let existing = document.getElementById("cloudy-calibration-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cloudy-calibration-toast";
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "320px",
    backgroundColor: "#1a1a1a",
    color: "#e2e0dc",
    border: "1px solid #2680eb",
    borderLeft: "4px solid #2680eb",
    borderRadius: "6px",
    padding: "12px 14px",
    zIndex: "2147483647",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "13px",
    lineHeight: "1.4",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
    opacity: "0",
    transform: "translateY(-10px)",
    pointerEvents: "auto",
  });

  toast.innerHTML =
    '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
    '<strong style="color:#fff; font-size:12px; letter-spacing:0.5px;">☁️ 20-MINUTE VISUAL CALIBRATION</strong>' +
    '<span id="cloudy-toast-close" style="cursor:pointer; color:#888; font-size:16px; line-height:1;">&times;</span>' +
    "</div>" +
    '<div style="color:#b0b0b0; font-size:12px; margin-bottom:8px;">' +
    "Look 20 feet away for 20 seconds to relax your ocular focus." +
    "</div>" +
    '<div style="width:100%; height:3px; background:#333; border-radius:2px; overflow:hidden;">' +
    '<div id="cloudy-toast-bar" style="width:100%; height:100%; background:#2680eb; transition:width 20s linear;"></div>' +
    "</div>";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    const bar = document.getElementById("cloudy-toast-bar");
    if (bar) {
      setTimeout(() => {
        bar.style.width = "0%";
      }, 50);
    }
  });

  const closeBtn = document.getElementById("cloudy-toast-close");
  if (closeBtn) {
    closeBtn.onclick = () => toast.remove();
  }

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }
  }, 20000);
}

// -------------------------------------------------------------
// Fullscreen Atmosphere Lamp & Multi-Bay Light Kitchen Synthesizer
// -------------------------------------------------------------
function wavelengthToHex(wl) {
  const w = parseInt(wl, 10) || 480;
  if (w <= 465) return "#0047FF";
  if (w <= 495) return "#00BFFF";
  if (w <= 535) return "#00FF00";
  if (w <= 565) return "#7CFF00";
  if (w <= 610) return "#FFA657";
  return "#FF0000";
}

function kelvinToHex(kelvin) {
  const k = parseInt(kelvin, 10) || 4600;
  if (k <= 3200) return "#FF8A3D";
  if (k <= 4200) return "#FFB969";
  if (k <= 5200) return "#FFF1E0";
  return "#9CE0FF";
}

function launchFullscreenAmbient(ambientConfig) {
  if (!isTopFrame) return;
  let fullscreenDiv = document.getElementById("cloudy-fullscreen-ambient");
  if (fullscreenDiv) fullscreenDiv.remove();

  fullscreenDiv = document.createElement("div");
  fullscreenDiv.id = "cloudy-fullscreen-ambient";

  Object.assign(fullscreenDiv.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "2147483647",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    cursor: "default",
    transition: "opacity 1s ease-in-out",
    background: "#000",
    fontFamily: "system-ui, -apple-system, sans-serif !important",
    letterSpacing: "normal !important",
    lineHeight: "normal !important",
    userSelect: "none",
    WebkitUserSelect: "none",
  });

  const backgroundLayer = document.createElement("div");
  Object.assign(backgroundLayer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "1",
    pointerEvents: "none",
  });

  let lampType = ambientConfig.lamp;
  let greenMode = ambientConfig.greenMode,
    greenStep = ambientConfig.greenStep;
  let blueMode = ambientConfig.blueMode;
  let amberMode = ambientConfig.amberMode || "breathe";
  let kitchenWl = ambientConfig.kitchenWl || 480;
  let kitchenTemp = ambientConfig.kitchenTemp || 4600;
  let kitchenRhythm = ambientConfig.kitchenRhythm || 12;
  let kitchenSlotWls =
    ambientConfig.kitchenSlotWls && ambientConfig.kitchenSlotWls.length > 0
      ? ambientConfig.kitchenSlotWls
      : [kitchenWl];

  const renderBackground = () => {
    backgroundLayer.style.animation = "none";
    backgroundLayer.style.backgroundImage = "none";
    if (lampType === "green") {
      if (greenMode === "cycle") {
        if (greenStep === 1) {
          backgroundLayer.style.background = "#00FF00";
          backgroundLayer.style.animation = "cloudyGltBreatheFs 8s infinite alternate ease-in-out";
        } else if (greenStep === 2) {
          backgroundLayer.style.background = "#7CFF00";
          backgroundLayer.style.animation = "cloudyGltBreatheFs 8s infinite alternate ease-in-out";
        } else if (greenStep === 3) {
          backgroundLayer.style.animation = "cloudyGltBlendFs 12s infinite alternate ease-in-out";
        } else if (greenStep === 4) {
          backgroundLayer.style.backgroundColor = "#00FF00";
          backgroundLayer.style.backgroundImage =
            "conic-gradient(#7CFF00 90deg, transparent 90deg 180deg, #7CFF00 180deg 270deg, transparent 270deg)";
          backgroundLayer.style.backgroundSize = "60px 60px";
          backgroundLayer.style.animation = "cloudyGltBreatheFs 8s infinite alternate ease-in-out";
        }
        backgroundLayer.style.filter = "none";
      } else if (greenMode === "static") {
        let bgTarget =
          greenStep <= 3 || (greenStep >= 7 && greenStep <= 9) ? "#00FF00" : "#7CFF00";
        if (greenStep >= 7) {
          backgroundLayer.style.backgroundColor = "#00FF00";
          backgroundLayer.style.backgroundImage =
            "conic-gradient(#7CFF00 90deg, transparent 90deg 180deg, #7CFF00 180deg 270deg, transparent 270deg)";
          backgroundLayer.style.backgroundSize = "60px 60px";
        } else {
          backgroundLayer.style.backgroundImage = "none";
          backgroundLayer.style.background = bgTarget;
        }
        const luxLevels = {
          1: 0.25,
          2: 0.5,
          3: 1.0,
          4: 0.25,
          5: 0.5,
          6: 1.0,
          7: 0.25,
          8: 0.5,
          9: 1.0,
        };
        backgroundLayer.style.filter = "brightness(" + luxLevels[greenStep] + ")";
      }
    } else if (lampType === "blue") {
      if (blueMode === "coffee") {
        backgroundLayer.style.background = "#00BFFF";
        backgroundLayer.style.filter = "none";
      } else if (blueMode === "rezzed") {
        backgroundLayer.style.background = "#0047FF";
        backgroundLayer.style.animation = "bltBreatheFs 8s infinite alternate ease-in-out";
        backgroundLayer.style.filter = "none";
      } else if (blueMode === "cycle") {
        backgroundLayer.style.animation = "bltBlendFs 12s infinite alternate ease-in-out";
        backgroundLayer.style.filter = "none";
      }
    } else if (lampType === "amber") {
      backgroundLayer.style.backgroundImage = "none";
      backgroundLayer.style.backgroundColor = "";
      if (amberMode === "static") {
        backgroundLayer.style.background = "#FFA657";
        backgroundLayer.style.filter = "none";
      } else if (amberMode === "blend") {
        backgroundLayer.style.background =
          "radial-gradient(circle at 50% 50%, #FFA657 0%, #FF0000 80%)";
        backgroundLayer.style.animation = "cloudyGltBreatheFs 8s infinite alternate ease-in-out";
        backgroundLayer.style.filter = "none";
      } else {
        backgroundLayer.style.animation = "amberBlendFs 12s infinite alternate ease-in-out";
        backgroundLayer.style.filter = "none";
      }
    } else if (lampType === "kitchen") {
      const primaryColor = wavelengthToHex(kitchenWl);
      const secondaryColor =
        kitchenSlotWls.length > 0
          ? wavelengthToHex(kitchenSlotWls[0])
          : kelvinToHex(kitchenTemp);
      const tertiaryColor =
        kitchenSlotWls.length > 1
          ? wavelengthToHex(kitchenSlotWls[kitchenSlotWls.length - 1])
          : kelvinToHex(kitchenTemp);
      const outerColor = kelvinToHex(kitchenTemp);
      backgroundLayer.style.background =
        "radial-gradient(circle at 50% 50%, " +
        primaryColor +
        " 0%, " +
        secondaryColor +
        " 38%, " +
        tertiaryColor +
        " 72%, " +
        outerColor +
        " 100%)";
      backgroundLayer.style.animation =
        "cloudyGltBreatheFs " + kitchenRhythm + "s infinite alternate ease-in-out";
      backgroundLayer.style.filter = "none";
    }
  };

  renderBackground();
  fullscreenDiv.appendChild(backgroundLayer);

  const uiWrapper = document.createElement("div");
  Object.assign(uiWrapper.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: "10",
    position: "relative",
    width: "100%",
  });

  const headerRow = document.createElement("div");
  Object.assign(headerRow.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "5px",
    pointerEvents: "auto",
  });

  const primaryText = document.createElement("h1");
  const updateTitleText = () => {
    primaryText.innerText =
      lampType === "green"
        ? "Green Lamp"
        : lampType === "blue"
          ? "Blue Lamp"
          : lampType === "kitchen"
            ? "Light Kitchen (" + kitchenWl + "nm • " + kitchenTemp + "K • " + kitchenRhythm + "s)"
            : "Amber Lamp";
  };
  updateTitleText();

  Object.assign(primaryText.style, {
    color: "rgba(0,0,0,0.85)",
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0",
    fontFamily: "system-ui, -apple-system, sans-serif !important",
    letterSpacing: "normal !important",
    transition: "all 0.3s",
    textShadow: "none",
    pointerEvents: "auto",
    marginBottom: "30px",
  });

  primaryText.onmouseover = () => {
    primaryText.style.color = "#FFF";
    primaryText.style.textShadow = "0 0 10px rgba(255,255,255,0.8)";
  };
  primaryText.onmouseout = () => {
    primaryText.style.color = "rgba(0,0,0,0.85)";
    primaryText.style.textShadow = "none";
  };

  headerRow.appendChild(primaryText);
  uiWrapper.appendChild(headerRow);

  const makeBtn = () => {
    const b = document.createElement("button");
    b.className = "fs-glt-tile";
    return b;
  };

  const buttonRack = document.createElement("div");
  Object.assign(buttonRack.style, {
    display: "flex",
    gap: "15px",
    pointerEvents: "auto",
    transition: "all 0.3s",
  });

  if (lampType === "green") {
    const btnCycleG = makeBtn();
    const btnStaticG = makeBtn();
    const updateGBtns = () => {
      btnCycleG.classList.toggle("active", greenMode === "cycle");
      btnStaticG.classList.toggle("active", greenMode === "static");
      let cTxt =
        greenMode === "cycle"
          ? { 1: "525nm", 2: "545nm", 3: "BLEND", 4: "DUAL" }[greenStep]
          : "OFF";
      let sTxt =
        greenMode === "static"
          ? {
              1: "525 DIM",
              2: "525 MED",
              3: "525 MAX",
              4: "545 DIM",
              5: "545 MED",
              6: "545 MAX",
              7: "DUAL DIM",
              8: "DUAL MED",
              9: "DUAL MAX",
            }[greenStep]
          : "OFF";
      btnCycleG.innerHTML =
        '<span class="fs-tile-label">CYCLE</span><span class="fs-hz-readout">' + cTxt + "</span>";
      btnStaticG.innerHTML =
        '<span class="fs-tile-label">STATIC</span><span class="fs-hz-readout">' + sTxt + "</span>";
    };
    btnCycleG.onclick = (e) => {
      e.stopPropagation();
      if (greenMode === "cycle") greenStep = (greenStep % 4) + 1;
      else {
        greenMode = "cycle";
        greenStep = 1;
      }
      renderBackground();
      updateGBtns();
    };
    btnStaticG.onclick = (e) => {
      e.stopPropagation();
      if (greenMode === "static") greenStep = (greenStep % 9) + 1;
      else {
        greenMode = "static";
        greenStep = 1;
      }
      renderBackground();
      updateGBtns();
    };
    buttonRack.appendChild(btnCycleG);
    buttonRack.appendChild(btnStaticG);
    updateGBtns();
  } else if (lampType === "blue") {
    const btnCoffee = makeBtn();
    const btnRezzed = makeBtn();
    const btnCycleB = makeBtn();
    const updateBBtns = () => {
      btnCoffee.classList.toggle("active", blueMode === "coffee");
      btnRezzed.classList.toggle("active", blueMode === "rezzed");
      btnCycleB.classList.toggle("active", blueMode === "cycle");
      btnCoffee.innerHTML =
        '<span class="fs-tile-label">STATIC</span><span class="fs-hz-readout">' +
        (blueMode === "coffee" ? "480nm Static" : "OFF") +
        "</span>";
      btnRezzed.innerHTML =
        '<span class="fs-tile-label">BREATHE</span><span class="fs-hz-readout">' +
        (blueMode === "rezzed" ? "460nm Breathe" : "OFF") +
        "</span>";
      btnCycleB.innerHTML =
        '<span class="fs-tile-label">CYCLE BLEND</span><span class="fs-hz-readout">' +
        (blueMode === "cycle" ? "Blend Both" : "OFF") +
        "</span>";
    };
    btnCoffee.onclick = (e) => {
      e.stopPropagation();
      blueMode = "coffee";
      renderBackground();
      updateBBtns();
    };
    btnRezzed.onclick = (e) => {
      e.stopPropagation();
      blueMode = "rezzed";
      renderBackground();
      updateBBtns();
    };
    btnCycleB.onclick = (e) => {
      e.stopPropagation();
      blueMode = "cycle";
      renderBackground();
      updateBBtns();
    };
    buttonRack.appendChild(btnCoffee);
    buttonRack.appendChild(btnRezzed);
    buttonRack.appendChild(btnCycleB);
    updateBBtns();
  } else if (lampType === "amber") {
    const btnBreatheA = makeBtn();
    const btnStaticA = makeBtn();
    const btnBlendA = makeBtn();
    const updateABtns = () => {
      btnBreatheA.classList.toggle("active", amberMode === "breathe");
      btnStaticA.classList.toggle("active", amberMode === "static");
      btnBlendA.classList.toggle("active", amberMode === "blend");
      btnBreatheA.innerHTML =
        '<span class="fs-tile-label">BREATHE</span><span class="fs-hz-readout">' +
        (amberMode === "breathe" ? "660nm+2700K" : "OFF") +
        "</span>";
      btnStaticA.innerHTML =
        '<span class="fs-tile-label">STATIC</span><span class="fs-hz-readout">' +
        (amberMode === "static" ? "2700K Static" : "OFF") +
        "</span>";
      btnBlendA.innerHTML =
        '<span class="fs-tile-label">CONE BREATHE</span><span class="fs-hz-readout">' +
        (amberMode === "blend" ? "Cone Breathe" : "OFF") +
        "</span>";
    };
    btnBreatheA.onclick = (e) => {
      e.stopPropagation();
      amberMode = "breathe";
      renderBackground();
      updateABtns();
    };
    btnStaticA.onclick = (e) => {
      e.stopPropagation();
      amberMode = "static";
      renderBackground();
      updateABtns();
    };
    btnBlendA.onclick = (e) => {
      e.stopPropagation();
      amberMode = "blend";
      renderBackground();
      updateABtns();
    };
    buttonRack.appendChild(btnBreatheA);
    buttonRack.appendChild(btnStaticA);
    buttonRack.appendChild(btnBlendA);
    updateABtns();
  } else if (lampType === "kitchen") {
    const btnWl = makeBtn();
    const btnTemp = makeBtn();
    const btnRhythm = makeBtn();
    btnWl.classList.add("active");
    btnTemp.classList.add("active");
    btnRhythm.classList.add("active");

    const updateKBtns = () => {
      btnWl.innerHTML =
        '<span class="fs-tile-label">WAVELENGTH</span><span class="fs-hz-readout">' +
        kitchenWl +
        " nm</span>";
      btnTemp.innerHTML =
        '<span class="fs-tile-label">COLOR TEMP</span><span class="fs-hz-readout">' +
        kitchenTemp +
        " K</span>";
      btnRhythm.innerHTML =
        '<span class="fs-tile-label">RHYTHM</span><span class="fs-hz-readout">' +
        kitchenRhythm +
        " sec</span>";
      updateTitleText();
    };

    btnWl.onclick = (e) => {
      e.stopPropagation();
      kitchenWl = kitchenWl >= 660 ? 460 : kitchenWl + 20;
      renderBackground();
      updateKBtns();
    };
    btnTemp.onclick = (e) => {
      e.stopPropagation();
      kitchenTemp = kitchenTemp >= 6500 ? 2700 : kitchenTemp + 400;
      renderBackground();
      updateKBtns();
    };
    btnRhythm.onclick = (e) => {
      e.stopPropagation();
      kitchenRhythm = kitchenRhythm >= 16 ? 4 : kitchenRhythm + 2;
      renderBackground();
      updateKBtns();
    };

    buttonRack.appendChild(btnWl);
    buttonRack.appendChild(btnTemp);
    buttonRack.appendChild(btnRhythm);
    updateKBtns();
  }

  uiWrapper.appendChild(buttonRack);
  fullscreenDiv.appendChild(uiWrapper);

  const closeOverlay = document.createElement("div");
  Object.assign(closeOverlay.style, {
    position: "absolute",
    bottom: "30px",
    color: "rgba(0,0,0,0.6)",
    fontSize: "18px",
    fontWeight: "600",
    pointerEvents: "auto",
    transition: "all 0.3s",
    textShadow: "none",
    fontFamily: "system-ui, -apple-system, sans-serif !important",
    letterSpacing: "normal !important",
    zIndex: "10",
    cursor: "pointer",
  });
  closeOverlay.innerText = "Click anywhere to exit full screen";
  closeOverlay.onmouseover = () => {
    closeOverlay.style.color = "#FFF";
    closeOverlay.style.textShadow = "0 0 10px rgba(255,255,255,0.8)";
  };
  closeOverlay.onmouseout = () => {
    closeOverlay.style.color = "rgba(0,0,0,0.6)";
    closeOverlay.style.textShadow = "none";
  };
  closeOverlay.onclick = (e) => {
    e.stopPropagation();
    fullscreenDiv.style.opacity = "0";
    setTimeout(() => fullscreenDiv.remove(), 1000);
  };
  fullscreenDiv.appendChild(closeOverlay);

  document.body.appendChild(fullscreenDiv);

  if (!document.getElementById("cloudy-ambient-keyframes")) {
    const styleBlock = document.createElement("style");
    styleBlock.id = "cloudy-ambient-keyframes";
    styleBlock.innerHTML =
      "@keyframes cloudyGltBlendFs { 0% { background-color: #00FF00; filter: brightness(0.15); } 35% { background-color: #00FF00; filter: brightness(1.0); } 65% { background-color: #7CFF00; filter: brightness(1.0); } 100% { background-color: #7CFF00; filter: brightness(0.15); } } " +
      "@keyframes cloudyGltBreatheFs { 0% { filter: brightness(0.15); } 100% { filter: brightness(1.0); } } " +
      "@keyframes bltBreatheFs { 0% { filter: brightness(0.2); } 100% { filter: brightness(1.0); } } " +
      "@keyframes bltBlendFs { 0% { background-color: #0047FF; filter: brightness(0.2); } 35% { background-color: #0047FF; filter: brightness(1.0); } 65% { background-color: #00BFFF; filter: brightness(1.0); } 100% { background-color: #00BFFF; filter: brightness(0.2); } } " +
      "@keyframes amberBlendFs { 0% { background-color: #FFA657; filter: brightness(0.2); } 50% { background-color: #FF0000; filter: brightness(1.0); } 100% { background-color: #FFA657; filter: brightness(0.2); } } " +
      ".fs-glt-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; height: 70px; background: transparent; border: 1px solid rgba(0,0,0,0.28); border-radius: 6px; cursor: pointer; transition: all 0.2s; pointer-events: auto; font-family: system-ui, -apple-system, sans-serif !important; padding: 0; box-shadow: none; outline: none; } " +
      ".fs-glt-tile .fs-tile-label { color: rgba(0,0,0,0.65); font-size: 14px; font-weight: 700; text-shadow: none; pointer-events: none; transition: all 0.3s; line-height: 1.2; letter-spacing: 0.5px; } " +
      ".fs-glt-tile .fs-hz-readout { color: rgba(0,0,0,0.55); font-size: 12px; font-weight: 600; text-shadow: none; pointer-events: none; margin-top: 4px; transition: all 0.3s; } " +
      ".fs-glt-tile.active { border: 1px solid rgba(0,0,0,0.65); background: transparent; } " +
      ".fs-glt-tile.active .fs-tile-label { color: rgba(0,0,0,0.9); } " +
      ".fs-glt-tile.active .fs-hz-readout { color: rgba(0,0,0,0.8); } " +
      ".fs-glt-tile:hover, .fs-glt-tile.active:hover { border: 1px solid rgba(255,255,255,0.6); background: transparent; box-shadow: none; } " +
      ".fs-glt-tile:hover .fs-tile-label, .fs-glt-tile.active:hover .fs-tile-label { color: #FFF !important; text-shadow: 0 0 8px rgba(255,255,255,0.8) !important; } " +
      ".fs-glt-tile:hover .fs-hz-readout, .fs-glt-tile.active:hover .fs-hz-readout { color: rgba(255,255,255,0.9) !important; text-shadow: 0 0 6px rgba(255,255,255,0.6) !important; }";
    document.head.appendChild(styleBlock);
  }

  backgroundLayer.style.pointerEvents = "auto";
  backgroundLayer.addEventListener("click", () => {
    fullscreenDiv.style.opacity = "0";
    setTimeout(() => fullscreenDiv.remove(), 1000);
  });
}

// -------------------------------------------------------------
// 5-Mode Local Acoustic Focus Synthesizer (532Hz, 582Hz, Dual, Brown Noise, Pulse)
// -------------------------------------------------------------
function establishAcoustics() {
  if (!cloudyAudioCtx) {
    cloudyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    mainAudioGain = cloudyAudioCtx.createGain();
    mainAudioGain.gain.value = 0.012;
    mainAudioGain.connect(cloudyAudioCtx.destination);
  }
}

function haltAcoustics() {
  if (wave532) {
    try {
      wave532.stop();
      wave532.disconnect();
    } catch (e) {}
    wave532 = null;
  }
  if (wave582) {
    try {
      wave582.stop();
      wave582.disconnect();
    } catch (e) {}
    wave582 = null;
  }
  if (brownNoiseNode) {
    try {
      brownNoiseNode.stop();
      brownNoiseNode.disconnect();
    } catch (e) {}
    brownNoiseNode = null;
  }
  if (brownFilterNode) {
    try {
      brownFilterNode.disconnect();
    } catch (e) {}
    brownFilterNode = null;
  }
  if (pulseLfoNode) {
    try {
      pulseLfoNode.stop();
      pulseLfoNode.disconnect();
    } catch (e) {}
    pulseLfoNode = null;
  }
  if (pulseLfoGain) {
    try {
      pulseLfoGain.disconnect();
    } catch (e) {}
    pulseLfoGain = null;
  }
}

function executeAudioState(tilesArray) {
  if (!isTopFrame) return;
  haltAcoustics();
  const activePulse = tilesArray.find((id) => id.startsWith("solfeggio-freq-"));
  if (!activePulse) return;

  establishAcoustics();

  if (cloudyAudioCtx.state === "suspended") {
    const resumeAudio = () => {
      if (cloudyAudioCtx && cloudyAudioCtx.state === "suspended") {
        cloudyAudioCtx.resume();
      }
    };
    document.addEventListener("click", resumeAudio, { once: true });
    document.addEventListener("keydown", resumeAudio, { once: true });
  }

  const freqMode = activePulse.split("-")[2];

  if (freqMode === "1" || freqMode === "3" || freqMode === "5") {
    wave532 = cloudyAudioCtx.createOscillator();
    wave532.type = "sine";
    wave532.frequency.setValueAtTime(532, cloudyAudioCtx.currentTime);
    wave532.connect(mainAudioGain);
    wave532.start();
  }

  if (freqMode === "2" || freqMode === "3" || freqMode === "5") {
    wave582 = cloudyAudioCtx.createOscillator();
    wave582.type = "sine";
    wave582.frequency.setValueAtTime(582, cloudyAudioCtx.currentTime);
    wave582.connect(mainAudioGain);
    wave582.start();
  }

  if (freqMode === "4") {
    const bufferSize = cloudyAudioCtx.sampleRate * 3;
    const noiseBuffer = cloudyAudioCtx.createBuffer(1, bufferSize, cloudyAudioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.2;
    }
    brownNoiseNode = cloudyAudioCtx.createBufferSource();
    brownNoiseNode.buffer = noiseBuffer;
    brownNoiseNode.loop = true;

    brownFilterNode = cloudyAudioCtx.createBiquadFilter();
    brownFilterNode.type = "lowpass";
    brownFilterNode.frequency.setValueAtTime(420, cloudyAudioCtx.currentTime);

    brownNoiseNode.connect(brownFilterNode);
    brownFilterNode.connect(mainAudioGain);
    brownNoiseNode.start();
  }

  if (freqMode === "5") {
    pulseLfoNode = cloudyAudioCtx.createOscillator();
    pulseLfoGain = cloudyAudioCtx.createGain();
    pulseLfoNode.type = "sine";
    pulseLfoNode.frequency.setValueAtTime(0.12, cloudyAudioCtx.currentTime);
    pulseLfoGain.gain.setValueAtTime(0.006, cloudyAudioCtx.currentTime);
    pulseLfoNode.connect(pulseLfoGain);
    pulseLfoGain.connect(mainAudioGain.gain);
    pulseLfoNode.start();
  }
}

// -------------------------------------------------------------
// Multi-Point + Text-Contrast Background Luma Scanner
// -------------------------------------------------------------
function detectPageTheme(useCache = false) {
  if (useCache && cachedPageIsDark !== null) {
    return cachedPageIsDark;
  }

  function getLuma(colorStr) {
    if (!colorStr) return null;
    let rgb = colorStr.match(/\d+(\.\d+)?/g);
    if (rgb && rgb.length >= 3) {
      if (rgb.length >= 4 && parseFloat(rgb[3]) === 0) return null;
      return (
        (parseFloat(rgb[0]) * 299 +
          parseFloat(rgb[1]) * 587 +
          parseFloat(rgb[2]) * 114) /
        1000
      );
    }
    return null;
  }

  const darkFilterEl = document.getElementById("cloudy-dark-bg-style");
  const hadDarkFilter = !!darkFilterEl && !darkFilterEl.disabled;
  if (darkFilterEl) darkFilterEl.disabled = true;

  let isDark = null;

  const docEl = document.documentElement;
  const bodyEl = document.body;
  if (docEl && bodyEl) {
    const combinedClass = ((docEl.className || "") + " " + (bodyEl.className || "")).toLowerCase();
    const dataTheme = (
      (docEl.getAttribute("data-theme") || "") +
      " " +
      (bodyEl.getAttribute("data-theme") || "") +
      " " +
      (docEl.getAttribute("data-color-mode") || "") +
      " " +
      (docEl.getAttribute("theme") || "")
    ).toLowerCase();

    if (
      combinedClass.includes("dark-theme") ||
      combinedClass.includes("theme-dark") ||
      /\bdark\b/.test(combinedClass) ||
      dataTheme.includes("dark")
    ) {
      isDark = true;
    } else if (
      combinedClass.includes("light-theme") ||
      combinedClass.includes("theme-light") ||
      dataTheme.includes("light")
    ) {
      isDark = false;
    }
  }

  if (isDark === null) {
    let elementsToScan = [];
    if (typeof document.elementFromPoint === "function") {
      const samplePoints = [
        [window.innerWidth * 0.5, window.innerHeight * 0.5],
        [window.innerWidth * 0.35, window.innerHeight * 0.35],
        [window.innerWidth * 0.65, window.innerHeight * 0.65],
      ];
      samplePoints.forEach((pt) => {
        let el = document.elementFromPoint(pt[0], pt[1]);
        while (el && el !== document.documentElement) {
          const elId = el.id || "";
          if (!elId.startsWith("cloudy-") && !elId.startsWith("lotus-")) {
            elementsToScan.push(el);
          }
          el = el.parentElement;
        }
      });
    }
    elementsToScan.push(
      document.querySelector("main"),
      document.querySelector("c-wiz"),
      document.querySelector("#app"),
      document.querySelector("#root"),
      document.body,
      document.documentElement
    );

    for (let el of elementsToScan) {
      if (!el) continue;
      let style;
      try {
        style = window.getComputedStyle(el);
      } catch (e) {
        continue;
      }
      if (!style) continue;

      let bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        let luma = getLuma(bg);
        if (luma !== null) {
          isDark = luma < 135;
          break;
        }
      }
    }
  }

  if (isDark === null && document.body) {
    const sampleTextEl =
      document.querySelector("p, article, message-content, h1, h2, h3, a, span") || document.body;
    try {
      const textStyle = window.getComputedStyle(sampleTextEl);
      if (textStyle && textStyle.color) {
        let textLuma = getLuma(textStyle.color);
        if (textLuma !== null) {
          isDark = textLuma > 160;
        }
      }
    } catch (e) {}
  }

  if (isDark === null) {
    try {
      const rootStyle = window.getComputedStyle(document.documentElement);
      if (rootStyle && rootStyle.colorScheme === "dark") {
        isDark = true;
      }
    } catch (e) {}
  }

  if (darkFilterEl && hadDarkFilter) darkFilterEl.disabled = false;

  cachedPageIsDark = !!isDark;
  return cachedPageIsDark;
}

function resolveActiveLoadout(state, useCachedTheme = false) {
  const themeId = state.curatedThemeIndex || 0;
  const isDarkPage =
    state.enabledTiles && state.enabledTiles.includes("dark-bg")
      ? true
      : detectPageTheme(useCachedTheme);

  if (themeId === 21 || themeId === 22) {
    const staticNum = themeId - 20;
    return {
      isPreset: true,
      isDarkPage,
      loadout: state["static" + staticNum] || null,
    };
  }

  if (themeId === 23 || themeId === 24) {
    const amNum = themeId - 22;
    const amPair = state["autoMatch" + amNum];
    if (amPair) {
      return {
        isPreset: true,
        isDarkPage,
        loadout: isDarkPage ? amPair.dark : amPair.light,
      };
    }
  }

  return {
    isPreset: false,
    isDarkPage,
    loadout: null,
  };
}

// -------------------------------------------------------------
// Zero-Thrash Master Typography & Universal Font Size Engine
// -------------------------------------------------------------
function injectStyleIntoNestedTargets(cssText) {
  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      const doc = frame.contentDocument;
      if (doc && (doc.head || doc.documentElement)) {
        let existing = doc.getElementById("cloudy-theme-styles");
        if (!cssText) {
          if (existing) existing.remove();
          return;
        }
        if (!existing) {
          existing = doc.createElement("style");
          existing.id = "cloudy-theme-styles";
          (doc.head || doc.documentElement).appendChild(existing);
        }
        if (existing.textContent !== cssText) {
          existing.textContent = cssText;
        }
      }
    } catch (e) {}
  });
}

function applyTypographyEngine(manifestState, resolved) {
  let legacySheet = document.getElementById("lotus-theme-styles");
  if (legacySheet) legacySheet.remove();

  const themeId = manifestState.curatedThemeIndex || 0;
  let useContrast = !!manifestState.adaptiveContrast;
  let useKinetic = !!manifestState.kineticFocus;

  if (resolved.isPreset && resolved.loadout) {
    if (resolved.loadout.contrast !== undefined) useContrast = !!resolved.loadout.contrast;
    if (resolved.loadout.kinetic !== undefined) useKinetic = !!resolved.loadout.kinetic;
  }

  let existingSheet = document.getElementById("cloudy-theme-styles");

  if (
    themeId === 0 &&
    (!manifestState.fontSizeIndex || manifestState.fontSizeIndex === 0) &&
    !useContrast &&
    !useKinetic
  ) {
    if (existingSheet) existingSheet.remove();
    injectStyleIntoNestedTargets("");
    return;
  }

  let activeFontObj;
  let customSize = 0;

  if (resolved.isPreset && resolved.loadout) {
    activeFontObj = MASTER_FONT_ROSTER[resolved.loadout.font || 0];
    customSize = resolved.loadout.size || 0;
  } else {
    activeFontObj = MASTER_FONT_ROSTER[themeId] || MASTER_FONT_ROSTER[0];
  }

  if (!activeFontObj) return;

  const paintTarget =
    'body, div:not([class*="icon"]):not([class*="symbol"]):not([class*="code"]):not([id^="cloudy-"]), p, h1, h2, h3, h4, h5, h6, span:not([class*="icon"]):not([class*="symbol"]):not([class*="token"]):not([class*="material-icons"]), a, li, td, th, strong, b, em, label, button, input, textarea, c-wiz, yt-formatted-string, yt-attributed-string, message-content, text-message-content, model-response, user-message, .markdown-body, #kr-renderer, #kr-renderer *, #kindleReader_content, #kindleReader_content *, .kp-notebook-printable, .kcr-reading-area, [id*="kindleReader"] *, .calibre, .calibre *, svg text, svg tspan';

  const layoutTarget =
    'p, li, td, th, blockquote, dd, dt, figcaption, article p, section p, #content-text, yt-attributed-string#content-text, #description-inline-expander, .markdown-body, .markdown-body p, .markdown-body li, message-content, message-content p, text-message-content, model-response, user-message, #kr-renderer p, #kr-renderer div, #kr-renderer span, #kindleReader_content p, #kindleReader_content div, #kindleReader_content span, .kcr-reading-area p, .kcr-reading-area span, [id*="kindleReader"] p, [id*="kindleReader"] span';

  const universalSizeTarget =
    'p, li, td, th, blockquote, dd, dt, figcaption, article, section, a, label, yt-formatted-string, yt-attributed-string, message-content, text-message-content, model-response, user-message, .markdown-body, div:not([class*="icon"]):not([class*="symbol"]):not([class*="logo"]):not([id^="cloudy-"]), span:not([class*="icon"]):not([class*="symbol"]):not([class*="logo"]):not([class*="material-icons"]):not([id^="cloudy-"]), #kr-renderer p, #kr-renderer div, #kr-renderer span, #kindleReader_content p, #kindleReader_content div, #kindleReader_content span, .kcr-reading-area p, .kcr-reading-area span';

  let layoutRules = "word-break: break-word !important; overflow-wrap: break-word !important; ";
  let paintRules = "font-synthesis: weight style !important; ";
  let sizeOverrideCSS = "";

  if (activeFontObj.customCSS) paintRules += activeFontObj.customCSS;

  const matrix = manifestState.sizeMatrix || [14, 17, 22];
  let activePx = 0;

  if (resolved.isPreset && customSize > 0) {
    activePx = customSize;
  } else if (manifestState.fontSizeIndex > 0) {
    activePx = matrix[manifestState.fontSizeIndex - 1] || 0;
  }

  if (activePx > 0) {
    sizeOverrideCSS =
      " " +
      universalSizeTarget +
      " { font-size: " +
      activePx +
      "px !important; line-height: 1.6 !important; } " +
      "h1 { font-size: " +
      Math.round(activePx * 1.6) +
      "px !important; line-height: 1.3 !important; } " +
      "h2 { font-size: " +
      Math.round(activePx * 1.4) +
      "px !important; line-height: 1.35 !important; } " +
      "h3, h4 { font-size: " +
      Math.round(activePx * 1.2) +
      "px !important; line-height: 1.4 !important; } ";
  }

  if (activeFontObj.spacing) {
    layoutRules += "line-height: " + activeFontObj.spacing + " !important; ";
  }

  if (activeFontObj.variable !== false) {
    paintRules +=
      'font-weight: var(--cloudy-font-weight, 400) !important; font-variation-settings: "wght" var(--cloudy-font-weight-num, 400) !important; ';
  } else {
    paintRules += "font-weight: 400 !important; ";
  }

  const headTarget = document.head || document.documentElement;
  const familyRule = activeFontObj.family ? "font-family: " + activeFontObj.family + " !important;" : "";
  const localFontFaceRule = buildLocalFontFaceCSS(activeFontObj);

  const compiledCSS =
    localFontFaceRule +
    " " +
    paintTarget +
    " { " +
    familyRule +
    " text-rendering: optimizeLegibility !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; " +
    paintRules +
    " } " +
    layoutTarget +
    " { " +
    layoutRules +
    " } " +
    sizeOverrideCSS +
    "cloudy-word { display: inline !important; font-weight: var(--cloudy-font-weight, 400) !important; font-variation-settings: \"wght\" var(--cloudy-font-weight-num, 400) !important; } " +
    "cloudy-word > cloudy-focus, body cloudy-focus { font-weight: var(--cloudy-kinetic-weight, 600) !important; font-variation-settings: \"wght\" var(--cloudy-kinetic-weight-num, 600) !important; font-synthesis: weight style !important; -webkit-text-stroke: 0px transparent !important; color: inherit !important; opacity: 1 !important; display: inline !important; }";

  if (!existingSheet) {
    existingSheet = document.createElement("style");
    existingSheet.id = "cloudy-theme-styles";
    if (headTarget) headTarget.appendChild(existingSheet);
  }
  if (existingSheet.textContent !== compiledCSS) {
    existingSheet.textContent = compiledCSS;
  }

  injectStyleIntoNestedTargets(compiledCSS);
}

// -------------------------------------------------------------
// Adaptive Contrast & Smooth Kinetic Calibration (300 Dark / 400 Light)
// -------------------------------------------------------------
function evaluateAdaptiveContrast(state, resolved) {
  if (!state) return;

  let useContrast = !!state.adaptiveContrast;
  let useKinetic = !!state.kineticFocus;

  if (resolved.isPreset && resolved.loadout) {
    if (resolved.loadout.contrast !== undefined) useContrast = !!resolved.loadout.contrast;
    if (resolved.loadout.kinetic !== undefined) useKinetic = !!resolved.loadout.kinetic;
  }

  const isDark = !!resolved.isDarkPage;

  const lightWeight = "400";
  const darkWeight = "300";
  const kineticLightWeight = useKinetic ? "600" : lightWeight;
  const kineticDarkWeight = useKinetic ? "500" : darkWeight;

  const targetWeight = !useContrast ? "400" : isDark ? darkWeight : lightWeight;
  const targetKineticWeight = !useContrast
    ? useKinetic
      ? "600"
      : "400"
    : isDark
      ? kineticDarkWeight
      : kineticLightWeight;

  const applyVarsToDoc = (docEl) => {
    if (!docEl) return;
    docEl.style.setProperty("--cloudy-font-weight", targetWeight);
    docEl.style.setProperty("--cloudy-font-weight-num", targetWeight);
    docEl.style.setProperty("--cloudy-kinetic-weight", targetKineticWeight);
    docEl.style.setProperty("--cloudy-kinetic-weight-num", targetKineticWeight);
  };

  applyVarsToDoc(document.documentElement);

  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      if (frame.contentDocument && frame.contentDocument.documentElement) {
        applyVarsToDoc(frame.contentDocument.documentElement);
      }
    } catch (e) {}
  });
}

// -------------------------------------------------------------
// Emoji-Safe Incremental Kinetic Focus Engine (Never Splits Surrogate Pairs)
// -------------------------------------------------------------
function applyKineticFocus(state, resolved, rootNodes = null) {
  let useKinetic = !!state.kineticFocus;
  if (resolved.isPreset && resolved.loadout && resolved.loadout.kinetic !== undefined) {
    useKinetic = !!resolved.loadout.kinetic;
  }

  function unwrapKineticTags(node) {
    if (!node) return;
    if (node.shadowRoot) {
      unwrapKineticTags(node.shadowRoot);
      node.shadowRoot.normalize();
    }
    if (node.childNodes && node.childNodes.length > 0) {
      Array.from(node.childNodes).forEach((child) => unwrapKineticTags(child));
    }
    const tag = node.tagName ? node.tagName.toLowerCase() : "";
    if (tag === "cloudy-focus" || tag === "cloudy-word" || tag === "lotus-focus") {
      const parent = node.parentNode;
      if (parent) {
        if (tag === "cloudy-word") {
          while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
          }
          parent.removeChild(node);
        } else {
          parent.replaceChild(document.createTextNode(node.textContent), node);
        }
      }
    }
  }

  if (!useKinetic) {
    if (document.body && document.body.hasAttribute("data-cloudy-kinetic")) {
      unwrapKineticTags(document.body);
      document.body.normalize();
      document.body.removeAttribute("data-cloudy-kinetic");
      document.body.removeAttribute("data-lotus-kinetic");
    }
    return;
  }

  if (!document.body) return;

  function isEditableNode(el) {
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      if (
        el.isContentEditable ||
        el.getAttribute("contenteditable") === "true" ||
        el.getAttribute("role") === "textbox"
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function collectTextNodes(node, textNodes = []) {
    if (!node) return textNodes;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const elTag = node.tagName ? node.tagName.toLowerCase() : "";
      if (
        [
          "cloudy-word",
          "cloudy-focus",
          "lotus-focus",
          "script",
          "style",
          "noscript",
          "textarea",
          "input",
          "button",
          "code",
          "pre",
          "code-block",
          "svg",
          "canvas",
        ].includes(elTag)
      ) {
        return textNodes;
      }
      if ((node.id || "").startsWith("cloudy-")) {
        return textNodes;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const parentEl = node.parentElement;
      const parentTag = parentEl ? parentEl.tagName.toLowerCase() : "";
      if (
        parentEl &&
        !isEditableNode(parentEl) &&
        !parentEl.closest("cloudy-word, cloudy-focus, code, pre, code-block, .code-block") &&
        ![
          "script",
          "style",
          "noscript",
          "textarea",
          "input",
          "button",
          "cloudy-word",
          "cloudy-focus",
          "lotus-focus",
          "code",
          "pre",
        ].includes(parentTag)
      ) {
        if (node.nodeValue && node.nodeValue.trim() !== "") {
          textNodes.push(node);
        }
      }
      return textNodes;
    }

    if (node.shadowRoot) {
      collectTextNodes(node.shadowRoot, textNodes);
    }

    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        collectTextNodes(node.childNodes[i], textNodes);
      }
    }

    return textNodes;
  }

  const scanTargets =
    rootNodes && rootNodes.length > 0 ? rootNodes : [document.body];
  let nodesToProcess = [];
  for (let i = 0; i < scanTargets.length; i++) {
    const target = scanTargets[i];
    if (target && (target === document.body || document.body.contains(target))) {
      collectTextNodes(target, nodesToProcess);
    }
  }

  const letterRegex = /[A-Za-z\u00C0-\u024F\u0400-\u04FF]/;

  nodesToProcess.forEach((node) => {
    if (!node.parentNode) return;
    if (node.parentElement && node.parentElement.closest("cloudy-word")) return;

    const words = node.nodeValue.split(/(\s+)/);
    if (words.length === 1 && words[0].trim() === "") return;

    const fragment = document.createDocumentFragment();
    words.forEach((word) => {
      // Do not split whitespace, emojis, numbers, or symbol-only tokens
      if (word.trim() === "" || !letterRegex.test(word)) {
        fragment.appendChild(document.createTextNode(word));
      } else {
        // Split by full Unicode code points (Array.from) so surrogate pairs/emojis never break into 
        const chars = Array.from(word);
        const splitPoint = Math.ceil(chars.length * 0.4);
        const firstPart = chars.slice(0, splitPoint).join("");
        const secondPart = chars.slice(splitPoint).join("");

        const cloudyWord = document.createElement("cloudy-word");
        const cloudyFocus = document.createElement("cloudy-focus");
        cloudyFocus.textContent = firstPart;

        cloudyWord.appendChild(cloudyFocus);
        if (secondPart) cloudyWord.appendChild(document.createTextNode(secondPart));

        fragment.appendChild(cloudyWord);
      }
    });

    if (node.parentNode) {
      node.parentNode.replaceChild(fragment, node);
    }
  });

  document.body.setAttribute("data-cloudy-kinetic", "true");
}

function processCloudyState(incomingState) {
  if (!incomingState) return;
  cachedCloudyState = incomingState;
  cachedPageIsDark = null;

  const resolved = resolveActiveLoadout(incomingState, false);

  if (isTopFrame) {
    let legacyOverlay = document.getElementById("lotus-master-overlay");
    if (legacyOverlay) legacyOverlay.remove();

    let appOverlay = document.getElementById("cloudy-master-overlay");
    if (!appOverlay && document.body) {
      appOverlay = document.createElement("div");
      appOverlay.id = "cloudy-master-overlay";
      document.body.appendChild(appOverlay);
    }

    let activeTint = incomingState.selectedTint;
    let activeIntensity = incomingState.shieldIntensity;

    if (resolved.isPreset && resolved.loadout) {
      if (resolved.loadout.tint && resolved.loadout.tint !== "off") {
        activeTint = resolved.loadout.tint;
        activeIntensity =
          resolved.loadout.tintIntensity !== undefined ? resolved.loadout.tintIntensity : 20;
      } else {
        activeTint = "off";
      }
    }

    if (appOverlay) {
      appOverlay.className = "cloudy-master-overlay";
      if (activeTint && activeTint !== "off" && activeIntensity > 0) {
        appOverlay.classList.add("cloudy-tint-" + activeTint);
        appOverlay.style.opacity = activeIntensity / 100;
        appOverlay.style.display = "block";
      } else {
        appOverlay.style.opacity = "0";
        appOverlay.style.display = "none";
      }
    }

    let darkStyle = document.getElementById("cloudy-dark-bg-style");
    if (incomingState.enabledTiles && incomingState.enabledTiles.includes("dark-bg")) {
      if (!darkStyle) {
        darkStyle = document.createElement("style");
        darkStyle.id = "cloudy-dark-bg-style";
        const headTarget = document.head || document.documentElement;
        if (headTarget) headTarget.appendChild(darkStyle);
      }
      darkStyle.textContent =
        "html { background-color: #121212 !important; filter: invert(1) hue-rotate(180deg) !important; } " +
        "img, video, iframe, canvas, svg, picture { filter: invert(1) hue-rotate(180deg) !important; }";
    } else {
      if (darkStyle) darkStyle.remove();
    }

    if (incomingState.enabledTiles && incomingState.enabledTiles.includes("timer")) {
      if (!activeCloudyTimer) {
        activeCloudyTimer = setInterval(() => {
          showCalibrationToast();
        }, 1200000);
      }
    } else {
      clearInterval(activeCloudyTimer);
      activeCloudyTimer = null;
    }

    if (incomingState.enabledTiles) {
      executeAudioState(incomingState.enabledTiles);
    }
  }

  if (typeof cloudyObserver !== "undefined") cloudyObserver.disconnect();

  applyTypographyEngine(incomingState, resolved);
  evaluateAdaptiveContrast(incomingState, resolved);
  applyKineticFocus(incomingState, resolved, null);

  if (typeof initCloudyObserver !== "undefined") initCloudyObserver();
}

function syncAndEvaluateTab() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["CloudyReader_ActiveManifest"], (result) => {
      if (result.CloudyReader_ActiveManifest) {
        processCloudyState(result.CloudyReader_ActiveManifest);
      }
    });
  } else if (cachedCloudyState) {
    processCloudyState(cachedCloudyState);
  }
}

window.addEventListener("load", () => {
  syncAndEvaluateTab();
});

window.addEventListener("focus", () => {
  syncAndEvaluateTab();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncAndEvaluateTab();
  }
});

const cloudyObserver = new MutationObserver((mutations) => {
  if (isUpdatingDOM || !cachedCloudyState) return;

  for (let i = 0; i < mutations.length; i++) {
    const m = mutations[i];
    if (m.addedNodes && m.addedNodes.length > 0) {
      for (let j = 0; j < m.addedNodes.length; j++) {
        const added = m.addedNodes[j];
        if (added.nodeType === Node.ELEMENT_NODE) {
          const tag = added.tagName ? added.tagName.toLowerCase() : "";
          if (tag !== "cloudy-word" && tag !== "cloudy-focus") {
            pendingMutationRoots.add(added);
          }
        } else if (added.nodeType === Node.TEXT_NODE && added.parentElement) {
          if (!added.parentElement.closest("cloudy-word")) {
            pendingMutationRoots.add(added.parentElement);
          }
        }
      }
    }
  }

  if (pendingMutationRoots.size > 0) {
    if (domUpdateTimer) clearTimeout(domUpdateTimer);
    domUpdateTimer = setTimeout(() => {
      isUpdatingDOM = true;
      cloudyObserver.disconnect();

      const rootsArray = Array.from(pendingMutationRoots);
      pendingMutationRoots.clear();

      requestAnimationFrame(() => {
        const resolved = resolveActiveLoadout(cachedCloudyState, true);
        let useKinetic = !!cachedCloudyState.kineticFocus;
        if (resolved.isPreset && resolved.loadout && resolved.loadout.kinetic !== undefined) {
          useKinetic = !!resolved.loadout.kinetic;
        }
        if (useKinetic) {
          applyKineticFocus(cachedCloudyState, resolved, rootsArray);
        }
        initCloudyObserver();
        isUpdatingDOM = false;
      });
    }, 100);
  }
});

function initCloudyObserver() {
  if (document.body) {
    cloudyObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    setTimeout(initCloudyObserver, 100);
  }
}
initCloudyObserver();

chrome.runtime.onMessage.addListener((payload, sender, callback) => {
  if (payload.action === "applyState" && payload.state) {
    processCloudyState(payload.state);
    if (callback) callback({ success: true });
  } else if (payload.action === "queryTabTheme") {
    const isDark =
      cachedCloudyState &&
      cachedCloudyState.enabledTiles &&
      cachedCloudyState.enabledTiles.includes("dark-bg")
        ? true
        : detectPageTheme(false);
    if (callback) callback({ isDarkPage: isDark });
  } else if (payload.action === "launch-fullscreen-ambient") {
    payload.uiTheme = cachedCloudyState ? cachedCloudyState.uiTheme : "blue";
    launchFullscreenAmbient(payload);
    if (callback) callback({ success: true });
  } else if (payload.action === "execute-tts" && payload.text) {
    if (isTopFrame && cachedCloudyState && cachedCloudyState.enabledTiles.includes("tts")) {
      speakTextLocally(payload.text);
    }
    if (callback) callback({ success: true });
  }
  return true;
});

chrome.storage.onChanged.addListener((changes, space) => {
  if (space === "local" && changes.CloudyReader_ActiveManifest) {
    if (changes.CloudyReader_ActiveManifest.newValue) {
      processCloudyState(changes.CloudyReader_ActiveManifest.newValue);
    }
  }
});

syncAndEvaluateTab();