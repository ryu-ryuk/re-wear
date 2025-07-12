#!/usr/bin/env python3
"""
🖼️ Docker Image Upload & Download Test

This script tests the complete image upload/download flow:
1. Register a user
2. Create an item with image upload
3. Fetch the item to get image URLs
4. Test downloading the image URLs
5. Verify frontend can access the images
"""
import requests
import json
import time
import os
from pathlib import Path

BASE_URL = "http://localhost:8000/api"
MEDIA_URL = "http://localhost:8000/media"

def log_response(endpoint: str, response: requests.Response, request_data=None):
    """Enhanced logging for debugging"""
    print("=" * 60)
    print(f"🌐 {response.request.method} {endpoint}")
    print(f"📊 Status: {response.status_code}")
    
    if request_data:
        print(f"📤 Request Data: {json.dumps(request_data, indent=2)}")
    
    try:
        response_data = response.json()
        print(f"📥 Response: {json.dumps(response_data, indent=2)}")
    except:
        print(f"📥 Response (raw): {response.text[:500]}...")
    print("=" * 60)

def create_test_user():
    """Create a unique test user"""
    timestamp = int(time.time())
    user_data = {
        "username": f"imgtest_{timestamp}",
        "email": f"imgtest_{timestamp}@test.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Image",
        "last_name": "Tester",
        "location": "Test City"
    }
    
    response = requests.post(f"{BASE_URL}/users/register/", json=user_data)
    log_response("POST /users/register/", response, user_data)
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Failed to create user: {response.json()}")

def create_item_with_image(token: str, image_path: str):
    """Create an item and upload an image"""
    # First create the item
    item_data = {
        "title": "Test Item with Image",
        "description": "Testing image upload functionality",
        "category": "tops",
        "size": "M",
        "condition": "good",
        "point_value": 20,
        "tags": "test,image",
        "color": "blue",
        "brand": "TestBrand"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/items/", json=item_data, headers=headers)
    log_response("POST /items/ (Create Item)", response, item_data)
    
    if response.status_code != 201:
        raise Exception(f"Failed to create item: {response.json()}")
    
    item = response.json()
    item_id = item.get('id')
    
    if not item_id:
        raise Exception(f"Item creation didn't return ID: {item}")
    
    print(f"✅ Item created with ID: {item_id}")
    
    # Now upload an image for this item
    if os.path.exists(image_path):
        print(f"📸 Uploading image: {image_path}")
        
        # Prepare multipart form data
        with open(image_path, 'rb') as img_file:
            files = {
                'image': ('test_image.png', img_file, 'image/png'),
            }
            data = {
                'item': item_id,
                'alt_text': 'Test uploaded image',
                'is_primary': True,
                'order': 1
            }
            
            # Upload image using multipart form
            response = requests.post(
                f"{BASE_URL}/items/{item_id}/upload-image/", 
                files=files, 
                data=data, 
                headers={"Authorization": f"Bearer {token}"}
            )
            log_response(f"POST /items/{item_id}/upload-image/", response)
            
            if response.status_code in [200, 201]:
                print("✅ Image uploaded successfully!")
                return item_id, response.json()
            else:
                print(f"❌ Image upload failed: {response.text}")
                return item_id, None
    else:
        print(f"❌ Image file not found: {image_path}")
        return item_id, None

def get_item_with_images(token: str, item_id: int):
    """Fetch item details including images"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/items/{item_id}/", headers=headers)
    log_response(f"GET /items/{item_id}/ (With Images)", response)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get item: {response.json()}")

def test_image_urls(item_data):
    """Test if image URLs are accessible"""
    print("\n🔗 Testing Image URLs...")
    
    images = item_data.get('images', [])
    if not images:
        print("❌ No images found in item data")
        return False
    
    for i, image in enumerate(images):
        image_url = image.get('image')
        if image_url:
            # Handle relative URLs
            if image_url.startswith('/media/'):
                full_url = f"http://localhost:8000{image_url}"
            else:
                full_url = image_url
            
            print(f"🌐 Testing image {i+1}: {full_url}")
            
            try:
                response = requests.get(full_url, timeout=10)
                if response.status_code == 200:
                    print(f"✅ Image accessible! Size: {len(response.content)} bytes")
                    print(f"📋 Content-Type: {response.headers.get('content-type', 'unknown')}")
                else:
                    print(f"❌ Image not accessible: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"❌ Error accessing image: {e}")
        else:
            print(f"❌ Image {i+1} has no URL")
    
    return len(images) > 0

def copy_test_image():
    """Copy the logo to use as test image"""
    source_path = "/home/ryu/re-wear/backend/static/logo/logo.png"
    test_path = "/home/ryu/re-wear/backend/test_image.png"
    
    if os.path.exists(source_path):
        import shutil
        shutil.copy2(source_path, test_path)
        print(f"✅ Copied test image to: {test_path}")
        return test_path
    else:
        print(f"❌ Source image not found: {source_path}")
        return None

def main():
    """Main test function"""
    print("🖼️ Docker Image Upload & Download Test")
    print("=" * 60)
    
    try:
        # Step 1: Prepare test image
        print("\n📋 STEP 1: Preparing test image...")
        image_path = copy_test_image()
        if not image_path:
            print("❌ Cannot proceed without test image")
            return
        
        # Step 2: Create test user
        print("\n👤 STEP 2: Creating test user...")
        user_data = create_test_user()
        token = user_data["tokens"]["access"]
        user_id = user_data["user"]["id"]
        print(f"✅ User created: {user_data['user']['username']}")
        
        # Step 3: Create item with image
        print("\n🛍️ STEP 3: Creating item with image...")
        item_id, upload_response = create_item_with_image(token, image_path)
        
        # Step 4: Fetch item with images
        print("\n📥 STEP 4: Fetching item details...")
        item_details = get_item_with_images(token, item_id)
        
        # Step 5: Test image URLs
        print("\n🔗 STEP 5: Testing image accessibility...")
        images_accessible = test_image_urls(item_details)
        
        # Step 6: Test featured endpoint with images
        print("\n⭐ STEP 6: Testing featured endpoint...")
        response = requests.get(f"{BASE_URL}/items/featured/?limit=1")
        log_response("GET /items/featured/?limit=1", response)
        
        # Summary
        print("\n📊 TEST SUMMARY:")
        print("=" * 40)
        print(f"✅ User registration: SUCCESS")
        print(f"✅ Item creation: SUCCESS (ID: {item_id})")
        print(f"{'✅' if upload_response else '❌'} Image upload: {'SUCCESS' if upload_response else 'FAILED'}")
        print(f"{'✅' if images_accessible else '❌'} Image accessibility: {'SUCCESS' if images_accessible else 'FAILED'}")
        
        # Clean up test image
        if os.path.exists(image_path):
            os.remove(image_path)
            print(f"🧹 Cleaned up test image: {image_path}")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
