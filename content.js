/**
 * ==========================================================================
 * Cloudy Reader ☁️ Live Environment Injector
 * ==========================================================================
 */

const isTopFrame = window === window.top;
let activeCloudyTimer = null;
let cachedCloudyState = null;
let cloudyAudioCtx = null;
let wave532 = null;
let wave582 = null;
let mainAudioGain = null;

// THE DYNAMIC MASTER FONT ROSTER (All Variable Fonts Include 300 & 400 Weights for Adaptive Contrast)
const MASTER_FONT_ROSTER = [
  { name: "Native UI", family: "", url: "", spacing: "", variable: true },

  /* ZONE 1: POWER (1 - 5) */
  {
    name: "Source Sans 3",
    family: "'Source Sans 3', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');",
    spacing: "1.5",
    variable: true,
  },
  {
    name: "Noto Sans",
    family: "'Noto Sans', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');",
    spacing: "1.5",
    variable: true,
  },
  {
    name: "Atkinson Next",
    family: "'Atkinson Hyperlegible Next', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "Ubuntu Sans",
    family: "'Ubuntu Sans', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap');",
    spacing: "1.5",
    variable: true,
  },
  {
    name: "IBM Plex Sans",
    family: "'IBM Plex Sans', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');",
    spacing: "1.55",
    variable: true,
  },

  /* ZONE 2: WELLNESS (6 - 10) */
  {
    name: "Plus Jakarta Sans",
    family: "'Plus Jakarta Sans', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');",
    spacing: "1.55",
    variable: true,
  },
  {
    name: "Andika",
    family: "'Andika', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Andika:ital,wght@0,400;0,700;1,400;1,700&display=swap');",
    spacing: "1.6",
    variable: false,
  },
  {
    name: "Lexend",
    family: "'Lexend', sans-serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "OpenDyslexic",
    family: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
    url: "@import url('https://fonts.cdnfonts.com/css/opendyslexic');",
    spacing: "1.6",
    customCSS: "text-align: left !important; letter-spacing: 0.15em !important; ",
    variable: false,
  },
  {
    name: "Verdana",
    family: "'Verdana', Geneva, sans-serif",
    url: "",
    spacing: "1.8",
    variable: false,
  },

  /* ZONE 3: TECH (11 - 15) */
  {
    name: "Cascadia Mono",
    family: "'Cascadia Mono', monospace",
    url: "@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "Ubuntu Sans Mono",
    family: "'Ubuntu Sans Mono', monospace",
    url: "@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "Fira Code",
    family: "'Fira Code', monospace",
    url: "@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "Source Code Pro",
    family: "'Source Code Pro', monospace",
    url: "@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "IBM Plex Mono",
    family: "'IBM Plex Mono', monospace",
    url: "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');",
    spacing: "1.6",
    variable: true,
  },

  /* ZONE 4: SCHOLAR (16 - 20) */
  {
    name: "Source Serif 4",
    family: "'Source Serif 4', serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap');",
    spacing: "1.6",
    variable: true,
  },
  {
    name: "Literata",
    family: "'Literata', serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap');",
    spacing: "1.65",
    variable: true,
  },
  {
    name: "EB Garamond",
    family: "'EB Garamond', serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap');",
    spacing: "1.7",
    variable: true,
  },
  {
    name: "Palatino",
    family: "'Palatino', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
    url: "",
    spacing: "1.65",
    variable: false,
  },
  {
    name: "Lora",
    family: "'Lora', serif",
    url: "@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap');",
    spacing: "1.65",
    variable: true,
  },
];

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
// Fullscreen Atmosphere Lamp & Light Kitchen Synthesizer
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
        kitchenSlotWls.length > 1
          ? wavelengthToHex(kitchenSlotWls[kitchenSlotWls.length - 1])
          : kelvinToHex(kitchenTemp);
      const outerColor = kelvinToHex(kitchenTemp);
      backgroundLayer.style.background =
        "radial-gradient(circle at 50% 50%, " +
        primaryColor +
        " 0%, " +
        secondaryColor +
        " 55%, " +
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
      ".fs-glt-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; height: 70px; background: transparent; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: all 0.2s; pointer-events: auto; font-family: system-ui, -apple-system, sans-serif !important; padding: 0; box-shadow: none; outline: none; } " +
      ".fs-glt-tile .fs-tile-label { color: rgba(0,0,0,0.65); font-size: 14px; font-weight: 700; text-shadow: none; pointer-events: none; transition: all 0.3s; line-height: 1.2; letter-spacing: 0.5px; } " +
      ".fs-glt-tile .fs-hz-readout { color: rgba(0,0,0,0.55); font-size: 12px; font-weight: 600; text-shadow: none; pointer-events: none; margin-top: 4px; transition: all 0.3s; } " +
      ".fs-glt-tile.active { border: 1px solid rgba(0,0,0,0.3); background: transparent; } " +
      ".fs-glt-tile.active .fs-tile-label { color: rgba(0,0,0,0.9); } " +
      ".fs-glt-tile.active .fs-hz-readout { color: rgba(0,0,0,0.8); } " +
      ".fs-glt-tile:hover, .fs-glt-tile.active:hover { border: 1px solid rgba(255,255,255,0.4); background: transparent; box-shadow: none; } " +
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

