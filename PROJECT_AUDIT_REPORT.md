# Complete Project & Codebase Comprehensive Audit
**Project:** VYOM 2026 Official Website
**Date:** September 23, 2026

---

## 1. Scope & Objective
This audit covers the exhaustive review of the VYOM-2026-main repository. The analysis spans across architecture, UI/UX consistency, data flow, code hygiene, security, and performance bottlenecks to provide actionable refactoring recommendations.

---

## 2. Audit Report

### Section 1: Executive Summary & Project Overview
- **Project Purpose & Stack**: 
  - **Purpose**: Official event showcase and registration platform for VYOM 2026, Rungta University's annual fest.
  - **Core Tech Stack**: HTML5, Vanilla CSS3 (custom styles, CSS variables), Vanilla JavaScript (ES6+).
  - **Frameworks/Libraries**: None. It is a pure static Multi-Page Application (MPA).
  - **Environment**: Client-side browser execution, with form submissions sent to a Google Apps Script endpoint.
- **Project Health Scorecard**: 
  - **Code Quality**: 4/10 (High code duplication, lack of modularity)
  - **Security**: 8/10 (Static nature inherently minimizes risks, but lacks input sanitization)
  - **UI/UX Consistency**: 9/10 (Strong, immersive theme with cohesive design tokens)
  - **Performance**: 7/10 (Fast initial load, but lacks asset optimization and relies on heavy inline scripts)
  - **Maintainability**: 3/10 (Copy-pasted structural elements like navbars and footers across all pages)

### Section 2: Architecture & System Design Breakdown
- **System Architecture**: Flat, Multi-Page Architecture (MPA). The site relies on standalone HTML files that share a common CSS file (`shared.css`). Logic is embedded directly within `<script>` tags in each HTML file.
- **Architectural Diagram**:
```mermaid
flowchart TD
    User([User / Browser])
    
    subgraph Frontend [Static Frontend (MPA)]
        Index[index.html]
        Events[events.html]
        Gallery[gallery.html]
        Sponsors[sponsors.html]
        Brochure[brochure.html]
        SharedCSS[shared.css]
    end

    subgraph Backend [External Services]
        GoogleAppsScript[Google Apps Script Endpoint]
        IBB[IBB Image Hosting]
    end

    User -->|Visits| Index
    User -->|Navigates| Events
    Index -.->|Loads| SharedCSS
    Events -.->|Loads| SharedCSS
    Gallery -.->|Loads| SharedCSS
    
    Index -.->|Fetches Assets| IBB
    Gallery -.->|Fetches Assets| IBB

    User -->|Fills Registration| Events
    Events -->|POST Request via Fetch| GoogleAppsScript
```
- **Directory Hierarchy & Module Breakdown**:
  - `index.html`: Landing page with dynamic hero section and countdown.
  - `events.html`: Event listing and registration modal with hardcoded JSON database.
  - `gallery.html`: Photo gallery with a custom lightbox implementation.
  - `sponsors.html` & `brochure.html`: Informational pages.
  - `shared.css`: Global design tokens, typography, and utility classes.

### Section 3: UI/UX & Design System Audit
- **Typography & Fonts**: 
  - Primary Fonts: `Orbitron` (Headings/Accents), `Rajdhani` (Body).
  - Loaded via Google Fonts. Highly consistent usage across the application.
- **Styling & Design Tokens**: 
  - Centralized CSS variables in `shared.css` (`:root { --pink: #FF0055; --cyan: #00FFD1; --dark: #070707; }`).
  - Dark mode default with glassmorphism effects (`backdrop-filter: blur()`).
  - Custom cursor (`div#cursor`) implemented via JavaScript mouse tracking.
- **Pages & Components Breakdown**: 
  - **Navbar**: Responsive with hamburger menu, but code is duplicated in every `.html` file.
  - **Footer**: Detailed multi-column footer, also duplicated.
  - **Cards**: Event and Sponsor cards use hover micro-interactions (scale, border-color shifts, box-shadow pulses).

### Section 4: Data Flow, Models & Connectivity
- **Data Architecture & Schemas**: 
  - No traditional database. Data is stored as hardcoded JavaScript arrays (e.g., `const EVENTS = [...]` in `events.html`, `const PHOTOS = [...]` in `gallery.html`).
