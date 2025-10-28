# Hero Section Redesign - Pastel Brand Identity

## Overview
Redesain hero section dengan warna pastel yang soft, mempertahankan identitas brand Naraflow (biru-hijau), dan layout modern dengan 2 kolom.

## 🎨 Brand Color System

### Primary Colors (Biru)
```typescript
primary: {
  light: '#E0F2FE',  // pastel blue
  medium: '#38BDF8', // brand blue
  dark: '#0EA5E9'
}
```

### Secondary Colors (Hijau)
```typescript
secondary: {
  light: '#DCFCE7',  // pastel green
  medium: '#22C55E', // brand green
  dark: '#16A34A'
}
```

### Background Gradients
- Soft pastel gradients untuk background
- Overlay dengan blur effect untuk depth
- Konsisten dengan brand identity

## 📐 Layout Structure

### 1. Header Section
- **Badge**: "Satu Platform, Semua Kebutuhan" dengan gradient brand
- **Title**: "Satu WhatsApp. Semua Beres." dengan gradient text
- **Subtitle**: Deskripsi singkat dalam italic
- **Category Filter**: 3 tombol dengan active state gradient

### 2. Main Grid (2 Kolom)

#### Kolom Kiri:
1. **WhatsApp Mockup** (dengan 3D effect)
2. **Chat Preview** - Daftar produk dengan:
   - Icon dengan gradient pastel
   - Nama produk
   - Waktu terakhir chat
   - Preview pesan

#### Kolom Kanan:
1. **Current Product Focus**:
   - Icon & nama produk
   - Deskripsi lengkap
   - Features dengan checkmarks
   - CTA button "Kunjungi Website"
   - Navigation arrows (untuk kategori)

2. **Product Line Summary**:
   - Grid 2 kolom: Farm vs Field
   - Daftar produk dengan icon
   - Organized by category

3. **All Products Grid** (hanya untuk "Semua Agen"):
   - Grid 2 kolom untuk semua produk
   - Hover effects
   - Brief descriptions

### 3. Footer CTA
- Border top dengan brand color
- Call-to-action dengan gradient brand
- Icon arrow untuk visual guidance

## 🎯 Product Color Coding

### Farm Products (Hijau-Ambah)
- **Rahayu** (🐔): Amber/Orange pastel
- **Tambakflow** (🦐): Blue/Cyan pastel  
- **Kasaflow** (🏪): Violet/Purple pastel

### Field Products (Biru-Ambah)
- **Rodaya** (📝): Emerald/Green pastel
- **Tamara** (🏨): Pink/Rose pastel
- **Sortify** (♻️): Lime/Green pastel

## ✨ Key Features

### 1. Active State Highlighting
```tsx
// Dynamic background gradient based on active category
style={{
  background: activeCategory === "farm" 
    ? `linear-gradient(135deg, ${brandColors.primary.medium}, ${brandColors.secondary.medium})`
    : 'transparent'
}}
```

### 2. Soft Pastel Backgrounds
- Gradient dari light to muted backgrounds
- Blur effects untuk depth perception
- Animated pulse effects untuk background circles

### 3. Product Focus (Default Tamara)
- Auto-rotate untuk kategori tertentu
- Smooth transitions
- Navigation arrows
- Features list dengan brand-colored checkmarks

### 4. Responsive Design
- Mobile-first approach
- Stacked layout untuk mobile
- 2-column grid untuk desktop
- Touch-friendly interactions

## 🔄 Interactions

### Category Filter
- **Semua Agen**: Grid view dengan semua produk
- **Farm as a Service**: Carousel dengan produk farm
- **Field Workflow**: Carousel dengan produk field

### Auto-rotation
- 5 detik untuk kategori tertentu
- Auto-advance produk
- Smooth transitions

### Hover Effects
- Scale on hover
- Shadow elevation
- Icon transformations
- Color intensity changes

## 📱 Components Used

### 1. Lucide Icons
- Egg, Fish, Building, Store, Hotel, Recycle
- Tractor, ClipboardList
- MessageCircle, Sparkles
- CheckCircle2, ExternalLink, ArrowRight
- ChevronLeft, ChevronRight

### 2. UI Components
- Button (from button-extended)
- WhatsAppMockup component
- Custom styled divs dengan gradient backgrounds

### 3. Animations
- Fade-in on mount
- Pulse untuk background circles
- Scale on hover
- Smooth transitions (duration-200)

## 🎨 Visual Hierarchy

### 1. Primary Focus
- Current product details (di kolom kanan)
- Large, clear typography
- Brand-colored CTAs

### 2. Secondary Focus
- Chat preview (kolom kiri)
- Product line summary (footer right column)

### 3. Supporting Elements
- Background gradients
- Category filters
- Navigation controls

## 💡 Design Principles

### Apple-style Minimalism
- Clean, spacious layouts
- Adequate whitespace
- Subtle shadows and borders
- Consistent rounded corners (rounded-xl, rounded-3xl)
- Smooth transitions

### Brand Consistency
- Consistent use of brand colors
- Gradient applications
- Pastel color scheme
- Professional appearance

### User Experience
- Clear visual feedback
- Intuitive navigation
- Responsive interactions
- Loading states

## 🔧 Technical Details

### State Management
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [activeCategory, setActiveCategory] = useState<"all" | "farm" | "field">("all");
const [isVisible, setIsVisible] = useState(false);
```

### Auto-rotation Logic
```typescript
useEffect(() => {
  if (activeCategory !== "all" && products.length > 1) {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }
}, [products.length, activeCategory]);
```

### Dynamic Product Filtering
```typescript
const getActiveProducts = () => {
  if (activeCategory === "farm") return farmProducts;
  if (activeCategory === "field") return fieldProducts;
  return allProducts;
};
```

## ✅ Features Implemented

- [x] Pastel color system dengan brand identity
- [x] 2-column layout (WhatsApp mockup + Product details)
- [x] Category filtering (All, Farm, Field)
- [x] Active state highlighting dengan gradient
- [x] Chat preview di kolom kiri
- [x] Product focus di kolom kanan (default Tamara)
- [x] Auto-rotation untuk kategori
- [x] Product line summary
- [x] Smooth transitions & animations
- [x] Responsive design
- [x] Hover effects
- [x] Brand-colored CTAs
- [x] Lucide icon integration

## 📝 Result

Hero section yang modern, minimalis, dan professional dengan:
- ✅ Warna pastel yang soft
- ✅ Brand identity yang konsisten
- ✅ Layout yang terorganisir
- ✅ User experience yang baik
- ✅ Visual hierarchy yang jelas
- ✅ Apple-style minimalism
- ✅ Responsive & accessible

