// Test script to verify backend API endpoints
const testBackend = async () => {
    const baseURL = 'http://localhost:5000/api';

    console.log('🧪 Testing AgriConnect Backend API\n');

    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    try {
        const healthResponse = await fetch(`${baseURL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
    }

    // Test 2: Register User
    console.log('\n2️⃣ Testing User Registration...');
    const testUser = {
        name: 'Test Farmer',
        email: `farmer${Date.now()}@test.com`,
        password: 'password123',
        role: 'farmer',
        phone: '1234567890',
        location: {
            state: 'Gujarat',
            district: 'Ahmedabad',
            pincode: '380001'
        }
    };

    try {
        const registerResponse = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const registerData = await registerResponse.json();
        console.log('✅ Registration:', registerData);

        if (registerData.success && registerData.token) {
            const token = registerData.token;

            // Test 3: Get Profile
            console.log('\n3️⃣ Testing Get Profile (Protected Route)...');
            const profileResponse = await fetch(`${baseURL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileResponse.json();
            console.log('✅ Profile:', profileData);

            // Test 4: Login
            console.log('\n4️⃣ Testing User Login...');
            const loginResponse = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });
            const loginData = await loginResponse.json();
            console.log('✅ Login:', loginData);
        }
    } catch (error) {
        console.error('❌ Registration Failed:', error.message);
    }

    console.log('\n✨ Backend API Testing Complete!');
};

// Run tests
testBackend();
