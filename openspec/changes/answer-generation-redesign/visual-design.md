# Visual Design Specification
## Answer Generation Redesign

### Design Goals
- **Simplicity**: Reduce cognitive load with clean, focused design
- **Speed**: Minimize steps from selection to copied answer
- **Customization**: Make AI prompts fully editable and transparent
- **Flexibility**: Provide multiple output formats and options
- **Accessibility**: Ensure all users can effectively use the interface

### Layout Structure

#### Icon Design
```
┌─────────────────┐
│  [AI] Answer    │  ← Clean, modern icon
└─────────────────┘
  - 32x32px size
  - Blue gradient background (#3B82F6)
  - White AI letter icon
  - Subtle drop shadow
  - Appears 300ms after selection
  - Stays visible for 8 seconds
```

#### Popup Layout (Single View)
```
┌─────────────────────────────────────────┐
│  Answer Generation              [×]     │  ← Header
├─────────────────────────────────────────┤
│  Selected Text:                          │  ← Text Preview
│  "Explain microservices architecture..." │
├─────────────────────────────────────────┤
│  📝 AI Prompt [Expand] [Templates]      │  ← Prompt Editor
│  ┌─────────────────────────────────────┐ │
│  │ You are a professional career coach │ │  ← Editable area
│  │ helping generate contextual answers │ │
│  │ based on user's selected text...    │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Quick Settings:                        │  ← Settings
│  [Professional] [Medium] [Paragraph]   │
├─────────────────────────────────────────┤
│  🎯 Generate Answer              [⚡]   │  ← Generate Button
├─────────────────────────────────────────┤
│  Generated Answer:                      │  ← Results
│  ┌─────────────────────────────────────┐ │
│  │ Microservices architecture is a... │ │
│  │ comprehensive approach that...      │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  📋 Copy ▼  💾 Export  ⭐ Save         │  ← Actions
└─────────────────────────────────────────┘
```

### Component Specifications

