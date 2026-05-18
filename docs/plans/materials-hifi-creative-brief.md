# Materials¹ — Hi-Fi Creative Brief

A creative brief for the design stage. Sets up the story, the audience, the aesthetic direction, and the voice. Then, for each section, the **job** the section needs to do for the buyer plus **three creative directions** to consider. Pick one per section, mix between them, or propose a fourth — but every section has to land its job. Optimise for the buyer feeling *I want this and I need this*, not for visual cleverness.

Layouts, dimensions, specific motion mechanics, type sizes, and palette specifics are open. Decide them in service of the directions you choose.

---

## Who this is for

Designers — UI, brand, motion, indie product builders — whose work currently looks like every other gradient-mesh SaaS site, and who feel it. The same designers, when they reach for Midjourney for something custom, get frustrated by generic AI outputs because they have nothing strong to use as a style reference.

They want their work to feel like *theirs.* They don't want shortcuts that look like shortcuts. They want a body of visual character they can apply across many projects without it ever looking like a stamp.

## What the product is

A library of 160 Materials — abstract 3D textures shipped as stills, video loops, and transparent PNGs. They go directly into design work (as backgrounds, surfaces, motion beds, brand textures, packaging fills, deck atmospheres, social posts — anywhere a designer reaches for something). They also work as Midjourney style references — feed a Material to MJ alongside a prompt and the generated image picks up the Material's character instead of defaulting to AI house style.

$9, paid once. There's also a free pack — Dark Materials — which is 10 of these same Materials and acts as the no-risk way in.

## The story the page is telling

Most designers don't want a texture pack. They want a *body of visual character that's theirs* — something they can apply across all their work so what comes out the other end stops looking generic. Materials gives them that, with a useful twist: the same source library works in two tools (their design tools and their AI tools). So the design work and the AI-generated work end up sharing a visible family resemblance — something stock textures and default Midjourney can't give them.

The page should make the buyer feel two things, in this order:

