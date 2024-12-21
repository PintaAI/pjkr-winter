# Cline Color Rules

## Palette Teal

Berikut adalah panduan penggunaan warna teal dalam proyek ini:

### Hex Codes
| Level | Hex Code | Keterangan |
|-------|----------|------------|
| 50    | #052033  | Paling Gelap |
| 100   | #0E3345  | |
| 200   | #174656  | |
| 300   | #205868  | |
| 400   | #296B79  | |
| 500   | #337E8B  | Medium |
| 600   | #3C919C  | |
| 700   | #45A3AE  | |
| 800   | #4EB6BF  | |
| 900   | #57C9D1  | Paling Terang |

### Cara Penggunaan

#### 1. Menggunakan Tailwind Classes
```jsx
// Background
<div className="bg-teal-50">  // Teal paling gelap
<div className="bg-teal-500"> // Teal medium
<div className="bg-teal-900"> // Teal paling terang

// Text
<div className="text-teal-50">  // Text warna teal gelap
<div className="text-teal-500"> // Text warna teal medium
<div className="text-teal-900"> // Text warna teal terang

// Border
<div className="border-teal-50">  // Border teal gelap
<div className="border-teal-500"> // Border teal medium
<div className="border-teal-900"> // Border teal terang
```

#### 2. Menggunakan CSS Variables
```css
.custom-class {
  /* Background */
  background-color: hsl(var(--teal-50));  /* Gelap */
  background-color: hsl(var(--teal-500)); /* Medium */
  background-color: hsl(var(--teal-900)); /* Terang */

  /* Text */
  color: hsl(var(--teal-50));  /* Gelap */
  color: hsl(var(--teal-500)); /* Medium */
  color: hsl(var(--teal-900)); /* Terang */

  /* Border */
  border-color: hsl(var(--teal-50));  /* Gelap */
  border-color: hsl(var(--teal-500)); /* Medium */
  border-color: hsl(var(--teal-900)); /* Terang */
}
```

### Panduan Penggunaan

1. **Warna Gelap (50-300)**
   - Latar belakang untuk area yang membutuhkan kontras tinggi
   - Text pada background terang
   - Header dan elemen penting

2. **Warna Medium (400-600)**
   - Elemen interaktif seperti button
   - Borders dan dividers
   - Accent colors

3. **Warna Terang (700-900)**
   - Highlight dan emphasis
   - Call-to-action elements
   - Decorative elements

### Catatan
- Palette ini sudah dikonfigurasi untuk mode terang dan gelap
- Warna akan otomatis menyesuaikan dengan tema yang aktif
- Gunakan level warna yang konsisten untuk menjaga harmoni visual
