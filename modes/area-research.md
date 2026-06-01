# Mode: area-research

Deep research on a specific neighborhood (freguesia, zona) to inform decisions.

## When to use

- User asks "tell me about [neighborhood]"
- Before evaluating a listing in an area the user hasn't bought in before
- When weighing two areas against each other
- When the user is considering broadening or narrowing their `preferred_areas` in profile.yml

## Inputs

1. The area name (freguesia, zona, or specific street)
2. `config/profile.yml` for buyer priorities (children, commute anchor, etc.)
3. `modes/_profile.md` for user-specific area map

## Research dimensions

Use WebSearch + WebFetch. Cite sources for every claim.

### Demographics & vibe

- Population density, age skew, family vs young professional vs students
- Recent gentrification trends
- Local Facebook groups or subreddits — what residents complain about

### Transit

- Closest metro stations, buses, train (CP)
- Walk time to user's `commute_anchor`
- Night transit (last metro, late buses)
- Carris carro reliability if relevant

### Daily life amenities

- Supermarkets (Pingo Doce, Continente, Lidl, Mercado X)
- Cafés and restaurants (Yelp / Google reviews count and recent ratings)
- Pharmacies, healthcare centers
- Banks, post office
- Gyms
- Green space (parks, public gardens)
- Pet-friendly amenities if user has pets

### Schools (if has_children = true)

- Public escolas: ratings (DGEEC), waiting lists
- Private and international options + price tier
- Crèches and infantário capacity in the area

### Future development

Critical and often ignored.

- Check the freguesia's PDM (Plano Diretor Municipal) updates
- Any approved construction projects in the next 5 years
- Metro line expansions, road widening
- Big urban regeneration projects (e.g. Marquês de Pombal redo, Beato Innovation District)
- Any large existing buildings recently sold for redevelopment

### Property market dynamics

- Current €/m² (apartments T2-T3, last 30-90 days), cite 3-5 sources
- 5-year trend in €/m² (INE Avaliação Bancária)
- Days on market (compare to city average)
- Buyer profile in the area (locals, expats, investors, AL)
- AL (Alojamento Local) saturation — high % of AL = noisier, more transient

### Risks

- Flood zones (LM near Tagus, low-lying parts of Lisbon)
- Earthquake risk + building age (pre-1958, pre-1985 less seismic)
- Heritage zone restrictions (Lisbon center is heavily regulated)
- Construction noise from ongoing big projects
- Specific known issues (e.g. specific streets with subway noise, specific buildings with disputes)

### Safety

Qualitative, not alarmist. Cite the Lisboa Mais Segura reports if available, or local crime maps. Distinguish actual crime from perception.

## Output

```
# Area research: {neighborhood}

## TL;DR
[3-4 sentences: who lives here, what it's like, who it fits]

## Fit for your profile
[Pulled from profile.yml + _profile.md]
- Commute: [time + mode] [✅ / ⚠️ / ❌ vs your target]
- Family / schools: [if has_children]
- Daily amenities: [verdict]
- Vibe: [matches your preference notes]

## Property market
- €/m² (last 30-90 days): €X-Y for T2-T3
- 5-year trend: +X% (vs Lisbon avg +Y%)
- Days on market: X (city avg: Y)
- Negotiation room: [tight / moderate / wide]

## Pros for you
- ...

## Cons / risks for you
- ...

## Future development
- [Projects + timeline + impact direction]

## Verdict
[Adjust your area_map in _profile.md? Suggest +0.X or -0.X]
```

## Rules

1. **Cite every claim.** No "the area is up-and-coming" without a source.
2. **Compare to user's anchors.** "5min walk to metro" is meaningless without their commute target.
3. **Surface non-obvious risks** (planned demolition next door, AL saturation) — that's where this mode earns its keep.
4. **Update `_profile.md` area_map** if the user agrees with the verdict.
