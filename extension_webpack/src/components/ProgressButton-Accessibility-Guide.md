# ProgressButton Accessibility Guidelines

## Accessibility Standards Compliance

The ProgressButton component is designed to meet WCAG 2.1 Level AA standards and provides comprehensive accessibility support across multiple assistive technologies.

## Keyboard Navigation

### Standard Keyboard Support

| Key | Action | Focus Required |
|-----|--------|----------------|
| `Tab` | Move to next focusable element | Yes |
| `Shift + Tab` | Move to previous focusable element | Yes |
| `Enter` | Activate button | Yes |
| `Space` | Activate button | Yes |

### Focus Management

```tsx
// Automatic focus ring with sufficient contrast
<ProgressButton
  progress={75}
  onClick={handleClick}
  className="focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-opacity-50"
/>

// Custom focus styling for high contrast themes
<ProgressButton
  progress={50}
  onClick={handleClick}
  className="focus-visible:outline-none focus-visible:border-2 focus-visible:border-yellow-400"
/>
```

### Focus Order

- Follows natural DOM order
- Respects `tabindex` attributes
- Consistent focus movement across states

## Screen Reader Support

### ARIA Attributes

```tsx
// Automatic ARIA implementation
<ProgressButton
  progress={75}
  onClick={handleClick}
  ariaLabel="Stop job application process"
/>

// Generates:
// role="progressbar"
// aria-label="Stop job application process"
// aria-valuenow="75"
// aria-valuemin="0"
// aria-valuemax="100"
```

### Dynamic State Announcements

#### Idle State
- **Text**: "Stop (75%)"
- **Progress**: "75 percent"

#### Loading State  
- **Text**: "Processing (75%)"
- **Progress**: "75 percent"
- **Additional**: Loading indicator

#### Completed State
- **Text**: "Completed"
- **Progress**: "100 percent"
- **Additional**: Success state

#### Error State
- **Text**: "Error occurred"
- **Progress**: "Current status"

### Screen Reader Testing

```tsx
// Example screen reader output testing
function testScreenReaderOutput() {
  const button = render(<ProgressButton progress={75} onClick={handleClick} />);
  
  // Test with Jest A11y or axe-core
  expect(button).toHaveAttribute('role', 'progressbar');
  expect(button).toHaveAttribute('aria-valuenow', '75');
  expect(button).toHaveAttribute('aria-valuemin', '0');
  expect(button).toHaveAttribute('aria-valuemax', '100');
}
```

## Motion Sensitivity

### Prefers Reduced Motion

The component automatically detects and responds to user motion preferences:

```tsx
// Automatic detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Manual override for testing
<ProgressButton
  progress={75}
  onClick={handleClick}
  reducedMotion={true}
/>
```

### Animation Alternatives

#### Standard Mode
- Smooth scale transitions (1.02x on hover, 0.98x on press)
- Progress bar animations with easing
- Loading spinner rotation
- State transition animations

#### Reduced Motion Mode
- Instant state changes (no animations)
- Preserved functionality and visual feedback
- Minimal visual transitions for state changes
- Maintained readability and accessibility

### Testing Reduced Motion

