# charity: water - Water Ways

Water Ways is a keyboard-friendly sewer-runner game about collecting virtual
clean water for a community. It is built with HTML, CSS, and JavaScript.

## How to play

- Select **Start journey**, then switch between the five lanes with the
  left/right arrow keys or A/D. On touch devices, use the on-screen arrows.
- Collect blue water drops for **10 points and 1 oz**.
- Every 20 collected water droplets advances the player to the next level.
- Every 15 oz upgrades the community school and increases the points multiplier,
  up to 3x for the journey.
- You start with **5 lives**. Avoid rolled-up paper trash because each
  collision removes one life and five points.
- Collect springs for a six-second jump that clears trash and earns five bonus
  points for each cleared obstacle.
- Collect watering cans for **10 water drops**.
- Collect hearts for **one extra life**.
- Toilet paper, empty cans, plastic bags, and plastic bottles are all trash
  obstacles. They each remove one life and five points if they hit you.
- Higher levels spawn more trash.
- The timer counts upward for the entire journey. There is no time limit;
  continue collecting water until all five lives are lost.
- Use **Pause** to freeze the timer and sewer traffic, then select **Resume**
  to continue.
- On touch devices, use the on-screen arrows to switch lanes.
- Confetti celebrates every 20 oz collected and every 100 seconds survived.
- The end screen shows your final score, water total, and final elapsed time.
- Select **Play again** to reset all counters and replay the level.
- Use **Settings** to view the controls or **Home** to return to the start
  state.
- Reaching the selected water goal opens a community question. Choose the
  clean-water action to complete the journey and earn a bonus.
- Journey pace options are **Low**, **Medium**, and **Hard**. Low uses only
  toilet paper obstacles, Medium uses every trash type, and Hard starts with
  one life and moves objects faster.

## Current project structure

- [index.html](./index.html) contains the game interface, HUD, game board,
  controls, overlays, and buttons.
- [script.js](./script.js) contains the game state, movement, object spawning,
  collisions, scoring, levels, timer, pause behavior, confetti, and reset
  logic.
- [styles.css](./styles.css) contains the charity: water-inspired styling,
  sewer lanes, responsive layout, buttons, overlays, and animations.
- `img/` contains the provided charity: water logo and water-can images.

## Skills needed to build this project

This project is achievable in two weeks for a beginner if the core game is
prioritized before visual polish.

### HTML skills

#### Semantic page structure

The page uses a header, main content, sections, buttons, status messages, and
overlay panels. The main sections are:

- The game header
- The HUD
- The five-lane game area
- The community challenge
- The result screen
- The settings panel

#### IDs and classes

JavaScript finds individual elements through IDs such as `score`, `water`,
`health`, `level`, `time`, `player`, and `confetti`. CSS uses classes such as
`hud`, `game-object`, `primary-button`, and `overlay-panel`.

IDs are normally used for one specific element. Classes are used for styling
multiple elements.

#### Buttons and event targets

The game uses buttons for:

- Starting
- Pausing and resuming
- Moving left and right
- Playing again
- Opening Settings
- Returning Home
- Answering the community question

Important HTML concepts include:

- `aria-label`
- `role="status"`
- `hidden`
- `disabled`

These features improve accessibility and keyboard and screen-reader support.

#### Overlay panels

The result, settings, and community panels are hidden and shown by JavaScript:

```html
<section id="result-panel" class="overlay-panel" hidden>
```

You need to understand how the `hidden` attribute works and how JavaScript can
change it.

### CSS skills

#### Flexbox and Grid

The project uses Flexbox for the header, controls, buttons, and final
statistics. CSS Grid is used for the HUD and result actions.

Useful properties include:

- `display: flex`
- `display: grid`
- `grid-template-columns`
- `gap`
- `justify-content`
- `align-items`

#### Positioning game objects

The game container uses `position: relative`, while the player, water drops,
trash, and confetti use `position: absolute`. This allows objects to be placed
inside the game board.

Important properties include:

- `position`
- `top`
- `left`
- `bottom`
- `z-index`
- `transform`

#### Sewer visual design

The sewer track uses CSS gradients and repeating gradients to create:

- Lane dividers
- Concrete tunnel texture
- Scrolling movement
- Side pipe details
- Shadows and depth

