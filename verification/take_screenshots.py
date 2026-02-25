from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # 1. Random Meme Button
        print("Taking screenshot of feed with random meme button...")
        page.wait_for_selector(".meme")
        page.screenshot(path="verification/feed_view.png")

        # 2. Random Meme Generated
        print("Generating random meme...")
        page.click("button[title='Surprise Me! 🎲']")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/random_meme_generated.png")

        # 3. Personalities View
        print("Taking screenshot of personalities...")
        page.click("#btn-personalities")
        page.wait_for_selector(".personality-card")
        # Scroll down to see new personalities
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/personalities_view.png")

        # 4. Chat View
        print("Taking screenshot of chat...")
        # Find a personality to chat with
        chat_btns = page.query_selector_all("button:has-text('Chat')")
        if chat_btns:
            chat_btns[-1].click() # Click the last one (likely a new one)
            page.wait_for_selector("#chat-modal")
            page.wait_for_timeout(500)
            page.screenshot(path="verification/chat_view.png")

            # Click magic reply
            page.click("button[title='Magic Reply']")
            page.wait_for_timeout(200)
            page.screenshot(path="verification/magic_reply.png")

        browser.close()

if __name__ == "__main__":
    run()
