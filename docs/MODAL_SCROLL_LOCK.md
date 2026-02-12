# Modal Scroll Lock Pattern

> Panduan wajib untuk semua modal/overlay di project Trisula.

## Masalah

Saat modal dibuka menggunakan React Portal (`createPortal` ke `document.body`), dua masalah UX muncul:

1. **Background tetap bisa di-scroll** — Wheel mouse dan gesture swipe masih menggerakkan halaman di belakang modal.
2. **Konten modal tidak bisa di-scroll via wheel/gesture** — User harus klik & drag scrollbar secara manual.

### Root Cause

| Lapisan | Masalah |
|---|---|
| **`<html>` & `<body>`** | `overflow: hidden` pada `<body>` saja **tidak cukup**. Browser bisa tetap scroll `<html>` element. Pada Next.js, scroll bisa terjadi di level `<html>` atau layout container di atasnya. |
| **Portal Overlay (`fixed inset-0`)** | Div overlay `position: fixed` **menangkap semua wheel events** sebelum sampai ke div scrollable di dalam modal. Akibatnya, wheel event "hilang" — tidak men-scroll modal content, tapi juga tidak di-block dari propagasi ke document. |
| **CSS-only `overflow: hidden`** | Pendekatan CSS murni hanya menyembunyikan scrollbar, tapi **tidak mencegah scroll programmatic** dari wheel/touch events yang sudah tertangkap di level document. |

## Solusi: `position: fixed` + Wheel Forwarding

### 1. Body Lock (di Provider/Root Component)

```tsx
useEffect(() => {
    if (isOpen) {
        const scrollY = window.scrollY;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Lock BOTH html and body
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.paddingRight = `${scrollBarWidth}px`; // prevent layout shift
    } else {
        const scrollY = document.body.style.top;
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1); // restore scroll position
    }
    return () => { /* same cleanup as the else branch */ };
}, [isOpen]);
```

**Mengapa `position: fixed`?**
- Membuat `<body>` keluar dari document flow — browser **secara fisik tidak bisa** scroll element yang `position: fixed`.
- `top: -${scrollY}px` menjaga posisi visual halaman agar tidak lompat ke atas saat di-lock.
- Saat unlock, `window.scrollTo()` mengembalikan posisi scroll yang disimpan.

### 2. Wheel Event Forwarding (di Overlay Component)

```tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);

const handleOverlayWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += e.deltaY;
    }
};

return createPortal(
    <div onWheel={handleOverlayWheel} className="fixed inset-0 ...">
        <div className="absolute inset-0 bg-black/90 ..." /> {/* backdrop */}
        <div> {/* modal box */}
            <div ref={scrollContainerRef} className="overflow-y-auto flex-1 overscroll-contain">
                {/* scrollable content */}
            </div>
        </div>
    </div>,
    document.body
);
```

**Mengapa perlu forwarding?**
- Overlay `fixed inset-0` menangkap wheel event sebelum sampai ke inner scrollable div.
- `handleOverlayWheel` secara manual menambahkan `deltaY` ke `scrollTop` dari container konten.
- `overscroll-contain` mencegah scroll "bocor" ke parent saat konten sudah mentok atas/bawah.

## Checklist untuk Modal Baru

- [ ] Gunakan `position: fixed` body lock di provider/root (bukan hanya `overflow: hidden`)
- [ ] Lock **kedua** `<html>` dan `<body>`
- [ ] Simpan & restore `window.scrollY` saat lock/unlock
- [ ] Kompensasi scrollbar width dengan `paddingRight` agar layout tidak bergeser
- [ ] Tambahkan `onWheel` handler di overlay wrapper untuk forward ke scroll container
- [ ] Gunakan `overscroll-contain` pada div scrollable
- [ ] Tambahkan class `custom-scrollbar` untuk estetika konsisten

## Referensi Implementasi

- [`RedeemModal.tsx`](../apps/web/src/components/organisms/RedeemModal.tsx) — Contoh lengkap dengan compound component pattern
- [`RedeemSuccessCertificate.tsx`](../apps/web/src/components/organisms/RedeemSuccessCertificate.tsx) — Contoh untuk overlay tanpa compound (standalone)
- [`globals.css`](../apps/web/app/globals.css) — Definisi `.custom-scrollbar`
