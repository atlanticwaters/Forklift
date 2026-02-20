# 🏗️ Forklift

**A Figma plugin that lifts real product data into your Product Pod components**

Forklift bridges the gap between design and real-world product data by automatically populating Figma Product Pod components with authentic product information including images, pricing, ratings, badges, specifications, and more.

---

## ✨ Features

### 🎯 Smart Component Population
- **Single Mode**: Populate one Product Pod at a time with full control
- **Batch Mode**: Fill multiple Product Pods simultaneously with different products
- Automatically detects and populates Product Pod instances in your selection

### 📦 Complete Product Data Mapping
Forklift intelligently maps product data to your Product Pod layers:

- **Product Information**: Brand name, title, model number
- **Pricing**: Dollar and cent values with discount price support
- **Images**: Hero images and up to 5 SKU thumbnails
- **Ratings**: Star rating visualization and review counts
- **Badges**: Up to 2 promotional or informational badges
- **Specifications**: Key product features (up to 3 attributes)
- **Fulfillment**: Pickup and delivery availability
- **Actions**: Customizable button labels

### 🎨 Layer-Aware Design
The plugin traverses your Product Pod structure by layer name, ensuring data lands in the right place:
- Text layers for product labels, prices, and specifications
- Image fills for hero and thumbnail visuals
- Component properties for star ratings
- Visibility controls for conditional elements (badges, fulfillment options)

---

## 🚀 How It Works

### 1. **Select Your Product Pods**
Select one or more Product Pod component instances in your Figma file. The plugin automatically detects valid Product Pod components.

### 2. **Browse the Catalog**
Navigate through a hierarchical product catalog:
- **Departments** → **Categories** → **Subcategories** → **Products**
- Visual product cards with images, prices, and ratings
- Breadcrumb navigation for easy backtracking

### 3. **Choose Your Mode**
- **Single Mode**: Click any product to populate the first selected Pod
- **Batch Mode**: Click multiple products to fill multiple Pods in sequence

### 4. **Watch the Magic**
The plugin:
- Loads required fonts automatically
- Creates image fills from product URLs
- Sets text content across multiple layers
- Configures star ratings with proper fill states
- Shows/hides conditional elements based on data availability
- Reports progress for batch operations

---

## 🏗️ Architecture

```
forklift/
├── src/
│   ├── code.ts              # Main plugin thread (Figma API)
│   ├── sandbox/             # Figma layer manipulation
│   │   ├── batchFiller.ts   # Product Pod population logic
│   │   ├── imageSetter.ts   # Image fill management
│   │   ├── nodeTraversal.ts # Layer tree navigation
│   │   ├── starRating.ts    # Star rating component control
│   │   └── textSetter.ts    # Font loading & text updates
│   ├── shared/
│   │   ├── constants.ts     # Layer names & configuration
│   │   └── types.ts         # TypeScript interfaces
│   └── ui/                  # React-based UI thread
│       ├── App.tsx          # Main application component
│       ├── components/      # Reusable UI components
│       ├── hooks/           # React hooks for data & messaging
│       ├── mapping/         # Product → Figma field transformation
│       └── api/             # External catalog data fetching
├── manifest.json            # Figma plugin configuration
├── package.json
├── tsconfig.json
└── esbuild.config.mjs       # Build configuration
```

### Key Design Patterns

#### **Layer Discovery by Name**
```typescript
const LAYER_NAMES = {
  PRODUCT_LABELS: "Product Labels",
  MAIN_PRICE: "Main Price",
  PRODUCT_MEDIA: "Product Media",
  // ... 30+ layer constants
};
```
The plugin uses predefined layer names to locate and manipulate specific elements within the Product Pod component hierarchy.

#### **Progressive Text Population**
```typescript
async function setTextOnNode(textNode, value) {
  // 1. Load all fonts used in the text node
  // 2. Handle both uniform and mixed font styles
  // 3. Update text content atomically
}
```

#### **Image Fill Creation**
```typescript
async function createImageFillFromUrl(url) {
  // 1. Fetch image from URL
  // 2. Create Figma image hash
  // 3. Return IMAGE fill with FILL scale mode
}
```

#### **Component Property Management**
```typescript
await star.setProperties({ fill: "filled" });
// or
await star.setProperties({ Fill: "filled" });
```
Handles case variations in component property names gracefully.

---

## 🎮 Product Pod Structure Requirements

For Forklift to work correctly, your Product Pod component must follow this layer naming convention:

### Required Layers
```
Product Pod (Component)
├── Pod Header (Slot 1)
├── Pod Body (Slot 2)
│   ├── Product Details
│   │   ├── Product Labels      # Text container for brand/title/model
│   │   ├── Main Price          # Text container for price parts
│   │   └── Product Overview
│   ├── Product Media
│   │   └── Image
│   │       └── Image           # Image fill node
│   ├── BETA Rating
│   │   └── Stars               # Star component instances
│   ├── Badge Group
│   │   ├── Badge               # Badge container 1
│   │   └── Badge               # Badge container 2
│   ├── SKU Selector
│   │   └── SKU Options
│   │       └── Tile Group
│   │           ├── Tile        # Up to 5 tiles
│   │           │   └── .Tile Base
│   │           │       └── col-left
│   │           │           └── Image
│   └── BETA Fulfillment Options
│       ├── BETA Fulfillment - Pickup
│       └── BETA Fulfillment - Delivery
│           └── Fulfillment Detail
└── Pod Actions
    └── Button
        └── Button title
```