```css
/* CSS for testing reduced motion */
@media (prefers-reduced-motion: reduce) {
  .progress-button * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Color Contrast Requirements

### Minimum Contrast Ratios

| Element | Background | Text/Icon | Contrast Ratio | WCAG Level |
|---------|------------|-----------|----------------|------------|
| Primary Button | Blue Gradient | White | 4.5:1 minimum | AA |
| Secondary Button | Gray Gradient | Dark Gray | 7:1 recommended | AAA |
| Focus Ring | Transparent | Blue Outline | 3:1 minimum | AA |
| Disabled Button | Light Gray | Gray | 3:1 minimum | AA |

### High Contrast Mode Support

```tsx
// High contrast color variants
const highContrastVariants = {
  primary: {
    base: 'bg-black text-white border-2 border-white',
    progress: 'bg-white',
    shadow: 'shadow-white',
  },
  secondary: {
    base: 'bg-white text-black border-2 border-black',
    progress: 'bg-black',
    shadow: 'shadow-black',
  }
};
```

### Color Blindness Considerations

- **Not relying solely on color** - uses shape and text
- **Sufficient color differentiation** - 4.5:1 contrast minimum
- **Alternative visual cues** - icons change with state

## Cognitive Accessibility

### Clear State Indication

```tsx
// Unambiguous state communication
const getAccessibleStateDescription = (state, progress) => {
  switch (state) {
    case 'completed':
      return `Task completed successfully at ${progress}%`;
    case 'loading':
      return `Processing at ${progress}% - please wait`;
    case 'error':
      return `Error occurred at ${progress}% progress`;
    default:
      return `Ready to stop process at ${progress}% progress`;
  }
};
```

### Time-Based Considerations

- **No rapid flashing** - animations smooth and gentle
- **No time pressure** - user can take time to read
- **Timeout handling** - appropriate timeout messages

### Error Prevention and Recovery

```tsx
// Clear error handling with accessibility
function AccessibleErrorHandling({ progress, onClick }) {
  const [hasError, setHasError] = useState(false);
  
  return (
    <div role="alert" aria-live="polite">
      {hasError && (
        <div className="sr-only">
          Error: Process interrupted. You can retry or continue.
        </div>
      )}
      <ProgressButton
        progress={progress}
        onClick={hasError ? () => setHasError(false) : onClick}
        ariaLabel={hasError ? "Retry process" : "Stop process"}
      />
    </div>
  );
}
```

## Testing Checklist

### Manual Testing

- [ ] Navigate using Tab and Shift+Tab
- [ ] Activate using Enter and Space keys
- [ ] Verify focus indicator visibility
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast in different themes
- [ ] Test reduced motion preference

### Automated Testing

```tsx
// Example accessibility test suite
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('ProgressButton should not have accessibility violations', async () => {
  const { container } = render(
    <ProgressButton progress={75} onClick={jest.fn()} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('ProgressButton should have proper ARIA attributes', () => {
  render(<ProgressButton progress={50} onClick={jest.fn()} />);
  
  const button = screen.getByRole('progressbar');
  expect(button).toHaveAttribute('aria-valuenow', '50');
  expect(button).toHaveAttribute('aria-valuemin', '0');
  expect(button).toHaveAttribute('aria-valuemax', '100');
});
```

### Screen Reader Testing Scripts

#### NVDA (Windows)
```
1. Navigate to ProgressButton
2. Expected: "Stop button 50 percent progressbar"
3. Press Space
4. Expected: "Processing 50 percent button"
```

#### VoiceOver (macOS)
```
1. Navigate to ProgressButton using Control+Option+Right
2. Expected: "Stop, 50 percent, progress indicator"
3. Press Control+Option+Space
4. Expected: "Processing, 50 percent, button"
```

#### TalkBack (Android)
```
1. Navigate to ProgressButton
2. Expected: "Stop button, 50% progress"
3. Tap to activate
4. Expected: "Processing button, 50% progress"
```

## Browser Compatibility

### Full Support

- Chrome 90+ (Screen readers, keyboard nav, reduced motion)
- Firefox 88+ (Screen readers, keyboard nav, reduced motion)  
- Safari 14+ (VoiceOver, keyboard nav, reduced motion)
- Edge 90+ (Screen readers, keyboard nav, reduced motion)

### Limited Support

- Internet Explorer 11 (Keyboard nav only, no reduced motion)
- Older mobile browsers (Basic functionality, limited accessibility)

## Development Guidelines

### Adding New Features

1. **Always test with screen readers**
2. **Maintain keyboard navigation**
3. **Ensure color contrast compliance**
4. **Support reduced motion preferences**
5. **Update ARIA attributes appropriately**

### Common Accessibility Patterns

```tsx
// Good: Comprehensive accessibility
<ProgressButton
  progress={75}
  onClick={handleClick}
  ariaLabel="Stop job application process"
  disabled={isProcessing}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
/>

// Avoid: Missing accessibility
<button onClick={handleClick}>
  {progress}%
</button>
```

### Performance Impact

- Screen reader updates are throttled to prevent overwhelming users
- Focus management is optimized for smooth navigation
- Reduced motion detection is cached to avoid performance overhead

## Legal Compliance

This component meets or exceeds:

- **WCAG 2.1 Level AA** - Web Content Accessibility Guidelines
- **Section 508** - U.S. Federal accessibility requirements
- **EN 301 549** - European accessibility standard
- **ADA** - Americans with Disabilities Act compliance

For questions about accessibility implementation or to report issues, please refer to the project's accessibility documentation or submit issues through the appropriate channels.