- **Connectivity & APIs**: 
  - **Registration Form**: Submits data via `fetch()` to `https://script.google.com/macros/s/AKfycb.../exec`.
  - Content-Type: Assumed to be `application/x-www-form-urlencoded` or `multipart/form-data` based on standard Google Form/Apps Script integrations.
- **Data Lifecycle**: 
  - User Action (Clicks Register) → UI State (Opens Modal) → User Inputs Data → JavaScript Validates → `fetch` POSTs data to Google Apps Script → Promise resolves → UI Rerenders (Success/Error Message).

### Section 5: Exhaustive Code Quality & File Analysis
- **Code Patterns & Hygiene**: 
  - **Violation of DRY (Don't Repeat Yourself)**: Navbar, Footer, Preloader, and Cursor logic are copy-pasted across all 5 HTML files. Any change to the navigation requires updating 5 different files.
  - **Inline JavaScript**: Massive blocks of logic (over 400 lines in `events.html`) are embedded directly in HTML, mixing markup with logic.
  - **Type Safety**: None (Vanilla JS).
- **Error Handling & Resilience**: 
  - Image `onerror` fallbacks are effectively used (`onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"`).
  - Lack of comprehensive try-catch blocks around potential DOM manipulation failures.

### Section 6: Security, Vulnerability & Edge-Case Audit
- **Security Vulnerabilities**: 
  - **XSS Vectors**: The use of `.innerHTML` in `events.html` (e.g., `document.getElementById('rm-dynamic-fields').innerHTML = ...`) is safe currently because data is hardcoded, but poses a severe XSS risk if event data ever comes from an external API.
  - **API Exposure**: The Google Apps Script URL is exposed in the client code. Since there's no auth, anyone can spam the endpoint with POST requests.
- **Access Control & Auth**: 
  - Completely public. No rate-limiting on the client-side form submissions.

### Section 7: Performance & Optimization Bottlenecks
- **Performance Risks**: 
  - **Asset Loading**: Images are hosted on `ibb.co` without explicit sizing attributes, leading to potential Cumulative Layout Shift (CLS).
  - **Event Listeners**: `setInterval` and `mousemove` listeners for the custom cursor are running constantly on every page without throttling/debouncing.
  - **DOM Thrashing**: Rendering the entire gallery grid via `.innerHTML` in one go is fine for 60 items, but will lag if the array grows.
- **Resource Leaks**: 
  - No cleanup for `setInterval` loops (e.g., the fake notification popups in `index.html` and `events.html`).

### Section 8: Actionable Refactoring Roadmap & Prioritized Recommendations

#### [CRITICAL] Extract Duplicated UI & Logic
- **Issue**: Navbar, Footer, and Cursor JS are duplicated across 5 files.
- **Action**: Adopt a Static Site Generator (e.g., Astro, Eleventy) or at minimum, extract shared JavaScript into a `main.js` file and link it (`<script src="main.js"></script>`).
- **Snippet (Before vs After)**:
  *Before*: `<nav id="navbar">...</nav>` repeated 5 times.
  *After (Astro)*: `<Header />` component used in a shared `<Layout>` wrapper.

#### [HIGH] Mitigate XSS Risks in Dynamic Rendering
- **Issue**: `.innerHTML` used for rendering form fields and gallery items.
- **Action**: Use `document.createElement()` or a lightweight templating system to sanitize inputs before injection.

#### [HIGH] Optimize Custom Cursor Performance
- **Issue**: `mousemove` event fires constantly, causing layout recalcs.
- **Action**: Use `requestAnimationFrame` for cursor tracking.
- **Snippet**:
  ```javascript
  let isMoving = false;
  document.addEventListener('mousemove', e => {
      if (!isMoving) {
          window.requestAnimationFrame(() => {
              cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
              isMoving = false;
          });
          isMoving = true;
      }
  });
  ```

#### [MEDIUM] Implement Image Optimization
- **Issue**: Direct hotlinking to high-res `ibb.co` images.
- **Action**: Compress images to WebP format, store them locally or on a proper CDN, and add `width` and `height` attributes to prevent layout shifts. Ensure `loading="lazy"` is consistently applied.

#### [LOW] Add Rate Limiting to Form Submissions
- **Issue**: Forms can be spammed.
- **Action**: Implement a client-side cooldown (e.g., disable the submit button for 60 seconds after a successful submission) and add Google reCAPTCHA v3 to protect the Apps Script endpoint.
