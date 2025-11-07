# Section Components Guide

## 📦 Components Created

### 1. **CallAIButton** (`ui/call-ai-button.tsx`)
A reusable button component for calling your AI receptionist.

**Location**: `apps/client/src/components/ui/call-ai-button.tsx`

**Usage**:
```tsx
import { CallAIButton } from "@/components/ui/call-ai-button";

<CallAIButton 
  phoneNumber="+17344156557"
  displayNumber="+1 734-415-6557"
  text="Call our AI receptionist"
  showIcon={true}
/>
```

**Props**:
- `phoneNumber` (optional): Phone number for tel: link - default: "+17344156557"
- `displayNumber` (optional): Display text - default: "+1 734-415-6557"  
- `text` (optional): Button text - default: "Call our AI receptionist"
- `className` (optional): Additional CSS classes
- `showIcon` (optional): Show phone icon - default: true

---

### 2. **SectionHero** (`sections/section-hero.tsx`)
Full-screen hero section with call button, heading, subtext, two CTAs, and featured image.

**Location**: `apps/client/src/components/sections/section-hero.tsx`

**Features**:
- ✅ `min-h-screen` height
- ✅ Grid background pattern
- ✅ Framer Motion animations
- ✅ Responsive 2-column layout
- ✅ Image with glow effect
- ✅ Optional AI call button
- ✅ Two customizable CTA buttons

**Usage**:
```tsx
import { SectionHero } from "@/components/sections";

<SectionHero
  title="AI that secures your calls while you"
  titleHighlight="focus on your business"
  subtitle="DailZero is the AI receptionist that answers, filters, and manages every call."
  primaryButtonText="Try for Free"
  primaryButtonHref="/waitlist"
  secondaryButtonText="Book a Demo"
  secondaryButtonHref="/contact"
  imageSrc="/hero-img.png"
  imageAlt="Hero Image"
  showCallButton={true}
/>
```

---

### 3. **SectionContent** (`sections/section-content.tsx`)
Section with sticky title/description on left and scrollable cards on right.

**Location**: `apps/client/src/components/sections/section-content.tsx`

**Features**:
- ✅ 2-column layout (sticky left content)
- ✅ Scrollable cards with custom scrollbar
- ✅ Card hover effects
- ✅ Image support in cards
- ✅ Responsive design

**Usage**:
```tsx
import { SectionContent } from "@/components/sections";

<SectionContent
  title="Features"
  contentTitle="Everything you need"
  contentTitleSubtext="Comprehensive call management solution"
  cards={[
    {
      title: "24/7 Availability",
      subtitle: "Never miss a call",
      image: "/feature-1.png",
      imageAlt: "24/7 Service"
    },
    // ... more cards
  ]}
/>
```

---

### 4. **SectionInfo** (`sections/section-info.tsx`)
Full-screen section with title/subtitle on left and text content in styled card on right.

**Location**: `apps/client/src/components/sections/section-info.tsx`

**Features**:
- ✅ `min-h-screen` height
- ✅ 2-column layout
- ✅ Text in styled card
- ✅ Supports multiline text (use `\n`)
- ✅ Muted background

**Usage**:
```tsx
import { SectionInfo } from "@/components/sections";

<SectionInfo
  title="About Us"
  pageInfoTitle="We're changing how businesses handle calls"
  subtitle="Learn more about our mission"
  pageInfoText="DailZero was founded with a simple mission..."
/>
```

---

### 5. **SectionContentSlider** (`sections/section-content-slider.tsx`)
Full-screen section with heading and horizontal card slider with navigation.

**Location**: `apps/client/src/components/sections/section-content-slider.tsx`

**Features**:
- ✅ `min-h-screen` height
- ✅ Responsive slider (1-3 cards based on screen size)
- ✅ Left/right arrow navigation
- ✅ Dot indicators
- ✅ Icon support (Lucide icons)
- ✅ Border and hover effects
- ✅ Smooth animations

**Usage**:
```tsx
import { SectionContentSlider } from "@/components/sections";
import { Phone, Mail, Calendar } from "lucide-react";

<SectionContentSlider
  title="Features"
  heading="Powerful Features"
  subheading="Discover what makes our AI special"
  cards={[
    { icon: Phone, text: "Answer calls automatically" },
    { icon: Mail, text: "Email notifications" },
    { icon: Calendar, text: "Schedule appointments" },
    // ... more cards
  ]}
/>
```

---

### 6. **SectionImageInfo** (`sections/section-image-info.tsx`)
Section with alternating image/content rows (image switches left/right per row).

**Location**: `apps/client/src/components/sections/section-image-info.tsx`

**Features**:
- ✅ Alternating layout (image position switches)
- ✅ Images with glow effects
- ✅ Large spacing between items
- ✅ Responsive 2-column layout
- ✅ Perfect for step-by-step guides

**Usage**:
```tsx
import { SectionImageInfo } from "@/components/sections";

<SectionImageInfo
  title="How It Works"
  sectionHeading="Simple, yet powerful"
  subheading="Get started in minutes"
  items={[
    {
      title: "Connect Your Phone",
      subtext: "Forward your calls in just a few clicks.",
      image: "/step-1.png"
    },
    // ... more items
  ]}
/>
```

---

### 7. **SectionFAQ** (`sections/section-faq.tsx`)
FAQ section with accordion interface.

**Location**: `apps/client/src/components/sections/section-faq.tsx`

**Features**:
- ✅ Accordion-style interface
- ✅ Smooth expand/collapse animations
- ✅ Max-width container for readability
- ✅ Styled card container
- ✅ Muted background

**Usage**:
```tsx
import { SectionFAQ } from "@/components/sections";

<SectionFAQ
  title="FAQ"
  heading="Frequently Asked Questions"
  faqs={[
    {
      question: "How does it work?",
      answer: "Our AI uses advanced NLP..."
    },
    // ... more FAQs
  ]}
/>
```

