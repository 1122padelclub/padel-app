"use client"

export function ThemeVars({ theme }: { theme: any }) {
  if (!theme || !theme.colors) {
    return null
  }

  const c = theme.colors
  return (
    <style jsx global>{`
      :root{
        --mt-bg:${c.background || "#0b234a"}; --mt-surface:${c.surface || "rgba(0,0,0,0.35)"}; --mt-text:${c.text || "#e5e7eb"};
        --mt-primary:${c.primary || "#0d1b2a"}; --mt-secondary:${c.secondary || "#1f2937"}; --mt-menu-text:${c.menuText || "#ffffff"};
        --mt-success:${c.success || "#22c55e"}; --mt-danger:${c.danger || "#ef4444"};
        --mt-radius:${theme.menuCustomization?.borderRadius ?? 12}px;

        /* tokens shadcn/ui */
        --background: var(--mt-bg);
        --foreground: var(--mt-text);
        --card: var(--mt-surface);
        --card-foreground: var(--mt-text);
        --popover: var(--mt-surface);
        --popover-foreground: var(--mt-text);
        --primary: var(--mt-primary);
        --primary-foreground: var(--mt-menu-text);
        --secondary: var(--mt-secondary);
        --secondary-foreground: var(--mt-menu-text);
        --muted: var(--mt-surface);
        --muted-foreground: var(--mt-text);
        --accent: var(--mt-secondary);
        --accent-foreground: var(--mt-menu-text);
        --destructive: var(--mt-danger);
        --destructive-foreground: var(--mt-menu-text);
        --border: var(--mt-secondary);
        --ring: var(--mt-primary);
      }

      /* overrides suaves para utilidades legacy usadas en /mesa */
      .text-white{ color:var(--mt-menu-text)!important; }
      .bg-slate-800,.bg-gray-900,.bg-gray-800{ background-color:var(--mt-surface)!important; }
      .border-slate-700,.border-gray-700{ border-color:var(--mt-secondary)!important; }
      .bg-cyan-500,.bg-blue-600,.bg-green-600{ background-color:var(--mt-primary)!important; }
      .from-slate-900{ --tw-gradient-from:var(--mt-primary)!important; }
      .to-slate-800{ --tw-gradient-to:var(--mt-bg)!important; }
    `}</style>
  )
}
