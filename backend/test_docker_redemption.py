#!/usr/bin/env python3
"""
🧪 Test Redemption with Existing Docker Data
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_with_existing_data():
    print("🧪 TESTING REDEMPTION WITH EXISTING DOCKER DATA")
    print("=" * 50)
    
    # 1. Create a test user
    print("👤 Creating test user...")
    
    import random
    import string
    username = f"redeemer_{''.join(random.choices(string.ascii_lowercase, k=6))}"
    email = f"{username}@test.com"
    
    user_data = {
        "username": username,
        "email": email,
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "Redeemer"
    }
    
    response = requests.post(f"{BASE_URL}/users/register/", json=user_data)
    
    if response.status_code != 201:
        print(f"❌ User creation failed: {response.json()}")
        return
    
    user_data = response.json()
    token = user_data['tokens']['access']
    initial_points = user_data['user']['points']
    
    print(f"✅ User created: {username}")
    print(f"💰 Starting points: {initial_points}")
    
    # 2. Get existing items
    print(f"\n📋 Fetching existing items...")
    
    items_response = requests.get(f"{BASE_URL}/items/")
    if items_response.status_code != 200:
        print(f"❌ Failed to fetch items")
        return
    
    items = items_response.json()['results']
    print(f"📦 Found {len(items)} items in database")
    
    if not items:
        print("❌ No items available for testing")
        return
    
    # Find an affordable item
    affordable_item = None
    for item in items:
        if item['point_value'] <= initial_points and item['status'] == 'available':
            affordable_item = item
            break
    
    if not affordable_item:
        print(f"❌ No affordable items found (user has {initial_points} points)")
        print("Available items:")
        for item in items[:5]:
            print(f"  - {item['title']}: {item['point_value']} points (status: {item['status']})")
        return
    
    print(f"🎯 Selected item: {affordable_item['title']}")
    print(f"💵 Item cost: {affordable_item['point_value']} points")
    print(f"🏪 Item owner: {affordable_item['owner']['username']}")
    
    # 3. Test redemption
    print(f"\n🛒 Testing redemption...")
    
    headers = {"Authorization": f"Bearer {token}"}
    redeem_data = {"item_id": affordable_item['id']}
    
    redeem_response = requests.post(f"{BASE_URL}/swaps/redeem/", 
                                  headers=headers, 
                                  json=redeem_data)
    
    print(f"Status: {redeem_response.status_code}")
    
    if redeem_response.status_code == 200:
        result = redeem_response.json()
        print(f"✅ SUCCESS! {result['message']}")
        print(f"💰 Points deducted: {result['points_deducted']}")
        print(f"💳 Remaining points: {result['remaining_points']}")
        print(f"🎁 Points awarded to seller: {result['points_awarded_to_seller']}")
        
        # 4. Verify user points were updated
        print(f"\n🔍 Verifying points update...")
        
        user_response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
        if user_response.status_code == 200:
            current_points = user_response.json()['points']
            expected_points = initial_points - affordable_item['point_value']
            
            print(f"Current points: {current_points}")
            print(f"Expected points: {expected_points}")
            
            if current_points == expected_points:
                print("✅ Points correctly deducted from user account!")
            else:
                print("❌ Points mismatch!")
        
        # 5. Check item status
        print(f"\n🔍 Checking item status...")
        
        item_response = requests.get(f"{BASE_URL}/items/{affordable_item['id']}/")
        if item_response.status_code == 200:
            updated_item = item_response.json()
            print(f"Item status: {updated_item['status']}")
            print(f"Item owner: {updated_item['owner']['username']}")
            
            if updated_item['status'] == 'swapped':
                print("✅ Item status correctly updated to 'swapped' (redeemed)!")
            else:
                print(f"⚠️ Item status is '{updated_item['status']}' (expected 'swapped')")
                
            if updated_item['owner']['username'] == username:
                print("✅ Item ownership correctly transferred!")
            else:
                print(f"❌ Item ownership not transferred (still owned by {updated_item['owner']['username']})")
                
    else:
        error_data = redeem_response.json()
        print(f"❌ Redemption failed: {error_data['message']}")
    
    print(f"\n🎉 Test completed!")

if __name__ == "__main__":
    test_with_existing_data()
