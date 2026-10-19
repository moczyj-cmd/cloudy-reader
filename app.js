/**
 * ==========================================================================
 * Cloudy Reader ☁️ Synchronized Engine & State Persistence Layer
 * ==========================================================================
 */

const DEFAULT_STATIC_SETS = {
  // Static Set 1: Streamline (Atkinson Next, Size 14, Green UI, Contrast ON)
  static1: {
    name: "Streamline",
    font: 3,
    size: 14,
    theme: 2,
    kinetic: false,
    contrast: true,
    tint: "off",
    tintIntensity: 0,
  },
  // Static Set 2: E-Reader (Literata, Size 17, Purple UI, Contrast ON)
  static2: {
    name: "E-Reader",
    font: 17,
    size: 17,
    theme: 3,
    kinetic: false,
    contrast: true,
    tint: "off",
    tintIntensity: 0,
  },
};

const DEFAULT_AUTOMATCH_SETS = {
  // Auto-Match 1: Studio Pro UI | Light: Paper (Ubuntu 12, Amber 17%) ⮀ Dark: Dark BG (IBM Plex Mono 12, Blackout 24%, Kinetic ON)
  autoMatch1: {
    theme: 1, // Studio Pro
    light: {
      name: "Paper",
      font: 4,
      size: 12,
      kinetic: false,
      contrast: true,
      tint: "amber",
      tintIntensity: 17,
    },
    dark: {
      name: "Dark BG",
      font: 15,
      size: 12,
      kinetic: true,
      contrast: true,
      tint: "blackout",
      tintIntensity: 24,
    },
  },
  // Auto-Match 2: Orange UI | Light: Scholar Day (Lora 17, Amber 12%) ⮀ Dark: Night Study (Atkinson Next 14, Blackout 18%)
  autoMatch2: {
    theme: 5, // Orange
    light: {
      name: "Scholar Day",
      font: 20,
      size: 17,
      kinetic: false,
      contrast: true,
      tint: "amber",
      tintIntensity: 12,
    },
    dark: {
      name: "Night Study",
      font: 3,
      size: 14,
      kinetic: false,
      contrast: true,
      tint: "blackout",
      tintIntensity: 18,
    },
  },
};

const THEME_ID_MAP = ["", "studio-pro", "green", "purple", "dark", "orange", "blue"];
const TINT_MODES = ["off", "red", "amber", "blackout"];
const MAX_NOTES_CHARS = 440;

