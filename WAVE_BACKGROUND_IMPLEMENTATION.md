# Wave Background Implementation - Naraflow Brand

## Overview
Implementasi background gelombang organik dengan gradient ungu-lavender-cream yang sesuai dengan mood Naraflow.

## 🎨 Wave Background Design

### Color Gradient
```
Left (Dark Purple) → Middle (Lavender) → Right (Cream)
#4A1A6B  →  #6D2A9A  →  #FFF7E6
```

Matching dengan logo Naraflow:
- **Ungu tua** (hsl 270, 60%, 35%)
- **Lavender** (hsl 270, 60%, 45%)
- **Cream/Off-white** seperti logo "N"

### Wave Layers (3 Layers untuk Depth)

#### Layer 1 - Back (Darkest)
```tsx
Opacity: 0.15
Gradient: #4A1A6B → #6D2A9A → #FFF7E6
```

#### Layer 2 - Middle
```tsx
Opacity: 0.12
Gradient: #5A1F7D → #7D3AB5 → #F5E6D3
```

#### Layer 3 - Front (Lightest)
```tsx
Opacity: 0.10
Gradient: #3E165A → #6D2A9A → #E6D4B8
```

### Wave Path Structure

**Path 1 (Back):**
- Gelombang besar dan melengkung
- Dimulai dari kiri bawah
- Berakhir di kanan atas
- Paling gelap untuk depth

**Path 2 (Middle):**
- Gelombang medium
- Sejalan dengan path 1
- Slightly offset untuk efek overlaying

**Path 3 (Front):**
- Gelombang paling terang
- Smooth curves
- Highlight effect

## ✨ Key Features

### 1. Organic Flow
- Curves natural seperti ombak
- Tidak rigid atau mechanical
- Breathing space antara waves

### 2. Color Harmony
- Purple tones matching logo
- Cream accents for warmth
- Smooth transitions
- No harsh color breaks

### 3. Depth Perception
- Layering dengan opacity berbeda
- Overlapping untuk depth
- Gradient yang mengikuti flow

### 4. SVG-Based
- Scalable tanpa loss
- Crisp pada semua resolution
- Smooth rendering
- Lightweight

## 🎯 Implementation

### Component: `WaveBackground`
```tsx
export const WaveBackground = ({ className, children }) => {
  return (
    <div className="relative">
      {/* SVG Wave Pattern */}
      <svg>
        {/* 3 wave layers dengan gradients */}
      </svg>
      {children}
    </div>
  );
};
```

### Usage in Hero
```tsx
<WaveBackground className="min-h-screen">
  {/* Content */}
</WaveBackground>
```

## 💡 Visual Effect

### Before
- Plain background dengan blur orbs
- Tidak ada sense of flow
- Static appearance

### After
- Organic waves yang mengalir
- Gradient yang smooth
- Sense of movement & fluidity
- Modern & sophisticated

## 🎨 Brand Expression

### 1. **Fluidity & Flow**
- Waves menggambarkan aliran data/workflow
- Connected & integrated feeling
- Dynamic bukan static

### 2. **Purple-to-Cream Transition**
- Dari complexity (purple) ke simplicity (cream)
- From tech to solution
- Deep thought to clear action

### 3. **Organic Forms**
- Natural, bukan rigid
- Approachable, bukan cold
- Grounded in reality

## 📊 Result

Background yang:
- ✅ **Organic & flowing** - seperti workflow yang natural
- ✅ **Brand colors** - purple matching logo
- ✅ **Depth & dimension** - 3D feeling dengan layers
- ✅ **Modern aesthetic** - sophisticated
- ✅ **Unique** - bukan generic gradient
- ✅ **Versatile** - bisa dipakai di seluruh site

