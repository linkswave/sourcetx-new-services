# MSP Pricing Workbook — Companion Guide

Use with the CSV files in this folder (import into Excel / Google Sheets):

- `s1_ai_automation_pricing.csv`
- `s2_security_compliance_pricing.csv`
- `s3_cloud_optimization_pricing.csv`
- `s4_data_pricing.csv`
- `mrr_projection_template.csv`

---

## How the pricing model works

Every service line follows the same 4-layer revenue stack. A healthy client
counts as **2+ layers** (retainer + at least one expansion product).

| Layer | Purpose | How priced | Margin target |
|---|---|---|---|
| L1 Audit | Door opener, produces proof + ranked list | Fixed fee | 50–60% |
| L2 Retainer | The recurring engine | Per user / workflow / spend unit | 65–75% |
| L3 Projects | Fixed builds the audit surfaces | Fixed fee, 20–30% deposit | 50–60% |
| L4 Value-add | Coat-tail margin | Per quarter / deliverable | 80%+ |

**Margin math to check before you quote anything:**
- Fully-loaded engineer cost ≈ salary × 1.3 (taxes, benefits, tooling) ÷ ~130
  billable hours/month. Know your real hourly cost before setting any monthly
  price, or you will underprice retainers.
- Gross margin = (revenue − direct labor − direct license pass-through) ÷ revenue.
- If a retainer dips below 55% margin, either the scope is too wide or the anchor
  unit is wrong — fix the scope, don't eat the margin.

---

## Anchor units (choose the right one per line)

Clients must understand what they're buying without reading your SOW:

| Line | Anchor unit | Example |
|---|---|---|
| AI Automation | Active automations + agent count | "Up to 15 automations, monitored, 3 new credits/quarter" |
| Security & Compliance | Per user (min 10) | "$45/user/mo" — scales naturally as they hire |
| Cloud Optimization | Cloud spend under management | "Manage up to $20K/mo of spend" |
| Data Engineering | Pipelines + reports | "3 pipelines, up to 8 dashboards" |

---

## Worked example (mixed book, month 1 → month 12)

Assumptions: start with Security & Compliance as the wedge (highest urgency +
best ARV). Sell 3 audits/month at $3,500; 50% convert at $45/user × 25 users =
$1,125/mo effective, plus setup fees and one remediation sprint each.

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Security retainers | 4 | 7 | 10 |
| Avg monthly per client | $1,200 | $1,400 | $1,600 (vCISO cross-sell) |
| Security MRR | $4,800 | $9,800 | $16,000 |
| Cross-sold cloud/data/automation | 0 | 2 | 5 (at ~$1,500 avg) |
| Total MRR | $4,800 | $12,800 | $23,500 |
| Cumulative audit revenue (one-time) | ~$31K | ~$63K | ~$126K |

> The audits fund the cash flow; the retainers build the valuation. Sell audits
> aggressively, but never let them outnumber your delivery capacity.

---

## Guardrails

- Never quote hourly for the core product. Hourly only for true one-off change
  requests that don't fit a retainer (and charge a premium rate for it).
- Pass-through licenses at cost + 15–25%, itemized. Trust is the retention lever.
- Annual contract, billed monthly, 60-day notice to cancel.
- Re-quote retainers when headcount or spend crosses a tier boundary (e.g., 20→25
  users) — build "tier review" into the QBR agenda.
- Deposit structure: 50% to schedule an audit, balance on delivery. Projects:
  20–30% deposit, milestone billing.

---

## Spreadsheet formulas to add after import

In `mrr_projection_template.csv`, add columns once in Excel/Sheets:

- **Blended ARV** = Retainer MRR ÷ Total clients
- **Revenue per audit** = Audit price × conversion rate (what each audit is
  "worth" in future MRR — decide if you can afford to discount the audit)
- **Churn-adjusted MRR** = MRR × (1 − churn% ÷ 12) applied monthly
- **Break-even per client** = setup cost ÷ (ARV × 12 × margin%) — how long until
  a new client is profitable (target < 4 months)
