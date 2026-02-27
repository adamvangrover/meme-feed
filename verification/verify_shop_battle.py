from playwright.sync_api import sync_playwright, expect

def verify_shop_battle():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/index.html")

        # 1. Shop
        page.locator("button[title='Shop']").click()
        expect(page.locator("#shop-container")).to_be_visible()
        page.wait_for_selector(".shop-item")
        page.screenshot(path="verification/shop_view.png")
        print("Shop view screenshot taken.")

        # 2. Battle
        page.locator("button[title='Battle']").click()
        expect(page.locator("#battle-container")).to_be_visible()
        # Wait a bit for images
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/battle_view.png")
        print("Battle view screenshot taken.")

        # 3. Profile Chart
        page.locator("#btn-profile").click()
        expect(page.locator("#activity-chart")).to_be_visible()
        page.screenshot(path="verification/profile_view.png")
        print("Profile view screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_shop_battle()
