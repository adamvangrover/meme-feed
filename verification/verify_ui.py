from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open the application
        page.goto("http://localhost:8080/")

        # Wait for the page to load
        page.wait_for_selector(".logo")

        # Open personalities
        page.click("#btn-personalities")
        page.wait_for_selector(".personality-card", state="visible", timeout=2000)

        page.screenshot(path="verification_personalities.png")

        # Open shop
        page.click("button[title='Shop']")
        page.wait_for_selector(".shop-item", state="visible", timeout=2000)

        page.screenshot(path="verification_shop.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
