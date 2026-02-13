# LAGO Multi-Agent Task Board

## Objective
Fix UI visibility issues (profile button), simplify store navigation, and set up Sanity/Supabase with example shop items.

## Definition of Done (DoD) Checklist
- [ ] Profile button is visible in header when user is logged in
- [ ] Store button has NO dropdown menu (remove furniture/materials items)
- [ ] Sanity CMS configured with example products
- [ ] Supabase configured with products/categories tables and example data
- [ ] Store page displays at least 3-5 example products
- [ ] Git repo configured for push/pull to https://github.com/dav123719/Lago
- [ ] Build passes without errors

---

## Backlog

*(Empty)*

---

## In Progress

### QA-VERIFICATION-001: Verify All Changes
**Owner:** QA_TESTER
**Status:** Running verification against DoD checklist

---

## Done

### UI-FIX-001: Fix Profile Button Visibility ✅
**Owner:** IMPLEMENTER_FRONTEND
**Files:** `src/components/layout/Header.tsx`
**Done:** Added AuthButton import and rendered in desktop header (line 289) and mobile menu (lines 420-430)

### UI-FIX-002: Remove Store Dropdown Menu ✅
**Owner:** IMPLEMENTER_FRONTEND
**Files:** `src/components/layout/Header.tsx`
**Done:** Removed children array from Store nav item - now simple link without dropdown

### BE-SETUP-001: Configure Git Remote ✅
**Owner:** IMPLEMENTER_BACKEND
**Done:** Git remote verified: https://github.com/dav123719/Lago (fetch/push)

### BE-SETUP-002: Setup Sanity Schema & Example Products ✅
**Owner:** IMPLEMENTER_BACKEND
**Files:** `sanity/schemas/index.ts`
**Done:** Updated to export product, category, siteSettings schemas alongside project

### BE-SETUP-003: Setup Supabase Schema & Example Products ✅
**Owner:** IMPLEMENTER_BACKEND
**Files:** `supabase/schema.sql`
**Done:** Added categories table + 4 categories + 5 example products with RLS policies

### BE-SETUP-004: Verify API Integration ✅
**Owner:** IMPLEMENTER_BACKEND
**Done:** Real credentials verified in .env.local - Sanity and Supabase APIs accessible

---

## Known Issues / Blockers

None yet.

---

## Agent Communication Log

**Cycle 1 - COMPLETED**
- IMPLEMENTER_FRONTEND: UI-FIX-001, UI-FIX-002 done
- IMPLEMENTER_BACKEND: BE-SETUP-001 through BE-SETUP-004 done
- QA_TESTER: Verifying all changes
- REVIEWER: Standing by for final review

