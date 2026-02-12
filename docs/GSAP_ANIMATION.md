# GSAP Animation Guide — Trisula Project

> **Audience**: AI Agents (Flash/Small models), developers.
> **Purpose**: Prevent common GSAP + React pitfalls in this project. Read this before modifying any animation code.

---

## Stack Overview

| Library | Version | Usage |
|---------|---------|-------|
| `gsap` | ^3.12 | Core animation engine |
| `@gsap/react` | ^2 | `useGSAP` hook for context-scoped cleanup |
| `lenis` | ^1.1 | Smooth scrolling (Landing page only) |

**Key file locations:**

```
apps/web/src/components/
├── atoms/
│   └── AnimatedCounter.tsx    ← Numerical count-up (ref-based DOM)
├── molecules/
│   └── DailyCheckIn.tsx       ← GSAP hover effects
└── organisms/
    ├── GoldCardOverview.tsx    ← Infinite shimmer loop
    ├── DailyCheckInModal.tsx   ← Firework particle system
    ├── HeroSection.tsx         ← Entry timeline
    └── NasabahActivityTable.tsx
```

Dashboard page: `apps/web/app/dashboard/nasabah/page.tsx` — Master GSAP timeline.

---

## Rule 1: Never Let React Control GSAP-Animated Content

When GSAP animates DOM content (text, styles), React must NOT own that same content.

### ❌ BAD — React children + GSAP textContent

```tsx
// GSAP writes to textContent
spanRef.current.textContent = "150";

// But React re-renders and overwrites it:
return <span ref={spanRef}>{displayValue}</span>;
//                          ^^^ React controls this!
```

**What happens**: Any React re-render (parent state change, context update, sibling data load) resets the span back to `{displayValue}`, causing the animation to "jump."

### ✅ GOOD — Empty element, GSAP owns all content

```tsx
// GSAP is the sole writer:
spanRef.current.textContent = format(obj.val);

// React renders an EMPTY span:
return <span ref={spanRef} className={className} />;
//                         ^^^ No children = React won't touch textContent
```

### ✅ ALSO GOOD — useGSAP for CSS-only animations

When GSAP only animates CSS properties (not text content), `useGSAP` + normal JSX is fine:

```tsx
useGSAP(() => {
    gsap.to(cardRef.current, {
        boxShadow: "0 0 60px rgba(212,175,55,0.15)",
        yoyo: true, repeat: -1, ease: "sine.inOut",
    });
}, { scope: cardRef, dependencies: [isLoading] });

return <div ref={cardRef}>Children are safe here</div>;
```

---

## Rule 2: React Strict Mode Double-Mount

Next.js development mode enables React Strict Mode, which **mounts → unmounts → remounts** every component. This is invisible to the user but devastating for animations.

### ❌ BAD — Setting final state in cleanup

```tsx
useEffect(() => {
    gsap.to(obj, { val: 150, duration: 2 });
    previousValue.current = 150; // ← Set immediately

    return () => {
        tween.kill();
        previousValue.current = 150; // ← ALSO set in cleanup!
    };
}, [value]);
```

**What happens**:
1. Mount #1: Animation starts 0 → 150
2. Strict Mode cleanup: `previousValue = 150`, tween killed
3. Mount #2 (visible one): start=150, end=150 → **no animation!**

### ✅ GOOD — Only set final state in `onComplete`

```tsx
useEffect(() => {
    const obj = { val: startValue };

    tweenRef.current = gsap.to(obj, {
        val: endValue,
        duration: 2.5,
        onComplete: () => {
            animatedTo.current = endValue; // ✅ Only after animation finishes
        }
    });

    return () => {
        tweenRef.current?.kill();  // ✅ Just cleanup, no state mutation
        tweenRef.current = null;
    };
}, [value]);
```

---

## Rule 3: `useGSAP` vs `useEffect` — When to Use Which

| Scenario | Use | Why |
|----------|-----|-----|
| CSS animations (transform, opacity, boxShadow) | `useGSAP` | Auto-cleanup of GSAP context is helpful |
| Infinite loops (shimmer, pulse) | `useGSAP` | Context-scoped, auto-killed on unmount |
| Timeline orchestration (page entry) | `useGSAP` | Manages complex sequences cleanly |
| Text/content animation (counters) | `useEffect` | Need manual control over tween lifecycle to survive Strict Mode |
| Animations needing `setState` in callbacks | `useEffect` | `useGSAP` can conflict with React state updates |

