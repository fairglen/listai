# Buyer Profile Context -- listai

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Customize everything here: your archetypes, must-haves,
     deal-breakers, area weightings, contact and offer scripts.

     The system reads _shared.md (updatable) first, then this
     file (your overrides). Your customizations always win.
     ============================================================ -->

## Your Search Archetype

<!-- Pick the archetype(s) that best describe what you're hunting.
     You can mix two if applicable (e.g. "primary home + open to light renovation"). -->

| Archetype | What it means | Trade-offs |
|-----------|---------------|------------|
| **Primary home, move-in ready** | Buy and live, no works | Pay premium for finished product |
| **Primary home, cosmetic refresh** | Paint, floors, kitchen swap | 15-25% discount on asking, 3-6 months of work |
| **Primary home, deep renovation** | Gut and rebuild | 30-50% discount, 12-18 months of work, big cash outlay |
| **Investment / rental yield** | Buy to rent (long-term or AL) | Different scoring entirely — see Investment Framing below |
| **Second home / weekend** | Comfortable but not primary | Location and atmosphere over commute and schools |

**My archetype:** [fill in — e.g. "Primary home, cosmetic refresh"]

## Your Scoring Weights

<!-- Override the default 6-block weights. They should sum to 1.0.
     Default: each block 0.20 except listing match 0.10 + price 0.30 -->

| Block | Default | My weight |
|-------|---------|-----------|
| Listing match | 0.10 | [fill in] |
| Price | 0.30 | [fill in] |
| Location | 0.20 | [fill in] |
| Condition | 0.20 | [fill in] |
| Legal & process | 0.20 | [fill in] |

## Your Hard Must-Haves

<!-- Things you would NEVER buy without. Score gets capped at 3.5 if missing. -->

- [e.g. "Elevator if floor > 2"]
- [e.g. "South or west facing main rooms"]
- [e.g. "Parking included or possible to rent in same building"]
- [e.g. "Energy certificate C or better"]

## Your Deal-Breakers

<!-- Auto-reject. Score capped at 2.5. -->

- [e.g. "Ground floor with humidity signs"]
- [e.g. "AL license already issued (signals investment property)"]
- [e.g. "Building pre-1951 with no thermal insulation"]
- [e.g. "Direct view of busy arterial street"]

## Your Area Map

<!-- Score adjustment per neighborhood, on a +1 to -1 scale.
     +1 = bonus to global score, -1 = penalty.
     Use this when an area is great or terrible for you specifically
     (not as general data). -->

| Area | Adjustment | Why |
|------|------------|-----|
| Alvalade | +0.5 | Family there, walkable, good schools |
| Campo de Ourique | +0.3 | Calm, good food, slight premium |
| Arroios | +0.2 | Up-and-coming, good metro |
| Bairro Alto | -0.5 | Too loud at night |
| Olivais Sul | -0.7 | Too far, no commute fit |

## Bonus Signals (score boosters)

<!-- Non-obvious features that make a listing MORE attractive without being
     must-haves. These NUDGE the score up — they never reject a listing.
     Great for future-proofing: home office, growing family, guests, rental
     potential, or space you can finish later.

     Tune the "+x" to how much each is worth to you. -->

| Signal | Boost | Why it matters to me |
|--------|-------|----------------------|
| Spare / empty room | +0.3 | [e.g. "Home office without sacrificing a bedroom"] |
| Annex (anexo) | +0.4 | [e.g. "Guest space or independent rental unit"] |
| Convertible attic (sótão) | +0.2 | [e.g. "Extra room I can finish later"] |
| Convertible basement / cave | +0.2 | [e.g. "Storage or workshop potential"] |
| Garden / quintal | +0.4 | [e.g. "Outdoor space, pets, light"] |
| Terrace / terraço | +0.3 | [e.g. "Sunny outdoor, BBQ, plants"] |
| Patio / pátio | +0.2 | [e.g. "Private enclosed outdoor at ground level"] |

<!-- Add your own rows. Keep boosts modest (+0.1 to +0.5) so they bump
     ranking without overriding price, location, and condition. -->

## Your Comparable Sources

<!-- When the system needs to verify €/m² comparables, point it here.
     The more specific the better. -->

- **Idealista** (filter by same freguesia + same typology, last 30 days)
- **Casa Sapo** ("Estatísticas" section gives area €/m²)
- **INE** (Instituto Nacional de Estatística) — Avaliação Bancária quarterly stats
- **Confidencial Imobiliário** — paid but authoritative
- **My own records** — `reports/` has past evaluations with €/m² calculated

## Your Contact Script Adaptations

<!-- Override the templates in `templates/contact-template.md` if needed.
     Keep your voice. -->

- **Tone:** [e.g. "direct, slightly formal, no smileys"]
- **Phrases I always use:** [e.g. "Aguardo a sua resposta", never "Fico a aguardar"]
- **Phrases I never use:** [e.g. "Saudações cordiais"]
- **Signature:** [e.g. "Maria — 912 345 678"]

## Your Offer Strategy

<!-- Override the offer template in `templates/offer-letter-template.md` if needed. -->

- **Opening anchor:** [e.g. "85% of asking unless €/m² is already at or below comparables"]
- **Walk-away rules:** [e.g. "Walk if seller won't move 3% off asking on a listing that's been on market 60+ days"]
- **Closing date target:** [e.g. "60 days from CPCV"]
- **Standard contingencies:** [e.g. "Financing approval + clean title"]

## Your Visit Checklist

<!-- Custom things you always check during a visit, beyond the standard ones.
     The system will surface this in visit-prep mode. -->

- [e.g. "Window quality and double glazing"]
- [e.g. "Bathroom ventilation — open or only mechanical?"]
- [e.g. "Noise test: stand in living room with windows closed and open"]
- [e.g. "Water pressure — flush toilet while running tap"]
- [e.g. "Cell reception in every room"]
- [e.g. "Light in main rooms at 10am AND 5pm — visit twice if possible"]

## Your Risk Posture

<!-- How much complexity you can absorb. -->

- **Renovation appetite:** [1-5, see profile.yml]
- **Legal complexity:** [1-5, e.g. "Won't touch heredades, OK with simple ónus"]
- **Condo politics:** [1-5, e.g. "Avoid buildings with ongoing assembly disputes"]
- **Market timing:** [e.g. "Will wait 6 months for the right fit, won't rush"]

## Investment Framing (only if archetype = investment)

<!-- If you're buying to rent, the scoring shifts.
     Delete this section if it doesn't apply. -->

- **Target gross yield:** [e.g. "5%"]
- **Target net yield after costs:** [e.g. "3.5%"]
- **Rental strategy:** [long-term residential / mid-term corporate / AL]
- **AL licensing situation:** [check current municipal restrictions per freguesia]
- **Comparable rents source:** [Idealista rental section, filter by same area + typology]
