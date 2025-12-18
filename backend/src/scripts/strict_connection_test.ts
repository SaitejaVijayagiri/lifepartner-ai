import axios from 'axios';

const APP_ID = "TEST430329ae80e0f32e41a393d78b923034";
const SECRET_KEY = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";

const headers = {
    'x-client-id': APP_ID,
    'x-client-secret': SECRET_KEY,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json'
};

const orderData = {
    order_amount: 1.00,
    order_currency: "INR",
    order_id: `test_${Date.now()}`,
    customer_details: {
        customer_id: "test_user",
        customer_phone: "9999999999"
    }
};

async function testEndpoint(name: string, url: string) {
    console.log(`\n--- Testing ${name} (${url}) ---`);
    try {
        const res = await axios.post(`${url}/orders`, orderData, { headers });
        console.log(`✅ SUCCESS! Status: ${res.status}`);
        console.log("Payment Session ID:", res.data.payment_session_id);
        return true;
    } catch (e: any) {
        console.log(`❌ FAILED. Status: ${e.response?.status}`);
        console.log("Message:", e.response?.data?.message || e.message);
        return false;
    }
}

async function run() {
    // 1. Test Sandbox
    await testEndpoint("SANDBOX", "https://sandbox.cashfree.com/pg");

    // 2. Test Production
    await testEndpoint("PRODUCTION", "https://api.cashfree.com/pg");
}

run();
