# Site Monitoring & Learning Plan

A structured approach to monitoring daviddangerfield.com over time, with dates and actions to track. Use this as a template for future client site launches.

---

## Phase 1: Initial Launch Confirmation (Days 1-7)

**Goal:** Verify the deployment is working and crawlers are responding.

### Day 1

- [x] Domain live on custom URL (HTTPS)
- [x] GA4 collecting visits
- [x] Robots.txt accessible
- [x] Sitemap.xml accessible
- [x] Google Search Console verified
- [x] Pages submitted for indexing
- [x] Bing Webmaster Tools verified & sitemap submitted

**What to check:**

- Visit site in private/incognito window and confirm smooth load.
- GA Realtime: confirm pageviews appearing.
- Search Console: confirm pages in "Submitted" state.

---

## Phase 2: Early Indexing (Days 3-7)

**Goal:** Confirm Google and Bing are discovering your pages.

### Day 3

**Google Search Console:**

- Go to Coverage report.
- Confirm pages transition from "Submitted" to "Indexed".
- Expect at minimum: homepage, services, about, contact indexed.
- Check for any errors or warnings (should be none).

**Bing Webmaster Tools:**

- Check Crawl page to see if Bing has started crawling.
- Expect initial crawl activity within 48 hours of sitemap submission.

**GA4:**

- Check Realtime for any inbound traffic.
- Look at Acquisition → Overview to see if search engine traffic is arriving (usually takes 5-7 days).

### Day 7

**Google Search Console:**

- Check "Performance" report (if data available yet).
- Note: may take 3-7 days for performance data to appear.
- Look at "Top pages" and "Top queries".
- If any pages have high impressions but low CTR, note for copy improvement.

**Bing Webmaster Tools:**

- Confirm Bing crawl activity in last 48 hours.
- Use URL Inspection on one inner page (e.g., /services) to verify Bing can access it.

**GA4:**

- Confirm no unusual traffic patterns or bot activity.
- Check if any referrals are appearing (besides search engines).

---

## Phase 3: Initial Learning (Week 2-4)

**Goal:** Understand what's working and what queries people are searching.

### End of Week 2 (Day 14)

**Google Search Console:**

- Go to Performance report.
- Export or screenshot:
  - Top 5 pages by impressions
  - Top 5 queries
  - Average CTR by page
- **Learning:** If homepage has high impressions but low CTR, the title/meta description might need adjustment.
- **Learning:** If services page isn't in top 5, you may need to improve internal linking to it.

**GA4:**

- Go to Reports → User Acquisition → Source/Medium.
- Confirm organic (search) traffic is the top channel once it starts flowing.
- Check Pages and Screens to see which pages are most visited.

### End of Week 3 (Day 21)

**Manual Audit:**

- Test all internal links (index, services, about, contact, cv redirect, schedule redirect).
- Confirm /cv redirects to PDF.
- Confirm /schedule redirects to Calendly.
- Verify no 404 errors in GA4.

**Search Console:**

- Check Coverage again. Confirm all 4 main pages are indexed.
- If homepage is indexed but inner pages are not, check internal linking structure.

### End of Week 4 (Day 28)

**Competitive Baseline:**

- Search for your core keywords in Google manually:
  - "St. Paul web developer"
  - "Twin Cities web development"
  - "Minnesota web services"
  - Your business name
- Note: where does daviddangerfield.com appear (if at all)?
- Note: these rankings will take time—do not expect top 10 results yet.

**GA4 Summary:**

- Go to Acquisition → Overview.
- Note total users, sessions, bounce rate, average session duration.
- Take a screenshot for baseline comparison 3 months from now.

---

## Phase 4: Growth Monitoring (Month 2-3)

**Goal:** Identify improvements and detect any issues.

### Month 2 (Day 60)

**Google Search Console:**

- Performance report: compare to week 2 baseline.
- Are impressions growing? Are clicks growing?
- Are URLs appearing for new search queries?
- **Action if impressions are low:** Add more internal links between pages; consider updating page titles/descriptions for better CTR.

**GA4:**

- Compare total users from month 1 to month 2.
- Check bounce rate—is it trending down (good) or up (bad)?
- Review top pages. Are people clicking through links or bouncing?

**Site Health Check:**

- Run Google PageSpeed Insights on homepage and one inner page.
- Confirm Core Web Vitals are "Good" or "Needs Improvement" (not "Poor").
- If poor, note what to improve for a client site (usually image optimization or JavaScript).

