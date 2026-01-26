from playwright.sync_api import sync_playwright, expect

def verify_social_features(page):
    # 1. Navigate to the app
    page.goto("http://localhost:8080/index.html")

    # 2. Wait for memes to load
    page.wait_for_selector(".meme", state="visible")

    # 3. Verify Social Elements exist on the first meme
    first_meme = page.locator(".meme").first

    # Check Header
    expect(first_meme.locator(".post-header")).to_be_visible()
    expect(first_meme.locator(".post-author")).to_be_visible()
    expect(first_meme.locator(".post-time")).to_be_visible()

    # Check Stats
    expect(first_meme.locator(".post-stats")).to_be_visible()

    # 4. Interact with Comments
    # Open comments
    comment_btn = first_meme.locator("button[title='Comment']")
    comment_btn.click()

    # Check comment section is visible
    comment_section = first_meme.locator(".comments-section")
    expect(comment_section).to_be_visible()

    # Post a comment
    input_field = comment_section.locator(".comment-input")
    input_field.fill("This is a test comment!")

    submit_btn = comment_section.locator(".comment-submit-btn")
    submit_btn.click()

    # Verify comment appeared
    expect(comment_section.locator(".comment-text", has_text="This is a test comment!")).to_be_visible()

    # 5. Take Screenshot
    page.screenshot(path="verification/social_features.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_social_features(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            raise
        finally:
            browser.close()
