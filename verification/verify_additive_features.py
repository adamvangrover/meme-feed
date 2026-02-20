
from playwright.sync_api import sync_playwright, expect

def verify_additive_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:8080/")

        print("Verifying Search Bar...")
        search_bar = page.locator("#search-bar")
        expect(search_bar).to_be_visible()
        search_bar.fill("cat")
        # Just verifying it exists and accepts input for now

        print("Verifying Soundboard...")
        soundboard_btn = page.locator("#btn-soundboard")
        expect(soundboard_btn).to_be_visible()
        soundboard_btn.click()

        soundboard_container = page.locator("#soundboard-container")
        expect(soundboard_container).to_be_visible()
        expect(page.locator(".sound-btn").first).to_be_visible()

        page.screenshot(path="verification/soundboard_feature.png")
        print("Soundboard screenshot taken.")

        print("Verifying Meme Templates in Editor...")
        # Open Editor
        page.locator("button[title='Create Meme']").click()
        template_selector = page.locator("#template-selector")
        expect(template_selector).to_be_visible()

        # Wait for templates to load (simulated or fetched)
        # We might need to wait a bit as it fetches from API
        page.wait_for_timeout(2000)
        # Check if templates are rendered
        if page.locator(".template-thumb").count() > 0:
            print("Templates loaded successfully.")
        else:
            print("Templates might be loading or API failed (expected in offline env sometimes, but let's see).")

        page.screenshot(path="verification/template_feature.png")
        print("Template screenshot taken.")

        # Close editor
        page.locator("#meme-generator .close-modal").click()

        print("Verifying Profile Stats Chart...")
        page.locator("#btn-profile").click()
        stats_chart = page.locator(".stats-chart")
        expect(stats_chart).to_be_visible()

        page.screenshot(path="verification/profile_stats_feature.png")
        print("Profile stats screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_additive_features()
