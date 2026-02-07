/**
 * Server configuration flags.
 *
 * Two independent concerns:
 *   SERVER_AUTH  – Enable/disable authentication (default: enabled)
 *   SERVER_UI    – Which UI assets to serve (default: "client-dist")
 *
 * Dev-only overrides:
 *   Both flags are only respected when NODE_ENV !== "production".
 *   In production the safe defaults are enforced:
 *     - auth is always enabled
 *     - UI is always "client-dist"
 */

const {
  NODE_ENV,
  SERVER_AUTH,
  SERVER_UI
} = process.env;

const isProduction = NODE_ENV === "production";

// --- Authentication -----------------------------------------------------------
// Default: enabled. Can only be disabled in development.
export const authEnabled: boolean = isProduction
  ? true
  : SERVER_AUTH !== "false";

// --- UI serving mode ----------------------------------------------------------
export const UI_MODES = {
  /** Serve pre-built Vite client bundles from dist/ (production default) */
  ClientDist: "client-dist",
  /** Serve static HTML pages from the server's pages/ folder */
  ServerPages: "server-pages",
  /** Don't serve any UI — API endpoints only */
  None: "none",
} as const;

export type UiMode = typeof UI_MODES[keyof typeof UI_MODES];

function resolveUiMode (): UiMode {
  if (isProduction) return UI_MODES.ClientDist;

  switch (SERVER_UI) {
    case "server-pages": return UI_MODES.ServerPages;
    case "none":         return UI_MODES.None;
    case "client-dist":  return UI_MODES.ClientDist;
    default:             return UI_MODES.ClientDist;
  }
}

export const uiMode: UiMode = resolveUiMode();

/** Whether the server should serve UI assets */
export const uiEnabled: boolean = uiMode !== UI_MODES.None;

// --- Logging ------------------------------------------------------------------
console.log(`Configuration: authEnabled  ${authEnabled}`);
console.log(`Configuration: uiMode       ${uiMode}`);
if (!isProduction && (!authEnabled || !uiEnabled)) {
  console.log("⚠️  Dev-only overrides active — these settings are ignored in production.");
}