---

### 8. **Accordion** (`ui/accordion.tsx`)
Reusable accordion component (used by SectionFAQ).

**Location**: `apps/client/src/components/ui/accordion.tsx`

**Usage**:
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question</AccordionTrigger>
    <AccordionContent>Answer</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 🎨 Design System

All components follow the DailZero design system:

### Colors (OKLCH)
- **Primary**: `oklch(0.62 0.19 259.76)` - Purple/Blue accent
- **Background**: `oklch(1.00 0 0)` (light) / `oklch(0.20 0 0)` (dark)
- **Foreground**: `oklch(0.32 0 0)` (light) / `oklch(0.92 0 0)` (dark)
- **Muted**: Light gray backgrounds for subtle sections
- **Border**: Subtle borders matching theme

### Typography
- **Font**: Poppins (body), Geist (UI)
- **Headings**: Bold, responsive (text-3xl → text-6xl)
- **Body**: Regular weight, comfortable line-height (1.5-1.75)

### Spacing
- **Sections**: `py-20` standard, `min-h-screen` for hero sections
- **Containers**: `container mx-auto` with responsive padding
- **Gaps**: Consistent 4, 6, 8, 12, 16 spacing scale

### Animations
- **Framer Motion**: Entrance animations with stagger
- **Duration**: 0.6s for most animations
- **Easing**: `easeOut` for natural feel
- **Viewport**: `once: true` for performance

---

## 📁 File Structure

```
apps/client/src/components/
├── ui/
│   ├── call-ai-button.tsx      ← AI call button
│   ├── accordion.tsx            ← Accordion component
│   └── ...                      ← Other UI components
│
└── sections/
    ├── section-hero.tsx         ← Hero section
    ├── section-content.tsx      ← Content with cards
    ├── section-info.tsx         ← Info section
    ├── section-content-slider.tsx ← Slider section
    ├── section-image-info.tsx   ← Alternating image/content
    ├── section-faq.tsx          ← FAQ section
    ├── index.ts                 ← Export barrel file
    ├── example-usage.tsx        ← Full example page
    ├── README.md                ← Detailed documentation
    └── COMPONENTS_GUIDE.md      ← This file
```

---

## 🚀 Quick Start

### 1. Import Components
```tsx
import {
  SectionHero,
  SectionContent,
  SectionInfo,
  SectionContentSlider,
  SectionImageInfo,
  SectionFAQ,
} from "@/components/sections";
```

### 2. Build Your Page
```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen">
      <SectionHero {...heroProps} />
      <SectionContent {...contentProps} />
      <SectionInfo {...infoProps} />
      <SectionContentSlider {...sliderProps} />
      <SectionImageInfo {...imageInfoProps} />
      <SectionFAQ {...faqProps} />
    </div>
  );
}
```

### 3. See Full Example
Check `example-usage.tsx` for a complete implementation with sample data.

---

## 🔧 Dependencies Installed

- `@radix-ui/react-accordion@^1.2.12` - For accordion functionality
- Existing: `framer-motion`, `lucide-react`, `next`, `tailwindcss`

---

## ✅ Best Practices

1. **Keys**: All components use unique keys (not array indices)
2. **Accessibility**: Proper ARIA labels and semantic HTML
3. **Performance**: Viewport-based animations with `once: true`
4. **Responsive**: Mobile-first design approach
5. **Type Safety**: Full TypeScript support with interfaces
6. **Customization**: All components accept `className` prop

---

## 🎯 Common Patterns

### Landing Page Structure
```tsx
<SectionHero />          // Hero with CTA
<SectionContent />       // Features showcase
<SectionInfo />          // About/Mission
<SectionContentSlider /> // Capabilities
<SectionImageInfo />     // How it works
<SectionFAQ />          // FAQ
```

### Service Page Structure
```tsx
<SectionHero />          // Service intro
<SectionImageInfo />     // Features breakdown
<SectionContentSlider /> // Benefits
<SectionFAQ />          // Service FAQ
```

### Product Page Structure
```tsx
<SectionHero />          // Product intro
<SectionContent />       // Product features
<SectionInfo />          // Product story
<SectionFAQ />          // Product FAQ
```

---

## 🐛 Troubleshooting

### Issue: Accordion not animating
**Solution**: Ensure CSS animations are in `globals.css`:
```css
@keyframes accordion-down { ... }
@keyframes accordion-up { ... }
```

### Issue: Images not showing
**Solution**: Ensure images are in `public/` folder and paths start with `/`

### Issue: Slider not responsive
**Solution**: Component automatically adjusts cards per view based on screen size

### Issue: Framer Motion not working
**Solution**: Ensure component is marked with `"use client"` directive

---

## 📝 Customization Examples

### Custom Colors
```tsx
<SectionHero 
  className="bg-gradient-to-br from-purple-50 to-blue-50"
  {...props}
/>
```

### Custom Spacing
```tsx
<SectionContent 
  className="py-32"  // Increase padding
  {...props}
/>
```

### Hide Call Button
```tsx
<SectionHero 
  showCallButton={false}
  {...props}
/>
```

---

## 📚 Additional Resources

- **Full Example**: See `example-usage.tsx`
- **Detailed Docs**: See `README.md`
- **Design System**: See `globals.css`
- **Component Library**: See `ui/` folder

---

## 🎉 You're All Set!

All components are ready to use. They're:
- ✅ Fully typed with TypeScript
- ✅ Responsive and accessible
- ✅ Animated with Framer Motion
- ✅ Styled with your color scheme
- ✅ Linter error-free
- ✅ Production-ready

Happy building! 🚀

