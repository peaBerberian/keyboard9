const DEFAULT_ENABLE_HINTS = true;
const DEFAULT_TOUCH_MODE = "block";
export const defaultStyle = {
  fontSize: "18px",
  fontFamily: "mono, monospace",
  keyboardBackgroundColor: "transparent",
  blockBackgroundColor: "#ffffff",
  blockTextColor: "#000000",
  blockSize: 100,
  blockBorderSize: 3,
  blockBorderColor: "#000000",
  blockBorderRadius: 5,
  blockPadding: 5,
  blockMargin: 5,
  innerLettersMargin: 9,
  hintFontSize: "0.8em",
  hintBackgroundColor: "#868686",
  hintTextColor: "#ffffff",
};

const MAIN_KEYS = [
  [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ],
  [
    ["0", "a", "b"],
    ["c", "d", "e"],
    ["f", "g", "h"],
  ],
  [
    ["i", "j", "k"],
    ["l", "m", "n"],
    ["o", "p", "q"],
  ],
  [
    ["r", "s", "t"],
    ["u", "v", "w"],
    ["x", "y", "z"],
  ],
];

const ALT_KEYS = [
  [
    ["!", "@", "#"],
    ["$", "%", "^"],
    ["&", "*", "~"],
  ],
  [
    ["`", "ù", "é"],
    ["è", "=", "à"],
    [";", "ë", "ç"],
  ],
  [
    ["|", "\\", ","],
    ["<", ".", ">"],
    ["/", "?", ":"],
  ],
  [
    ["[", '"', "]"],
    ["(", "'", ")"],
    ["-", "_", "+"],
  ],
];

const DIRECTION_KEY_MAP: Array<Array<[string, number]>> = [
  [
    ["1", 49],
    ["Up", 38],
    ["2", 50],
  ],
  [
    ["Left", 37],
    ["Enter", 13],
    ["Right", 39],
  ],
  [
    ["3", 51],
    ["Down", 40],
    ["4", 52],
  ],
];

const NUMPAD_KEY_MAP: Array<Array<[string, number]>> = [
  [
    ["NUMPAD 7", 103],
    ["NUMPAD 8", 104],
    ["NUMPAD 9", 105],
  ],
  [
    ["NUMPAD 4", 100],
    ["NUMPAD 5", 101],
    ["NUMPAD 6", 102],
  ],
  [
    ["NUMPAD 1", 97],
    ["NUMPAD 2", 98],
    ["NUMPAD 3", 99],
  ],
];

const QWERTY_KEY_MAP: Array<Array<[string, number]>> = [
  [
    ["Q", 81],
    ["W", 87],
    ["E", 69],
  ],
  [
    ["A", 65],
    ["S", 83],
    ["D", 68],
  ],
  [
    ["Z", 90],
    ["X", 88],
    ["C", 67],
  ],
];

