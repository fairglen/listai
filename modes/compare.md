# Mode: compare

Compare 2+ listings side-by-side and recommend a ranking.

## When to use

- User says "compare these listings: [urls or report nums]"
- User asks "which of these should I visit first / offer on first"
- After 3+ evaluations in the same area, periodically to keep the funnel sharp

## Inputs

1. The reports being compared (`reports/{num}-{slug}-{date}.md` each)
2. `config/profile.yml` and `modes/_profile.md` for weights

## Process

### Step 1 — Build the matrix

Tabulate every dimension from Blocks A-F side-by-side.

| Dimension | Listing A | Listing B | Listing C | Winner |
|-----------|-----------|-----------|-----------|--------|
| Area | Alvalade | Campo de Ourique | Arroios | A (per profile preference) |
| Typology | T2, 78m² | T2, 72m² | T3, 90m² | C (more space) |
| Price | €380k | €395k | €410k | A |
| €/m² | €4,872 | €5,486 | €4,556 | C |
| Floor | 3rd / 5 | 1st / 4 | 4th / 6 | A or C |
| Building year | 1992 | 2003 | 1985 | B |
| Energy cert | C | B | D | B |
| Renovation needs | Cosmetic | None | Kitchen + bath | B |
| Estimated works | €15k | €0 | €25k | B |
| Total cost (price + works) | €395k | €395k | €435k | A or B tied |
| Score | 4.2/5 | 4.4/5 | 3.8/5 | B |
| Days on market | 18 | 45 | 72 | A (fresh, but C has most leverage) |
| Negotiation room | Low | Medium | High | C |

### Step 2 — Trade-off analysis

For each pair (A vs B, A vs C, B vs C), name the key trade-off in 1 sentence.

Example:
> A vs B: A gives you a better area and lower €/m², B gives you better condition and no renovation hassle. If user has €15k renovation budget and 6 months of patience, A wins on lifetime value. If user needs to move in within 60 days, B wins.

### Step 3 — Recommendation

Three-tier:

1. **Visit first:** [The one with highest score AND lowest negotiation risk]
2. **Visit if first one disappoints:** [The backup]
3. **Skip or monitor:** [Lower fit ones]

Justify in 2-3 sentences using the buyer's profile, not abstract reasoning.

### Step 4 — Sequencing tactic

If multiple are strong:
- Visit the one with HIGHEST score but LEAST negotiation room first (fewer surprises)
- Visit the one with MOST negotiation room second (use the first visit's data to calibrate)
- This builds your area benchmark before you commit emotionally to anything

If the user already has an emotional favorite:
- Visit the others first to test the favorite against alternatives
- Avoids confirmation bias

## Output

```
# Comparison: {N} listings

## Matrix
[Table]

## Trade-offs
- A vs B: ...
- A vs C: ...
- B vs C: ...

## Recommendation
1. Visit first: [name + report link]
2. Visit second: [name + report link]
3. Skip or monitor: [name + report link]

## Why
[2-3 sentences tied to buyer profile]

## Sequencing
[1-2 sentences on the order]
```

## Rules

1. **Use the buyer's actual weights from `_profile.md`.** Don't apply default weights if user has overridden them.
2. **Surface non-obvious trade-offs.** "B is better" is not insight. "B is better unless the user values neighborhood walkability over building condition" is insight.
3. **Don't recommend skipping a high-score listing just because another is higher.** Compare absolute fit to threshold (3.5/5), not relative to peers.
4. **Note when listings are not really comparable.** Different areas, different typology, different price tiers. Sometimes the answer is "these aren't substitutes; you're choosing strategy, not a property".