const CloudyEngine = {
  state: {
    rosterVersion: 10,
    selectedTint: "red",
    shieldIntensity: 45,
    curatedThemeIndex: 0, // 0=Native, 1-20=Fonts, 21=Static1, 22=Static2, 23=AutoMatch1, 24=AutoMatch2
    fontSizeIndex: 0,
    sizeMatrix: [14, 17, 22],
    enabledTiles: [],
    uiTheme: "blue",
    previousUiTheme: "blue",
    adaptiveContrast: false,
    kineticFocus: false,
    userNotes: "",

    static1: JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static1)),
    static2: JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static2)),
    autoMatch1: JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch1)),
    autoMatch2: JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch2)),

    activeStaticSet: 1,
    activeVaultAutoMatch: 1,
    activeVaultAmSide: "light",
    activeDeckAutoMatch: 1,

    kitchenActiveSlots: [0, 1, 2, 3],
    kitchenWl: 480,
    kitchenTemp: 4600,
    kitchenRhythm: 12,
  },

  ambient: {
    view: "hub",
    greenMode: "cycle",
    greenStep: 1,
    blueMode: "rezzed",
    amberMode: "breathe",
  },

  uiThemesList: [
    { id: "blue", label: "BLUE" },
    { id: "studio-pro", label: "STUDIO PRO" },
    { id: "green", label: "GREEN" },
    { id: "purple", label: "PURPLE" },
    { id: "dark", label: "DARK" },
    { id: "orange", label: "ORANGE" },
  ],

  customFonts: [
    "Native UI",
    "Source Sans 3",
    "Noto Sans",
    "Atkinson Next",
    "Ubuntu Sans",
    "IBM Plex Sans",
    "Plus Jakarta Sans",
    "Andika",
    "Lexend",
    "OpenDyslexic",
    "Verdana",
    "Cascadia Mono",
    "Ubuntu Sans Mono",
    "Fira Code",
    "Source Code Pro",
    "IBM Plex Mono",
    "Source Serif 4",
    "Literata",
    "EB Garamond",
    "Palatino",
    "Lora",
  ],

  fontZones: [
    "System Default",
    "Power Suite",
    "Power Suite",
    "Power Suite",
    "Power Suite",
    "Power Suite",
    "Wellness Suite",
    "Wellness Suite",
    "Wellness Suite",
    "Wellness Suite",
    "Wellness Suite",
    "Tech Suite",
    "Tech Suite",
    "Tech Suite",
    "Tech Suite",
    "Tech Suite",
    "Scholar Suite",
    "Scholar Suite",
    "Scholar Suite",
    "Scholar Suite",
    "Scholar Suite",
  ],

  themeOrigins: [
    "Standard browser rendering with zero typographic overrides.",
    "Adobe's crown jewel and very first open-source typeface. Master typographer Paul D. Hunt stripped away a century of print clutter to forge pure digital crystal—so trusted for high-stakes clarity that the U.S. Government adopted it for official national portals.",
    "When computers hit an unrecognized character, they render dead white boxes engineers call 'tofu' (□). Google invested millions of dollars across a monumental 10-year global engineering mission—mapping over 800 languages and 100 scripts—to achieve 'No More Tofu' (No-to). You are looking at a multi-million-dollar marvel of human preservation.",
    "Engineered by the Braille Institute and named after founder J. Robert Atkinson, who lost his sight and reinvented Braille. Every hook, spur, and open loop is custom-sculpted so your brain never confuses a capital 'I', lowercase 'l', or '1'—turning effortless recognition into a daily superpower.",
    "Re-engineered for modern high-density displays by London's legendary Dalton Maag foundry. Notice the warm, curved human geometry and tailored horizontal tightness—it stops 'flashcard jumping' between words and makes standard system fonts feel cold and dated.",
    "After paying millions of dollars in corporate font licensing fees for over 50 years, IBM commissioned their own signature masterpiece from scratch and gifted it to the world. Built around 'Man vs. Machine,' look closely: warm, human curves on the outside, paired with razor-sharp machine cuts on the inside.",
    "Commissioned in 2020 by the Government of Jakarta and designed by Gumpita Rahayu at Tokotype foundry for the city's '+Jakarta' civic identity. Inspired by classic 1920s German geometric grotesques, its precision ink-traps and open apertures were engineered to unify a modern metropolis of 10 million people.",
    "Crafted by SIL International—the actual architects of the global Open Font License—specifically for foundational literacy. Every letter is stripped of visual ambiguity and spaced to breathe, letting tired eyes glide across the page with zero friction.",
    "Born from clinical research by educational therapist Dr. Bonnie Shaver-Troup and commissioned by Google. Built on a breakthrough discovery: most reading fatigue is actually caused by optical crowding. Lexend opens the visual channel to quiet eye stress on contact.",
    "Created by Abelardo Gonzalez using 'visual gravity.' Each letter is forged with a heavy, weighted baseline and unique asymmetry—acting like a physical anchor that stops characters from flipping, rotating, or swimming on the page.",
    "Hand-crafted pixel-by-pixel by legendary master Matthew Carter before smoothing a single curve. With massive lowercase height and generous spacing, it remains the official accessibility standard for Texas Health & Human Services.",
    "Microsoft's flagship terminal gem, forged specifically as the default voice of Visual Studio Code. Built for operators who stare at complex logic for 12 hours a day, keeping every bracket, number, and word unmistakably crisp.",
    "The crown jewel of the Linux terminal—and a secret weapon for reading small text. Every letter sits in its own generous, fixed-width chamber while keeping Ubuntu's warm human curves, letting your eyes lock onto whole words without jumping or straining.",
    "Born from Mozilla's collaboration with German design legend Erik Spiekermann and tuned by Nikita Prokopov. Originally engineered to make tiny mobile screens readable at a glance, it turns dense technical pages into a clean, high-velocity rhythm.",
    "Adobe's precision-engineered sibling to Source Sans. Every character shares the exact same horizontal footprint, turning chaotic log files, data tables, and technical documentation into laser-aligned columns.",
    "After paying millions in corporate font licensing fees for decades, IBM forged their own open-source family. Pairing classic computing heritage with razor-sharp modern cuts, this fixed-width gem makes any webpage read like a classified intelligence brief.",
    "Adobe's modern literary triumph by Frank Grießhammer. Unlike antique print fonts that turn spindly and weak on computer monitors, its sturdy, balanced strokes command the screen like fine ink on heavy cotton paper.",
    "Google Play Books' custom-commissioned flagship e-reader typeface. Legacy newspaper fonts were built in the 1930s to cram tiny ink onto cheap paper—Literata was engineered from scratch to eliminate pixel-shimmer on glowing glass screens.",
    "In 1500s Paris, master artisan Claude Garamont hand-carved these letterforms onto steel rods and struck them into pure copper molds to birth Renaissance publishing. Digitized directly from an original 1592 museum specimen, turning this on transforms your screen into a 400-year-old literary treasure.",
    "Crafted by master calligrapher Hermann Zapf and named after a 16th-century Italian penman. Revered as the gold standard for medical and academic journals, its wide, graceful openings refuse to blur even during marathon study sessions.",
    "Designed by typographer Olga Karpushina and debuted with Cyreal foundry in 2011. Drawing from traditional brushed calligraphy, its contrasting strokes and warm, sturdy serifs were specifically engineered to bring classic literary rhythm to modern glowing screens.",
  ],

  customThemes: [
    "Theme: Universal",
    "Theme: Studio Pro",
    "Theme: Green",
    "Theme: Purple",
    "Theme: Dark",
    "Theme: Orange",
    "Theme: Blue",
  ],

  nodes: {},
  originalDisclaimerText:
    "<strong>Cloudy Reader ☁️ Ergonomic Baseline</strong><br> This is a client-side environmental customization utility designed to optimize visual comfort and reduce screen friction. It is not a medical device and is not intended to diagnose, treat, cure, or prevent any clinical condition. <strong>By using this extension, you acknowledge and agree to these terms.</strong>",

  init() {
    this.cacheDOM();
    this.closeAllAccordions();
    this.bindEvents();
    this.hydrateSilo();
    this.updateDeckCustomButtons();
  },

  cacheDOM() {
    this.nodes.kineticFocusRow = document.getElementById("kineticFocusRow");
    this.nodes.adaptiveContrastRow = document.getElementById("adaptiveContrastRow");
    this.nodes.fontSizeControlRow = document.getElementById("fontSizeControlRow");
    this.nodes.kineticFocusBtn = document.getElementById("kineticFocusBtn");
    this.nodes.adaptiveContrastBtn = document.getElementById("adaptiveContrastBtn");
    this.nodes.fontModeCycleBtn = document.getElementById("fontModeCycleBtn");

    this.nodes.createCustomSetBtn = document.getElementById("createCustomSetBtn");

    this.nodes.accordionSections = document.querySelectorAll(".accordion-section");
    this.nodes.accordionHeaders = document.querySelectorAll(".accordion-header[data-acc-target]");
    this.nodes.lampQuickBtns = document.querySelectorAll(".lamp-quick-btn[data-lamp-Quick]");

    this.nodes.cloudyNotesArea = document.getElementById("cloudyNotesArea");
    this.nodes.notesCharCount = document.getElementById("notesCharCount");

    this.nodes.themePrev = document.getElementById("themePrev");
    this.nodes.themeNext = document.getElementById("themeNext");
    this.nodes.activeThemeDisplay = document.getElementById("activeThemeDisplay");

    this.nodes.customSetPrev = document.getElementById("customSetPrev");
    this.nodes.customSetNext = document.getElementById("customSetNext");
    this.nodes.customSetLabel = document.getElementById("customSetLabel");
    this.nodes.customSetBtn = document.getElementById("customSetBtn");
    this.nodes.cName = document.getElementById("c-name");
    this.nodes.cFont = document.getElementById("c-font");
    this.nodes.cSize = document.getElementById("c-size");
    this.nodes.cTheme = document.getElementById("c-theme");
    this.nodes.cKinetic = document.getElementById("c-kinetic");
    this.nodes.cContrast = document.getElementById("c-contrast");
    this.nodes.cTint = document.getElementById("c-tint");
    this.nodes.cTintSlider = document.getElementById("c-tint-slider");
    this.nodes.cTintVal = document.getElementById("c-tint-val");

    this.nodes.amVaultLabel = document.getElementById("amVaultLabel");
    this.nodes.amVaultPrev = document.getElementById("amVaultPrev");
    this.nodes.amVaultNext = document.getElementById("amVaultNext");
    this.nodes.amSideToggleBtn = document.getElementById("amSideToggleBtn");
    this.nodes.amName = document.getElementById("am-name");
    this.nodes.amResetBtn = document.getElementById("amResetBtn");
    this.nodes.amFont = document.getElementById("am-font");
    this.nodes.amSize = document.getElementById("am-size");
    this.nodes.amTheme = document.getElementById("am-theme");
    this.nodes.amKinetic = document.getElementById("am-kinetic");
    this.nodes.amContrast = document.getElementById("am-contrast");
    this.nodes.amTint = document.getElementById("am-tint");
    this.nodes.amTintGauge = document.getElementById("am-tint-gauge");
    this.nodes.amTintSlider = document.getElementById("am-tint-slider");
    this.nodes.amTintVal = document.getElementById("am-tint-val");

    this.nodes.deckStaticName1 = document.getElementById("deckStaticName1");
    this.nodes.deckStaticName2 = document.getElementById("deckStaticName2");
    this.nodes.deckAmSetLabel = document.getElementById("deckAmSetLabel");
    this.nodes.deckAmPrev = document.getElementById("deckAmPrev");
    this.nodes.deckAmNext = document.getElementById("deckAmNext");
    this.nodes.autoMatchDeckBtn = document.getElementById("autoMatchDeckBtn");
    this.nodes.amDeckLightName = document.getElementById("amDeckLightName");
    this.nodes.amDeckDarkName = document.getElementById("amDeckDarkName");

    this.nodes.html = document.documentElement;
    this.nodes.shieldSlider = document.getElementById("shield-slider");
    this.nodes.intensityDisplay = document.getElementById("intensityValue");
    this.nodes.folderTabs = document.querySelectorAll(".folder-tab");
    this.nodes.fontRosters = document.querySelectorAll(".font-roster");
    this.nodes.fontBtns = document.querySelectorAll(".font-btn");
    this.nodes.sensoryRows = document.querySelectorAll(".sensory-row[data-tile-id]");
    this.nodes.tintBtns = document.querySelectorAll(".tint-btn[data-tint]");
    this.nodes.hzReadout = document.getElementById("hzReadout");
    this.nodes.aboutMenuBtn = document.getElementById("aboutMenuBtn");

    this.nodes.ambientToggle = document.getElementById("ambientToggle");
    this.nodes.ambientOverlay = document.getElementById("ambientOverlay");
    this.nodes.btnAmbientBack = document.getElementById("btnAmbientBack");
    this.nodes.greenZone = document.getElementById("greenZone");
    this.nodes.blueZone = document.getElementById("blueZone");
    this.nodes.amberZone = document.getElementById("amberZone");
    this.nodes.kitchenZone = document.getElementById("kitchenZone");
    this.nodes.lampClickLayers = document.querySelectorAll(".lamp-click-layer");
    this.nodes.ambientExpandBtn = document.getElementById("ambientExpandBtn");
    this.nodes.ambientFullScreenBtn = document.getElementById("ambientFullScreenBtn");

    this.nodes.btnGreenCycle = document.getElementById("btnGreenCycle");
    this.nodes.btnGreenStatic = document.getElementById("btnGreenStatic");
    this.nodes.lblGreenCycle = document.getElementById("lblGreenCycle");
    this.nodes.lblGreenStatic = document.getElementById("lblGreenStatic");

    this.nodes.btnBlueCoffee = document.getElementById("btnBlueCoffee");
    this.nodes.btnBlueRezzed = document.getElementById("btnBlueRezzed");
    this.nodes.btnBlueCycle = document.getElementById("btnBlueCycle");

    this.nodes.btnAmberBreathe = document.getElementById("btnAmberBreathe");
    this.nodes.btnAmberStatic = document.getElementById("btnAmberStatic");
    this.nodes.btnAmberBlend = document.getElementById("btnAmberBlend");

    this.nodes.kitchenSlots = document.querySelectorAll(".kitchen-slot-btn");
    this.nodes.ksWavelength = document.getElementById("ksWavelength");
    this.nodes.ksColorTemp = document.getElementById("ksColorTemp");
    this.nodes.ksRhythm = document.getElementById("ksRhythm");
    this.nodes.ksWlBadge = document.getElementById("ksWlBadge");
    this.nodes.ksTempBadge = document.getElementById("ksTempBadge");
    this.nodes.ksRhythmBadge = document.getElementById("ksRhythmBadge");
    this.nodes.kReadoutWl = document.getElementById("kReadoutWl");
    this.nodes.kReadoutTemp = document.getElementById("kReadoutTemp");

    this.nodes.resetFontSizesBtn = document.getElementById("resetFontSizesBtn");
    this.nodes.fontDropdowns = document.querySelectorAll(".font-dropdown");
    this.nodes.masterPowerBtn = document.getElementById("masterPowerBtn");
  },

  closeAllAccordions() {
    this.nodes.accordionSections.forEach((sec) => {
      sec.classList.remove("open");
      const arr = sec.querySelector(".acc-arrow");
      if (arr) arr.textContent = "▸";
    });
  },

  toggleAccordion(targetId, forceOpen = false) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;
    const isCurrentlyOpen = targetSection.classList.contains("open");

    this.closeAllAccordions();

    if (forceOpen || !isCurrentlyOpen) {
      targetSection.classList.add("open");
      const arr = targetSection.querySelector(".acc-arrow");
      if (arr) arr.textContent = "▾";
    }
  },

  updateNotesCounter(textVal) {
    const cleanText = (textVal || "").substring(0, MAX_NOTES_CHARS);
    if (this.nodes.notesCharCount) {
      this.nodes.notesCharCount.textContent =
        String(cleanText.length) + " Characters / " + String(MAX_NOTES_CHARS) + " Characters";
    }
  },

  normalizeThemeId(themeId) {
    if (themeId === "emerald") return "green";
    if (themeId === "amethyst") return "purple";
    if (themeId === "papaya") return "orange";
    if (["blue", "studio-pro", "green", "purple", "dark", "orange"].includes(themeId)) return themeId;
    return "blue";
  },

  applyUIThemeToDOM(themeId) {
    const cleanId = this.normalizeThemeId(themeId);
    this.state.uiTheme = cleanId;
    document.documentElement.setAttribute("data-ui-theme", cleanId);
    const activeTheme = this.uiThemesList.find((t) => t.id === cleanId);
    if (this.nodes.activeThemeDisplay && activeTheme) {
      this.nodes.activeThemeDisplay.textContent = activeTheme.label;
    }
  },

  updateTypoControlRows() {
    if (this.nodes.kineticFocusRow) {
      this.nodes.kineticFocusRow.setAttribute(
        "data-state",
        this.state.kineticFocus ? "enabled" : "disabled"
      );
    }
    if (this.nodes.adaptiveContrastRow) {
      this.nodes.adaptiveContrastRow.setAttribute(
        "data-state",
        this.state.adaptiveContrast ? "enabled" : "disabled"
      );
    }
  },

  getSizeLabels() {
    const matrix = this.state.sizeMatrix || [14, 17, 22];
    return ["aA", String(matrix[0]), String(matrix[1]), String(matrix[2])];
  },

  setHUDText(htmlText, isAlert = false, scrollLore = false) {
    document.querySelectorAll(".disclaimer").forEach((container) => {
      const marquee = container.querySelector(".marquee-content");
      if (marquee) {
        marquee.innerHTML = htmlText;
        marquee.classList.remove("no-scroll", "scroll-lore");
        if (isAlert) {
          container.classList.add("active-tooltip");
          marquee.classList.add(scrollLore ? "scroll-lore" : "no-scroll");
        } else {
          container.classList.remove("active-tooltip");
        }
      }
    });
  },

  flashHUDAlert(htmlText) {
    this.setHUDText(htmlText, true, false);
    if (this.hudTimeout) clearTimeout(this.hudTimeout);
    this.hudTimeout = setTimeout(() => {
      this.setHUDText(this.originalDisclaimerText, false, false);
    }, 2200);
  },

  showFontLoreInHUD(fontIdx) {
    const idx = parseInt(fontIdx, 10) || 0;

    // Static Sets 1 & 2 (Indices 21 & 22)
    if (idx === 21 || idx === 22) {
      const setNum = idx - 20;
      const setData = this.state["static" + setNum] || {};
      const setName = setData.name && setData.name.trim() ? setData.name : "Set " + setNum;
      const fontLabel = this.customFonts[setData.font || 0] || "Native UI";
      const sizeLabel = setData.size > 0 ? "Size: " + setData.size : "Default Size";
      const tintVal = setData.tintIntensity || 0;
      const tintLabel =
        setData.tint && setData.tint !== "off" ? " | " + tintVal + "% " + setData.tint : "";
      const contrastLabel = setData.contrast ? " | Adaptive Contrast" : "";
      const kineticLabel = setData.kinetic ? " | Kinetic Focus" : "";
      const loreStr = fontLabel + " • " + sizeLabel + tintLabel + contrastLabel + kineticLabel;

      this.setHUDText(
        '<span class="hud-header">INFO: <span class="hud-font-name">Custom Set ' +
          setNum +
          ' — "' +
          setName +
          '"</span></span><span class="hud-lore">' +
          loreStr +
          "</span>",
        true,
        loreStr.length > 85
      );
      return;
    }

    // Auto-Match Sets 1 & 2 (Indices 23 & 24)
    if (idx === 23 || idx === 24) {
      const amNum = idx - 22;
      const amData = this.state["autoMatch" + amNum] || DEFAULT_AUTOMATCH_SETS["autoMatch" + amNum];
      const lightName = amData.light.name || "Light";
      const darkName = amData.dark.name || "Dark";
      const lightFont = this.customFonts[amData.light.font || 0] || "Native UI";
      const darkFont = this.customFonts[amData.dark.font || 0] || "Native UI";
      const lightSize = amData.light.size || "Default";
      const darkSize = amData.dark.size || "Default";
      const loreStr =
        "☼ Light BG: " +
        lightFont +
        " (" +
        lightSize +
        "px) • ☾ Dark BG: " +
        darkFont +
        " (" +
        darkSize +
        "px)";

      this.setHUDText(
        '<span class="hud-header">INFO: <span class="hud-font-name">Auto-Match ' +
          amNum +
          " (" +
          lightName +
          " ⮀ " +
          darkName +
          ')</span></span><span class="hud-lore">' +
          loreStr +
          "</span>",
        true,
        loreStr.length > 85
      );
      return;
    }

    const fontName = this.customFonts[idx] || "Native UI";
    const zoneName = this.fontZones[idx] || "Typography";
    const story = this.themeOrigins[idx] || this.themeOrigins[0];
    const shouldScroll = story.length > 85;

    this.setHUDText(
      '<span class="hud-header">INFO: <span class="hud-font-name">' +
        fontName +
        " (" +
        zoneName +
        ')</span></span><span class="hud-lore">' +
        story +
        "</span>",
      true,
      shouldScroll
    );
  },

  updateDeckCustomButtons() {
    if (this.nodes.deckStaticName1) {
      const s1Name =
        this.state.static1 && this.state.static1.name ? this.state.static1.name.trim() : "";
      this.nodes.deckStaticName1.textContent = s1Name || "Set 1";
    }
    if (this.nodes.deckStaticName2) {
      const s2Name =
        this.state.static2 && this.state.static2.name ? this.state.static2.name.trim() : "";
      this.nodes.deckStaticName2.textContent = s2Name || "Set 2";
    }

    const amNum = this.state.activeDeckAutoMatch || 1;
    const amData = this.state["autoMatch" + amNum] || DEFAULT_AUTOMATCH_SETS["autoMatch" + amNum];

    if (this.nodes.deckAmSetLabel) {
      this.nodes.deckAmSetLabel.textContent = "AUTO-MATCH " + amNum;
    }
    if (this.nodes.autoMatchDeckBtn) {
      this.nodes.autoMatchDeckBtn.setAttribute("data-font-idx", String(22 + amNum));
    }
    if (this.nodes.amDeckLightName && amData.light) {
      this.nodes.amDeckLightName.textContent =
        amData.light.name && amData.light.name.trim() ? amData.light.name.trim() : "Light";
    }
    if (this.nodes.amDeckDarkName && amData.dark) {
      this.nodes.amDeckDarkName.textContent =
        amData.dark.name && amData.dark.name.trim() ? amData.dark.name.trim() : "Dark";
    }

    this.highlightFontButtons(this.state.curatedThemeIndex || 0);
  },

  updateHzReadout(mode) {
    if (!this.nodes.hzReadout) return;
    const labels = ["OFF", "532HZ", "582HZ", "DUAL"];
    this.nodes.hzReadout.textContent = labels[mode] || "OFF";
  },

  updateAmbientUI() {
    this.nodes.ambientOverlay.setAttribute("data-view", this.ambient.view);
    this.nodes.greenZone.setAttribute("data-mode", this.ambient.greenMode);
    this.nodes.greenZone.setAttribute("data-step", this.ambient.greenStep);
    this.nodes.btnGreenCycle.classList.remove("active");
    this.nodes.btnGreenStatic.classList.remove("active");
    this.nodes.lblGreenCycle.textContent = "OFF";
    this.nodes.lblGreenStatic.textContent = "OFF";

    if (this.ambient.greenMode === "cycle") {
      this.nodes.btnGreenCycle.classList.add("active");
      const cycleMap = { 1: "525nm", 2: "545nm", 3: "BLEND", 4: "DUAL" };
      this.nodes.lblGreenCycle.textContent = cycleMap[this.ambient.greenStep];
    } else if (this.ambient.greenMode === "static") {
      this.nodes.btnGreenStatic.classList.add("active");
      const map = {
        1: "525 DIM",
        2: "525 MED",
        3: "525 MAX",
        4: "545 DIM",
        5: "545 MED",
        6: "545 MAX",
        7: "DUAL DIM",
        8: "DUAL MED",
        9: "DUAL MAX",
      };
      this.nodes.lblGreenStatic.innerHTML = map[this.ambient.greenStep].replace(" ", "<br>");
    }

    this.nodes.blueZone.setAttribute("data-mode", this.ambient.blueMode);
    [this.nodes.btnBlueCoffee, this.nodes.btnBlueRezzed, this.nodes.btnBlueCycle].forEach((b) =>
      b.classList.remove("active")
    );
    if (this.ambient.blueMode === "coffee") this.nodes.btnBlueCoffee.classList.add("active");
    if (this.ambient.blueMode === "rezzed") this.nodes.btnBlueRezzed.classList.add("active");
    if (this.ambient.blueMode === "cycle") this.nodes.btnBlueCycle.classList.add("active");

    this.nodes.amberZone.setAttribute("data-mode", this.ambient.amberMode);
    [this.nodes.btnAmberBreathe, this.nodes.btnAmberStatic, this.nodes.btnAmberBlend].forEach((b) =>
      b.classList.remove("active")
    );
    if (this.ambient.amberMode === "breathe") this.nodes.btnAmberBreathe.classList.add("active");
    if (this.ambient.amberMode === "static") this.nodes.btnAmberStatic.classList.add("active");
    if (this.ambient.amberMode === "blend") this.nodes.btnAmberBlend.classList.add("active");
  },

  populateFontAndSizeSelects(fontSelectEl, sizeSelectEl, selectedFont, selectedSize) {
    if (fontSelectEl) {
      fontSelectEl.innerHTML = "";
      this.customFonts.forEach((fontLabel, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = fontLabel;
        if (index === selectedFont) opt.selected = true;
        fontSelectEl.appendChild(opt);
      });
      fontSelectEl.classList.toggle("active", selectedFont > 0);
    }

    if (sizeSelectEl) {
      sizeSelectEl.innerHTML = '<option value="0">Size: Default</option>';
      for (let i = 8; i <= 30; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = "Size: " + i;
        if (i === selectedSize) opt.selected = true;
        sizeSelectEl.appendChild(opt);
      }
      sizeSelectEl.classList.toggle("active", selectedSize > 0);
    }
  },

  renderStaticSetVaultUI() {
    const setNum = this.state.activeStaticSet || 1;
    const setKey = "static" + setNum;
    const data = this.state[setKey] || DEFAULT_STATIC_SETS[setKey];

    if (this.nodes.customSetLabel) {
      this.nodes.customSetLabel.textContent = "CUSTOM SET " + setNum;
    }

    if (this.nodes.cName) {
      this.nodes.cName.value = data.name || "";
      this.nodes.cName.classList.toggle("has-label", !!(data.name && data.name.trim()));
    }

    this.populateFontAndSizeSelects(this.nodes.cFont, this.nodes.cSize, data.font || 0, data.size || 0);

    if (this.nodes.cTheme) {
      this.nodes.cTheme.textContent = this.customThemes[data.theme || 0] || this.customThemes[0];
      this.nodes.cTheme.classList.toggle("active", (data.theme || 0) > 0);
    }

    if (this.nodes.cKinetic) {
      this.nodes.cKinetic.classList.toggle("active", !!data.kinetic);
    }
    if (this.nodes.cContrast) {
      this.nodes.cContrast.classList.toggle("active", !!data.contrast);
    }
    if (this.nodes.cTint) {
      const tMode = data.tint || "off";
      this.nodes.cTint.textContent = "Tint: " + tMode.charAt(0).toUpperCase() + tMode.slice(1);
      this.nodes.cTint.classList.toggle("active", tMode !== "off");
    }
    if (this.nodes.cTintSlider && this.nodes.cTintVal) {
      const tInt = data.tintIntensity !== undefined ? data.tintIntensity : 0;
      this.nodes.cTintSlider.value = tInt;
      this.nodes.cTintVal.textContent = tInt + "%";
      const gaugeContainer = this.nodes.cTintSlider.closest(".custom-tint-gauge");
      if (gaugeContainer) {
        gaugeContainer.classList.toggle("active", (data.tint || "off") !== "off");
      }
    }
  },

  renderAutoMatchVaultUI() {
    const amNum = this.state.activeVaultAutoMatch || 1;
    const side = this.state.activeVaultAmSide || "light";
    const amPair = this.state["autoMatch" + amNum] || DEFAULT_AUTOMATCH_SETS["autoMatch" + amNum];
    const sideData = amPair[side] || amPair.light;

    if (this.nodes.amVaultLabel) {
      this.nodes.amVaultLabel.textContent = "AUTO-MATCH " + amNum;
    }

    if (this.nodes.amSideToggleBtn) {
      this.nodes.amSideToggleBtn.setAttribute("data-side", side);
      this.nodes.amSideToggleBtn.textContent = side === "light" ? "☼ LIGHT" : "☾ DARK";
    }

    if (this.nodes.amName) {
      this.nodes.amName.value = sideData.name || "";
      this.nodes.amName.classList.toggle("has-label", !!(sideData.name && sideData.name.trim()));
    }

    this.populateFontAndSizeSelects(this.nodes.amFont, this.nodes.amSize, sideData.font || 0, sideData.size || 0);

    if (this.nodes.amTheme) {
      const sharedTheme = amPair.theme || 0;
      this.nodes.amTheme.textContent = this.customThemes[sharedTheme] || this.customThemes[0];
      this.nodes.amTheme.classList.toggle("active", sharedTheme > 0);
    }

    if (this.nodes.amKinetic) {
      this.nodes.amKinetic.classList.toggle("active", !!sideData.kinetic);
    }
    if (this.nodes.amContrast) {
      this.nodes.amContrast.classList.toggle("active", !!sideData.contrast);
    }
    if (this.nodes.amTint) {
      const tMode = sideData.tint || "off";
      this.nodes.amTint.textContent = "Tint: " + tMode.charAt(0).toUpperCase() + tMode.slice(1);
      this.nodes.amTint.classList.toggle("active", tMode !== "off");
    }
    if (this.nodes.amTintSlider && this.nodes.amTintVal) {
      const tInt = sideData.tintIntensity !== undefined ? sideData.tintIntensity : 0;
      this.nodes.amTintSlider.value = tInt;
      this.nodes.amTintVal.textContent = tInt + "%";
      if (this.nodes.amTintGauge) {
        this.nodes.amTintGauge.classList.toggle("active", (sideData.tint || "off") !== "off");
      }
    }
  },

  highlightFontButtons(selectedIdx) {
    document.querySelectorAll(".font-btn").forEach((b) => {
      const idx = parseInt(b.getAttribute("data-font-idx"), 10);
      b.classList.toggle("active", idx === selectedIdx);
    });
  },

  syncMainDeckIndicatorsFromLoadout(loadoutData, themeIndex) {
    if (!loadoutData) return;

    if (themeIndex > 0) {
      this.applyUIThemeToDOM(THEME_ID_MAP[themeIndex]);
    } else {
      this.applyUIThemeToDOM(this.state.previousUiTheme || "blue");
    }

    if (loadoutData.contrast !== undefined) {
      this.state.adaptiveContrast = !!loadoutData.contrast;
    }

    if (loadoutData.kinetic !== undefined) {
      this.state.kineticFocus = !!loadoutData.kinetic;
    }

    this.updateTypoControlRows();

    if (loadoutData.tint && loadoutData.tint !== "off") {
      this.state.selectedTint = loadoutData.tint;
      this.state.shieldIntensity =
        loadoutData.tintIntensity !== undefined ? loadoutData.tintIntensity : 20;
      if (this.nodes.shieldSlider) {
        this.nodes.shieldSlider.value = this.state.shieldIntensity;
        this.nodes.intensityDisplay.textContent = this.state.shieldIntensity + "%";
      }
      this.nodes.tintBtns.forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-tint") === loadoutData.tint);
      });
    } else {
      this.state.selectedTint = "off";
      this.nodes.tintBtns.forEach((b) => {
        b.classList.remove("active");
      });
    }
  },

  syncAutoMatchReadoutWithActiveTab(amPair) {
    if (!amPair) return;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "queryTabTheme" }, (resp) => {
            if (chrome.runtime.lastError || !resp) {
              this.syncMainDeckIndicatorsFromLoadout(amPair.light, amPair.theme || 0);
              return;
            }
            const activeSide = resp.isDarkPage ? amPair.dark : amPair.light;
            this.syncMainDeckIndicatorsFromLoadout(activeSide, amPair.theme || 0);
          });
        } else {
          this.syncMainDeckIndicatorsFromLoadout(amPair.light, amPair.theme || 0);
        }
      });
    } else {
      this.syncMainDeckIndicatorsFromLoadout(amPair.light, amPair.theme || 0);
    }
  },

  activateCustomOrAutoMatch(selectedIdx) {
    this.state.curatedThemeIndex = selectedIdx;
    this.highlightFontButtons(selectedIdx);

    if (selectedIdx === 21 || selectedIdx === 22) {
      const setNum = selectedIdx - 20;
      const staticData = this.state["static" + setNum];
      if (staticData) {
        this.syncMainDeckIndicatorsFromLoadout(staticData, staticData.theme || 0);
      }
    } else if (selectedIdx === 23 || selectedIdx === 24) {
      const amNum = selectedIdx - 22;
      this.state.activeDeckAutoMatch = amNum;
      const amPair = this.state["autoMatch" + amNum];
      if (amPair) {
        this.syncAutoMatchReadoutWithActiveTab(amPair);
      }
    }

    this.lockDownSilo();
  },

  bindEvents() {
    // Single-Open Accordion Headers
    this.nodes.accordionHeaders.forEach((header) => {
      header.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetId = header.getAttribute("data-acc-target");
        if (targetId) {
          this.toggleAccordion(targetId);
        }
      });
    });

    // "+ Configure Sets" Button inside Custom Tab opens Customization Menu Accordion
    if (this.nodes.createCustomSetBtn) {
      this.nodes.createCustomSetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleAccordion("accCustomization", true);
      });
    }

    // Notes Scratchpad Live Counter & Persistence (440-Character Limit)
    if (this.nodes.cloudyNotesArea) {
      this.nodes.cloudyNotesArea.addEventListener("input", (e) => {
        const cleanVal = (e.target.value || "").substring(0, MAX_NOTES_CHARS);
        if (e.target.value !== cleanVal) {
          e.target.value = cleanVal;
        }
        this.state.userNotes = cleanVal;
        this.updateNotesCounter(cleanVal);
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ CloudyReader_ActiveManifest: this.state });
        }
      });
    }

    // Quick Lamp Launchers inside Atmosphere Lamp Accordion
    this.nodes.lampQuickBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetLamp = btn.getAttribute("data-lamp-Quick") || "hub";
        this.ambient.view = targetLamp;
        this.updateAmbientUI();
        this.nodes.ambientOverlay.classList.add("active");
      });
    });

    // Universal [data-tooltip] Hover Listener
    document.querySelectorAll("[data-tooltip]").forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        const rawTip = e.currentTarget.getAttribute("data-tooltip") || "";
        if (rawTip.includes(":")) {
          const parts = rawTip.split(":");
          const title = parts.shift().trim();
          const body = parts.join(":").trim();
          const shouldScroll = body.length > 85;
          this.setHUDText(
            '<span class="hud-header">INFO: <span class="hud-font-name">' +
              title +
              '</span></span><span class="hud-lore">' +
              body +
              "</span>",
            true,
            shouldScroll
          );
        } else {
          const shouldScroll = rawTip.length > 85;
          this.setHUDText(
            '<span class="hud-header">INFO: <span class="hud-font-name">System Control</span></span><span class="hud-lore">' +
              rawTip +
              "</span>",
            true,
            shouldScroll
          );
        }
      });
      el.addEventListener("mouseleave", () => {
        this.setHUDText(this.originalDisclaimerText, false, false);
      });
    });

    // Global UI Theme Cycling
    const cycleTheme = (direction) => {
      let currentIndex = this.uiThemesList.findIndex((t) => t.id === this.state.uiTheme);
      if (currentIndex === -1) currentIndex = 0;
      let nextIndex = (currentIndex + direction + this.uiThemesList.length) % this.uiThemesList.length;

      const nextThemeId = this.uiThemesList[nextIndex].id;
      this.state.previousUiTheme = nextThemeId;
      this.applyUIThemeToDOM(nextThemeId);
      this.lockDownSilo();
    };

    this.nodes.themePrev.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleTheme(-1);
    });
    this.nodes.themeNext.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleTheme(1);
    });

    // Custom Tab Auto-Match 1 / 2 Switcher Arrows
    const cycleDeckAutoMatch = () => {
      let current = this.state.activeDeckAutoMatch || 1;
      current = current === 1 ? 2 : 1;
      this.state.activeDeckAutoMatch = current;
      this.updateDeckCustomButtons();

      if (this.state.curatedThemeIndex === 23 || this.state.curatedThemeIndex === 24) {
        this.activateCustomOrAutoMatch(22 + current);
      } else {
        this.lockDownSilo();
      }
      this.showFontLoreInHUD(22 + current);
    };

    if (this.nodes.deckAmPrev) {
      this.nodes.deckAmPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        cycleDeckAutoMatch();
      });
    }
    if (this.nodes.deckAmNext) {
      this.nodes.deckAmNext.addEventListener("click", (e) => {
        e.stopPropagation();
        cycleDeckAutoMatch();
      });
    }

    // Customization Menu: Static Set (1 & 2) Events
    const cycleStaticVaultSet = () => {
      this.state.activeStaticSet = this.state.activeStaticSet === 1 ? 2 : 1;
      this.renderStaticSetVaultUI();
      this.lockDownSilo();
    };

    this.nodes.customSetPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleStaticVaultSet();
    });
    this.nodes.customSetNext.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleStaticVaultSet();
    });

    if (this.nodes.customSetBtn) {
      this.nodes.customSetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.static1 = JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static1));
        this.state.static2 = JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static2));
        this.renderStaticSetVaultUI();
        this.updateDeckCustomButtons();
        if (this.state.curatedThemeIndex === 21 || this.state.curatedThemeIndex === 22) {
          this.activateCustomOrAutoMatch(this.state.curatedThemeIndex);
        } else {
          this.lockDownSilo();
        }
        this.flashHUDAlert(
          '<span class="hud-header">INFO: <span class="hud-font-name">Static Sets Reset</span></span><span class="hud-lore">Static Sets 1 & 2 restored to factory Streamline and E-Reader defaults.</span>'
        );
      });
    }

    if (this.nodes.cName) {
      this.nodes.cName.addEventListener("input", (e) => {
        const setKey = "static" + (this.state.activeStaticSet || 1);
        this.state[setKey].name = e.target.value.substring(0, 20);
        this.nodes.cName.classList.toggle("has-label", !!(e.target.value && e.target.value.trim()));
        this.updateDeckCustomButtons();
        this.lockDownSilo();
      });
    }

    this.nodes.cFont.addEventListener("change", (e) => {
      const setKey = "static" + (this.state.activeStaticSet || 1);
      const selectedFontIdx = parseInt(e.target.value, 10);
      this.state[setKey].font = selectedFontIdx;
      this.nodes.cFont.classList.toggle("active", selectedFontIdx > 0);
      this.showFontLoreInHUD(20 + (this.state.activeStaticSet || 1));
      this.lockDownSilo();
    });

    this.nodes.cSize.addEventListener("change", (e) => {
      const setKey = "static" + (this.state.activeStaticSet || 1);
      this.state[setKey].size = parseInt(e.target.value, 10);
      this.nodes.cSize.classList.toggle("active", this.state[setKey].size > 0);
      this.lockDownSilo();
    });

    this.nodes.cTheme.addEventListener("click", () => {
      const setNum = this.state.activeStaticSet || 1;
      const setKey = "static" + setNum;
      this.state[setKey].theme = ((this.state[setKey].theme || 0) + 1) % this.customThemes.length;
      this.renderStaticSetVaultUI();

      if (this.state.curatedThemeIndex === 20 + setNum) {
        if (this.state[setKey].theme > 0) {
          this.applyUIThemeToDOM(THEME_ID_MAP[this.state[setKey].theme]);
        } else {
          this.applyUIThemeToDOM(this.state.previousUiTheme || "blue");
        }
      }
      this.lockDownSilo();
    });

    this.nodes.cKinetic.addEventListener("click", () => {
      const setKey = "static" + (this.state.activeStaticSet || 1);
      this.state[setKey].kinetic = !this.state[setKey].kinetic;
      this.renderStaticSetVaultUI();
      this.lockDownSilo();
    });

    this.nodes.cContrast.addEventListener("click", () => {
      const setKey = "static" + (this.state.activeStaticSet || 1);
      this.state[setKey].contrast = !this.state[setKey].contrast;
      this.renderStaticSetVaultUI();
      this.lockDownSilo();
    });

    this.nodes.cTint.addEventListener("click", () => {
      const setKey = "static" + (this.state.activeStaticSet || 1);
      let currentTint = this.state[setKey].tint || "off";
      let nextTint = TINT_MODES[(TINT_MODES.indexOf(currentTint) + 1) % TINT_MODES.length];
      this.state[setKey].tint = nextTint;
      if (nextTint !== "off" && !this.state[setKey].tintIntensity) {
        this.state[setKey].tintIntensity = 20;
      }
      this.renderStaticSetVaultUI();
      this.lockDownSilo();
    });

    this.nodes.cTintSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      this.nodes.cTintVal.textContent = val + "%";
      const setKey = "static" + (this.state.activeStaticSet || 1);
      this.state[setKey].tintIntensity = val;
      this.lockDownSilo();
    });

    // Customization Menu: Auto-Match (1 & 2) Events
    const cycleAutoMatchVaultSet = () => {
      this.state.activeVaultAutoMatch = this.state.activeVaultAutoMatch === 1 ? 2 : 1;
      this.renderAutoMatchVaultUI();
      this.lockDownSilo();
    };

    if (this.nodes.amVaultPrev) {
      this.nodes.amVaultPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        cycleAutoMatchVaultSet();
      });
    }
    if (this.nodes.amVaultNext) {
      this.nodes.amVaultNext.addEventListener("click", (e) => {
        e.stopPropagation();
        cycleAutoMatchVaultSet();
      });
    }

    if (this.nodes.amSideToggleBtn) {
      this.nodes.amSideToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.activeVaultAmSide = this.state.activeVaultAmSide === "light" ? "dark" : "light";
        this.renderAutoMatchVaultUI();
      });
    }

    if (this.nodes.amResetBtn) {
      this.nodes.amResetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.autoMatch1 = JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch1));
        this.state.autoMatch2 = JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch2));
        this.renderAutoMatchVaultUI();
        this.updateDeckCustomButtons();
        if (this.state.curatedThemeIndex === 23 || this.state.curatedThemeIndex === 24) {
          this.activateCustomOrAutoMatch(this.state.curatedThemeIndex);
        } else {
          this.lockDownSilo();
        }
        this.flashHUDAlert(
          '<span class="hud-header">INFO: <span class="hud-font-name">Auto-Match Sets Reset</span></span><span class="hud-lore">Auto-Match 1 & 2 restored to factory Light & Dark loadouts.</span>'
        );
      });
    }

    if (this.nodes.amName) {
      this.nodes.amName.addEventListener("input", (e) => {
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].name = e.target.value.substring(0, 20);
        this.nodes.amName.classList.toggle("has-label", !!(e.target.value && e.target.value.trim()));
        this.updateDeckCustomButtons();
        this.lockDownSilo();
      });
    }

    if (this.nodes.amFont) {
      this.nodes.amFont.addEventListener("change", (e) => {
        const amNum = this.state.activeVaultAutoMatch || 1;
        const amKey = "autoMatch" + amNum;
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].font = parseInt(e.target.value, 10);
        this.renderAutoMatchVaultUI();
        this.showFontLoreInHUD(22 + amNum);
        this.lockDownSilo();
      });
    }

    if (this.nodes.amSize) {
      this.nodes.amSize.addEventListener("change", (e) => {
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].size = parseInt(e.target.value, 10);
        this.renderAutoMatchVaultUI();
        this.lockDownSilo();
      });
    }

    if (this.nodes.amTheme) {
      this.nodes.amTheme.addEventListener("click", () => {
        const amNum = this.state.activeVaultAutoMatch || 1;
        const amKey = "autoMatch" + amNum;
        this.state[amKey].theme = ((this.state[amKey].theme || 0) + 1) % this.customThemes.length;
        this.renderAutoMatchVaultUI();

        if (this.state.curatedThemeIndex === 22 + amNum) {
          if (this.state[amKey].theme > 0) {
            this.applyUIThemeToDOM(THEME_ID_MAP[this.state[amKey].theme]);
          } else {
            this.applyUIThemeToDOM(this.state.previousUiTheme || "blue");
          }
        }
        this.lockDownSilo();
      });
    }

    if (this.nodes.amKinetic) {
      this.nodes.amKinetic.addEventListener("click", () => {
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].kinetic = !this.state[amKey][side].kinetic;
        this.renderAutoMatchVaultUI();
        this.lockDownSilo();
      });
    }

    if (this.nodes.amContrast) {
      this.nodes.amContrast.addEventListener("click", () => {
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].contrast = !this.state[amKey][side].contrast;
        this.renderAutoMatchVaultUI();
        this.lockDownSilo();
      });
    }

    if (this.nodes.amTint) {
      this.nodes.amTint.addEventListener("click", () => {
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        let currentTint = this.state[amKey][side].tint || "off";
        let nextTint = TINT_MODES[(TINT_MODES.indexOf(currentTint) + 1) % TINT_MODES.length];
        this.state[amKey][side].tint = nextTint;
        if (nextTint !== "off" && !this.state[amKey][side].tintIntensity) {
          this.state[amKey][side].tintIntensity = 20;
        }
        this.renderAutoMatchVaultUI();
        this.lockDownSilo();
      });
    }

    if (this.nodes.amTintSlider) {
      this.nodes.amTintSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.nodes.amTintVal.textContent = val + "%";
        const amKey = "autoMatch" + (this.state.activeVaultAutoMatch || 1);
        const side = this.state.activeVaultAmSide || "light";
        this.state[amKey][side].tintIntensity = val;
        this.lockDownSilo();
      });
    }

    // Right-Column Typography Controls
    if (this.nodes.kineticFocusRow) {
      this.nodes.kineticFocusRow.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.kineticFocus = !this.state.kineticFocus;
        this.updateTypoControlRows();
        this.lockDownSilo();
      });
    }

    if (this.nodes.adaptiveContrastRow) {
      this.nodes.adaptiveContrastRow.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.adaptiveContrast = !this.state.adaptiveContrast;
        this.updateTypoControlRows();
        this.lockDownSilo();
      });
    }

    const cycleFontSize = (e) => {
      e.stopPropagation();
      const labels = this.getSizeLabels();
      let nextIndex = ((this.state.fontSizeIndex || 0) + 1) % labels.length;
      this.state.fontSizeIndex = nextIndex;
      if (this.nodes.fontModeCycleBtn) {
        this.nodes.fontModeCycleBtn.textContent = labels[nextIndex];
        this.nodes.fontModeCycleBtn.classList.toggle("active-mode", nextIndex !== 0);
      }
      this.lockDownSilo();
    };

    if (this.nodes.fontSizeControlRow) {
      this.nodes.fontSizeControlRow.addEventListener("click", cycleFontSize);
    }

    // Master Power Reset
    this.nodes.masterPowerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove(["CloudyReader_ActiveManifest"], () => {
          this.flashHUDAlert(
            '<span class="hud-header">INFO: <span class="hud-font-name">Master System Reset</span></span><span class="hud-lore">All sensory modifications cleared. Reloading native view...</span>'
          );
          setTimeout(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]) chrome.tabs.reload(tabs[0].id);
            });
            window.close();
          }, 1200);
        });
      }
    });

    // Atmosphere Lamp Hub Events
    this.nodes.ambientToggle.addEventListener("click", () => {
      this.ambient.view = "hub";
      this.updateAmbientUI();
      this.nodes.ambientOverlay.classList.add("active");
    });

    this.nodes.btnAmbientBack.addEventListener("click", () => {
      this.nodes.html.style.width = "560px";
      document.body.style.width = "560px";
      document.documentElement.classList.remove("expanded-lamp");
      document.body.classList.remove("expanded-lamp");
      this.nodes.ambientOverlay.classList.remove("active");
      if (document.querySelector(".glt-close-text")) {
        document.querySelector(".glt-close-text").textContent = "Click screen to return to Hub";
      }
    });

    document.querySelectorAll(".hub-enter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.closest("#greenZone")) this.ambient.view = "green";
        else if (e.target.closest("#blueZone")) this.ambient.view = "blue";
        else if (e.target.closest("#amberZone")) this.ambient.view = "amber";
        else if (e.target.closest("#kitchenZone")) this.ambient.view = "kitchen";
        this.updateAmbientUI();
      });
    });

    this.nodes.greenZone.addEventListener("click", () => {
      if (this.ambient.view === "hub") {
        this.ambient.view = "green";
        this.updateAmbientUI();
      }
    });
    this.nodes.blueZone.addEventListener("click", () => {
      if (this.ambient.view === "hub") {
        this.ambient.view = "blue";
        this.updateAmbientUI();
      }
    });
    this.nodes.amberZone.addEventListener("click", () => {
      if (this.ambient.view === "hub") {
        this.ambient.view = "amber";
        this.updateAmbientUI();
      }
    });

    this.nodes.lampClickLayers.forEach((layer) => {
      layer.addEventListener("click", (e) => {
        e.stopPropagation();
        if (document.documentElement.classList.contains("expanded-lamp")) {
          document.documentElement.classList.remove("expanded-lamp");
          document.body.classList.remove("expanded-lamp");
          this.nodes.html.style.width = "560px";
          document.body.style.width = "560px";
          if (document.querySelector(".glt-close-text")) {
            document.querySelector(".glt-close-text").textContent = "Click screen to return to Hub";
          }
        } else {
          this.ambient.view = "hub";
          this.updateAmbientUI();
        }
      });
    });

    [
      this.nodes.btnGreenCycle,
      this.nodes.btnGreenStatic,
      this.nodes.btnBlueCoffee,
      this.nodes.btnBlueRezzed,
      this.nodes.btnBlueCycle,
      this.nodes.btnAmberBreathe,
      this.nodes.btnAmberStatic,
      this.nodes.btnAmberBlend,
      this.nodes.ambientExpandBtn,
      this.nodes.ambientFullScreenBtn,
    ].forEach((el) => {
      if (el) el.addEventListener("click", (e) => e.stopPropagation());
    });

    this.nodes.ambientExpandBtn.addEventListener("click", () => {
      document.documentElement.classList.add("expanded-lamp");
      document.body.classList.add("expanded-lamp");
      this.nodes.html.style.width = "760px";
      document.body.style.width = "760px";
      if (document.querySelector(".glt-close-text")) {
        document.querySelector(".glt-close-text").textContent = "Click screen to return to normal view";
      }
    });

    this.nodes.ambientFullScreenBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          const url = tabs[0].url || "";
          if (
            url.startsWith("chrome://") ||
            url.startsWith("edge://") ||
            url.startsWith("about:") ||
            url.includes("chrome.google.com/webstore") ||
            url.includes("chromewebstore.google.com")
          ) {
            alert(
              "Cloudy Reader: Browser security policies do not allow extensions to run on internal browser pages or the Web Store. Please use Full Screen on any standard website!"
            );
            return;
          }
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "launch-fullscreen-ambient",
              lamp: this.ambient.view,
              greenMode: this.ambient.greenMode,
              greenStep: this.ambient.greenStep,
              blueMode: this.ambient.blueMode,
              amberMode: this.ambient.amberMode,
              kitchenWl: this.state.kitchenWl,
              kitchenTemp: this.state.kitchenTemp,
              kitchenRhythm: this.state.kitchenRhythm,
              uiTheme: this.state.uiTheme,
            },
            () => {
              if (chrome.runtime.lastError) {
                alert("Cloudy Reader: Please refresh this tab (F5) once so Cloudy Reader can connect to it!");
              } else {
                window.close();
              }
            }
          );
        }
      });
    });

    this.nodes.btnGreenCycle.addEventListener("click", () => {
      if (this.ambient.greenMode === "cycle") this.ambient.greenStep = (this.ambient.greenStep % 4) + 1;
      else {
        this.ambient.greenMode = "cycle";
        this.ambient.greenStep = 1;
      }
      this.updateAmbientUI();
    });
    this.nodes.btnGreenStatic.addEventListener("click", () => {
      if (this.ambient.greenMode === "static") this.ambient.greenStep = (this.ambient.greenStep % 9) + 1;
      else {
        this.ambient.greenMode = "static";
        this.ambient.greenStep = 1;
      }
      this.updateAmbientUI();
    });
    this.nodes.btnBlueCoffee.addEventListener("click", () => {
      this.ambient.blueMode = "coffee";
      this.updateAmbientUI();
    });
    this.nodes.btnBlueRezzed.addEventListener("click", () => {
      this.ambient.blueMode = "rezzed";
      this.updateAmbientUI();
    });
    this.nodes.btnBlueCycle.addEventListener("click", () => {
      this.ambient.blueMode = "cycle";
      this.updateAmbientUI();
    });
    this.nodes.btnAmberBreathe.addEventListener("click", () => {
      this.ambient.amberMode = "breathe";
      this.updateAmbientUI();
    });
    this.nodes.btnAmberStatic.addEventListener("click", () => {
      this.ambient.amberMode = "static";
      this.updateAmbientUI();
    });
    this.nodes.btnAmberBlend.addEventListener("click", () => {
      this.ambient.amberMode = "blend";
      this.updateAmbientUI();
    });

    this.nodes.ksWavelength.addEventListener("input", (e) => {
      this.state.kitchenWl = parseInt(e.target.value, 10);
      this.nodes.ksWlBadge.textContent = e.target.value;
      this.nodes.kReadoutWl.textContent = e.target.value + " nm";
      this.lockDownSilo();
    });
    this.nodes.ksColorTemp.addEventListener("input", (e) => {
      this.state.kitchenTemp = parseInt(e.target.value, 10);
      this.nodes.ksTempBadge.textContent = e.target.value;
      this.nodes.kReadoutTemp.textContent = e.target.value + " K";
      this.lockDownSilo();
    });
    this.nodes.ksRhythm.addEventListener("input", (e) => {
      this.state.kitchenRhythm = parseInt(e.target.value, 10);
      this.nodes.ksRhythmBadge.textContent = e.target.value;
      this.lockDownSilo();
    });

    this.nodes.kitchenSlots.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const slotIdx = parseInt(e.target.getAttribute("data-slot"), 10);
        if (btn.classList.contains("empty")) {
          btn.classList.remove("empty");
          btn.classList.add("active");
          btn.textContent = this.state.kitchenWl + "nm";
          if (!this.state.kitchenActiveSlots.includes(slotIdx)) this.state.kitchenActiveSlots.push(slotIdx);
        } else {
          btn.classList.remove("active");
          btn.classList.add("empty");
          btn.textContent = "+";
          this.state.kitchenActiveSlots = this.state.kitchenActiveSlots.filter((s) => s !== slotIdx);
        }
        this.lockDownSilo();
      });
    });

    // Typography Suite Folder Tabs Routing
    this.nodes.folderTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.nodes.folderTabs.forEach((t) => t.classList.remove("active"));
        this.nodes.fontRosters.forEach((r) => {
          r.classList.remove("active");
          r.classList.add("hidden");
        });

        const targetTab = e.currentTarget;
        targetTab.classList.add("active");

        const category = targetTab.getAttribute("data-category");
        const targetRoster = document.getElementById("roster-" + category);
        if (targetRoster) {
          targetRoster.classList.remove("hidden");
          setTimeout(() => targetRoster.classList.add("active"), 10);
        }
      });
    });

    // Font & Custom/Auto-Match Buttons inside Typography Suite
    this.nodes.fontBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const prevIdx = this.state.curatedThemeIndex || 0;
        const selectedIdx = parseInt(e.currentTarget.getAttribute("data-font-idx"), 10);

        if (selectedIdx >= 21 && selectedIdx <= 24) {
          this.activateCustomOrAutoMatch(selectedIdx);
        } else {
          this.state.curatedThemeIndex = selectedIdx;
          this.highlightFontButtons(selectedIdx);
          if (prevIdx >= 21 || selectedIdx === 0) {
            this.state.fontSizeIndex = 0;
            if (this.nodes.fontModeCycleBtn) {
              this.nodes.fontModeCycleBtn.textContent = "aA";
              this.nodes.fontModeCycleBtn.classList.remove("active-mode");
            }
            this.applyUIThemeToDOM(this.state.previousUiTheme || "blue");
          }
          this.lockDownSilo();
        }
      });

      btn.addEventListener("mouseenter", (e) => {
        const hoverIdx = parseInt(e.currentTarget.getAttribute("data-font-idx"), 10);
        this.showFontLoreInHUD(hoverIdx);
      });

      btn.addEventListener("mouseleave", () => {
        this.setHUDText(this.originalDisclaimerText, false, false);
      });
    });

    // Screen Tinting Controls
    this.nodes.shieldSlider.addEventListener("input", (e) => {
      this.state.shieldIntensity = parseInt(e.target.value, 10);
      this.nodes.intensityDisplay.textContent = this.state.shieldIntensity + "%";
      this.lockDownSilo();
    });

    this.nodes.tintBtns.forEach((btn) => {
      if (btn.classList.contains("theme-btn") || btn.classList.contains("override-btn")) return;
      btn.addEventListener("click", (e) => {
        const clickedTint = e.currentTarget.getAttribute("data-tint");
        if (this.state.selectedTint === clickedTint && e.currentTarget.classList.contains("active")) {
          e.currentTarget.classList.remove("active");
          this.state.selectedTint = "off";
        } else {
          this.nodes.tintBtns.forEach((b) => {
            if (!b.classList.contains("theme-btn") && !b.classList.contains("override-btn")) {
              b.classList.remove("active");
            }
          });
          e.currentTarget.classList.add("active");
          this.state.selectedTint = clickedTint;
        }
        this.lockDownSilo();
      });
    });

    // Right-Column Sensory Control Rows
    this.nodes.sensoryRows.forEach((row) => {
      row.addEventListener("click", (e) => {
        const tileId = row.getAttribute("data-tile-id");
        if (!tileId) return;
        if (tileId === "solfeggio-freq") {
          let currentState = parseInt(row.getAttribute("data-audio-state"), 10) || 0;
          let nextState = (currentState + 1) % 4;
          row.setAttribute("data-audio-state", nextState);
          this.updateHzReadout(nextState);
          this.state.enabledTiles = this.state.enabledTiles.filter((id) => !id.startsWith("solfeggio-freq"));
          if (nextState > 0) this.state.enabledTiles.push("solfeggio-freq-" + nextState);
        } else {
          const currentState = row.getAttribute("data-state");
          if (currentState === "disabled") {
            row.setAttribute("data-state", "enabled");
            if (!this.state.enabledTiles.includes(tileId)) this.state.enabledTiles.push(tileId);
          } else {
            row.setAttribute("data-state", "disabled");
            this.state.enabledTiles = this.state.enabledTiles.filter((id) => id !== tileId);
          }
        }
        this.lockDownSilo();
      });
    });

    // Font Size Matrix Dropdowns & Reset
    if (this.nodes.fontDropdowns && this.nodes.fontDropdowns.length > 0) {
      this.nodes.fontDropdowns.forEach((drop, idx) => {
        const currentValue = (this.state.sizeMatrix && this.state.sizeMatrix[idx]) || drop.value;
        drop.innerHTML = "";
        for (let i = 8; i <= 30; i++) {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = String(i);
          if (i == currentValue) opt.selected = true;
          drop.appendChild(opt);
        }

        drop.addEventListener("change", (e) => {
          if (!this.state.sizeMatrix) this.state.sizeMatrix = [14, 17, 22];
          this.state.sizeMatrix[idx] = parseInt(e.target.value, 10);
          const labels = this.getSizeLabels();
          if (this.state.fontSizeIndex > 0 && this.nodes.fontModeCycleBtn) {
            this.nodes.fontModeCycleBtn.textContent = labels[this.state.fontSizeIndex];
          }
          this.lockDownSilo();
        });
      });

      this.nodes.resetFontSizesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.sizeMatrix = [14, 17, 22];
        this.nodes.fontDropdowns[0].value = "14";
        this.nodes.fontDropdowns[1].value = "17";
        this.nodes.fontDropdowns[2].value = "22";
        const labels = this.getSizeLabels();
        if (this.state.fontSizeIndex > 0 && this.nodes.fontModeCycleBtn) {
          this.nodes.fontModeCycleBtn.textContent = labels[this.state.fontSizeIndex];
        }
        this.lockDownSilo();
        this.flashHUDAlert(
          '<span class="hud-header">INFO: <span class="hud-font-name">Size Matrix Reset</span></span><span class="hud-lore">Base sizes restored to 14, 17, and 22.</span>'
        );
      });
    }
  },

  lockDownSilo() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      if (chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
          if (activeTabs && activeTabs[0] && activeTabs[0].id) {
            chrome.tabs.sendMessage(
              activeTabs[0].id,
              { action: "applyState", state: this.state },
              () => {
                void chrome.runtime.lastError;
              }
            );
          }
        });
      }
      chrome.storage.local.set({ CloudyReader_ActiveManifest: this.state }, () => {
        if (chrome.tabs) {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab && tab.id && !tab.active) {
                chrome.tabs.sendMessage(tab.id, { action: "applyState", state: this.state }, () => {
                  void chrome.runtime.lastError;
                });
              }
            });
          });
        }
      });
    }
  },

  hydrateSilo() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["CloudyReader_ActiveManifest"], (result) => {
        this.closeAllAccordions();

        if (!result.CloudyReader_ActiveManifest) {
          this.applyUIThemeToDOM("blue");
          this.renderStaticSetVaultUI();
          this.renderAutoMatchVaultUI();
          this.updateDeckCustomButtons();
          this.updateTypoControlRows();
          this.updateNotesCounter("");
          return;
        }

        const saved = result.CloudyReader_ActiveManifest;
        this.state = Object.assign(this.state, saved);

        if (!saved.rosterVersion || saved.rosterVersion < 9) {
          this.state.rosterVersion = 10;
          this.state.uiTheme = "blue";
          this.state.previousUiTheme = "blue";
          this.state.static1 = JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static1));
          this.state.static2 = JSON.parse(JSON.stringify(DEFAULT_STATIC_SETS.static2));
          this.state.autoMatch1 = JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch1));
          this.state.autoMatch2 = JSON.parse(JSON.stringify(DEFAULT_AUTOMATCH_SETS.autoMatch2));
        }

        this.state.previousUiTheme = this.normalizeThemeId(
          this.state.previousUiTheme || this.state.uiTheme || "blue"
        );

        let loadedIndex = this.state.curatedThemeIndex || 0;
        if (loadedIndex > 24) loadedIndex = 23;
        this.state.curatedThemeIndex = loadedIndex;

        if (loadedIndex === 21 || loadedIndex === 22) {
          const stData = this.state["static" + (loadedIndex - 20)];
          if (stData && stData.theme > 0) {
            this.state.uiTheme = THEME_ID_MAP[stData.theme] || "blue";
          }
        } else if (loadedIndex === 23 || loadedIndex === 24) {
          const amNum = loadedIndex - 22;
          this.state.activeDeckAutoMatch = amNum;
          const amData = this.state["autoMatch" + amNum];
          if (amData && amData.theme > 0) {
            this.state.uiTheme = THEME_ID_MAP[amData.theme] || "blue";
          }
          if (amData) {
            this.syncAutoMatchReadoutWithActiveTab(amData);
          }
        } else {
          this.state.uiTheme = this.normalizeThemeId(this.state.uiTheme);
        }

        this.applyUIThemeToDOM(this.state.uiTheme);

        // Hydrate Notes Scratchpad
        const savedNotes = (this.state.userNotes || "").substring(0, MAX_NOTES_CHARS);
        this.state.userNotes = savedNotes;
        if (this.nodes.cloudyNotesArea) {
          this.nodes.cloudyNotesArea.value = savedNotes;
        }
        this.updateNotesCounter(savedNotes);

        chrome.storage.local.set({ CloudyReader_ActiveManifest: this.state });

        this.nodes.shieldSlider.value = this.state.shieldIntensity;
        this.nodes.intensityDisplay.textContent = this.state.shieldIntensity + "%";

        this.renderStaticSetVaultUI();
        this.renderAutoMatchVaultUI();
        this.updateDeckCustomButtons();

        if (loadedIndex > 0) {
          let targetCategory = null;
          if (loadedIndex >= 21 && loadedIndex <= 24) {
            targetCategory = "custom";
          } else {
            const activeBtn = document.querySelector('.font-btn[data-font-idx="' + loadedIndex + '"]');
            if (activeBtn) {
              const parentRoster = activeBtn.closest(".font-roster");
              if (parentRoster) targetCategory = parentRoster.id.replace("roster-", "");
            }
          }
          if (targetCategory) {
            this.nodes.folderTabs.forEach((t) => t.classList.remove("active"));
            this.nodes.fontRosters.forEach((r) => {
              r.classList.remove("active");
              r.classList.add("hidden");
            });
            const targetTab = document.querySelector('.folder-tab[data-category="' + targetCategory + '"]');
            const targetRoster = document.getElementById("roster-" + targetCategory);
            if (targetTab) targetTab.classList.add("active");
            if (targetRoster) {
              targetRoster.classList.remove("hidden");
              targetRoster.classList.add("active");
            }
          }
        }

        this.state.sizeMatrix = this.state.sizeMatrix || [14, 17, 22];
        if (this.nodes.fontDropdowns && this.nodes.fontDropdowns.length === 3) {
          this.nodes.fontDropdowns[0].value = String(this.state.sizeMatrix[0]);
          this.nodes.fontDropdowns[1].value = String(this.state.sizeMatrix[1]);
          this.nodes.fontDropdowns[2].value = String(this.state.sizeMatrix[2]);
        }

        this.state.fontSizeIndex = this.state.fontSizeIndex || 0;
        const sizeLabels = this.getSizeLabels();
        if (this.nodes.fontModeCycleBtn) {
          this.nodes.fontModeCycleBtn.textContent = sizeLabels[this.state.fontSizeIndex] || "aA";
          this.nodes.fontModeCycleBtn.classList.toggle("active-mode", this.state.fontSizeIndex !== 0);
        }

        this.state.adaptiveContrast = this.state.adaptiveContrast || false;
        this.state.kineticFocus = this.state.kineticFocus || false;
        this.updateTypoControlRows();

        this.nodes.tintBtns.forEach((btn) => {
          if (btn.classList.contains("theme-btn") || btn.classList.contains("override-btn")) return;
          btn.classList.toggle("active", btn.getAttribute("data-tint") === this.state.selectedTint);
        });

        this.nodes.sensoryRows.forEach((row) => {
          const id = row.getAttribute("data-tile-id");
          if (id === "solfeggio-freq") {
            const activeAudioState = this.state.enabledTiles.find((t) => t.startsWith("solfeggio-freq-"));
            if (activeAudioState) {
              const mode = parseInt(activeAudioState.split("-")[2], 10);
              row.setAttribute("data-audio-state", mode);
              this.updateHzReadout(mode);
            } else {
              row.setAttribute("data-audio-state", "0");
              this.updateHzReadout(0);
            }
          } else {
            row.setAttribute("data-state", this.state.enabledTiles.includes(id) ? "enabled" : "disabled");
          }
        });
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  CloudyEngine.init();
});