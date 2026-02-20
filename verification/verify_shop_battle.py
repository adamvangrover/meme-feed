
from playwright.sync_api import sync_playwright, expect

def verify_shop_battle_magic():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1600, 'height': 900})

        # Navigate to the app
        page.goto("http://localhost:8080/")

        print("Verifying Shop...")
        shop_btn = page.locator("#btn-shop")
        expect(shop_btn).to_be_visible()
        shop_btn.click()

        shop_container = page.locator("#shop-container")
        expect(shop_container).to_be_visible()
        expect(page.locator(".shop-item").first).to_be_visible()

        # Verify Coin Balance
        balance = page.locator("#user-coins")
        expect(balance).to_be_visible()

        page.screenshot(path="verification/shop_feature.png")
        print("Shop screenshot taken.")

        print("Verifying Battle Mode...")
        battle_btn = page.locator("#btn-battle")
        expect(battle_btn).to_be_visible()
        battle_btn.click()

        battle_container = page.locator("#battle-container")
        expect(battle_container).to_be_visible()

        # Wait for battle cards (might need fetch)
        page.wait_for_timeout(2000)

        expect(page.locator("#battle-left img")).to_be_visible()
        expect(page.locator("#battle-right img")).to_be_visible()

        page.screenshot(path="verification/battle_feature.png")
        print("Battle screenshot taken.")

        print("Verifying Magic Caption in Editor...")
        page.locator("button[title='Create Meme']").click()

        magic_btn = page.locator("text=Magic Caption")
        expect(magic_btn).to_be_visible()

        # Click magic caption
        magic_btn.click()

        # Check if text inputs are populated (value is not empty)
        # Note: sometimes only bottom is populated
        top_val = page.locator("#top-text").input_value()
        bot_val = page.locator("#bottom-text").input_value()

        if top_val or bot_val:
            print(f"Magic caption generated text: Top='{top_val}', Bottom='{bot_val}'")
        else:
            print("Magic caption failed to populate text.")

        page.screenshot(path="verification/magic_caption_feature.png")
        print("Magic caption screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_shop_battle_magic()