function establishAcoustics() {
  if (!cloudyAudioCtx) {
    cloudyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    mainAudioGain = cloudyAudioCtx.createGain();
    mainAudioGain.gain.value = 0.01;
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

  if (freqMode === "1" || freqMode === "3") {
    wave532 = cloudyAudioCtx.createOscillator();
    wave532.type = "sine";
    wave532.frequency.setValueAtTime(532, cloudyAudioCtx.currentTime);
    wave532.connect(mainAudioGain);
    wave532.start();
  }

  if (freqMode === "2" || freqMode === "3") {
    wave582 = cloudyAudioCtx.createOscillator();
    wave582.type = "sine";
    wave582.frequency.setValueAtTime(582, cloudyAudioCtx.currentTime);
    wave582.connect(mainAudioGain);
    wave582.start();
  }
}

// -------------------------------------------------------------
// Tab-Isolated Background Luma & Active Loadout Resolver
// -------------------------------------------------------------
function detectPageTheme() {
  function getLuma(colorStr) {
    if (!colorStr) return null;
    let rgb = colorStr.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      if (rgb.length >= 4 && parseFloat(rgb[3]) === 0) return null;
      return (
        (parseInt(rgb[0], 10) * 299 +
          parseInt(rgb[1], 10) * 587 +
          parseInt(rgb[2], 10) * 114) /
        1000
      );
    }
    return null;
  }

  const darkFilterEl = document.getElementById("cloudy-dark-bg-style");
  const hadDarkFilter = !!darkFilterEl && !darkFilterEl.disabled;
  if (darkFilterEl) darkFilterEl.disabled = true;

  let isDark = false;
  let elementsToScan = [];
  if (typeof document.elementFromPoint === "function") {
    let centerEl = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    while (centerEl && centerEl !== document.documentElement) {
      const elId = centerEl.id || "";
      if (!elId.startsWith("cloudy-") && !elId.startsWith("lotus-")) {
        elementsToScan.push(centerEl);
      }
      centerEl = centerEl.parentElement;
    }
  }
  elementsToScan.push(
    document.querySelector("main"),
    document.querySelector("#app"),
    document.querySelector("#root"),
    document.body,
    document.documentElement
  );

  let foundBg = false;
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
        foundBg = true;
        isDark = luma < 128;
        break;
      }
    }
  }

  if (!foundBg) {
    try {
      const rootStyle = window.getComputedStyle(document.documentElement);
      if (rootStyle && rootStyle.colorScheme === "dark") {
        isDark = true;
        foundBg = true;
      }
    } catch (e) {}
  }

  if (!foundBg && document.body) {
    try {
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle && bodyStyle.color) {
        let textLuma = getLuma(bodyStyle.color);
        if (textLuma !== null) {
          isDark = textLuma > 180;
        }
      }
    } catch (e) {}
  }

  if (darkFilterEl && hadDarkFilter) darkFilterEl.disabled = false;

  return isDark;
}

