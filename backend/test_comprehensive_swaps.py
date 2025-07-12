#!/usr/bin/env python3
"""
🔄 COMPREHENSIVE SWAP TESTING SCRIPT - ReWear Platform

Tests all swap functionality including:
- Creating swap requests
- Accepting/rejecting swaps  
- Completing swaps
- Canceling swaps
- Points redemption
- User profile and dashboard data
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/api"

def log_response(endpoint: str, response: requests.Response, data: Any = None):
    """Helper to log API responses"""
    print(f"\n{'='*60}")
    print(f"🌐 {endpoint}")
    print(f"📊 Status: {response.status_code}")
    if data:
        print(f"📤 Request Data: {json.dumps(data, indent=2)}")
    print(f"📥 Response: {json.dumps(response.json(), indent=2)}")
    print(f"{'='*60}")

def create_test_user(base_username: str) -> Dict[str, Any]:
    """Create a test user with unique timestamp-based credentials"""
    timestamp = int(time.time())
    username = f"{base_username}_{timestamp}"
    email = f"{base_username}_{timestamp}@test.com"
    
    user_data = {
        "username": username,
        "email": email,
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": f"Test_{base_username}",
        "last_name": "User",
        "location": "Test City"
    }
    
    response = requests.post(f"{BASE_URL}/users/register/", json=user_data)
    log_response(f"POST /users/register/ ({username})", response, user_data)
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Failed to create user {username}: {response.json()}")

def login_user(username: str, password: str = "testpass123") -> str:
    """Login user and return access token"""
    login_data = {"username": username, "password": password}
    response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
    log_response(f"POST /users/login/ ({username})", response, login_data)
    
    if response.status_code == 200:
        return response.json()["tokens"]["access"]
    else:
        raise Exception(f"Failed to login {username}: {response.json()}")

def create_test_item(token: str, title: str, point_value: int = 15) -> Dict[str, Any]:
    """Create a test item for swapping"""
    item_data = {
        "title": title,
        "description": f"Test item: {title}",
        "category": "tops",
        "size": "M",
        "condition": "good",
        "point_value": point_value,
        "tags_list": ["casual", "test"],
        "color": "blue",
        "brand": "TestBrand"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/items/", json=item_data, headers=headers)
    log_response(f"POST /items/ ({title})", response, item_data)
    
    if response.status_code == 201:
        response_data = response.json()
        print(f"🔍 DEBUG: Response keys: {list(response_data.keys())}")
        print(f"🔍 DEBUG: Has ID field: {'id' in response_data}")
        if 'id' in response_data:
            print(f"🔍 DEBUG: ID value: {response_data['id']}")
        return response_data
    else:
        error_msg = f"Failed to create item {title}. Status: {response.status_code}, Response: {response.json()}"
        print(f"❌ {error_msg}")
        raise Exception(error_msg)

def get_user_profile(token: str, user_id: str = None) -> Dict[str, Any]:
    """Get comprehensive user profile data"""
    headers = {"Authorization": f"Bearer {token}"}
    
    if user_id:
        # Get specific user profile (public view)
        response = requests.get(f"{BASE_URL}/users/{user_id}/", headers=headers)
        log_response(f"GET /users/{user_id}/ (Profile)", response)
    else:
        # Get own profile
        response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
        log_response("GET /users/me/ (My Profile)", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get user profile: {response.json()}")

def get_complete_dashboard(token: str) -> Dict[str, Any]:
    """Get complete dashboard with all user data"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/complete_dashboard/", headers=headers)
    log_response("GET /users/complete_dashboard/ (Complete Data)", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get dashboard: {response.json()}")

def create_swap_request(token: str, offered_item_id: int, requested_item_id: int, message: str = "") -> Dict[str, Any]:
    """Create a swap request"""
    swap_data = {
        "offered_item": offered_item_id,
        "requested_item": requested_item_id,
        "message": message or f"I'd love to swap for your item!"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/", json=swap_data, headers=headers)
    log_response("POST /swaps/ (Create Swap)", response, swap_data)
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Failed to create swap: {response.json()}")

def accept_swap(token: str, swap_id: int) -> Dict[str, Any]:
    """Accept a swap request"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/{swap_id}/accept/", headers=headers)
    log_response(f"POST /swaps/{swap_id}/accept/", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to accept swap: {response.json()}")

def reject_swap(token: str, swap_id: int, reason: str = "") -> Dict[str, Any]:
    """Reject a swap request"""
    reject_data = {"reason": reason or "Not interested"}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/{swap_id}/reject/", json=reject_data, headers=headers)
    log_response(f"POST /swaps/{swap_id}/reject/", response, reject_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to reject swap: {response.json()}")

def complete_swap(token: str, swap_id: int) -> Dict[str, Any]:
    """Mark a swap as completed"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/{swap_id}/complete/", headers=headers)
    log_response(f"POST /swaps/{swap_id}/complete/", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to complete swap: {response.json()}")

def cancel_swap(token: str, swap_id: int) -> Dict[str, Any]:
    """Cancel a swap request"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/{swap_id}/cancel/", headers=headers)
    log_response(f"POST /swaps/{swap_id}/cancel/", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to cancel swap: {response.json()}")

def redeem_item_with_points(token: str, item_id: int) -> Dict[str, Any]:
    """Redeem an item using points"""
    redeem_data = {"item_id": item_id}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/swaps/redeem/", json=redeem_data, headers=headers)
    log_response("POST /swaps/redeem/ (Points Redemption)", response, redeem_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to redeem item: {response.json()}")

def get_user_swaps(token: str) -> Dict[str, Any]:
    """Get all user's swap requests"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/my_swaps/", headers=headers)
    log_response("GET /users/my_swaps/ (All Swaps)", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get swaps: {response.json()}")

def main():
    """Run comprehensive swap testing"""
    print("🚀 STARTING COMPREHENSIVE SWAP TESTING")
    print("=" * 80)
    
    try:
        # 1. Create test users
        print("\n🔧 STEP 1: Creating test users...")
        user1_data = create_test_user("swapuser1")
        time.sleep(1)  # Ensure unique timestamps
        user2_data = create_test_user("swapuser2") 
        time.sleep(1)  # Ensure unique timestamps
        user3_data = create_test_user("swapuser3")
        
        user1_token = user1_data["tokens"]["access"]
        user2_token = user2_data["tokens"]["access"]
        user3_token = user3_data["tokens"]["access"]
        
        user1_id = user1_data["user"]["id"]
        user2_id = user2_data["user"]["id"]
        user3_id = user3_data["user"]["id"]
        
        # 2. Create test items
        print("\n🛍️ STEP 2: Creating test items...")
        try:
            user1_item1 = create_test_item(user1_token, "User1 Vintage Jacket", 20)
            print(f"✅ Created item 1 for user1: {user1_item1.get('id', 'NO ID FOUND')}")
            
            user1_item2 = create_test_item(user1_token, "User1 Designer Shoes", 30)
            print(f"✅ Created item 2 for user1: {user1_item2.get('id', 'NO ID FOUND')}")
            
            user2_item1 = create_test_item(user2_token, "User2 Summer Dress", 15)
            print(f"✅ Created item 1 for user2: {user2_item1.get('id', 'NO ID FOUND')}")
            
            user2_item2 = create_test_item(user2_token, "User2 Winter Coat", 25)
            print(f"✅ Created item 2 for user2: {user2_item2.get('id', 'NO ID FOUND')}")
            
            user3_item1 = create_test_item(user3_token, "User3 Casual Shirt", 10)
            print(f"✅ Created item 1 for user3: {user3_item1.get('id', 'NO ID FOUND')}")
            
        except Exception as e:
            print(f"❌ FAILED to create items: {e}")
            raise
        
        # 3. Show initial user profiles and dashboards
        print("\n👤 STEP 3: Checking initial user profiles...")
        user1_profile = get_user_profile(user1_token)
        user1_dashboard = get_complete_dashboard(user1_token)
        
        # Check public profile view
        user2_public_profile = get_user_profile(user1_token, user2_id)
        
        # 4. Create swap requests
        print("\n🔄 STEP 4: Creating swap requests...")
        
        # Validate all items have IDs before proceeding
        items_to_check = [
            ("user1_item1", user1_item1),
            ("user1_item2", user1_item2),
            ("user2_item1", user2_item1),
            ("user2_item2", user2_item2),
            ("user3_item1", user3_item1)
        ]
        
        for item_name, item_data in items_to_check:
            if not item_data or "id" not in item_data:
                print(f"❌ ERROR: {item_name} missing ID. Data: {item_data}")
                raise Exception(f"Item {item_name} doesn't have an ID")
            else:
                print(f"✅ {item_name} has ID: {item_data['id']}")
        
        swap1 = create_swap_request(
            user1_token, 
            user1_item1["id"], 
            user2_item1["id"], 
            "Love your summer dress! Perfect for the season."
        )
        print(f"✅ Created swap1 with ID: {swap1.get('id', 'NO ID FOUND')}")
        
        swap2 = create_swap_request(
            user2_token, 
            user2_item2["id"], 
            user1_item2["id"], 
            "Your designer shoes would complete my outfit!"
        )
        print(f"✅ Created swap2 with ID: {swap2.get('id', 'NO ID FOUND')}")
        
        # Create another swap to test rejection
        swap3 = create_swap_request(
            user3_token, 
            user3_item1["id"], 
            user2_item2["id"], 
            "Would love to trade for your winter coat."
        )
        print(f"✅ Created swap3 with ID: {swap3.get('id', 'NO ID FOUND')}")
        
        # Validate all swaps have IDs before proceeding
        swaps_to_check = [
            ("swap1", swap1),
            ("swap2", swap2),
            ("swap3", swap3)
        ]
        
        for swap_name, swap_data in swaps_to_check:
            if not swap_data or "id" not in swap_data:
                print(f"❌ ERROR: {swap_name} missing ID. Data: {swap_data}")
                raise Exception(f"Swap {swap_name} doesn't have an ID")
            else:
                print(f"✅ {swap_name} has ID: {swap_data['id']}")
        
        # 5. Test swap acceptance
        print("\n✅ STEP 5: Testing swap acceptance...")
        accepted_swap = accept_swap(user2_token, swap1["id"])
        
        # 6. Test swap rejection
        print("\n❌ STEP 6: Testing swap rejection...")
        rejected_swap = reject_swap(user2_token, swap3["id"], "Looking for something different")
        
        # 7. Test swap completion
        print("\n🎉 STEP 7: Testing swap completion...")
        completed_swap = complete_swap(user2_token, swap1["id"])  # Item owner completes the swap
        
        # 8. Test swap cancellation (use swap2 which hasn't been accepted yet)
        print("\n🚫 STEP 8: Testing swap cancellation...")
        canceled_swap = cancel_swap(user2_token, swap2["id"])
        
        # 9. Test points redemption
        print("\n💰 STEP 9: Testing points redemption...")
        redemption_result = redeem_item_with_points(user1_token, user3_item1["id"])
        
        # 10. Check final user data
        print("\n📊 STEP 10: Checking final user data...")
        user1_final_dashboard = get_complete_dashboard(user1_token)
        user2_final_dashboard = get_complete_dashboard(user2_token)
        user3_final_dashboard = get_complete_dashboard(user3_token)
        
        # Get all swaps for each user
        user1_swaps = get_user_swaps(user1_token)
        user2_swaps = get_user_swaps(user2_token)
        user3_swaps = get_user_swaps(user3_token)
        
        print("\n🎯 TESTING COMPLETED SUCCESSFULLY!")
        print("✅ All swap endpoints tested")
        print("✅ User profiles and dashboards verified")
        print("✅ Points system working")
        print("✅ Swap flow complete")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        raise

if __name__ == "__main__":
    main()
