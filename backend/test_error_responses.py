#!/usr/bin/env python3
"""
🧪 Test script to demonstrate error responses for ReWear API
Run this to see exact error formats returned by the API
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n🔸 {title}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")
    print("-" * 50)

def test_registration_errors():
    """Test various registration error scenarios"""
    print("🧪 TESTING REGISTRATION ERRORS")
    
    # Missing fields
    print_response(
        "Missing Required Fields",
        requests.post(f"{BASE_URL}/users/register/", json={})
    )
    
    # Invalid email
    print_response(
        "Invalid Email Format", 
        requests.post(f"{BASE_URL}/users/register/", json={
            "username": "testuser",
            "email": "invalid-email",
            "password": "testpass123"
        })
    )
    
    # Weak password
    print_response(
        "Weak Password",
        requests.post(f"{BASE_URL}/users/register/", json={
            "username": "testuser",
            "email": "test@example.com", 
            "password": "123"
        })
    )
    
    # Create a user first
    requests.post(f"{BASE_URL}/users/register/", json={
        "username": "existinguser",
        "email": "existing@example.com",
        "password": "strongpass123"
    })
    
    # Duplicate username
    print_response(
        "Duplicate Username",
        requests.post(f"{BASE_URL}/users/register/", json={
            "username": "existinguser",
            "email": "new@example.com",
            "password": "strongpass123"
        })
    )
    
    # Duplicate email
    print_response(
        "Duplicate Email",
        requests.post(f"{BASE_URL}/users/register/", json={
            "username": "newuser",
            "email": "existing@example.com",
            "password": "strongpass123"
        })
    )

def test_login_errors():
    """Test login error scenarios"""
    print("\n🧪 TESTING LOGIN ERRORS")
    
    # Missing fields
    print_response(
        "Missing Credentials",
        requests.post(f"{BASE_URL}/users/login/", json={})
    )
    
    # Invalid credentials
    print_response(
        "Invalid Credentials",
        requests.post(f"{BASE_URL}/users/login/", json={
            "username": "nonexistent",
            "password": "wrongpass"
        })
    )

def test_authentication_errors():
    """Test authentication required errors"""
    print("\n🧪 TESTING AUTHENTICATION ERRORS")
    
    # Access protected endpoint without auth
    print_response(
        "No Authentication Header",
        requests.get(f"{BASE_URL}/users/me/")
    )
    
    # Invalid token
    print_response(
        "Invalid Token",
        requests.get(f"{BASE_URL}/users/me/", headers={
            "Authorization": "Bearer invalid_token"
        })
    )

def test_item_errors():
    """Test item-related errors"""
    print("\n🧪 TESTING ITEM ERRORS")
    
    # Create item without auth
    print_response(
        "Create Item Without Auth",
        requests.post(f"{BASE_URL}/items/", json={
            "title": "Test Item",
            "description": "Test description"
        })
    )
    
    # Access non-existent item
    print_response(
        "Item Not Found",
        requests.get(f"{BASE_URL}/items/99999/")
    )

def test_successful_registration():
    """Show successful registration response"""
    print("\n✅ TESTING SUCCESSFUL REGISTRATION")
    
    print_response(
        "Successful Registration",
        requests.post(f"{BASE_URL}/users/register/", json={
            "username": "successuser",
            "email": "success@example.com",
            "password": "strongpassword123",
            "first_name": "Success",
            "last_name": "User",
            "location": "Test City"
        })
    )

if __name__ == "__main__":
    print("🚀 Starting API Error Response Tests")
    print("Make sure the Django server is running on localhost:8000")
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/items/")
        print(f"✅ Server is running (Status: {response.status_code})")
        
        test_registration_errors()
        test_login_errors() 
        test_authentication_errors()
        test_item_errors()
        test_successful_registration()
        
        print("\n🎉 All error response tests completed!")
        print("Check the output above to see the exact error formats.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server.")
        print("Make sure Django is running: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error running tests: {e}")
