Game-style-guide.md
---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 
# My Game Visual Style

## Color Scheme

When creating UI elements, styling, or visual components for this workshop, feel free to use the official Kiro brand colors to make the game look cool.

### Primary Colors
- **Purple-500**: `#790ECB` - Main brand color for primary buttons, CTAs, and key highlights
- **Purple-400**: Lighter purple for hover states and secondary accents
- **Purple-300**: Lightest purple for text links and subtle highlights

### Background Colors
- **Black-900**: Dark background (primary)
- **Prey-900**: Dark gray for secondary backgrounds
- **Prey-750**: Medium-dark gray for cards and containers
- **Prey-700**: Lighter gray for hover states on dark elements

### Text Colors
- **White**: Primary text on dark backgrounds
- **Prey-300**: Secondary text, muted content
- **Prey-400**: Tertiary text, labels

### Usage Guidelines
- Use purple-500 for primary actions and brand moments
- Maintain high contrast ratios for accessibility
- Dark theme is the default - use black-900 as the base
- Purple should be used intentionally as an accent, not overwhelmingly

## Color Application Examples
- Primary buttons: `bg-purple-500 hover:bg-purple-400`
- Links: `text-purple-300 hover:text-purple-500`
- Cards on dark: `bg-prey-750 hover:bg-prey-700`
- Body text: `text-white` or `text-prey-300`

# Design Guidelines

## Interaction
- Smooth animations for all button interactions
- Satisfying feedback for player actions (screen shake, particle effects)
- Clear visual hierarchy with consistent spacing

## Game Feel
- 60 FPS target for smooth gameplay
- Immediate response to player input
- Clear visual feedback for all game events
- Retro pixel art aesthetic with modern polish

## Super Kiro World Defaults

When the user asks for a **Kiro-branded platformer** or refers to **“Super Kiro World”**:

- Theme the world around Kiro debugging cloud systems at an AWS re:Invent-style expo.
  - Platforms can represent dashboards, pipelines, and services.
  - Collectibles can be logs, metrics, or trace shards.
  - Level goals can be “Deploy Gates” or “Green Check” portals at the end of the level.
- Prefer a **unique signature mechanic** such as:
  - Time Rewind / Time Warp: rewinding a few seconds of player movement with limited uses.
  - Service Activation: switches that bring platforms or services online.
  - Log Trails: temporary platforms or boosts created by Kiro’s trail.
- Use Kiro brand colors in the HUD and UI elements (score, lives, abilities), while keeping the gameplay area readable.
- If the user does **not** specify gravity or jump physics, suggest responsive defaults (for example, gravity around `0.5` and jump power around `12`) and let the user override them.
- If the user **does** specify gravity, jump power, or other physics in the prompt, do **not** ask them again. Use their provided values and build around them.