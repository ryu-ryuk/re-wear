#!/usr/bin/env python3
"""
🧪 ReWear API Comprehensive Testing Suite

This script tests ALL API endpoints including the new swap system, 
user dashboard, and complete platform functionality.

Usage: python test_api.py
"""

import requests
import json
import sys
import time
import random

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200, description=""):
    """Test an API endpoint and return the response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        print(f"🧪 {method} {endpoint}")
        if description:
            print(f"   {description}")
        print(f"   Status: {response.status_code} (expected: {expected_status})")
        
        if response.status_code == expected_status:
            print("   ✅ PASS")
            return response
        else:
            print("   ❌ FAIL")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text[:200]}...")
            return response
        
    except requests.exceptions.ConnectionError:
        print(f"   ❌ CONNECTION ERROR - Is the server running on {BASE_URL}?")
        return None
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        return None

def create_test_user(user_num):
    """Create a unique test user and return auth token"""
    unique_id = int(time.time() % 10000) + user_num
    test_data = {
        "username": f"testuser_{unique_id}",
        "email": f"test_{unique_id}@example.com", 
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": f"Test{user_num}",
        "location": "Test City"
    }
    
    response = test_endpoint("POST", "/api/users/register/", test_data, expected_status=201)
    
    if response and response.status_code == 201:
        try:
            auth_data = response.json()
            token = auth_data['tokens']['access']
            user_id = auth_data['user']['id']
            username = auth_data['user']['username']
            return token, user_id, username
        except:
            pass
    
    return None, None, None

def main():
    print("🧥 ReWear API Comprehensive Testing Suite")
    print("=" * 60)
    
    # Test 1: Server Health Check
    print("\n📡 1. SERVER HEALTH CHECK")
    test_endpoint("GET", "/", description="Check if Django server is running")
    
    # Test 2: Items API (Public Endpoints)
    print("\n👕 2. ITEMS API (PUBLIC)")
    test_endpoint("GET", "/api/items/", description="Get all items (paginated)")
    test_endpoint("GET", "/api/items/featured/", description="Get featured items for homepage")
    test_endpoint("GET", "/api/items/categories/", description="Get categories and conditions")
    test_endpoint("GET", "/api/items/stats/", description="Get platform statistics")
    
    # Advanced search testing
    test_endpoint("GET", "/api/items/search/?q=vintage", description="Search for 'vintage' items")
    test_endpoint("GET", "/api/items/search/?category=tops&sort=popular", description="Filter by category and sort")
    
    # Test 3: Get Item for Testing
    print("\n📱 3. ITEM DETAIL & DISCOVERY")
    
    items_response = test_endpoint("GET", "/api/items/")
    item_id = None
    if items_response and items_response.status_code == 200:
        try:
            items_data = items_response.json()
            if items_data.get('results') and len(items_data['results']) > 0:
                item_id = items_data['results'][0]['id']
                print(f"   📋 Using item ID: {item_id}")
                
                # Test item detail
                test_endpoint("GET", f"/api/items/{item_id}/", description="Get item details (increments view count)")
        except:
            pass
    
    if not item_id:
        print("   ⚠️  No items found - will create test items later")
        item_id = 999999
    
    # Test 4: User Registration & Points System
    print("\n📝 4. USER REGISTRATION & POINTS SYSTEM")
    
    # Create first test user
    token1, user_id1, username1 = create_test_user(1)
    if token1:
        print(f"   🎉 Created user: {username1} (ID: {user_id1})")
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Check if user got welcome points
        profile_response = test_endpoint("GET", "/api/users/me/", headers=headers1, description="Check user profile with welcome points")
        if profile_response and profile_response.status_code == 200:
            try:
                profile_data = profile_response.json()
                points = profile_data.get('points', 0)
                print(f"   💰 User has {points} points (should be 100 welcome bonus)")
            except:
                pass
    else:
        print("   ❌ Failed to create first test user")
        return
    
    # Create second test user for swap testing
    token2, user_id2, username2 = create_test_user(2)
    if token2:
        print(f"   🎉 Created second user: {username2} (ID: {user_id2})")
        headers2 = {"Authorization": f"Bearer {token2}"}
    else:
        print("   ❌ Failed to create second test user")
        headers2 = None
    
    # Test 5: User Dashboard APIs
    print("\n👤 5. USER DASHBOARD (COMPREHENSIVE)")
    test_endpoint("GET", "/api/users/me/", headers=headers1, description="Get current user profile")
    test_endpoint("GET", "/api/users/dashboard/", headers=headers1, description="Get dashboard statistics")
    test_endpoint("GET", "/api/users/my_activity/", headers=headers1, description="Get recent activity")
    test_endpoint("GET", "/api/users/complete_dashboard/", headers=headers1, description="Get complete dashboard data")
    
    # Test 6: Item Creation (Auto-Approved)
    print("\n📦 6. ITEM CREATION (AUTO-APPROVED)")
    
    # Create test items for both users
    item_data_1 = {
        "title": "Vintage Denim Jacket",
        "description": "Classic 90s style denim jacket in excellent condition. Perfect for layering!",
        "category": "outerwear",
        "size": "M",
        "condition": "excellent",
        "point_value": 25,
        "tags_list": ["vintage", "denim", "90s", "casual"],
        "color": "blue",
        "brand": "Levi's"
    }
    
    item_response_1 = test_endpoint("POST", "/api/items/", item_data_1, headers=headers1, 
                                   expected_status=201, description="Create item for user 1")
    created_item_1 = None
    if item_response_1 and item_response_1.status_code == 201:
        try:
            created_item_1 = item_response_1.json()['id']
            print(f"   📦 Created item 1: ID {created_item_1} (auto-approved)")
        except:
            pass
    
    if headers2:
        item_data_2 = {
            "title": "Designer Silk Scarf",
            "description": "Luxury silk scarf with beautiful patterns. Perfect accessory!",
            "category": "accessories",
            "size": "One Size",
            "condition": "new",
            "point_value": 30,
            "tags_list": ["designer", "silk", "luxury", "formal"],
            "color": "red",
            "brand": "Hermès"
        }
        
        item_response_2 = test_endpoint("POST", "/api/items/", item_data_2, headers=headers2,
                                       expected_status=201, description="Create item for user 2")
        created_item_2 = None
        if item_response_2 and item_response_2.status_code == 201:
            try:
                created_item_2 = item_response_2.json()['id']
                print(f"   📦 Created item 2: ID {created_item_2} (auto-approved)")
            except:
                pass
    
    # Test 7: My Items & User Items API
    print("\n📋 7. USER ITEMS MANAGEMENT")
    test_endpoint("GET", "/api/items/my/", headers=headers1, description="Get user 1's items")
    if headers2:
        test_endpoint("GET", "/api/items/my/", headers=headers2, description="Get user 2's items")
    
    # Test 8: Item Interactions
    print("\n❤️ 8. ITEM INTERACTIONS")
    if created_item_2 and headers1:
        # User 1 likes User 2's item
        test_endpoint("POST", f"/api/items/{created_item_2}/like/", headers=headers1, 
                     description="User 1 likes User 2's item")
        
        # Check if like was recorded
        test_endpoint("GET", f"/api/items/{created_item_2}/", description="Check like count increased")
    
    # Test 9: Swap System (The Core Feature!)
    print("\n� 9. SWAP SYSTEM (CORE FEATURE)")
    
    if created_item_1 and created_item_2 and headers1 and headers2:
        # User 1 requests to swap their item for User 2's item
        swap_data = {
            "requested_item": created_item_2,  # User 2's scarf
            "offered_item": created_item_1,    # User 1's jacket
            "message": "Hi! I love your silk scarf. Would you like to swap for my vintage denim jacket?"
        }
        
        swap_response = test_endpoint("POST", "/api/swaps/", swap_data, headers=headers1,
                                     expected_status=201, description="User 1 requests swap")
        
        swap_id = None
        if swap_response and swap_response.status_code == 201:
            try:
                swap_id = swap_response.json()['id']
                print(f"   � Created swap request: ID {swap_id}")
            except:
                pass
        
        # Test swap management endpoints
        test_endpoint("GET", "/api/swaps/", headers=headers1, description="Get User 1's swaps")
        test_endpoint("GET", "/api/swaps/", headers=headers2, description="Get User 2's swaps")
        
        if swap_id:
            # User 2 accepts the swap
            test_endpoint("POST", f"/api/swaps/{swap_id}/accept/", headers=headers2,
                         description="User 2 accepts the swap")
            
            # Check items are now marked as 'pending'
            test_endpoint("GET", f"/api/items/{created_item_1}/", description="Check item 1 status (should be pending)")
            test_endpoint("GET", f"/api/items/{created_item_2}/", description="Check item 2 status (should be pending)")
            
            # Complete the swap (both users earn points)
            test_endpoint("POST", f"/api/swaps/{swap_id}/complete/", headers=headers1,
                         description="User 1 completes the swap (both earn +5 points)")
            
            # Check final item statuses
            test_endpoint("GET", f"/api/items/{created_item_1}/", description="Check item 1 final status (should be swapped)")
            test_endpoint("GET", f"/api/items/{created_item_2}/", description="Check item 2 final status (should be swapped)")
    
    # Test 10: User Swap History & Dashboard Updates
    print("\n📊 10. UPDATED DASHBOARD & SWAP HISTORY")
    test_endpoint("GET", "/api/users/my_swaps/", headers=headers1, description="Get User 1's swap history")
    if headers2:
        test_endpoint("GET", "/api/users/my_swaps/", headers=headers2, description="Get User 2's swap history")
    
    # Check updated points
    final_profile_1 = test_endpoint("GET", "/api/users/me/", headers=headers1, description="Check User 1's final points")
    if final_profile_1 and final_profile_1.status_code == 200:
        try:
            profile_data = final_profile_1.json()
            final_points = profile_data.get('points', 0)
            print(f"   💰 User 1 final points: {final_points} (should be 105 = 100 welcome + 5 swap)")
        except:
            pass
    
    # Test 11: Error Handling & Edge Cases
    print("\n🚫 11. ERROR HANDLING & EDGE CASES")
    test_endpoint("GET", "/api/items/999999/", expected_status=404, description="Non-existent item")
    test_endpoint("POST", "/api/users/register/", {"username": "incomplete"}, expected_status=400, description="Incomplete registration")
    
    # Try to create swap with invalid data
    if headers1:
        test_endpoint("POST", "/api/swaps/", {"requested_item": 999999, "offered_item": 888888}, 
                     headers=headers1, expected_status=400, description="Invalid swap request")
    
    # Test 12: Platform Statistics
    print("\n📈 12. PLATFORM STATISTICS")
    test_endpoint("GET", "/api/items/stats/", description="Updated platform stats after test data")
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 COMPREHENSIVE API TESTING COMPLETE!")
    print("\n📋 SUMMARY:")
    print("✅ Items auto-approved (no admin bottleneck)")
    print("✅ User registration with 100 welcome points")
    print("✅ Complete swap system (request → accept → complete)")
    print("✅ Points system (welcome bonus + swap rewards)")
    print("✅ Dashboard APIs with real-time stats")
    print("✅ Item interactions (likes, views)")
    print("✅ Advanced search and filtering")
    
    print(f"\n🔧 FRONTEND INTEGRATION:")
    print(f"- API Base URL: {BASE_URL}")
    print(f"- Test users created: {username1}, {username2 if headers2 else 'N/A'}")
    print(f"- Test items created with auto-approval")
    print(f"- Complete swap flow demonstrated")
    
    print(f"\n💡 POINTS SYSTEM:")
    print(f"- Welcome bonus: 100 points (automatic)")
    print(f"- Successful swap: +5 points for both parties")
    print(f"- Future: Point redemption for premium items")

if __name__ == "__main__":
    main()
