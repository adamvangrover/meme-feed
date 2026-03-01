from playwright.sync_api import sync_playwright
import time

def verify_expansion():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/index.html", wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")
            # If load fails, we can still try to check content if it partially loaded

        time.sleep(5) # Give JS time to run

        # 1. Check Theme Selector Options
        try:
            theme_selector = page.locator("#theme-selector")
            options = theme_selector.locator("option").all_inner_texts()
            print("Themes found:", options)

            expected_themes = ["Ocean", "Sunset", "Midnight", "Candy", "Hacker", "Autumn"]
            found_all = all(any(expected.lower() in opt.lower() for opt in options) for expected in expected_themes)

            if found_all:
                print("SUCCESS: New themes detected.")
            else:
                print("WARNING: Some expected themes not found.")
        except Exception as e:
            print(f"Theme check failed: {e}")


        # 2. Check Personalities Page
        try:
            # We can just check the JS state if exposed, or navigate
            # app.state.importedPersonalities might be accessible via console

            # Let's try navigating to personalities.html directly first as it's simpler
            page.goto("http://localhost:8080/personalities.html", wait_until="domcontentloaded")
            time.sleep(2)
            importable_personalities = page.locator(".personality-card").count()
            print(f"Personalities available for import: {importable_personalities}")

            if importable_personalities >= 60: # We added 30 to 30 existing
                print("SUCCESS: Expanded personalities detected.")
            else:
                print(f"WARNING: Personalities count seems low (expected >= 60, found {importable_personalities}).")
        except Exception as e:
            print(f"Personalities check failed: {e}")

        # 3. Check Meme Editor Stickers
        try:
            page.goto("http://localhost:8080/index.html", wait_until="domcontentloaded")
            # We need to trigger sticker render, which happens on load usually or init
            # app.renderStickerOptions() is called in init()

            page.evaluate("app.openMemeEditor()")

            # Wait for stickers
            page.wait_for_selector("#sticker-options button", timeout=10000)
            stickers = page.locator("#sticker-options button").count()
            print(f"Stickers found: {stickers}")

            if stickers > 100:
                 print("SUCCESS: Expanded stickers detected.")
            else:
                 print("WARNING: Sticker count seems low.")
        except Exception as e:
             print(f"Sticker check failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_expansion()
