from playwright.sync_api import sync_playwright

def verify_shortcuts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/index.html")

        # Wait for memes
        page.wait_for_selector(".meme")

        # Press 'j' to scroll
        initial_scroll = page.evaluate("window.scrollY")
        page.keyboard.press("j")
        page.wait_for_timeout(1000) # Wait for smooth scroll
        new_scroll = page.evaluate("window.scrollY")

        if new_scroll > initial_scroll:
            print("Shortcut 'j' works: Scrolled down.")
        else:
            print("Shortcut 'j' failed.")

        # Press 'm' to mute
        # Check toast
        page.keyboard.press("m")
        try:
            page.wait_for_selector("#toast-notification", state="visible")
            print("Shortcut 'm' works: Toast appeared.")
        except:
            print("Shortcut 'm' failed.")

        browser.close()

if __name__ == "__main__":
    verify_shortcuts()
