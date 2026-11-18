import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const SCREENSHOT_DIR = path.resolve('test-results/screenshots');

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 568, capture: true },
  { name: 'mobile-360', width: 360, height: 640, capture: false },
  { name: 'mobile-375', width: 375, height: 667, capture: true },
  { name: 'mobile-390', width: 390, height: 844, capture: false },
  { name: 'mobile-414', width: 414, height: 896, capture: false },
  { name: 'mobile-430', width: 430, height: 932, capture: false },
  { name: 'tablet-768', width: 768, height: 1024, capture: true },
  { name: 'laptop-1024', width: 1024, height: 768, capture: false },
  { name: 'desktop-1440', width: 1440, height: 900, capture: true },
];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function boxesOverlap(a, b) {
  return (
    a.x < b.x + b.width - 1 &&
    a.x + a.width > b.x + 1 &&
    a.y < b.y + b.height - 1 &&
    a.y + a.height > b.y + 1
  );
}

async function assertLayoutAndTargets(page, viewport, routeLabel) {
  const audit = await page.evaluate(() => {
    const innerWidth = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;

    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const tabElements = Array.from(document.querySelectorAll('[role="tab"]'))
      .filter(isVisible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          text: (el.textContent || '').trim(),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          right: rect.right,
        };
      });

    const headerControls = Array.from(
      document.querySelectorAll('header a, header button, header [role="button"]')
    )
      .filter(isVisible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          label: el.getAttribute('aria-label') || (el.textContent || '').trim(),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          right: rect.right,
        };
      });

    const smallTabs = tabElements.filter((t) => t.height < 43.5);
    const clippedTabs = tabElements.filter((t) => t.x < -1 || t.right > innerWidth + 1);
    const smallHeaderControls = headerControls.filter((c) => c.height < 43.5 || c.width < 43.5);
    const clippedHeaderControls = headerControls.filter((c) => c.x < -1 || c.right > innerWidth + 1);

    const bodyText = document.body.innerText || '';
    const hasBareLegacyPhone = /(?<!\+1\s)\(803\)\s*718-5509/.test(bodyText);
    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) =>
      a.getAttribute('href')
    );

    return {
      innerWidth,
      scrollWidth,
      tabElements,
      headerControls,
      smallTabs,
      clippedTabs,
      smallHeaderControls,
      clippedHeaderControls,
      hasBareLegacyPhone,
      telLinks,
    };
  });

  assert.ok(
    audit.scrollWidth <= audit.innerWidth,
    `[${viewport.name}][${routeLabel}] Horizontal overflow detected: scrollWidth=${audit.scrollWidth} > innerWidth=${audit.innerWidth}`
  );
  assert.equal(
    audit.smallTabs.length,
    0,
    `[${viewport.name}][${routeLabel}] Tabs below 44px height: ${JSON.stringify(audit.smallTabs)}`
  );
  assert.equal(
    audit.clippedTabs.length,
    0,
    `[${viewport.name}][${routeLabel}] Clipped tabs outside viewport: ${JSON.stringify(audit.clippedTabs)}`
  );
  assert.equal(
    audit.smallHeaderControls.length,
    0,
    `[${viewport.name}][${routeLabel}] Header controls below 44x44: ${JSON.stringify(audit.smallHeaderControls)}`
  );
  assert.equal(
    audit.clippedHeaderControls.length,
    0,
    `[${viewport.name}][${routeLabel}] Clipped header controls: ${JSON.stringify(audit.clippedHeaderControls)}`
  );
  assert.equal(
    audit.hasBareLegacyPhone,
    false,
    `[${viewport.name}][${routeLabel}] Found non-international (803) 718-5509 without +1`
  );
  assert.ok(
    audit.telLinks.every((href) => href === 'tel:+18037185509'),
    `[${viewport.name}][${routeLabel}] Unexpected tel link hrefs: ${JSON.stringify(audit.telLinks)}`
  );

  for (let i = 0; i < audit.tabElements.length; i += 1) {
    for (let j = i + 1; j < audit.tabElements.length; j += 1) {
      assert.equal(
        boxesOverlap(audit.tabElements[i], audit.tabElements[j]),
        false,
        `[${viewport.name}][${routeLabel}] Overlapping tabs: "${audit.tabElements[i].text}" & "${audit.tabElements[j].text}"`
      );
    }
  }

  for (let i = 0; i < audit.headerControls.length; i += 1) {
    for (let j = i + 1; j < audit.headerControls.length; j += 1) {
      assert.equal(
        boxesOverlap(audit.headerControls[i], audit.headerControls[j]),
        false,
        `[${viewport.name}][${routeLabel}] Overlapping header controls: "${audit.headerControls[i].label}" & "${audit.headerControls[j].label}"`
      );
    }
  }
}

