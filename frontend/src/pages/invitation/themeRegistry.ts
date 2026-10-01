import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ThemeId } from "../../lib/invitationThemes.js";
import type { InvitationThemeProps } from "./shared/types.js";

type ThemeComponent = LazyExoticComponent<ComponentType<InvitationThemeProps>>;

export const THEME_COMPONENTS: Record<ThemeId, ThemeComponent> = {
  "noir-calla": lazy(() =>
    import("./themes/NoirCallaTheme.js").then((m) => ({ default: m.NoirCallaTheme }))
  ),
  "chalk-and-vow": lazy(() =>
    import("./themes/ChalkAndVowTheme.js").then((m) => ({ default: m.ChalkAndVowTheme }))
  ),
  "nocturne-botanica": lazy(() =>
    import("./themes/NocturneBotanicaTheme.js").then((m) => ({ default: m.NocturneBotanicaTheme }))
  ),
};
