# 🏗️ Trisula Frontend Refactor Strategy: Atomic Design & State Optimization

This document serves as the **primary instruction set** for AI Agents tasked with refactoring the `apps/web` frontend. The goal is to maximize performance, maintainability, and animation smoothness by decoupling visual components from business logic.

## 1. Core Philosophy (The "Why")

- **State Colocation**: Move state as close as possible to where it is used. If only an input changes, only that input component should re-render.
- **Component Composition**: Use `children` or `slots` heavily. This prevents parent re-renders from affecting children if the children are passed as props.
- **Server vs. Client Boundary**: Keep Template/Layout components as **Server Components**. Only "plant" interactive Client Components (Atoms/Molecules) at the leaf nodes.
- **Signal-like Behavior**: Use **TanStack Query** for Server State to cache data and avoid cascading re-renders.

---

## 2. Folder Structure (Atomic Design)

The AI Agent must reorganize components into this specific hierarchy:

| Directory | Type | Description | Responsibility |
| :--- | :--- | :--- | :--- |
| `components/atoms` | **Stateless / Pure UI** | Smallest units (Button, Input, Badge, Icon). | Visuals only. No business logic. |
| `components/molecules` | **Local State Only** | Groups of atoms (FormInput, PointBadge, StatCard). | Local interactions (e.g., input validation state). |
| `components/organisms` | **Smart Components** | Complex sections (GoldCard, Navbar, ProductGrid). | **Data Fetching** (TanStack Query) starts here. Business logic resides here. |
| `components/templates` | **Layouts** | Page structures (DashboardLayout, AuthLayout). | arranging Organisms. No state. |
| `components/pages` | **Route Connectors** | Next.js Page components. | Connecting Route Params to Organisms. |

---

## 3. The Golden Rules of Optimization

### 🚫 Stop Prop Drilling
Do not pass global state (e.g., User Balance) from Page -> Template -> Organism -> Molecule.
**Solution**: Fetch the data directly in the **Organism** or **Molecule** that needs it using TanStack Query or Zustand.

### ⬇️ Push State Down
If a piece of state is only used by a child component, move that `useState` into the child. Do not keep it in the Parent.

### 🧠 Memoization Strategy
- Use `React.memo` **only** for Atoms/Molecules that verify two conditions:
  1. They receive the exact same props frequently.
  2. Their Parent re-renders frequently.
- Do not blindly wrap everything in `memo`.

### 🎬 GSAP Context Cleanup
**CRITICAL**: Every GSAP animation must be wrapped in `useGSAP` (from `@gsap/react`) or `gsap.context`.
- Failure to do this causes animation glitches and memory leaks when components unmount.

---

## 4. State Management Strategy

| Logic Type | Recommended Tool | Example |
| :--- | :--- | :--- |
| **Static / Rare** | `React Context` | Theme (Dark/Light), User Role, Toast Provider. |
| **Global / Frequent** | `Zustand` | Sidebar Toggle, Modal Open/Close, Complex Form Steps. |
| **Server Data** | `TanStack Query` | User Balance, Polis Data, Activation Codes. **(Sourced from Hono API)** |

---

## 5. Specific Refactor Instructions (For AI)

### 🏆 Case Study: `GoldCard`
**Current Issue**: The `GoldCard` component likely mixes the visual representation of the card with the logic for fetching points and animating the number.
**Refactor Plan**:
1. Create `atoms/CardBackground`: Pure CSS/Image component for the gold texture.
2. Create `atoms/AnimatedCounter`: A component that takes a `value` prop and uses GSAP to animate *only* the text number.
3. Create `organisms/UserBalanceCard`: 
   - Fetches balance using `useQuery`.
   - Passes the balance to `AnimatedCounter`.
   - Renders `CardBackground`.
**Result**: When balance updates, only the `AnimatedCounter` re-renders visually (or strictly speaking, the DOM updates via GSAP), while the heavy background remains static.

---

## 💡 Insight: "The Visual Gap"

In Atomic Design, components should get "dumber" as you go down the tree.
- **Organisms** are "Smart" (knows *how* to get data).
- **Atoms** are "Dumb" (knows *how* to look).

 By keeping Atoms pure, you can implement complex, heavy GSAP animations on them without worry. If an Atom has no dependent state, it won't re-render unexpectedly, ensuring buttery smooth 60fps animations.
