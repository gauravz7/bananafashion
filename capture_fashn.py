import os
import time
import sys
from playwright.sync_api import sync_playwright

SNAPSHOT_DIR = "snapshots"

def ensure_snapshot_dir():
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def capture_homepage(page):
    print("Navigating to homepage...")
    page.goto("https://fashn.ai")
    page.wait_for_load_state("networkidle")
    try:
        page.click("text=Accept", timeout=2000)
    except:
        pass
    print("Capturing homepage...")
    page.screenshot(path=os.path.join(SNAPSHOT_DIR, "homepage.png"), full_page=True)

def capture_dropdowns(page):
    print("Capturing dropdowns...")
    nav_items = ["Product", "Solutions", "Resources"]
    for item in nav_items:
        try:
            print(f"Hovering over {item}...")
            # Try multiple selectors
            locator = page.get_by_text(item, exact=True).first
            if not locator.is_visible():
                locator = page.locator(f"nav >> text={item}").first
            
            if locator.is_visible():
                locator.hover()
                time.sleep(1)
                page.screenshot(path=os.path.join(SNAPSHOT_DIR, f"dropdown_{item.lower()}.png"))
            else:
                print(f"Nav item {item} not visible/found.")
        except Exception as e:
            print(f"Failed to capture dropdown for {item}: {e}")

def capture_studio(page, headless):
    print("Navigating to Studio...")
    page.goto("https://app.fashn.ai/studio")
    
    time.sleep(3)
    # Always pause if not headless to allow user to check/login
    if not headless:
        print("\n" + "="*50)
        print("INTERACTIVE MODE")
        print("Please log in manually if needed.")
        print("Navigate to the Studio dashboard if not already there.")
        print("Press Enter in this terminal when ready to capture Studio features...")
        print("="*50 + "\n")
        input()
    elif "login" in page.url:
        print("Login required but running headless. Skipping.")
        return

    print("Resuming Studio capture...")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=os.path.join(SNAPSHOT_DIR, "studio_main.png"))
    
    # Define features to look for
    # We'll try to find them in the sidebar or tabs
    features = [
        "Model Swap", 
        "Virtual Try-On", 
        "Model Creation",
        "Assets",
        "History"
    ]
    
    for feature in features:
        try:
            print(f"Switching to {feature}...")
            # Try text match
            locator = page.get_by_text(feature, exact=True).first
            if not locator.is_visible():
                 # Try partial match or specific role
                 locator = page.get_by_role("button", name=feature).first
            
            if locator.is_visible():
                locator.click()
                time.sleep(3) # Wait for UI update
                page.screenshot(path=os.path.join(SNAPSHOT_DIR, f"studio_{feature.lower().replace(' ', '_')}.png"))
            else:
                print(f"Feature {feature} not found.")
        except Exception as e:
            print(f"Could not capture {feature}: {e}")

def main():
    ensure_snapshot_dir()
    # Default to headed unless specified otherwise
    headless = False
    if "--headless" in sys.argv:
        headless = True
        
    with sync_playwright() as p:
        print(f"Launching browser (headless={headless})...")
        # Try to use chrome channel if available for better compatibility, else default
        try:
            browser = p.chromium.launch(headless=headless, channel="chrome")
        except:
            browser = p.chromium.launch(headless=headless)
            
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        try:
            # capture_homepage(page)
            # capture_dropdowns(page)
            # Focus on Studio as requested
            capture_studio(page, headless)
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            print("Closing browser...")
            browser.close()

if __name__ == "__main__":
    main()
