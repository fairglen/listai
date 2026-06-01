# Mode: visit-prep

Generate a focused checklist for visiting a property the user has scheduled to see.

## When to use

- When the user says "prep for visit to [listing]"
- When tracker status moves to `Visit Scheduled`

## Inputs

1. The listing report (`reports/{num}-{slug}-{date}.md`)
2. The buyer profile (`config/profile.yml`) — for personal must-haves and risk posture
3. `modes/_profile.md` — for user's custom visit checklist

## Output

A printable checklist organized by phase: before arriving / during the visit / immediately after.

### Before arriving (research)

- [ ] Walk the neighborhood at a different time of day than the visit
- [ ] Cross-check listing photos against Google Street View — any mismatch?
- [ ] Check `PDM` (Plano Diretor Municipal) for any planned development in the next 5 years
- [ ] Recent sales in the building / street (Idealista price history, Casa Sapo)
- [ ] Look up the building on Google reviews, Facebook groups, complaints sites
- [ ] If pre-2004: check if Ficha Técnica de Habitação exists

### Specific questions to ask the agent

Generated from Block F gaps in the report:

- [ ] Year of last major renovation (kitchen, bathrooms, electrical, plumbing)
- [ ] Energy certificate letter — request the certificate document, not just the letter
- [ ] Condomínio: monthly quota, last 2 assembly minutes, any pending special assessments, reserve fund balance
- [ ] Any ongoing or planned building works (fachada, telhado, elevador maintenance)
- [ ] Reason for sale (probate? divorce? upgrade?)
- [ ] How long on market, any prior offers fallen through
- [ ] If apartment: which neighbors are owners vs renters, any AL units in the building
- [ ] If house: roof, foundation, drainage history
- [ ] If pre-1980: thermal insulation status, any humidity issues, fenestration plan

### Things to test during the visit

- [ ] **Light** — open all blinds. Stand in main rooms at the agreed visit time. Note shadows.
- [ ] **Noise** — close all windows. Listen for 30 seconds. Then open them. Note delta.
- [ ] **Water pressure** — flush a toilet while running the kitchen tap and a shower. Watch the pressure drop.
- [ ] **Hot water time** — open hot tap, count seconds until it's actually hot.
- [ ] **Window/door seal** — close them. Stand by them. Feel for drafts.
- [ ] **Cell reception** — check signal bars in every room, especially bedroom and kitchen.
- [ ] **Smell** — humidity, mould, sewage, cooking smells from neighbors. Note kitchen extractor.
- [ ] **Building entry and stairs** — clean? cared for? Smells? Mailbox status?
- [ ] **Garage / parking** — actually measure with your phone if your car needs it. Idealista parking dimensions lie.
- [ ] **Balcony / terrace** — what's the view (look up AND down). Wind exposure. Sun hours.
- [ ] **Closets and arrumos** — open them all. Often hide damp.
- [ ] **Electrical panel** — modern (disjuntores diferenciais) or fuses?
- [ ] **Boiler / aquecimento** — type, age, last service.

### User-specific checks

Pulled from `modes/_profile.md` → "Your Visit Checklist":

[The system inserts the user's custom items here]

### Photos to take

- [ ] Energy cert document (in full)
- [ ] Caderneta predial if shown
- [ ] Electrical panel
- [ ] Boiler/water heater nameplate (model + serial)
- [ ] Any visible cracks or damp stains
- [ ] Each room from the door
- [ ] View from main windows
- [ ] Building exterior + entrance
- [ ] Address sign (proof of which building you visited)
- [ ] Floor plan if the agent has one printed

### Immediately after (within 1 hour)

- [ ] Update the report with a `## Visit notes ({date})` section. Use voice memo on the way home if needed.
- [ ] Rate each block A-G again with the new information.
- [ ] Update tracker to `Visited`. Decision lane: pursue / pass / second visit needed.
- [ ] If pursuing: draft offer (mode `offer`) within 24h.
- [ ] If passing: log the reason. Patterns matter — over 10 visits you'll spot what consistently disqualifies a property.

## Red flags during visit (auto-escalate)

- Owner pressured agent to skip a room or area
- Agent says "the certificado energético will come later"
- Visible structural cracks (not just plaster cracks) on load-bearing walls
- Strong humidity smell, especially in bathrooms or kitchen
- Agent refuses to share the caderneta predial or licença de utilização
- Asking price has dropped 20%+ recently with no clear reason
- Building has no caretaker (porteiro) AND has known security issues in the area

If any of these → flag in the post-visit update and reconsider score.
