# Google Ads Implementation Guide

This document explains how to implement Google Ads throughout the HamletHub website.

## Implementation

The Google Ads are implemented using a custom `GoogleAd` component that handles the integration with Google Ad Manager.

## Using the GoogleAd Component

The `GoogleAd` component makes it easy to place ads throughout the site based on the hub's alias.

### Component Properties

- `alias` (required): The alias used to identify the ad unit (typically the town slug)
- `size` (optional): The ad size to display, either `"300x250"` (Medium Rectangle) or `"970x90"` (Leaderboard)
  - Defaults to `"970x90"` if not specified
- `className` (optional): Additional CSS classes to apply to the ad container

### Ad Sizes

The component supports two standard ad sizes:

1. **Medium Rectangle (300x250)** - Good for sidebar and in-content placements
2. **Leaderboard (970x90)** - Good for header and footer areas

### Example Usage

```tsx
// Import the component
import GoogleAd from "@/app/_components/GoogleAd";

// Medium Rectangle (300x250)
<GoogleAd 
  alias="ridgefield-connecticut" 
  size="300x250"
  className="my-4" 
/>

// Leaderboard (970x90) - Default size
<GoogleAd 
  alias="danbury-connecticut" 
/>
```

## Ad Placement Strategy

Ads are currently placed in these locations:

1. **Town Pages** - At the top of each town page
   ```tsx
   <GoogleAd 
     alias={townSlug} 
     size="970x90"
   />
   ```

2. **Future Placements** - Additional placements can be added following the same pattern

## Implementing Google Ads in a New Section

To add Google Ads to a new section of the site:

1. Import the GoogleAd component:
   ```tsx
   import GoogleAd from "@/app/_components/GoogleAd";
   ```

2. Add the component where you want the ad to appear:
   ```tsx
   <GoogleAd 
     alias="desired-ad-unit-name" 
     size="970x90" // or "300x250"
   />
   ```

3. Make sure the ad unit name exists in Google Ad Manager

## Technical Details

The GoogleAd component:
- Uses Google Publisher Tags (GPT) for ad delivery
- Handles all script loading and initialization
- Works with server-side rendering
- Provides fallback styling during loading
- Automatically removes ads on component unmount

## Troubleshooting

If ads aren't displaying properly:

1. Check browser console for any errors
2. Verify the alias matches what's configured in Google Ad Manager
3. Ensure the ad size matches what's configured for that unit
4. Try using the ad-test page to test different configurations 