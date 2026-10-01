# NOX Blackfiles: Simulator Architecture & Implementation Plan

## 1. Analysis of the Current OpenDesign UI

### Strengths
- **Aesthetics**: The CSS (`nox.css`) provides a clean, modern, and moody "dark mode" aesthetic suitable for a cyber-investigation theme.
- **Layout Foundation**: The multi-pane dashboard layout (`col-aside`, `col-main`, `col-side`) is a solid foundation for managing complex information.

### Weaknesses & Needed Changes (The "Why")
- **Administrative vs. Immersive**: The current UI looks like a Jira board for detectives ("Objectives", "Blockers", "Task lists"). It feels like managing a project, not solving a crime. We need to shift the focus from *tracking tasks* to *examining evidence*.
- **Fragmented Experience**: Splitting the game into multiple static HTML files (`evidence.html`, `interrogation.html`, `timeline.html`) breaks immersion. Switching contexts should be seamless.
- **Lack of Synthesis (The "Red String")**: Real investigation involves connecting the dots. A flat list of "Pinned Evidence" doesn't capture this. We need a visual deduction board where players actively link clues to form hypotheses.
- **Spoon-feeding**: Explicit "Objectives" and "Unresolved Questions" hold the player's hand too much. The player should determine the questions based on contradictions in the evidence.

## 2. The New Architecture

We will build a **Single Page Application (SPA)** in vanilla JavaScript, HTML, and CSS (leveraging the existing `nox.css` for styling but replacing the structure).

### Core Components
1. **The Investigation Desktop (SPA Engine)**: A central state manager that handles navigation between views (Scene, Evidence, Deduction Board) without reloading the page.
2. **Interactive Scene Inspector**: A text/visual hybrid view where players read the scene report and click on highlighted keywords (e.g., `[Anti-static wristband]`, `[Rack 4]`) to extract them as **Evidence Items**.
3. **The Deduction Board (The Core Mechanic)**: An SVG-based interactive canvas where players drag evidence nodes and connect them. To solve the case, the player must connect the correct combination of `Method`, `Opportunity`, and `Motive` nodes to a `Suspect`.
4. **Deep Inspection Modal**: When an item is collected, it can be deeply inspected. For example, inspecting the "Anti-static wristband" reveals the hidden clue: the safety resistor was removed.

## 3. The New Case: "The Server Room Sabotage"

Drawing inspiration from the *Himayatnagar* reference (where a natural death masked a murder via subtle tampering), we will build a case where an industrial accident masks a premeditated assassination.

- **Victim**: Ajay Desai, DevOps Lead at a fin-tech startup.
- **Initial Ruling**: Accidental electrocution in Server Room B.
- **The True Cause**: His anti-static wristband was modified (safety resistor replaced with conductive copper) to turn him into a ground path, and a remote power surge was triggered while he was working.
- **The Suspects**:
  - *Neha (VP Engineering)*: Has remote access, motivated by Ajay discovering her micro-embezzlement scheme.
  - *Vikram (Junior Sysadmin)*: Incompetent, recently reprimanded by Ajay. (Red herring).
- **The Contradiction (The "Glucometer" moment)**: The main breaker was physically locked out by Ajay, but the logs show power was restored *remotely* via a bypass relay at the exact moment his smart watch recorded a heart spike.

## 4. Implementation Steps

1. **Bootstrap the SPA**: Create an `index.html` that serves as the shell, loading the existing `nox.css` and our new `simulator.js`.
2. **Build the State Machine**: Implement a simple pub/sub or reactive state in JS to track unlocked evidence.
3. **Develop the Views**:
   - `Scene View`: Render the initial incident report with interactive extraction links.
   - `Evidence View`: A grid of collected items with "Inspect" buttons.
   - `Board View`: The SVG drag-and-drop deduction board.
4. **Wire the Logic**: Connecting the right nodes on the board triggers the "Case Solved" state.