export default function createKeyboard(
  parentElement: HTMLElement,
  params: {
    keyMap?: [string, number][][] | "numpad" | "qwerty" | "direction";
    useDefaultInput?: boolean;
    onUpdate?: (text: string) => void;
    onDone: (text: string) => void;
    enableHints?: boolean;
    touchMode?: "disabled" | "character" | "block";
    style?: {
      fontSize?: string;
      fontFamily?: string;
      keyboardBackgroundColor?: string;
      blockBackgroundColor?: string;
      blockTextColor?: string;
      blockSize?: number;
      blockBorderSize?: number;
      blockBorderColor?: string;
      blockBorderRadius?: number;
      blockPadding?: number;
      blockMargin?: number;
      innerLettersMargin?: number;
      hintFontSize?: string;
      hintBackgroundColor?: string;
      hintTextColor?: string;
    };
    initialText?: string;
  },
): () => void {
  const enableHints = params.enableHints ?? DEFAULT_ENABLE_HINTS;
  const touchMode = params.touchMode ?? DEFAULT_TOUCH_MODE;
  const fontSize = params.style?.fontSize ?? defaultStyle.fontSize;
  const fontFamily = params.style?.fontFamily ?? defaultStyle.fontFamily;
  const keyboardBackgroundColor =
    params.style?.keyboardBackgroundColor ??
    defaultStyle.keyboardBackgroundColor;
  const blockBackgroundColor =
    params.style?.blockBackgroundColor ?? defaultStyle.blockBackgroundColor;
  const blockTextColor =
    params.style?.blockTextColor ?? defaultStyle.blockTextColor;
  const blockSize = params.style?.blockSize ?? defaultStyle.blockSize;
  const blockBorderSize =
    params.style?.blockBorderSize ?? defaultStyle.blockBorderSize;
  const blockBorderColor =
    params.style?.blockBorderColor ?? defaultStyle.blockBorderColor;
  const blockBorderRadius =
    params.style?.blockBorderRadius ?? defaultStyle.blockBorderRadius;
  const blockPadding = params.style?.blockPadding ?? defaultStyle.blockPadding;
  const blockMargin = params.style?.blockMargin ?? defaultStyle.blockMargin;
  const innerLettersMargin =
    params.style?.innerLettersMargin ?? defaultStyle.innerLettersMargin;
  const hintFontSize = params.style?.hintFontSize ?? defaultStyle.hintFontSize;
  const hintBackgroundColor =
    params.style?.hintBackgroundColor ?? defaultStyle.hintBackgroundColor;
  const hintTextColor =
    params.style?.hintTextColor ?? defaultStyle.hintTextColor;

  const keyboardSize =
    3 * (blockSize + 2 * blockPadding + 2 * blockBorderSize + 2 * blockMargin) +
    2;
  const updateCallbacks: Array<(text: string) => void> = [];
  if (params.onUpdate !== undefined) {
    updateCallbacks.push(params.onUpdate);
  }
  const keyboardContainerElt = document.createElement("div");
  parentElement.appendChild(keyboardContainerElt);

  let text = params.initialText ?? "";
  let currentLetters: string[][] | null = null;
  let isUpper = false;
  let isSpecials = false;
  let inputElt: HTMLInputElement | undefined;

  if (params.useDefaultInput === true) {
    createDefaultInputElement();
  }

  let keyMap: [string, number][][];
  if (params.keyMap === "numpad") {
    keyMap = NUMPAD_KEY_MAP;
  } else if (params.keyMap === "qwerty") {
    keyMap = QWERTY_KEY_MAP;
  } else if (params.keyMap === "direction") {
    keyMap = DIRECTION_KEY_MAP;
  } else if (Array.isArray(params.keyMap)) {
    keyMap = params.keyMap;
  } else {
    keyMap = NUMPAD_KEY_MAP;
  }

  const keyboardElt = document.createElement("div");
  keyboardElt.style.backgroundColor = keyboardBackgroundColor;
  keyboardElt.style.color = blockTextColor;

  displayMainKeyboard();

  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.removeEventListener("keydown", onKeyDown);
    keyboardContainerElt.parentElement?.removeChild(keyboardContainerElt);
    inputElt?.parentElement?.removeChild(inputElt);
  };

  function createDefaultInputElement(): void {
    let cursorInterval: number | null = null;
    let hasCursor = false;
    inputElt = document.createElement("input");
    inputElt.onfocus = updateInputEltStatus;
    inputElt.onblur = updateInputEltStatus;
    inputElt.oninput = () => {
      if (inputElt !== undefined) {
        text = inputElt.value;
      }
    };
    inputElt.type = "text";
    inputElt.style.width = keyboardSize - 5 * 4 + "px";
    inputElt.style.margin = "5px";

    updateCallbacks.push(updateInputEltStatus);
    parentElement.appendChild(inputElt);

    updateInputEltStatus();
    function updateInputEltStatus() {
      if (cursorInterval !== null) {
        clearInterval(cursorInterval);
      }
      if (
        text.length === 0 ||
        inputElt === undefined ||
        document.activeElement === inputElt
      ) {
        if (inputElt !== undefined) {
          inputElt.value = text;
        }
        return;
      }
      inputElt.value = text + "|";
      hasCursor = true;
      cursorInterval = setInterval(() => {
        if (inputElt === undefined) {
          return;
        }
        if (!hasCursor) {
          inputElt.value = text + "|";
          hasCursor = true;
        } else {
          inputElt.value = text;
          hasCursor = false;
        }
      }, 500);
    }
  }
  function eraseLastChar() {
    if (text.length > 0) {
      text = text.substring(0, text.length - 1);
      return true;
    }
    return false;
  }
  function addCharToText(char: string) {
    text += isUpper ? char.toUpperCase() : char;
  }
  function getKeyDirection(
    keyCode: number,
  ):
    | "UpperLeft"
    | "Up"
    | "UpperRight"
    | "Left"
    | "Center"
    | "Right"
    | "BottomLeft"
    | "Bottom"
    | "BottomRight"
    | null {
    switch (keyCode) {
      case keyMap[0][0][1]:
        return "UpperLeft";
      case keyMap[0][1][1]:
        return "Up";
      case keyMap[0][2][1]:
        return "UpperRight";
      case keyMap[1][0][1]:
        return "Left";
      case keyMap[1][1][1]:
        return "Center";
      case keyMap[1][2][1]:
        return "Right";
      case keyMap[2][0][1]:
        return "BottomLeft";
      case keyMap[2][1][1]:
        return "Bottom";
      case keyMap[2][2][1]:
        return "BottomRight";
    }
    return null;
  }
  function onKeyDown(evt: KeyboardEvent): void {
    // console.warn("KEYCODE,", evt.keyCode);
    const { keyCode } = evt;
    let hasUpdated = false;

    const direction = getKeyDirection(keyCode);
    switch (direction) {
      case "UpperLeft":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[0][0]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            hasUpdated = eraseLastChar();
          }
        }
        break;
      case "Up":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[0][1]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            const keyGroup = isSpecials ? ALT_KEYS : MAIN_KEYS;
            currentLetters = keyGroup[0];
            displayLettersSelectionFor(keyGroup[0]);
          }
        }
        break;
      case "UpperRight":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[0][2]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            addCharToText(" ");
            hasUpdated = true;
          }
        }
        break;
      case "Left":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[1][0]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            const keyGroup = isSpecials ? ALT_KEYS : MAIN_KEYS;
            currentLetters = keyGroup[1];
            displayLettersSelectionFor(keyGroup[1]);
          }
        }
        break;
      case "Center":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[1][1]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            params.onDone(text);
          }
        }
        break;
      case "Right":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[1][2]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            const keyGroup = isSpecials ? ALT_KEYS : MAIN_KEYS;
            currentLetters = keyGroup[2];
            displayLettersSelectionFor(keyGroup[2]);
          }
        }
        break;
      case "BottomLeft":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[2][0]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            isUpper = !isUpper;
            displayMainKeyboard();
          }
        }
        break;
      case "Bottom":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[2][1]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            const keyGroup = isSpecials ? ALT_KEYS : MAIN_KEYS;
            currentLetters = keyGroup[3];
            displayLettersSelectionFor(keyGroup[3]);
          }
        }
        break;
      case "BottomRight":
        {
          if (currentLetters !== null) {
            addCharToText(currentLetters[2][2]);
            hasUpdated = true;
            currentLetters = null;
            displayMainKeyboard();
          } else {
            isSpecials = !isSpecials;
            displayMainKeyboard();
          }
        }
        break;
    }
    if (hasUpdated) {
      onTextUpdate();
    }
  }

  function onTextUpdate() {
    updateCallbacks.forEach((cb) => cb(text));
  }
  function displayMainKeyboard(): void {
    keyboardElt.innerHTML = "";
    const keyGroup = isSpecials ? ALT_KEYS : MAIN_KEYS;

    // Upper Left
    const eraseElt = createBlockElt("Erase\nLast\nChar.");
    if (touchMode !== "disabled") {
      eraseElt.style.cursor = "pointer";
      eraseElt.onclick = () => {
        if (eraseLastChar()) {
          onTextUpdate();
        }
      };
    }
    keyboardElt.appendChild(eraseElt);

    // Up
    keyboardElt.appendChild(generateKeyBlockElt(keyGroup[0]));

    // Upper Right
    const spaceElt = createBlockElt("Space");
    if (touchMode !== "disabled") {
      spaceElt.style.cursor = "pointer";
      spaceElt.onclick = () => {
        addCharToText(" ");
        onTextUpdate();
      };
    }
    keyboardElt.appendChild(spaceElt);

    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[0][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[0][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[0][2][0]));
    }

    // Left
    keyboardElt.appendChild(generateKeyBlockElt(keyGroup[1]));

    // Center
    const doneElt = createBlockElt("Done");
    if (touchMode !== "disabled") {
      doneElt.style.cursor = "pointer";
      doneElt.onclick = () => {
        params.onDone(text);
      };
    }
    keyboardElt.appendChild(doneElt);

    // Right
    keyboardElt.appendChild(generateKeyBlockElt(keyGroup[2]));

    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[1][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[1][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[1][2][0]));
    }

    // Bottom Left
    const switchElt = createBlockElt(
      "Switch\n" + (isUpper ? "Lower" : "Upper") + "\nCase",
    );
    if (touchMode !== "disabled") {
      switchElt.style.cursor = "pointer";
      switchElt.onclick = () => {
        isUpper = !isUpper;
        displayMainKeyboard();
      };
    }
    keyboardElt.appendChild(switchElt);

    // Bottom
    keyboardElt.appendChild(generateKeyBlockElt(keyGroup[3]));

    // Bottom Right
    const specialsElt = createBlockElt(
      isSpecials ? "Display\nLetters\nNumbers" : "Display\nSpecial\nChar.",
    );
    if (touchMode !== "disabled") {
      specialsElt.style.cursor = "pointer";
      specialsElt.onclick = () => {
        isSpecials = !isSpecials;
        displayMainKeyboard();
      };
    }
    keyboardElt.appendChild(specialsElt);

    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[2][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[2][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[2][2][0]));
    }

    keyboardElt.className = "keyboard-grid";
    keyboardElt.style.display = "grid";
    keyboardElt.style.gridTemplateColumns = "repeat(3, 0fr)";
    keyboardElt.style.fontFamily = fontFamily;
    keyboardElt.style.width = keyboardSize + "px";
    keyboardElt.style.fontSize = fontSize;
    keyboardContainerElt.appendChild(keyboardElt);
  }

  function createHintElement(hint: string): HTMLElement {
    const elt = document.createElement("div");
    elt.className = "keyboard-hint";
    elt.textContent = hint;
    elt.style.color = hintTextColor;
    elt.style.backgroundColor = hintBackgroundColor;
    elt.style.fontSize = hintFontSize;
    elt.style.textAlign = "center";
    elt.style.marginTop = "-" + blockMargin + "px";
    elt.style.width = blockSize + "px";
    elt.style.marginLeft = String(blockMargin + blockBorderSize) + "px";
    elt.style.marginRight = String(blockMargin + blockBorderSize) + "px";
    elt.style.padding = "0px " + blockPadding + "px";
    elt.style.display = "grid";
    elt.style.alignItems = "center";
    return elt;
  }

  function displayLettersSelectionFor(letters: string[][]): void {
    keyboardElt.innerHTML = "";
    keyboardElt.appendChild(createKeyElement(letters[0][0]));
    keyboardElt.appendChild(createKeyElement(letters[0][1]));
    keyboardElt.appendChild(createKeyElement(letters[0][2]));
    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[0][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[0][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[0][2][0]));
    }
    keyboardElt.appendChild(createKeyElement(letters[1][0]));
    keyboardElt.appendChild(createKeyElement(letters[1][1]));
    keyboardElt.appendChild(createKeyElement(letters[1][2]));
    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[1][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[1][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[1][2][0]));
    }
    keyboardElt.appendChild(createKeyElement(letters[2][0]));
    keyboardElt.appendChild(createKeyElement(letters[2][1]));
    keyboardElt.appendChild(createKeyElement(letters[2][2]));
    if (enableHints) {
      keyboardElt.appendChild(createHintElement(keyMap[2][0][0]));
      keyboardElt.appendChild(createHintElement(keyMap[2][1][0]));
      keyboardElt.appendChild(createHintElement(keyMap[2][2][0]));
    }
    keyboardElt.className = "letters-grid";
    keyboardElt.style.display = "grid";
    keyboardElt.style.gridTemplateColumns = "repeat(3, 0fr)";
    keyboardElt.style.fontFamily = fontFamily;
    keyboardElt.style.width = keyboardSize + "px";
    keyboardElt.style.fontSize = fontSize;
    keyboardContainerElt.appendChild(keyboardElt);
  }

  function createKeyElement(letter: string): HTMLElement {
    const elt = document.createElement("div");
    const textContent = isUpper ? letter.toUpperCase() : letter;
    elt.textContent = textContent;
    if (touchMode !== "disabled") {
      elt.style.cursor = "pointer";
      elt.onclick = () => {
        addCharToText(textContent);
        currentLetters = null;
        displayMainKeyboard();
        onTextUpdate();
      };
    }
    applyBlockStyle(elt);
    elt.style.lineHeight = blockSize + "px";
    return elt;
  }

  function applyBlockStyle(elt: HTMLElement): void {
    elt.style.textAlign = "center";
    elt.style.padding = blockPadding + "px";
    elt.style.margin = blockMargin + "px";
    elt.style.border = blockBorderSize + "px solid " + blockBorderColor;
    elt.style.borderRadius = blockBorderRadius + "px";
    elt.style.backgroundColor = blockBackgroundColor;
    elt.style.color = blockTextColor;
    elt.style.height = blockSize + "px";
    elt.style.width = blockSize + "px";
    elt.style.display = "grid";
    elt.style.alignItems = "center";
  }

  function createBlockElt(text?: string): HTMLElement {
    const elt = document.createElement("div");
    if (text !== undefined) {
      elt.textContent = text;
    }
    elt.className = "key-separator";
    applyBlockStyle(elt);
    return elt;
  }

  function generateKeyBlockElt(stringSrc: string[][]): HTMLElement {
    if (stringSrc.length !== 3) {
      throw new Error("Invalid keyboard block length");
    }

    const blockElt = document.createElement("div");
    blockElt.className = "key-block";
    for (let lineNb = 0; lineNb < stringSrc.length; lineNb++) {
      const lineDivElt = document.createElement("div");
      lineDivElt.className = "key-line";
      const line = stringSrc[lineNb];
      for (let letterIndex = 0; letterIndex < line.length; letterIndex++) {
        const letter = line[letterIndex];
        const letterSpan = document.createElement("span");
        const textContent = isUpper ? letter.toUpperCase() : letter;
        letterSpan.textContent = textContent;
        letterSpan.className = "key-letter";
        letterSpan.style.textAlign = "center";
        letterSpan.style.margin = innerLettersMargin + "px";
        if (touchMode === "character") {
          letterSpan.style.cursor = "pointer";
          letterSpan.onclick = () => {
            addCharToText(textContent);
            currentLetters = null;
            displayMainKeyboard();
            onTextUpdate();
          };
        }
        lineDivElt.appendChild(letterSpan);
      }
      blockElt.appendChild(lineDivElt);
    }
    if (touchMode === "block") {
      blockElt.style.cursor = "pointer";
      blockElt.onclick = () => {
        currentLetters = stringSrc;
        displayLettersSelectionFor(stringSrc);
      };
    }
    applyBlockStyle(blockElt);
    return blockElt;
  }
}
