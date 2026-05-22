import { onMounted } from "vue";

type KeyDescriptor = string;
type KeyHandler = (e: KeyboardEvent) => void;

function normalizeDescriptor(descriptor: string) {
  return descriptor.toLowerCase();
}

function matchesDescriptor(e: KeyboardEvent, descriptor: string) {
  const parts = descriptor.toLowerCase().split("+").map(p => p.trim());

  const keyPart = parts[parts.length - 1];

  const requireShift = parts.includes("shift");
  const requireCtrl = parts.includes("ctrl") || parts.includes("control");
  const requireAlt = parts.includes("alt");
  const requireMeta
    = parts.includes("meta")
      || parts.includes("cmd")
      || parts.includes("command");

  const key = e.key.toLowerCase() === " " ? "space" : e.key.toLowerCase();
  const targetKey = keyPart === " " ? "space" : keyPart;

  const modifiersMatch = (
    requireShift === e.shiftKey
    || requireCtrl === e.ctrlKey
    || requireAlt === e.altKey
    || requireMeta === e.metaKey
  );

  if (!modifiersMatch)
    return false;

  return key === targetKey;
}

const handlers: Array<{
  descriptor: KeyDescriptor;
  handler: KeyHandler;
}> = [];

function keydownListener(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;

  if (["INPUT", "TEXTAREA"].includes(tag))
    return;

  for (const { descriptor, handler } of handlers) {
    if (matchesDescriptor(e, descriptor)) {
      handler(e);
    }
  }
}

let isListening = false;

function ensureListener() {
  if (isListening)
    return;
  window.addEventListener("keydown", keydownListener);
  isListening = true;
}

export function useKeyboard() {
  onMounted(() => {
    ensureListener();
  });

  function addGlobalShortcut(
    descriptor: KeyDescriptor | KeyDescriptor[],
    handler: KeyHandler,
  ) {
    const list = Array.isArray(descriptor) ? descriptor : [descriptor];

    for (const d of list) {
      const normalized = normalizeDescriptor(d);

      // prevent duplicates
      if (!handlers.some(h => h.descriptor === normalized)) {
        handlers.push({
          descriptor: normalized,
          handler,
        });
      }
    }
  }

  function createElementKeyHandler(
    callback: KeyHandler,
    keys: KeyDescriptor[] = ["enter", "space", "t"],
  ) {
    return (e: KeyboardEvent) => {
      for (const k of keys) {
        if (matchesDescriptor(e, k)) {
          e.preventDefault();
          callback(e);
          break;
        }
      }
    };
  }

  return {
    addGlobalShortcut,
    createElementKeyHandler,
    matchesDescriptor,
  };
}
