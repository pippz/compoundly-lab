# Compoundly Lab

Compoundly Lab is a lightweight, browser-based chemical compound research
tool. It lets you search for a compound by name, formula or indetifier and
presents a focused research sheet with molecular formula, identifiers,
structure information, and a short description.

The app is implemented as a single HTML file with vanilla HTML, CSS, and
JavaScript. It uses public chemical data services directly from the
browser, so there is no backend server or build step required.

## Features

-   Search for compounds by:
    -   compound name
    -   molecular formula
    -   CAS
-   Resolve compound records through **PubChem**
-   Use **NCI Cactus** as a fallback resolver when PubChem cannot
    directly resolve a query, if the query cannot be resolved by Cactus Wikipedia handles it
-   Re-resolve Cactus results through PubChem using an InChIKey when
    possible
-   Display:
    -   compound name
    -   molecular formula
    -   molecular weight
    -   IUPAC name
    -   PubChem CID
    -   InChIKey
    -   canonical SMILES
    -   2D structure image when available
    -   description / research summary
-   Handle multiple PubChem matches with a candidate-selection interface
-   Show a research pipeline while data is being retrieved
-   Cache results during the current browser session
-   Protect newer searches from being overwritten by stale requests
-   Apply request timeouts to external API calls
-   Copy formulas, InChIKeys, and SMILES values to the clipboard
-   Responsive layout for desktop and mobile
-   English UI

## How it works

Compoundly Lab follows a multi-source lookup flow:

``` text
User query
    │
    ▼
PubChem name → CID lookup
    │
    ├── One match ───────────────► Fetch PubChem properties
    │
    ├── Multiple matches ────────► Show candidate picker
    │
    └── No match / error
              │
              ▼
        NCI Cactus fallback
              │
              ├── InChIKey available
              │       │
              │       ▼
              │   PubChem InChIKey → CID
              │       │
              │       ▼
              │   Fetch PubChem properties
              │
              └── No PubChem resolution
                      │
                      ▼
                Show Cactus data
```

For descriptions, Compoundly Lab first attempts to retrieve a PubChem
description. If one is not available, it falls back to Wikipedia.

The description source is kept separate from the primary chemical record
source so the UI can indicate where the information came from.

## Data sources

### PubChem

PubChem is the primary chemical data source.

Compoundly Lab uses the PubChem PUG REST endpoints for:

-   name-to-CID resolution
-   InChIKey-to-CID resolution
-   molecular properties
-   compound descriptions
-   2D structure images

Base endpoint:

``` text
https://pubchem.ncbi.nlm.nih.gov/rest/pug
```

### NCI Cactus

NCI Cactus is used as an alternate chemical resolver when a direct
PubChem lookup does not produce a result.

Compoundly Lab requests information such as:

-   molecular formula
-   standard InChIKey
-   IUPAC name

Base endpoint:

``` text
https://cactus.nci.nih.gov/chemical/structure
```

### Wikipedia

Wikipedia is used only as a description fallback.

The selected UI language determines the Wikipedia API used:

-   English: `en.wikipedia.org`

This means the chemical record itself is still resolved through the
chemical data sources, while the explanatory description can come from a
localized Wikipedia source.


## Running locally

No build system is required.

Clone the repository:

``` bash
git clone https://github.com/YOUR_USERNAME/compoundly.git
cd compoundly
```

Then open the HTML file in a modern browser.


## Project structure

The current application is intentionally small:

``` text
compoundly/
├── compoundly.html
└── README.md
```

The application currently contains its HTML, CSS, JavaScript,
translations, and UI in the single HTML file.

As the project grows, the code can be split into modules such as:

``` text
compoundly/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── api/
│   │   ├── pubchem.js
│   │   ├── cactus.js
│   │   └── wikipedia.js
│   └── i18n/
│       ├── en.js
│       └── it.js
└── README.md
```

That refactor is optional; the current single-file implementation keeps
deployment simple.

## Browser requirements

Compoundly Lab uses modern browser APIs including:

-   `fetch`
-   `AbortController`
-   `localStorage`
-   Clipboard API
-   modern JavaScript syntax

A current version of Chrome, Edge, Firefox, Safari, or another modern
browser is recommended.

Clipboard copying depends on browser permissions and security context.
If clipboard access is unavailable, the app reports the problem and the
value can still be selected manually.

## Error handling

External services can fail or return incomplete data. Compoundly Lab is
designed to degrade gracefully:

-   PubChem lookup failures can trigger the Cactus fallback.
-   Cactus results can be re-resolved through PubChem using an InChIKey.
-   Missing PubChem descriptions can trigger the Wikipedia fallback.
-   Individual candidate lookups are isolated so one failed candidate
    does not prevent the remaining candidates from loading.
-   Requests have a 12-second timeout.
-   A request ID is used to prevent an older search from replacing the
    result of a newer search.

Because the application depends on third-party public APIs, availability
and response behavior ultimately depend on those services.

## Caching

Compoundly Lab keeps a small in-memory cache for the current browser
session.

This avoids repeating identical lookups during the same session.

The cache is not intended to be a persistent chemical database.
Reloading the page clears the in-memory cache.

The selected language is different: it is stored in `localStorage` so
the user's language preference survives page reloads.

## Acknowledgements & Development Note

Compoundly Lab was built using AI-assisted development tools (such as Claude / ChatGPT etc...) for rapid prototyping and generating feature logic. I actively guided the architecture, manually debugged and patched code issues, especially in the UI, throughout development to ensure functional reliability and clean design. 

Compoundly Lab is built around publicly accessible chemical information
services including:

-   PubChem / National Center for Biotechnology Information (NCBI)
-   NCI Chemical Identifier Resolver (Cactus)
-   Wikipedia

Please consult the respective services' current terms, policies, and
attribution requirements before deploying or redistributing the
application.

------------------------------------------------------------------------

**Compoundly Lab** --- chemical compound research, simplified.