### Important: `useGSAP` Context Cleanup

`useGSAP` creates a GSAP context that auto-kills ALL tweens inside it when:
- Dependencies change
- Component unmounts
- Strict Mode does its double-mount

This is **great** for fire-and-forget CSS animations but **problematic** for animations that need to track their own completion state (like counters).

---

## Rule 4: Don't Use `useState` for Frame-by-Frame Updates

### ❌ BAD — setState in animation loop

```tsx
const [display, setDisplay] = useState(0);

gsap.to(obj, {
    onUpdate: () => setDisplay(obj.val) // 60 calls/sec = 60 re-renders/sec
});

return <span>{Math.round(display)}</span>;
```

**Problems**: Excessive re-renders, potential GSAP context conflicts, performance degradation.

### ✅ GOOD — Direct DOM update via ref

```tsx
const spanRef = useRef<HTMLSpanElement>(null);

gsap.to(obj, {
    onUpdate: () => {
        spanRef.current!.textContent = String(Math.round(obj.val));
    }
});

return <span ref={spanRef} />;
```

---

## Rule 5: Coordinating Multiple Animations

The Nasabah dashboard orchestrates multiple GSAP animations. They must be coordinated to avoid visual chaos.

### Current Timeline (page.tsx)

```
0.0s  ──── Navbar slides down (0.6s)
0.4s  ──── Gold Card scales up (0.8s, back.out ease)
1.0s  ──── Activity Table fades up (0.7s)
1.5s  ──── Dev Tools fade in (1s)
```

**AnimatedCounter** within the Gold Card uses a `delay: 0.5s` so the count-up starts AFTER the card is visually present.

### Rule: Always use `delay` to sync child animations with parent entrances

```tsx
// Parent: card appears at ~0.4s, fully visible by ~1.2s
// Child counter should start AFTER the parent is visible:
gsap.to(obj, {
    delay: 0.5, // Start counting after card entrance
    duration: 2.5,
});
```

---

## Reference: AnimatedCounter Architecture

This is the project's most complex animation component. Here's the final working pattern:

```
                    Mount (value=0)
                         │
                    useEffect fires
                         │
              endValue=0, startValue=0
                         │
              Display "0", return early
                         │
                   ── Data loads ──
                         │
                    value changes to 150
                         │
                    useEffect re-fires
                         │
              startValue=0 (animatedTo is null)
              endValue=150
                         │
            ┌─────── Animation ───────┐
            │ obj: 0 → 150 over 2.5s  │
            │ delay: 0.5s             │
            │ textContent updated     │
            │ via ref (no setState)   │
            └─────────────────────────┘
                         │
                    onComplete
                         │
              animatedTo.current = 150
                         │
                   ── User claims ──
                         │
                    value changes to 160
                         │
              startValue=150 (from animatedTo)
              endValue=160
                         │
            ┌─────── Animation ───────┐
            │ obj: 150 → 160 over 1s  │
            │ delay: 0 (instant)      │
            └─────────────────────────┘
```

### Key Design Decisions

1. **`animatedTo` ref (not `previousValue`)**: Only set in `onComplete`, never in cleanup. Survives Strict Mode.
2. **Empty `<span />`**: No React children = React can't overwrite GSAP's textContent.
3. **`useEffect` (not `useGSAP`)**: Manual tween lifecycle control needed for counter logic.
4. **Two-speed animation**: First entrance is slow (2.5s + delay) for dramatic effect; subsequent updates are fast (1s, no delay).

---

## Checklist for AI Agents

Before modifying any GSAP animation in this project:

- [ ] Am I animating **text content** or **CSS properties**?
  - Text → use `useEffect` + ref + empty span
  - CSS → use `useGSAP`
- [ ] Does my cleanup function mutate any state/ref beyond killing the tween?
  - If yes → **remove it**. Only set final state in `onComplete`.
- [ ] Am I using `setState` inside `onUpdate`?
  - If yes → **refactor** to `ref.current.textContent`.
- [ ] Does the animated element have React-controlled children?
  - If yes → **remove children**, render empty element.
- [ ] Have I tested with Strict Mode? (Default in Next.js dev)
  - Mount → cleanup → remount must produce the same visual result.
- [ ] Is my animation coordinated with parent entrance animations?
  - If yes → add appropriate `delay`.