function resolveActiveLoadout(state) {
  const themeId = state.curatedThemeIndex || 0;
  const isDarkPage =
    state.enabledTiles && state.enabledTiles.includes("dark-bg") ? true : detectPageTheme();

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
// The Master Typography Engine (Includes Kindle Cloud Reader Iframe & Shadow Piercer)
// -------------------------------------------------------------
function injectStyleIntoNestedTargets(cssText) {
  // 1. Pierce accessible same-origin iframes (e.g., Kindle Cloud Reader book panes)
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
  let existingSheet = document.getElementById("cloudy-theme-styles");
  if (existingSheet) existingSheet.remove();

  let legacySheet = document.getElementById("lotus-theme-styles");
  if (legacySheet) legacySheet.remove();

  const themeId = manifestState.curatedThemeIndex || 0;

  if (
    themeId === 0 &&
    (!manifestState.fontSizeIndex || manifestState.fontSizeIndex === 0) &&
    !manifestState.adaptiveContrast &&
    !manifestState.kineticFocus
  ) {
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

  const domStyle = document.createElement("style");
  domStyle.id = "cloudy-theme-styles";

  const paintTarget =
    'body, div:not([class*="icon"]):not([class*="symbol"]):not([class*="code"]), p, h1, h2, h3, h4, h5, h6, span:not([class*="icon"]):not([class*="symbol"]):not([class*="token"]), a, li, td, th, strong, b, em, label, button, input, textarea, yt-formatted-string, yt-attributed-string, message-content, text-message-content, model-response, user-message, .markdown-body, #kr-renderer, #kr-renderer *, #kindleReader_content, #kindleReader_content *, .kp-notebook-printable, .kcr-reading-area, [id*="kindleReader"] *, .calibre, .calibre *, svg text, svg tspan';

  const layoutTarget =
    'p, li, td, th, blockquote, dd, dt, figcaption, article p, section p, #content-text, yt-attributed-string#content-text, #description-inline-expander, .markdown-body, .markdown-body p, .markdown-body li, message-content, message-content p, text-message-content, model-response, user-message, #kr-renderer p, #kr-renderer div, #kr-renderer span, #kindleReader_content p, #kindleReader_content div, #kindleReader_content span, .kcr-reading-area p, .kcr-reading-area span, [id*="kindleReader"] p, [id*="kindleReader"] span';

  let layoutRules = "word-break: break-word !important; overflow-wrap: break-word !important; ";
  let paintRules = "";

  if (activeFontObj.customCSS) paintRules += activeFontObj.customCSS;

  const matrix = manifestState.sizeMatrix || [14, 17, 22];
  const globalSizeMap = {
    0: "",
    1: matrix[0] + "px",
    2: matrix[1] + "px",
    3: matrix[2] + "px",
  };

  if (resolved.isPreset && customSize > 0) {
    layoutRules += "font-size: " + customSize + "px !important; line-height: 1.6 !important; ";
  } else if (!resolved.isPreset && manifestState.fontSizeIndex > 0) {
    layoutRules +=
      "font-size: " + globalSizeMap[manifestState.fontSizeIndex] + " !important; line-height: 1.6 !important; ";
  }

  if (activeFontObj.spacing) {
    layoutRules += "line-height: " + activeFontObj.spacing + " !important; ";
  }

  if (activeFontObj.variable !== false) {
    paintRules += "font-weight: var(--cloudy-font-weight, 400) !important; ";
  } else {
    paintRules += "font-weight: 400 !important; ";
  }

  const headTarget = document.head || document.documentElement;
  const familyRule = activeFontObj.family ? "font-family: " + activeFontObj.family + " !important;" : "";

  const compiledCSS =
    activeFontObj.url +
    " " +
    paintTarget +
    " { " +
    familyRule +
    " text-rendering: optimizeLegibility !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; backface-visibility: hidden !important; " +
    paintRules +
    " } " +
    layoutTarget +
    " { " +
    layoutRules +
    " } " +
    "cloudy-focus { font-weight: var(--cloudy-kinetic-weight, 700) !important; color: inherit !important; opacity: 1 !important; display: inline !important; }";

  domStyle.textContent = compiledCSS;

  if (headTarget) headTarget.appendChild(domStyle);
  injectStyleIntoNestedTargets(compiledCSS);
}

// -------------------------------------------------------------
// Adaptive Contrast Calibration (True 400 Light / 300 Dark)
// -------------------------------------------------------------
function evaluateAdaptiveContrast(state, resolved) {
  if (!state) return;

  let useContrast = state.adaptiveContrast;
  let useKinetic = state.kineticFocus;

  if (resolved.isPreset && resolved.loadout) {
    if (resolved.loadout.contrast !== undefined) useContrast = !!resolved.loadout.contrast;
    if (resolved.loadout.kinetic !== undefined) useKinetic = !!resolved.loadout.kinetic;
  }

  const lightWeight = "400";
  const darkWeight = "300";
  const kineticLightWeight = useKinetic ? "700" : "inherit";
  const kineticDarkWeight = useKinetic ? "500" : "inherit";

  const targetWeight = !useContrast ? "400" : resolved.isDarkPage ? darkWeight : lightWeight;
  const targetKineticWeight = !useContrast
    ? kineticLightWeight
    : resolved.isDarkPage
      ? kineticDarkWeight
      : kineticLightWeight;

  document.documentElement.style.setProperty("--cloudy-font-weight", targetWeight);
  document.documentElement.style.setProperty("--cloudy-kinetic-weight", targetKineticWeight);

  // Sync CSS variables into accessible same-origin iframes
  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      if (frame.contentDocument && frame.contentDocument.documentElement) {
        frame.contentDocument.documentElement.style.setProperty("--cloudy-font-weight", targetWeight);
        frame.contentDocument.documentElement.style.setProperty(
          "--cloudy-kinetic-weight",
          targetKineticWeight
        );
      }
    } catch (e) {}
  });
}