### Optional Layers
- `Discount Price` (shown when wasPrice is provided)
- `Attribute 1`, `Attribute 2`, `Attribute 3` (key product features)
- Custom badge configurations

---

## 🛠️ Development

### Prerequisites
- Node.js 16+
- Figma desktop app

### Setup
```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode (auto-rebuild on changes)
npm run watch

# Type checking
npm run typecheck
```

### Building
The build process uses esbuild to create:
- `dist/code.js` - Main plugin thread (vanilla JS)
- `dist/ui.html` - UI iframe with bundled React app
- `dist/ui.js` - UI JavaScript bundle

### Installing in Figma
1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Navigate to the Forklift directory and select `manifest.json`
4. The plugin will appear in your plugins list

---

## 📡 Data Source

Forklift fetches product data from the **Orange Catalog API** hosted on GitHub Pages. The catalog includes:
- **Hierarchical categories**: Departments, categories, and subcategories
- **Product listings**: 50-100 products per category
- **Product details**: Complete specifications, images, pricing, ratings, and availability

### Network Access
The plugin requires network access to:
- `https://atlanticwaters.github.io` - Product catalog data
- `https://*.thdstatic.com` - Product images
- CDN resources for UI assets

---

## 🔧 Configuration

### UI Dimensions
```typescript
const UI_WIDTH = 360;
const UI_HEIGHT = 560;
```
The plugin UI is optimized for a narrow panel that fits comfortably alongside your canvas.

### Thumbnail Limits
```typescript
const MAX_THUMBNAILS = 5;
```
Matches the 5-slot SKU selector in the Product Pod design.

---

## 📚 Common Workflows

### Populating a Single Pod
1. Select a Product Pod instance
2. Launch Forklift plugin
3. Ensure **Single** mode is active
4. Navigate to desired product category
5. Click a product card → Pod fills instantly

### Batch Populating Multiple Pods
1. Select multiple Product Pod instances (e.g., 8 Pods)
2. Launch Forklift
3. Switch to **Batch** mode
4. Click 8 different products
5. Click **Fill N Pods** → All Pods populate in sequence

### Filling with Variations
- Select Pods arranged in a grid layout
- Use Batch mode to showcase product variety
- Each Pod gets unique product data
- Creates realistic mockups for presentations

---

## 🎯 Use Cases

### ✅ Design QA
Validate your Product Pod design with real-world data scenarios:
- Long product titles that wrap
- Missing badges or ratings
- Out-of-stock states
- Price variations

### ✅ Presentation Decks
Quickly populate mockups with authentic products for stakeholder reviews without manual copy-paste.

### ✅ Design Exploration
Test how your component handles edge cases:
- Products with 1 vs. 5 thumbnails
- Low ratings vs. high ratings
- Different badge combinations
- Various price points

### ✅ Developer Handoff
Show engineers exactly how real data should map to each design element.

---

## 📝 Message Protocol

The plugin uses a message-based architecture between the UI and main threads:

### UI → Main Thread
```typescript
{ type: "populate-single", fields: ProductPodFields }
{ type: "populate-batch", items: ProductPodFields[] }
{ type: "get-selection" }
```

### Main Thread → UI
```typescript
{ type: "selection-update", count: number, hasProductPods: boolean }
{ type: "populate-progress", current: number, total: number }
{ type: "populate-success", count: number }
{ type: "populate-error", message: string }
```

---

## 🐛 Troubleshooting

### "No Product Pod instances selected"
- Ensure you've selected at least one component instance
- Verify the component is named "Product Pod" or contains that text
- Check that you're selecting instances (not the main component)

### Images not loading
- Verify network access in `manifest.json`
- Check that image URLs are accessible
- Ensure Figma has permission to load external images

### Text not updating
- The plugin automatically loads fonts, but ensure they exist in your file
- Falls back to "Inter Regular" if original fonts fail
- Check layer names match the constants exactly

### Star ratings not changing
- Verify star instances have a `fill` or `Fill` property
- Ensure stars are component instances (not frames)
- Check that property values match expected variants

---

## 🚧 Future Enhancements

- [ ] Search functionality for quick product lookup
- [ ] Favorite/bookmark products for quick access
- [ ] Custom data source configuration
- [ ] Export filled Pods as structured data
- [ ] Undo/redo support for batch operations
- [ ] Product comparison mode

---

## 📄 License

This is an internal tool for design and development workflows.

---

## 🙏 Credits

Built with:
- **Figma Plugin API** - Component manipulation and rendering
- **React** - UI framework
- **TypeScript** - Type safety
- **esbuild** - Lightning-fast builds
- **Orange Catalog** - Product data source

---

**Happy designing! 🎨**
