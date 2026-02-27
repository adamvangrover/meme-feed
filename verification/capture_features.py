from playwright.sync_api import sync_playwright
import time

def capture_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Capture Personalities Import Page
        print("Capturing Personalities...")
        page.goto("http://localhost:8080/personalities.html", wait_until="domcontentloaded")
        time.sleep(2) # Wait for render
        page.screenshot(path="verification/new_personalities.png", full_page=True)

        # 2. Capture Theme Selector (and apply a new theme)
        print("Capturing Theme Change...")
        page.goto("http://localhost:8080/index.html", wait_until="domcontentloaded")
        time.sleep(2)
        # Change theme to 'Ocean'
        page.select_option("#theme-selector", "ocean")
        time.sleep(1)
        page.screenshot(path="verification/theme_ocean.png")

        # Change theme to 'Sunset'
        page.select_option("#theme-selector", "sunset")
        time.sleep(1)
        page.screenshot(path="verification/theme_sunset.png")

        # 3. Capture Meme Editor with Stickers
        print("Capturing Editor & Stickers...")
        page.click("button[title='Create Meme']")
        time.sleep(1)
        page.screenshot(path="verification/editor_stickers.png")

        # CLOSE EDITOR specifically
        page.click("#meme-generator .close-modal")
        time.sleep(1)

        # 4. Capture Chat with New Personality
        print("Capturing Chat...")

        # Inject the new personality
        page.evaluate("""
            const p = {
                "id": "p31",
                "name": "The Philosopher",
                "image": "https://robohash.org/philosopher?set=set2",
                "text": "I meme, therefore I am.",
                "voice": { "lang": "en-US", "pitch": 0.8, "rate": 0.8 }
            };
            if (!app.state.importedPersonalities.some(item => item.id === 'p31')) {
                app.state.importedPersonalities.push(p);
                app.saveState();
            }
        """)

        # Force switch view and render
        page.evaluate("app.switchView('personalities')")
        time.sleep(1)
        page.evaluate("app.renderPersonalities()")
        time.sleep(1)

        # Find the philosopher card and click chat
        print("Clicking chat button...")
        page.evaluate("""
            const cards = Array.from(document.querySelectorAll('.personality-card'));
            const card = cards.find(c => c.innerText.includes('The Philosopher'));
            if (card) {
                const btn = Array.from(card.querySelectorAll('button')).find(b => b.innerText.includes('Chat'));
                if (btn) btn.click();
            } else {
                console.log("Card not found");
            }
        """)
        time.sleep(1)

        # Type a message
        print("Sending message...")
        page.fill("#chat-input", "What is truth?")
        page.click("#chat-modal .action-btn.primary") # The send button inside chat modal
        time.sleep(2) # Wait for reply

        page.screenshot(path="verification/chat_philosopher.png")

        browser.close()

if __name__ == "__main__":
    capture_features()