1. **"I want my work to look like that."** (Earned through what they see — the Materials themselves, in context, in motion.)
2. **"And that's actually mine to apply to anything I make."** (Earned through what they understand — that this isn't 160 wallpapers but 160 seeds that multiply through use.)

If the buyer leaves with both, they buy. The page's job from top to bottom is delivering them.

---

## Aesthetic direction

**The hero is built — it locks the page's core character.** Pure black background. The Material itself is the only heat source — the surrounding chrome is cool and quiet. A faint blue gradient bleeds up from the bottom edge as the entire page-level atmosphere. The inversion is the design's smartest move: by keeping the page chrome cool and restrained, the warm / iridescent / vibrant Materials become the page's primary colour. The page is the dark studio backdrop; the Materials are the specimens lit inside it.

The hero also establishes three character moves the rest of the page should inherit:

- **Asymmetric composition.** Brand mark left of the Material, body copy right of it — the Material itself in the centre as the page's first "specimen." Following sections should keep this off-centre, editorial pace rather than centring everything.
- **Plus Jakarta Sans throughout**, with personality injected through a single-word iridescent gradient ("creative" rendered in a purple-to-pink fade). This is the closest thing the type system has to ornament. Reserve it for **one accented word per section maximum** — it stops working if it appears everywhere. The accent palette should be drawn from the Materials themselves (the same iridescents that appear on the actual textures), so the typography and the product visibly belong to each other.
- **A cool dark page, no warm atmospheric backgrounds.** The bottom-edge blue bleed is the entire page-level atmosphere. No amber horizons, no warm hero glows. The Materials carry all the warmth — and they only get to do that because the page chrome refuses to compete.

**Adjacent references for moves the hero doesn't show:**

- **Linear** — asymmetric editorial layouts in body sections (headline far left, body far right), restraint as personality, and `FIG. 3.7`-style catalog framing of figures. Render those captions in Plus Jakarta Sans caps with tight tracking, *not* mono.
- **Origin** — how specimens get presented as strips and cards. The bottom row of Origin's spending page (textured cards: blue gradient, brown leather, teal abstract) is the closest existing reference to how the Materials library section should feel.
- **Antimetal** — the thin technical grid lines in its hero radar (fine concentric arcs and dot patterns reading as scientific instrumentation). These translate directly to Materials: the element-box system is borrowed from the periodic table, and thin grid lines reinforce the scientific-catalog framing throughout the page. See "Technical grid lines" below for the primitive.

**Don't borrow:**

- Origin's eclipse or Antimetal's literal constellation / radar dots as compositions — too signature to those sites, would read as derivative.
- Serif italic display headlines (Origin's signature move). The gradient-word treatment is doing that job.
- Neon-lime CTAs (Antimetal's signature move). Button accents should come from the Materials' own iridescent palette, not a separate brand colour.
- Warm gradient page backgrounds. The hero has committed to a cool dark page; following sections match.

**The risk to push against:** dark cinematic editorial is the current default for AI-adjacent landing pages. Linear, Vercel, Anthropic, and a hundred others all sit in this zone. The defenses are (a) the catalog primitives — the element-box system, the technical grid lines, the pack manifest at the close — (b) the actual visual character of the Materials themselves, and (c) a confident designer-to-designer voice that doesn't read like a startup template.

---

## Element-box system (a site-level visual hook — not a product attribute)

**Important caveat first:** the Materials themselves don't ship with element-style designations. There's no model number on file, no periodic-table metadata in the product. The element-box system is something we're inventing *for the site* as a visual marketing hook — applied to each featured Material on the page to thread catalog energy through the design.

With that clear: each Material featured on the page gets an invented three-digit ID, two-letter symbol, and category name. E.g. `014 / Mt / matte`, `027 / Gl / gloss`, `051 / Cr / chrome`. These element boxes are the page's strongest single design idea — they cast each Material as a *specimen* in a catalog, threading catalog energy through whichever directions you pick.

Use them as design objects throughout — labels on Material thumbnails, captions in copy, metadata in interactive elements. Three sizes, three contexts is the constraint: don't apply them everywhere or the system flattens into decoration.

Categories to work from (expand if useful): Mt matte · Gl gloss · Cr chrome · Fl fluid · Or organic · Vb vibrant · Ds dust/textured · Ic iridescent.

A note on honesty: because these designations are invented for the site, they shouldn't appear inside the downloaded product (file names, the Figma file, the Gumroad listing). Keeping them site-only protects the device — it reads as editorial framing rather than overpromising a system the product doesn't deliver.

---

## Technical grid lines (paired primitive with the element-box system)

Thin, low-intensity grid lines threaded through the page as a recurring background motif. Concentric arcs, fine dot patterns, ruled hairline grids, occasional radial fans, light tick marks at key axis points. They should read like instrumentation diagrams or periodic-table reference plates — *scientific catalog*, not *blueprint*.

The grids and the element-box system are paired primitives. Element boxes say *"this Material has a designation"*; grid lines say *"this is the reference field that designation lives in."* Together they carry the periodic-table identity the brief leans on. Either one without the other reads weaker than both together.

**Where they live:**
- Behind hero compositions (subtle — barely there, but present)
- Behind library and specimen sections (slightly stronger, to support the catalog framing)
- Around feature cards or figures (as tick marks, axis labels, or framing rules — never decoration for its own sake)
- Cross-section dividers where useful

**How they're rendered:**
- Hairline weight only — 1px or sub-1px
- Cool grey or muted blue tone, kept low contrast against the dark page
- Never carrying the eye's attention — they're texture, not content
- Plus Jakarta Sans caps for any associated labels (axis values, figure numbers, coordinates)

**What they aren't:** decorative pattern fills, Bauhaus-grid layouts, blueprint aesthetics, mathematical formula overlays. The reference is *understated instrumentation* — what you see in a quiet corner of a scientific reference book, not what you see on a startup's "we're technical" hero.

---

## Voice

Warm, casual, designer-to-designer. Not corporate. Not breathless. The buyer is a peer — talk to them like one.

**Banned words (no exceptions):** unlock, elevate, supercharge, transform, seamlessly, effortlessly, robust, powerful, comprehensive, breathtaking, game-changing, revolutionary, level up, take to the next level, cutting-edge, next-gen.

**Don't lead with "AI-powered" or "AI-generated assets."** Materials are *for* AI work as much as *of* AI work. Lead with what they are; the AI angle earns its place when the dual-use story is being told, not as the headline framing.

The words "stunning" and "curated" appear inside customer testimonials — those are kept verbatim. They're banned from your copy, not from quoted ones.

---

## Sections

Eight sections. Section ordering is locked because the funnel logic depends on it. §01 is also locked (the hero is built — see below). For §02 onwards, content and treatment are open — pick a direction per section, blend, or propose a fourth.

### 01 — Opener (BUILT)

**Status:** Built. This section is no longer a direction to choose between — it's locked. The brief still describes it here because the hero establishes the design language every following section has to match.

**What's there:**

- Pure black background with a faint cool blue gradient bleeding up from the bottom edge — the entire page-level atmospheric move.
- One hero Material centred: a glass-and-iridescent popsicle, warm amber-orange interior, lit so the warmth radiates from inside the Material itself.
- "Materials" set left of the Material in Plus Jakarta Sans bold.
- Sub-headline set right of the Material in Plus Jakarta Sans regular: *"Visual ingredients for designers, motion artists, and creative explorers."* The word "creative" rendered in a purple-to-pink iridescent gradient — the type system's first instance of the gradient-word accent move (now locked as the page's recurring personality move).
- Asymmetric three-part composition: brand mark / Material / sub-headline. Editorial pace; nothing centred.

**What the hero commits the rest of the page to** (full version in the Aesthetic direction section; restated here as anchor):

- Page chrome stays cool and dark; Materials are the only heat source.
- Plus Jakarta Sans throughout, with single-word iridescent gradient accents as the type system's only ornament.
- Asymmetric, editorial compositions — not centred SaaS templates.

**Open questions on the hero itself** (worth resolving before launch, not before continuing the rest of the brief):

- The screenshot doesn't show the primary CTA (`Get Materials¹`), the price ($9), or the secondary free-pack link. The brief's standing requirement is for these to be visible in the first four seconds without scrolling. Are they below the fold of this screenshot, deferred to a second beat, or yet to be added? If deferred, the four-second requirement needs revisiting honestly.
- Does the hero's bottom blue gradient continue into the next section, or does §02 start on pure black again? Either is defensible; pick deliberately.
- Mobile: how does the three-part horizontal composition restructure at 375px? Likely candidates are stacked (brand mark top → Material centre → sub-headline below) or a tighter overlay. Worth confirming.

### 02 — The pitch

**Job:** Lock the dual-use thesis in the buyer's head. One pack, two purposes. Purpose one — drop a Material into creative work (hero sections, app and dashboard surfaces, brand visuals, motion beds, decks). Purpose two — feed the same Material to Midjourney as a style reference and generate custom visuals that share its character. Same library, both jobs. By the end of this section the buyer should be able to say back what Materials are *for*.

This is the page's core thesis. Don't bury it in strategic framing or clever positioning — show it plainly.

**Direction A — Side-by-side.** Two halves of the screen, one source Material shared between them. Left: the Material applied in a design context (hero section, app background, dashboard surface — pick what reads cleanest). Right: the same Material used as a Midjourney style reference, with the resulting AI generation visible alongside. The literal claim, made literally. Argument: *same source, two jobs, no ambiguity.*

**Direction B — One source, fanning out.** A single Material sits at the centre. Two outputs flow from it — one a finished design, the other an AI-generated visual. The Material is visibly the hub. Could be static (printed-diagram look — Material centre, two paths out, two outputs) or scroll-driven (the Material holds while the two outputs assemble around it). Argument: *the library is the source; everything you make can come from here.*

**Direction C — Two demos, one Material.** A two-beat sequence. First beat: the Material dropped into a design context — finished, captioned for design work. Second beat (immediately after, same Material): the Material uploaded to Midjourney, the result generating, captioned for AI work. Two demos, one Material, end-to-end. Argument: *here's what each one actually looks like in practice.*

Across all three: keep the *same* Material on screen through both demonstrations. The point isn't that Materials *can* do both — it's the same Material doing both. Switching Materials between the design demo and the MJ demo loses the thesis.

### 02·5 — Proof moment

**Job:** The first interactive proof. The buyer needs a tactile, undeniable demonstration that what was just claimed is real. Should leave them thinking *"okay, that actually works"* — not *"okay, sounds nice."*

**Direction A — The slider.** A draggable comparison: one design (a hero, an app surface, a brand layout — designer's call) shown with a stock background vs the same design with a Material applied. Same copy, same layout — only the source changes. Argument: *see the difference yourself, with your hands.*

**Direction B — The cycler.** A small carousel or rotator showing the same comparison across multiple design contexts (e.g. hero, app screen, deck slide, social post, brand surface). Each can be compared with a click or swipe. Argument: *this isn't a special-case improvement. It works across everything you make.*

**Direction C — The transformation strip.** A scroll-driven before-to-after sequence — the same project transforming from stock-looking to Material-treated as the user scrolls. Less interactive but more cinematic. Argument: *watch the work change.*

The point of 02·5 isn't the *mechanism*; it's the moment the buyer feels the difference. Pick whichever direction makes that feeling unavoidable.

### 03 — The library

**Job:** Show the actual scope and variety. Make 160 feel like an asset, not a number on a page. Get the buyer attached to *specific* Materials — once they're picking favourites, the close gets easier.

**Direction A — Specimen catalog.** The library treated as a museum of specimens. Each Material gets its (site-invented) element-box designation and category. Browseable somehow — by mood, by use, by colour, by style — with the catalog energy front and centre. Argument: *this is curated, not dumped. There's intent behind every entry.*

**Direction B — The free-form gallery.** Less structured — a cinematic, motion-y wall of Materials moving past at varying speeds and sizes. Less to read, more to feel. The library is too big to absorb fully on this page, and that's the message. Argument: *the scale speaks for itself.*

**Direction C — Style guides.** Materials grouped by usable mood ("monochrome", "chrome & metallic", "warm & organic", "high-contrast graphic", "soft & dreamy"). Each group is a mini moodboard. Argument: *you don't have to figure out how to use these — they're already organised into directions you can apply.*

The MPH Sound testimonial — *"Every one of the materials in this pack are pristine. Mesmerizing all on their own. And even more excellent is when it's used as a style reference for further prompting and personalizing. Worth every penny."* — sits naturally in this section. Place it where it lands hardest.

### 04 — How it works

**Job:** Reduce activation energy. Buyer should leave thinking *"I could use this tomorrow."* No more than three steps in any treatment. Spec sheet, not tutorial.

**Direction A — Two workflows side by side.** Design tool flow on one side, AI tool flow on the other. Both shown in actual interface mocks. Three steps each, mirrored. Argument: *one library, two paths, both equally simple.*

**Direction B — Single annotated walk-through.** One imagined project (e.g., "designing a mock brand from scratch") followed end to end, showing the Materials at every step — first as a moodboard reference, then as a UI background, then as a Midjourney style ref for the brand's hero visual. Argument: *one library, used four times in one project.*

**Direction C — Quick-start recipes.** Three concrete recipes, each a one-line setup: *"Want a hero background? Drop M-014 into Figma."* / *"Want a brand-specific character render? Use M-027 as a Midjourney style ref + your prompt."* / *"Want a Notion cover? Crop and ship."* Argument: *no learning curve. You're already capable.*

### 05 — What changes

**Job:** Get the buyer picturing themselves *after* purchase. Make the future feel inevitable. Show the work — actual outcomes from using Materials.

**Direction A — Levels of use.** Show usage at increasing depths — light (one Material in one project), medium (a Material running across a small project), deep (whole brand systems built on Materials). The library scales with the buyer's ambition. Argument: *you can buy this for one project and end up using it for ten.*

**Direction B — By design type.** What changes for UI work, for brand work, for motion, for AI generation, for decks, for social. Each gets its own moment with concrete examples. Argument: *whatever you make, this fits.*

**Direction C — The outputs gallery.** Real finished work made with Materials, with credits where permission exists. (Currently sparse — would mean chasing permissioned examples, possibly post-launch.) Argument: *other designers already shipped with this. Here's what they did.*

The Andrew Ashton testimonial — *"Amazing! Thanks for the great work Danny, so many beautiful animations."* — sits naturally in this section.

### 06 — Proof

**Job:** Make trust effortless. The numbers are unusually strong (4.95★ across 16 reviews — paid pack 5.0★ from 8, free pack 4.9★ from 8 — zero ratings below 4★). Use them. Anchor with the human voice.

**Direction A — The number plus the human.** Lead with the rating stat at scale. Anchor with one strong testimonial (Eric Kerr is the strongest single-voice candidate). Plain, confident. Argument: *the numbers are the argument; the person makes them feel real.*

**Direction B — The wall of voices.** Multiple short testimonials laid out as a pinboard or stack — emphasises the *consistency* of the response across reviewers. Argument: *no one's lukewarm about this.*

**Direction C — The free pack as proof.** Lean entirely on the free pack rating (4.9★) as an anti-hype move. *"Don't believe me — the free pack is 10 of these same Materials. It's rated 4.9★. If that's not the quality you wanted, the paid pack won't be either. You decide."* Argument: *I'm not trying to convince you. I'm telling you to test me.*

Featured testimonial copy: *"Stunning and thoughtfully curated collection of visuals. Excited to incorporate them into a variety of client projects."* — Eric Kerr.

### 07 — Doubts

**Job:** Defuse the three real worries before the close. The worries (in roughly the order they come up):

1. *I can generate these in Midjourney myself for free.*
2. *Who's Danny? Is the quality actually real?*
3. *160 is overkill — I'll use five and the rest will sit on a hard drive.*

**Direction A — Plain Q&A.** Three questions, three answers, in the same warm voice as the rest of the page. Open by default, or accordion. Honest, not defensive. Argument: *the answers are good enough that hiding them would be the weak move.*

**Direction B — Counter-frame.** Each worry gets reframed rather than rebutted. Not *"here's why your concern is wrong"* but *"here's why your concern is actually backwards."* (E.g. "160 is overkill" → "160 isn't a checklist, it's 160 starting points for AI work.") Argument: *confidence — these aren't problems, they're features misread.*

**Direction C — The conversational frame.** Render as a designer-to-designer chat. Skeptical voice on one side, honest answers on the other. More personable, riskier — reads as gimmicky if not handled well. Argument: *talk to a real person, not a FAQ.*

Answers in detail (from the existing copy) live in `materials-landing-page-copy.md` — port them through whichever direction.

### 08 — Close

**Job:** Show what's in the box, make the choice obvious, close.

**Direction A — Pack manifest plus chooser.** Full pack inventory at the top, treated like a product spec sheet (3 hero items: stills / video loops / transparent PNGs — plus Plus / Bonus / Includes columns with all of Danny's emoji 🌄 🎥 👻 ✨ 🦸‍♂️ ✏️ 🎓 🛠️ 📁 ⚡️ 🙋‍♂️ — they carry the brand voice, keep them). Two cards beneath — Paid (Materials¹, $9) and Free (Dark Materials, free) — equal real estate, visual inversion does the signaling. The most explicit version. Argument: *here's exactly what you get for $9, and here are both ways in.*

**Direction B — Just the offer.** Strip everything back. One striking Material image at scale, the price, the button. A small "or grab the free pack" link beneath. Confident-close move. Argument: *you've seen everything. You don't need another pitch — you need a button.*

**Direction C — The decision tool.** Treat the close as a comparison: Buying vs Trying — what each path gets you, side by side, equal weight. Argument: *clarity for the buyer who's still on the fence.*

Standing copy if Direction A is chosen — pack manifest contents (from Danny's Gumroad listing): 160 stills + 160 transparent PNGs + 160 video loops, 5× 4K loops, 3× hero designs for web, 9× UI card templates, mini guide on using Materials in AI, three prompts to make your own, Figma file, lifetime updates, support.

Closing sign-off: *"Have fun ✌️ — Danny"* — small, warm.

---

## Cross-cutting principles (loose, not prescriptive)

**Motion philosophy.** Two motion-heavy moments per page, max. The rest is calm. Save motion for where it carries an argument — the transformation, the comparison, the kinetic library. Don't add motion for atmosphere alone.

**Page-level atmosphere.** The hero's faint cool bottom-edge gradient is the *entire* page-level atmospheric move. Don't add warm horizon glows, additional ambient washes, or section-by-section atmospheric spots. The page chrome stays cool and quiet; warmth and colour come from the Materials themselves and the gradient-word type treatment. If a section feels visually flat, the answer is a stronger Material or a better composition — not an added glow.

**Typography.** Plus Jakarta Sans throughout — display, body, metadata, element-box content, everything. One typeface means the catalog/specimen feel has to come from weight differential, size ratios, caps + tracking on metadata, and the element-box layout itself. Lean harder on those than you would in a multi-typeface system; they're what's carrying the catalog energy.

The hero locks one additional move: **a single accented word per section, rendered in an iridescent gradient drawn from the Materials' own palette** (the hero uses purple-to-pink on "creative"). This is the type system's only ornament. Rules: one word per section maximum, never on a section opener, never on metadata or captions — only on display or lead copy where a single word can carry emphasis. The gradient values should sample from actual Material colours so the typography and the product read as one system.

**Materials must include warm and vibrant ones — load-bearing.** Because the page chrome is committed to cool dark with no warm atmospheric backgrounds, the Materials themselves are carrying *all* the page's colour and warmth. If every featured Material is dark/chrome/iridescent-cool, the page reads cold, flat, and one-note. Across the library section, the close, and any feature/specimen moment, ensure a mix that includes warmer pieces (the amber, copper, organic, vibrant Materials) alongside the moodier ones. This isn't a nice-to-have — it's structural to the design working.

**Mobile.** Every section ships on mobile. None hidden, none radically restructured. Touch-native interactions where applicable. The brand aesthetic — dark, cool, specimen-catalog editorial with Materials carrying all the warmth — has to hold up at narrow widths.

**Accessibility.** Reduced-motion fallbacks for any scroll-driven moment. Keyboard support for any interactive element (sliders, carousels, accordions). ARIA-correct markup throughout. Decorative element boxes are `aria-hidden`.

---

## Standing assets and content

**Real testimonials (verbatim — keep accents and punctuation):**

- *"Every one of the materials in this pack are pristine. Mesmerizing all on their own. And even more excellent is when it's used as a style reference for further prompting and personalizing. Worth every penny."* — MPH Sound (place near the dual-use thesis)
- *"Stunning and thoughtfully curated collection of visuals. Excited to incorporate them into a variety of client projects."* — Eric Kerr (strongest single-voice anchor)
- *"Amazing! Thanks for the great work Danny, so many beautiful animations."* — Andrew Ashton (place near the motion / outcomes section)

**Real numbers:** Materials¹ paid pack — 5.0★ from 8 reviews. Dark Materials free pack — 4.9★ from 8 reviews. Combined: 16 reviews, 4.95★ average, zero below 4★.

**Volume framing:** Top-right corner reads `© 2026 · Volume 01`. Materials¹ is positioned as Volume 01 of an ongoing series — leave that frame in place. The numbered/catalog energy of the page leans on it.

**Free pack URL:** `https://dannystuart.gumroad.com/l/Dark-Materials-Abstract-Design-Textures`
**Paid pack URL:** `https://dannystuart.gumroad.com/l/Materials-Edition-1`

---

## Not on the page

- Customer screenshots from named brands (none permissioned)
- Founder photo or about block
- Comparison table vs other texture packs
- Newsletter modal, exit-intent overlay, demo pop-up
- Social proof claims that aren't backed by real numbers (no "trusted by 10,000+" if it's actually ~25)
- Testimonials beyond the three above unless real ones come in before launch

---

## Decisions to converge on after directions are picked

Once you've selected directions per section, the following need to be locked before build:

1. Typography scale and weights — Plus Jakarta Sans throughout. Lock the type scale (display / h1 / h2 / h3 / lead / body / caps / micro), weight assignments per role, and the tracking treatment for any caps usage (element-box content, section labels, button text).
2. Element-box assignments — the invented designation each featured Material gets on the page (estimated 12-20 needed depending on directions chosen). Decide whether the assignments stay stable across the page (so a given Material always reads as the same `0XX / Xx`) or vary by section.
3. Gradient-word accent palette — pick 2–3 iridescent gradients sampled from actual Materials (the hero uses a purple-to-pink fade on "creative"). Lock which gradient goes with which section so the accent feels deliberate rather than random.
4. Verifiable customer count for any "designers using it" claim, or revise to a number that's actually true (newsletter subscribers — 100+ — is honest; "2,400+" needs reconciliation against actual download totals)
5. Whether direction picks need additional Material assets (e.g., warm/vibrant Materials specifically chosen for the close hero shot and library section, customer-output examples for §05 if Direction C is chosen)

---

## What the page is ultimately for

A buyer landing here cold should leave the page in one of three states:

1. They bought Materials¹.
2. They downloaded the free pack and are now on the email list.
3. They left, but they remember the page.

Anything that doesn't push toward one of those three is decoration. When choosing between directions per section, the test is which one most reliably produces those outcomes — not which one is most visually interesting in isolation.