### Month 3 (Day 90)

**Google Search Console:**

- Full 90-day Performance comparison.
- How many unique queries are you ranking for (even if not top 10)?
- How has CTR changed?
- **Learning:** Low CTR on pages that rank high = copy/title needs improvement.
- **Learning:** No impressions for pages = they may need better internal linking.

**Bing Webmaster Tools:**

- Check if Bing has indexed your pages.
- Note: Bing is usually slower than Google but should have indexed by now.

**GA4:**

- Compare days 1-30 vs days 60-90.
- Is traffic growing? By what %?
- Are any referral sources emerging (besides search)?
- Are people converting? (e.g., scheduling, clicking CV link)

---

## Phase 5: Ongoing Monitoring (Quarterly)

**Goal:** Stay aware of performance, detect regressions, identify optimization opportunities.

### Every 3 Months

**Google Search Console:**

- Check Coverage for regressions (pages that were indexed but no longer are).
- Review Performance to see if top pages are changing.
- Look for new errors or warnings.
- Note any manual actions or security issues (should be none).

**GA4:**

- Compare quarter-over-quarter user count and traffic sources.
- Identify any new traffic patterns or anomalies.
- Check if bounce rate is improving (should drop as site reputation grows).

**Search Rankings:**

- Manually search for your core keywords.
- Take note of where you rank.
- Set a reminder to check this quarterly; goal is to see slow, steady improvement.

**Site Audit:**

- Run PageSpeed Insights again; confirm no regressions in Core Web Vitals.
- Test all links and forms.
- Check for any broken images or missing assets.

### Red Flags to Watch

- **Sudden drop in impressions or clicks:** Usually means a technical issue or an algorithmic change. Check Search Console for errors first.
- **Spike in 404 errors in GA4:** Broken link or deleted page. Fix immediately.
- **All traffic disappears:** Usually means the site went down or DNS failed. Check GitHub Pages deployment and DNS records.
- **Manual action warning in GSC:** Would indicate spam or policy violation. Review immediately.

---

## Client Site Template

When you create a site for a client, use this same plan structure:

1. **Launch checklist** (days 1-7): Domain, GA, GSC, Bing, robots, sitemap.
2. **Indexing verification** (days 3-7): Track coverage and crawl discovery.
3. **Initial learning** (weeks 2-4): Understand traffic sources, top pages, bounce rates.
4. **Growth monitoring** (months 2-3): Compare baselines, identify optimization opportunities.
5. **Ongoing cadence** (quarterly): Regressions, rankings, quarterly reviews.

**Pro tip for clients:**

- Set calendar reminders for these check-ins.
- Create a shared Google Sheet to track key metrics over time.
- Share GSC/GA4 access so they can see data, but position yourself as the strategic reviewer.
- Monthly email summary: "Here's what happened with your site this month, and here's what we should do about it."

---

## Metrics to Track Over Time

| Metric                  | Week 1 | Week 4 | Month 2 | Month 3 | Quarter 2 |
| ----------------------- | ------ | ------ | ------- | ------- | --------- |
| Pages Indexed           | ?      | ?      | ?       | ?       | ?         |
| Total Impressions (GSC) | ?      | ?      | ?       | ?       | ?         |
| Average CTR             | ?      | ?      | ?       | ?       | ?         |
| GA4 Users               | ?      | ?      | ?       | ?       | ?         |
| GA4 Bounce Rate         | ?      | ?      | ?       | ?       | ?         |
| Organic Traffic %       | ?      | ?      | ?       | ?       | ?         |
| Core Web Vitals         | ?      | Good   | Good    | Good    | Good      |
| Top Ranking Queries     | N/A    | ?      | ?       | ?       | ?         |

---

## Notes & Observations

Use this section to track what you learn for future client work:

- **[3/12/26]** Launched site, tools verified.
- **[3/14/26 - Day 3]** Check GSC coverage.
- **[3/19/26 - Day 7]** Check initial GA traffic and GSC performance.
- **[3/31/26 - Day 21]** Manual audit and keyword spot check.
- **[4/11/26 - Month 1]** GSC and Bing indexing status.
- **[5/12/26 - Month 2]** GTrends and ranking baseline.
- **[6/12/26 - Month 3]** Quarterly review and optimization plan.

---

**Status:** Site launched March 12, 2026. Next check: March 14, 2026 (Day 3).
