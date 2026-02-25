import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # 1. Verify Feed Loads
        print("Checking feed...")
        page.wait_for_selector(".meme")
        memes = page.query_selector_all(".meme")
        if len(memes) > 0:
            print(f"Feed loaded with {len(memes)} memes.")
        else:
            print("Feed failed to load.")
            sys.exit(1)

        # 2. Verify Random Meme Generator
        print("Checking Random Meme Generator...")
        initial_count = len(memes)
        page.click("button[title='Surprise Me! 🎲']")
        page.wait_for_timeout(1000) # Wait for animation/insertion
        new_count = len(page.query_selector_all(".meme"))
        if new_count > initial_count:
            print("Random Meme Generator working.")
        else:
            print("Random Meme Generator failed.")
            sys.exit(1)

        # 3. Verify Personalities View
        print("Checking Personalities View...")
        page.click("#btn-personalities")
        page.wait_for_selector(".personality-card")
        cards = page.query_selector_all(".personality-card")
        print(f"Found {len(cards)} personalities.")

        # Check for a new personality
        skeptic = page.query_selector("text=The Skeptic")
        if skeptic:
            print("Found new personality 'The Skeptic'.")
        else:
            print("New personality 'The Skeptic' not found.")

        # 4. Verify Chat and Magic Reply
        # Go back to feed or stay here, let's open chat for a personality
        print("Checking Chat...")
        # Find the first Chat button
        chat_btn = page.query_selector("button:has-text('Chat')")
        if chat_btn:
            chat_btn.click()
            page.wait_for_selector("#chat-modal")
            print("Chat modal opened.")

            # Check for Magic Reply button
            magic_btn = page.query_selector("button[title='Magic Reply']")
            if magic_btn:
                print("Magic Reply button found.")
                magic_btn.click()
                # Check input value
                input_val = page.eval_on_selector("#chat-input", "el => el.value")
                if input_val:
                    print(f"Magic Reply generated: {input_val}")
                else:
                    print("Magic Reply failed to populate input.")
                    sys.exit(1)
            else:
                print("Magic Reply button not found.")
                sys.exit(1)
        else:
            print("Chat button not found.")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    run()