async function navigateToPage(page, width, label) {
  if (width < 1024) {
    const openBtn = page.getByRole('button', { name: 'Open navigation menu' });
    await openBtn.click();
    const drawer = page.locator('#mobile-navigation-drawer');
    await drawer.waitFor({ state: 'visible' });
    const overflow = await page.evaluate(() => document.body.style.overflow);
    assert.equal(overflow, 'hidden', `Body scroll must lock when mobile menu is open at width=${width}`);
    await drawer.getByRole('button', { name: label, exact: true }).click();
    await drawer.waitFor({ state: 'detached' });
  } else {
    if (label === 'Safety & Compliance') {
      await page.locator('footer').getByRole('button', { name: 'Safety & Compliance', exact: true }).click();
    } else if (label === 'Careers & Drivers') {
      await page.locator('footer').getByRole('button', { name: 'Careers & CDL Drivers', exact: true }).click();
    } else if (label === 'Company Profile') {
      await page.locator('header').getByRole('button', { name: 'Company Profile', exact: true }).click();
    } else if (label === 'Request a Quote') {
      await page.locator('header').getByRole('button', { name: 'Request a Quote', exact: true }).click();
    } else {
      await page.locator('header nav').getByRole('button', { name: label, exact: true }).click();
    }
  }
}

async function verifyInteractiveTabs(page, viewport) {
  // 1. Home capabilities stacked tabs & keyboard navigation
  await navigateToPage(page, viewport.width, 'Home');
  await assertLayoutAndTargets(page, viewport, 'home');

  const freightTab = page.getByRole('tab', { name: /Freight Transport/i });
  await freightTab.click();
  assert.equal(await freightTab.getAttribute('aria-selected'), 'true');
  await freightTab.press('ArrowRight');
  const haulingTab = page.getByRole('tab', { name: /Commercial Hauling/i });
  assert.equal(await haulingTab.getAttribute('aria-selected'), 'true');
  if (viewport.capture) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `home-${viewport.name}.png`), fullPage: false });
  }

  // 2. Services page (5 tabs)
  await navigateToPage(page, viewport.width, 'Services');
  await assertLayoutAndTargets(page, viewport, 'services');
  for (const serviceLabel of ['Heavy Hauling', 'Cargo Van', '53ft Dry Van', 'Flatbed & Step Deck', 'Freight Transport']) {
    const tab = page.getByRole('tab', { name: new RegExp(serviceLabel, 'i') });
    await tab.click();
    assert.equal(await tab.getAttribute('aria-selected'), 'true');
  }
  await assertLayoutAndTargets(page, viewport, 'services-after-switch');
  if (viewport.capture) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `services-${viewport.name}.png`), fullPage: false });
  }

  // 3. Fleet page (mobile select + stepper on <768px, wrapped tablist on >=768px)
  await navigateToPage(page, viewport.width, 'Fleet');
  await assertLayoutAndTargets(page, viewport, 'fleet');
  if (viewport.width < 768) {
    const select = page.locator('#fleet-mobile-select');
    await select.selectOption('flatbed');
    assert.equal(await select.inputValue(), 'flatbed');
    await page.getByRole('button', { name: /next fleet equipment category/i }).click();
    assert.equal(await select.inputValue(), 'step-deck');
  } else {
    const stepDeckTab = page.getByRole('tab', { name: /Step Deck/i });
    await stepDeckTab.click();
    assert.equal(await stepDeckTab.getAttribute('aria-selected'), 'true');
  }
  if (viewport.capture) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `fleet-${viewport.name}.png`), fullPage: false });
  }

  // 4. Coverage / Service Areas page (vertical corridor tablist)
  await navigateToPage(page, viewport.width, 'Coverage');
  await assertLayoutAndTargets(page, viewport, 'service-areas');
  const i26Tab = page.getByRole('tab', { name: /I-26 Corridor/i });
  await i26Tab.click();
  assert.equal(await i26Tab.getAttribute('aria-selected'), 'true');

  // 5. Company Profile page (8-page index mobile select + stepper on <768px)
  await navigateToPage(page, viewport.width, 'Company Profile');
  await assertLayoutAndTargets(page, viewport, 'company-profile');
  if (viewport.width < 768) {
    const profileSelect = page.locator('#company-profile-mobile-select');
    await profileSelect.selectOption('4');
    assert.equal(await profileSelect.inputValue(), '4');
  } else {
    const p4Tab = page.getByRole('tab', { name: /Core Services/i });
    await p4Tab.click();
    assert.equal(await p4Tab.getAttribute('aria-selected'), 'true');
  }

  // 6. Remaining public routes
  for (const label of ['About', 'Contact', 'Safety & Compliance', 'Careers & Drivers', 'Request a Quote']) {
    await navigateToPage(page, viewport.width, label);
    await assertLayoutAndTargets(page, viewport, label.toLowerCase().replace(/\s+/g, '-'));
  }

  // Verify Escape closes mobile menu cleanly when <1024px
  if (viewport.width < 1024) {
    const openBtn = page.getByRole('button', { name: 'Open navigation menu' });
    await openBtn.click();
    const drawer = page.locator('#mobile-navigation-drawer');
    await drawer.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await drawer.waitFor({ state: 'detached' });
    const unlocked = await page.evaluate(() => document.body.style.overflow);
    assert.notEqual(unlocked, 'hidden', 'Body scroll lock must release on Escape');
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      page.on('pageerror', (err) => errors.push(`[${viewport.name}] pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`[${viewport.name}] console.error: ${msg.text()}`);
        }
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await verifyInteractiveTabs(page, viewport);
      await context.close();
      console.log(`PASS viewport ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  } finally {
    await browser.close();
  }

  assert.equal(errors.length, 0, `Browser runtime errors encountered:\n${errors.join('\n')}`);
  console.log('All responsive and accessibility browser checks passed cleanly.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