// -------------------------------------------------------------
// Kinetic Focus Engine (With DOM Guard to Prevent Re-Split Lag)
// -------------------------------------------------------------
function applyKineticFocus(state, resolved, allowMutationScan = false) {
  let useKinetic = state.kineticFocus;
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
    if (tag === "cloudy-focus" || tag === "lotus-focus") {
      const parent = node.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(node.textContent), node);
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

  if (document.body.hasAttribute("data-cloudy-kinetic") && !allowMutationScan) {
    return;
  }

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

    if (node.nodeType === Node.TEXT_NODE) {
      const parentEl = node.parentElement;
      const parentTag = parentEl ? parentEl.tagName.toLowerCase() : "";
      if (
        parentEl &&
        !isEditableNode(parentEl) &&
        !parentEl.closest("cloudy-focus") &&
        ![
          "script",
          "style",
          "noscript",
          "textarea",
          "input",
          "button",
          "cloudy-focus",
          "lotus-focus",
          "code",
          "pre",
        ].includes(parentTag)
      ) {
        if (node.nodeValue.trim() !== "") {
          textNodes.push(node);
        }
      }
      return textNodes;
    }

    if (node.shadowRoot) {
      collectTextNodes(node.shadowRoot, textNodes);
    }

    if (node.childNodes && node.childNodes.length > 0) {
      Array.from(node.childNodes).forEach((child) => {
        collectTextNodes(child, textNodes);
      });
    }

    return textNodes;
  }

  const nodesToProcess = collectTextNodes(document.body);

  nodesToProcess.forEach((node) => {
    const words = node.nodeValue.split(/(\s+)/);
    if (words.length === 1 && words[0].trim() === "") return;

    const fragment = document.createDocumentFragment();
    words.forEach((word) => {
      if (word.trim() === "") {
        fragment.appendChild(document.createTextNode(word));
      } else {
        const splitPoint = Math.ceil(word.length * 0.4);
        const firstPart = word.substring(0, splitPoint);
        const secondPart = word.substring(splitPoint);

        const cloudyFocus = document.createElement("cloudy-focus");
        cloudyFocus.textContent = firstPart;

        fragment.appendChild(cloudyFocus);
        if (secondPart) fragment.appendChild(document.createTextNode(secondPart));
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

  const resolved = resolveActiveLoadout(incomingState);

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
      if (activeTint && activeTint !== "off") {
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
  applyKineticFocus(incomingState, resolved, false);

  if (typeof initCloudyObserver !== "undefined") initCloudyObserver();
}

// -------------------------------------------------------------
// The Active DOM Sentinel & Multi-Tab Sync
// -------------------------------------------------------------
let isUpdatingDOM = false;

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

  let domChanged = false;
  for (let m of mutations) {
    if (m.addedNodes.length > 0) {
      domChanged = true;
      break;
    }
  }

  if (domChanged) {
    isUpdatingDOM = true;
    cloudyObserver.disconnect();

    requestAnimationFrame(() => {
      const resolved = resolveActiveLoadout(cachedCloudyState);
      applyTypographyEngine(cachedCloudyState, resolved);
      evaluateAdaptiveContrast(cachedCloudyState, resolved);
      applyKineticFocus(cachedCloudyState, resolved, true);
      initCloudyObserver();
      isUpdatingDOM = false;
    });
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

// -------------------------------------------------------------
// Core Event Listeners & Real-Time Multi-Tab Sync
// -------------------------------------------------------------
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
        : detectPageTheme();
    if (callback) callback({ isDarkPage: isDark });
  } else if (payload.action === "launch-fullscreen-ambient") {
    payload.uiTheme = cachedCloudyState ? cachedCloudyState.uiTheme : "blue";
    launchFullscreenAmbient(payload);
    if (callback) callback({ success: true });
  } else if (payload.action === "execute-tts" && payload.text) {
    if (isTopFrame && cachedCloudyState && cachedCloudyState.enabledTiles.includes("tts")) {
      window.speechSynthesis.cancel();
      let speechObject = new SpeechSynthesisUtterance(payload.text);
      window.speechSynthesis.speak(speechObject);
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