This is one of the more visually advanced CSS parts of the project. You can
learn it gradually by changing one value at a time and observing the result.

#### CSS animations

Animations are used for:

- Scrolling sewer lanes
- Falling confetti
- Hit feedback
- Water collection feedback

You should understand:

- `@keyframes`
- `animation-duration`
- `animation-delay`
- `animation-timing-function`
- `animation-fill-mode`
- CSS custom properties such as `--color` and `--delay`

#### Responsive design

The game uses a media query for smaller screens:

```css
@media (max-width: 600px)
```

Responsive CSS changes the HUD columns, button layout, header spacing, font
sizes, and game height.

#### Accessibility and focus styles

The project includes keyboard controls and `:focus-visible` styles. These give
keyboard users a clear outline while interacting with buttons.

### JavaScript skills

#### Variables and constants

The game stores configuration values such as:

```js
const MAX_HEALTH = 5;
const LANE_COUNT = 5;
const BASE_TRASH_CHANCE = 0.28;
```

You need to understand the difference between `const` and `let`, as well as
numbers, strings, arrays, and booleans.

#### DOM selection and updates

The game selects HTML elements with:

```js
document.getElementById(...)
```

It updates the HUD with:

```js
scoreElement.textContent = score;
```

This is how the score, water total, level, lives, and timer change on screen.

#### Functions

The game is divided into functions such as:

- `startGame`
- `resetGame`
- `movePlayer`
- `createObject`
- `collectObject`
- `gameLoop`
- `endGame`
- `togglePause`
- `showConfetti`

You need to understand function declarations, parameters, return values, and
calling functions.

### Accessibility

```js
if (gameState !== "playing") return;
```

This is an important beginner-to-intermediate concept.

#### Event listeners

The game listens for button clicks, keyboard presses, and community answer
selections:

```js
startButton.addEventListener("click", startGame);
```

You should understand:

- Events
- Event handlers
- `event.key`
- `event.target`
- `preventDefault()`

#### Keyboard movement and lane logic

The player moves through five fixed lanes:

```js
const LANE_POSITIONS = [10, 30, 50, 70, 90];
```

The current lane is stored as a number:

```js
let playerLane = 2;
```

Movement changes that number while preventing the player from leaving the
first or fifth lane. This requires understanding arrays, indexes, limits, and
converting lane numbers into CSS positions.

#### Random object generation

Water droplets and rolled paper obstacles are generated randomly with
`Math.random()`. Random choices determine whether an object is trash or water
and which lane it enters.

`Math.random()` produces a number from 0 up to, but not including, 1.

#### Arrays and object data

Active game objects are stored in an array:

```js
let objects = [];
```

Each object stores information such as its HTML element, lane, vertical
position, and whether it is trash. Managing several moving objects at once is
an important step beyond basic JavaScript.

#### Animation frames

The game uses:

```js
requestAnimationFrame(gameLoop);
```

The game loop:

1. Calculates elapsed time.
2. Spawns new objects.
3. Moves existing objects downward.
4. Checks collisions.
5. Removes objects that leave the screen.
6. Requests the next frame.

#### Collision detection

The game checks whether the player and an object are in the same lane and
whether their vertical positions overlap. It uses:

```js
getBoundingClientRect()
```

Collision detection combines DOM geometry, lane comparisons, timing, object
movement, and game state.

#### Timers

The elapsed-time display uses `setInterval()`. Pause clears the interval, and
resume starts it again.

You need to understand:

- `setInterval`
- `clearInterval`
- Avoiding duplicate intervals
- How pause state affects timers

#### Level progression

The level is calculated from the amount of water:

```js
Math.floor(water / 20) + 1
```

Every 20 oz:

- The level increases.
- Trash becomes more common.
- Confetti appears.
- Feedback is displayed.

#### Dynamic DOM creation

Confetti pieces are created in JavaScript:

```js
document.createElement("span")
```

They are styled, added to the confetti container, and removed after the
animation. This requires understanding how to create, append, and clean up
temporary elements.

#### Game reset and cleanup

Resetting the game must clear:

- Active objects
- Timers
- Animation frames
- Confetti
- Scores
- Lives
- Water
- Timer display
- Panels

