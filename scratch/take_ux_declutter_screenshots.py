import os
import sys
from playwright.sync_api import sync_playwright

OUT_DIR = "/home/samudra/.gemini/antigravity-cli/brain/065f48aa-5b00-4964-abd4-5dc98a9c15df/screenshots/pinterest-bento"
os.makedirs(OUT_DIR, exist_ok=True)

PAGES = [
    ("home", "http://localhost:3000/"),
    ("pharmacist", "http://localhost:3000/pharmacist"),
    ("doctor", "http://localhost:3000/doctor"),
    ("patient", "http://localhost:3000/patient"),
    ("admin", "http://localhost:3000/admin"),
]

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("mobile", 390, 844),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp_name, width, height in VIEWPORTS:
        context = browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        for name, url in PAGES:
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(600)
                path = f"{OUT_DIR}/{name}_{vp_name}.png"
                page.screenshot(path=path, full_page=True)
                print(f"Captured {path}")
            except Exception as e:
                print(f"Error capturing {name} {vp_name}: {e}")
        context.close()
    browser.close()
print("Bento screenshots capture done!")
