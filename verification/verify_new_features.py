from playwright.sync_api import sync_playwright, expect

def verify_new_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/index.html")

        # 1. Check Zen Mode Button
        zen_btn = page.locator("#btn-zen")
        expect(zen_btn).to_be_visible()
        print("Zen Mode button found.")

        # 2. Check Shortcuts Modal
        shortcuts_btn = page.locator("button[title='Keyboard Shortcuts']")
        shortcuts_btn.click()
        expect(page.locator("#shortcuts-modal")).to_be_visible()
        expect(page.locator("text=Keyboard Shortcuts ⌨️")).to_be_visible()
        page.screenshot(path="verification/shortcuts_modal.png")
        print("Shortcuts modal verified.")

        # Close modal
        page.locator("#shortcuts-modal .close-modal").click()

        # 3. Check Meme Generator Stickers
        page.locator("button[title='Create Meme']").click()
        expect(page.locator("#meme-generator")).to_be_visible()
        expect(page.locator("text=Add Stickers")).to_be_visible()
        expect(page.locator(".sticker-options button").first).to_be_visible()
        page.screenshot(path="verification/meme_generator_stickers.png")
        print("Meme Generator Stickers verified.")

        # Close Meme Generator
        page.locator("#meme-generator .close-modal").click()

        # 4. Check Reddit Sort
        # Change source to reddit to see if sort appears
        page.select_option("#source-filter", "reddit")
        expect(page.locator("#reddit-sort")).to_be_visible()
        print("Reddit sort dropdown verified.")

        # 5. Check Import/Export in Profile
        page.locator("#btn-profile").click()
        expect(page.locator("button", has_text="Export Data")).to_be_visible()
        expect(page.locator("button", has_text="Import Data")).to_be_visible()
        print("Import/Export buttons verified.")

        browser.close()

if __name__ == "__main__":
    verify_new_features()
