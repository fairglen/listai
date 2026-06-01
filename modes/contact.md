# Mode: contact

Generate a first-contact message to the listing agent.

## When to use

- After an evaluation with score ≥ 4.0
- When the user says "draft contact for [listing]"
- When updating tracker status to `Contacted`

## Inputs

1. The listing report (`reports/{num}-{slug}-{date}.md`)
2. The buyer profile (`config/profile.yml`)
3. The user's voice from `modes/_profile.md` ("Your Contact Script Adaptations" section)
4. The template (`templates/contact-template.md`)

## Output

A draft message ready for the user to copy-paste into the portal contact form, email, or WhatsApp.

**Format:**

```
Channel: [portal form / email / WhatsApp]
Length: [N sentences]
---
[draft message body]
---

Notes:
- [Any agent-specific context — e.g. "agent has 4 other Alvalade listings, mention you're focused on this area"]
- [Visit windows pulled from user availability, if known]
- [The ONE question prioritized based on Block F gaps from the report]
```

## Rules

1. **One ask per message.** Visit + one question. Never two questions.
2. **No price talk.** First contact is about getting in the door, not negotiating.
3. **No salary disclosure equivalent.** Don't disclose your max budget. Stay vague: "in your range".
4. **Specific windows.** "Saturday 10-12 or Sunday 14-16" beats "let me know what works".
5. **Match the channel.** Portal form → 4-6 sentences. Email → can be slightly longer. WhatsApp → 2-4.
6. **Match the language.** PT for PT portals/agents. Switch to EN only if the listing is in EN or the user asked.
7. **Apply the user's voice.** Read `_profile.md` for phrases they always/never use. Don't introduce phrases they don't use.

## After drafting

- ASK the user to confirm before sending. Never send on their behalf.
- Once confirmed sent, update tracker status to `Contacted` and add date to notes.
- Save the sent message text to the report as a new section `## Contact sent ({date})`.

## What to do if the agent replies

- If agent confirms a visit window → update tracker to `Visit Scheduled` with date.
- If agent asks for buyer pre-qualification → escalate to user with a draft response.
- If agent says listing is sold/off-market → update tracker to `Off Market` and ask user if they want to ask the agent about similar listings.
- If agent doesn't reply in 5 days → suggest a follow-up message (1 line, "Bom dia [agente], a confirmar disponibilidade para visita ao [ref]").
