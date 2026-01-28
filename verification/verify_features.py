from playwright.sync_api import sync_playwright

def verify_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/index.html")

        # Check Stories Container
        page.wait_for_selector("#stories-container")

        # Check Buttons
        page.wait_for_selector("button[title='Create Meme']")
        page.wait_for_selector("#btn-profile")
        page.wait_for_selector("button[title='Notifications']")

        # Open Profile
        page.click("#btn-profile")
        page.wait_for_selector("#profile-container")
        page.wait_for_selector(".profile-level-badge")

        # Take Screenshot
        page.screenshot(path="verification/features_verified.png")
        print("Verification screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_features()