#### Header Section
- **Title**: "Answer Generation" with close button
- **Close Button**: 24x24px, hover state with subtle background
- **Background**: Light gray (#F9FAFB) with border bottom
- **Padding**: 16px horizontal, 12px vertical

#### Selected Text Preview
- **Background**: Light blue (#EFF6FF)
- **Border**: 1px solid #DBEAFE
- **Text**: 14px, gray (#6B7280), italic
- **Max Height**: 60px with scroll if needed
- **Padding**: 12px
- **Border Radius**: 6px

#### Prompt Editor Section
- **Header**: "AI Prompt" with Expand/Templates buttons
- **Editor**: Syntax-highlighted textarea
- **Variables**: Highlighted in blue (#3B82F6)
- **Character Count**: Bottom right, gray (#9CA3AF)
- **Background**: White with border
- **Padding**: 12px
- **Border Radius**: 6px

#### Quick Settings Section
- **Layout**: Horizontal row of segmented controls
- **Tone Options**: Professional, Casual, Technical
- **Length Options**: Short, Medium, Long
- **Format Options**: Paragraph, Bullets, Numbered List
- **Styling**: Rounded segments with selected state

#### Generate Button
- **Primary Action**: Large, prominent button
- **Background**: Blue gradient (#3B82F6 to #2563EB)
- **Text**: "Generate Answer" with icon
- **Hover State**: Slightly darker blue
- **Disabled State**: Gray (#D1D5DB) with disabled cursor
- **Loading State**: Spinner animation with "Generating..."

#### Results Section
- **Background**: Green tint (#F0FDF4) for success
- **Border**: 1px solid #BBF7D0
- **Text**: 14px, dark gray (#1F2937)
- **Whitespace**: Preserved with proper line spacing
- **Padding**: 16px
- **Border Radius**: 6px

#### Action Buttons
- **Copy Button**: Primary blue with checkmark icon
- **Export Button**: Secondary gray with download icon
- **Save Button**: Outline style with star icon
- **Dropdown Arrow**: For format selection

### Color Palette

#### Primary Colors
- **Blue Primary**: #3B82F6 (buttons, links, highlights)
- **Blue Dark**: #1D4ED8 (hover states)
- **Blue Light**: #DBEAFE (backgrounds, borders)

#### Semantic Colors
- **Success Green**: #10B981 (success states, confirmations)
- **Warning Yellow**: #F59E0B (warnings, suggestions)
- **Error Red**: #EF4444 (errors, validation)
- **Info Blue**: #3B82F6 (information, tips)

#### Neutral Colors
- **Gray 900**: #111827 (primary text)
- **Gray 700**: #374151 (secondary text)
- **Gray 500**: #6B7280 (tertiary text)
- **Gray 300**: #D1D5DB (borders, dividers)
- **Gray 100**: #F3F4F6 (subtle backgrounds)
- **White**: #FFFFFF (card backgrounds)

### Typography

#### Font Stack
- **Primary**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Fallback**: sans-serif
- **Monospace**: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono'

#### Font Sizes
- **Large**: 18px (section titles)
- **Body**: 14px (main content)
- **Small**: 12px (captions, metadata)
- **Tiny**: 11px (character counts, timestamps)

#### Font Weights
- **Bold**: 600 (section titles, button labels)
- **Medium**: 500 (form labels)
- **Regular**: 400 (body text)

### Spacing System

#### Standard Spacing
- **xs**: 4px (tight spacing)
- **sm**: 8px (close elements)
- **md**: 12px (standard padding)
- **lg**: 16px (section spacing)
- **xl**: 20px (major spacing)
- **2xl**: 24px (component separation)

#### Layout Margins
- **Popup Margins**: 16px from edges
- **Section Spacing**: 16px between major sections
- **Element Spacing**: 8px between related elements
- **Button Spacing**: 12px between action buttons

### Animation Specifications

#### Transitions
- **Fast**: 150ms (hover states, button interactions)
- **Standard**: 200ms (popup show/hide)
- **Slow**: 300ms (complex animations)

#### Keyframe Animations
```css
/* Icon Appear */
@keyframes iconSlideIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Button Press */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

/* Copy Success */
@keyframes copySuccess {
  0% { opacity: 0; transform: translateY(10px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
```

### Responsive Design

#### Mobile (< 768px)
- **Popup Width**: 90% of viewport width
- **Font Sizes**: Slightly larger for touch
- **Touch Targets**: Minimum 44px height
- **Vertical Scrolling**: Single column layout

#### Tablet (768px - 1024px)
- **Popup Width**: 500px maximum
- **Layout**: Single column with optimal spacing
- **Touch Interface**: Enhanced touch targets

#### Desktop (> 1024px)
- **Popup Width**: 480px fixed
- **Layout**: Optimized for mouse/keyboard interaction
- **Keyboard Shortcuts**: Full support enabled

### Accessibility Features

#### Focus Management
- **Focus Ring**: 2px blue outline (#3B82F6)
- **Focus Visible**: Clear visual indicators
- **Tab Order**: Logical left-to-right, top-to-bottom
- **Skip Links**: Not needed for popup

#### Screen Reader Support
- **ARIA Labels**: All interactive elements
- **Live Regions**: For dynamic content updates
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: For all icons and graphics

#### Visual Accessibility
- **High Contrast**: Support for OS high contrast mode
- **Color Independence**: Information not conveyed by color alone
- **Text Scaling**: Support up to 200% zoom
- **Motion Preferences**: Respect prefers-reduced-motion

### Error States

#### Validation Errors
- **Red Border**: 2px solid #EF4444
- **Error Message**: 12px red text below field
- **Icon**: Exclamation triangle icon
- **Animation**: Shake animation for attention

#### Loading States
- **Skeleton**: Gray placeholder blocks
- **Spinner**: Animated loading indicator
- **Progress**: Indeterminate progress bar
- **Text**: "Loading..." with ellipsis

#### Empty States
- **Placeholder Text**: Helpful guidance
- **Icon**: Generic placeholder icon
- **Action**: Clear next step instruction

### Success States

#### Copy Success
- **Checkmark Animation**: 500ms green checkmark
- **Success Message**: "Copied to clipboard" in green
- **Background**: Brief green highlight
- **Auto-dismiss**: 2 seconds then fade out

#### Generation Success
- **Green Background**: Subtle success tint
- **Checkmark Icon**: Next to generated content
- **Timestamp**: When answer was generated
- **Share Options**: Copy/export buttons highlighted