Incomplete cleanup can cause multiple timers, objects moving after restart,
confetti remaining on screen, or scores changing unexpectedly.

## Trickier parts of the plan

### The game loop

The combination of `requestAnimationFrame`, object movement, and collision
detection is the most technically challenging part. You do not need a game
engine, but you do need to understand the basic update loop:

```js
function gameLoop() {
  updateObjects();
  checkCollisions();
  requestAnimationFrame(gameLoop);
}
```

### Pause and resume

Pause must stop more than the button text. It needs to pause:

- The animation frame
- The timer interval
- Player movement
- Collision checking
- Object movement

The JavaScript game loop and timer are paused in the current implementation.
The CSS sewer background animation is independent of JavaScript, so a future
improvement could pause it with:

```css
animation-play-state: paused;
```

### Collision detection

`getBoundingClientRect()` is effective, but you need to understand element
coordinates, the difference between top and bottom positions, the same-lane
check, and why objects are removed after collision.

### Difficulty scaling

Trash chance increases with level:

```js
BASE_TRASH_CHANCE + (level - 1) * TRASH_CHANCE_PER_LEVEL
```

Difficulty should remain fair. The current cap prevents the game from becoming
impossible. Future improvements could increase object speed, spawn objects
more frequently, avoid long runs of obstacles, or guarantee occasional water
drops.

### Multiple timing systems

The game uses:

- `requestAnimationFrame` for movement
- `setInterval` for the timer
- `setTimeout` for visual effects

Each timer must be tracked and cleared when appropriate.

### Game-state bugs

The project includes community challenge code, but the game no longer
automatically reaches the community challenge because the original 30-second
limit was removed. The following code is currently disconnected from the main
game path:

- `communityPanel`
- `answerQuestion`
- The `community` state
- The `answering` state

You can either remove this unused feature for a simpler project or add a
clear way to reach it, such as a level milestone or a button. For a
two-week beginner project, removing unused features may be safer unless the
community question is required by the assignment.

### Accessibility

Accessibility requires deliberate testing:

- Keyboard navigation
- Visible focus indicators
- Screen-reader status updates
- Clear button labels
- Sufficient color contrast
- Ensuring hidden panels cannot still receive focus

## Suggested two-week learning and build plan

### Days 1-2: HTML and basic CSS

Learn and practice:

- HTML structure
- IDs and classes
- Buttons
- Flexbox
- Grid
- Basic responsive design

Goal: Build the static Water Ways screen without gameplay.

### Days 3-4: JavaScript and DOM updates

Learn:

- Variables
- Functions
- DOM selection
- `textContent`
- Click events
- Keyboard events

Goal: Make Start, Home, Replay, and Pause buttons work.

### Days 5-6: Five-lane movement

Learn:

- Arrays
- Indexes
- Keyboard handling
- Limiting movement between lanes

Goal: Move the human player between all five lanes.

### Days 7-9: Objects and collisions

Learn:

- `createElement`
- Arrays of objects
- `requestAnimationFrame`
- `getBoundingClientRect`
- Object removal

Goal: Spawn water and trash, collect water, and lose lives when hit.

### Days 10-11: Scoring and levels

Add:

- Score updates
- Water totals
- Five lives
- Level progression every 20 oz
- Increased trash frequency

Goal: Make the core game fully playable.

### Days 12-13: Pause, confetti, and result screen

Add:

- Pause and resume
- Final time
- Confetti at 20 oz milestones
- Confetti every 100 seconds
- Game-over result screen

Goal: Finish the main game loop and feedback.

### Day 14: Testing and polish

Test:

- Starting and replaying
- Pausing and resuming
- Losing all lives
- Reaching 20, 40, and 60 oz
- Reaching 100 seconds
- Keyboard controls
- Mobile layout
- Settings and Home buttons

## Recommended priority

Prioritize these features in order:

1. Five-lane movement
2. Water collection
3. Trash collisions
4. Five lives
5. Score and level updates
6. Timer
7. Game-over screen
8. Pause
9. Confetti
10. Settings and visual polish

If time runs short, prioritize a reliable playable game over extra animations.
The core game can be completed with beginner-to-intermediate JavaScript. The
most advanced parts are the animation loop, collision detection, pause
cleanup, and managing multiple timers.
