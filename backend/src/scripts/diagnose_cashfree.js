const { Cashfree } = require("cashfree-pg");
require("dotenv").config();

console.log("--- CASHFREE DIAGNOSTICS (JS) ---");
console.log("App ID:", process.env.CASHFREE_APP_ID);
console.log("Environment Var:", process.env.CASHFREE_ENV);

// 1. Check SDK Environment
try {
    console.log("Cashfree.Environment (Type):", typeof Cashfree.Environment);
    console.log("Cashfree.Environment:", Cashfree.Environment);
} catch (e) {
    console.log("Error Accessing Cashfree.Environment:", e.message);
}

// 2. Configure
try {
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    // Test the fix I applied
    Cashfree.XEnvironment = Cashfree.Environment?.SANDBOX || "SANDBOX";

    console.log("Configured XEnvironment:", Cashfree.XEnvironment);

    // 3. Test API Call
    const testOrder = {
        order_amount: 1.00,
        order_currency: "INR",
        order_id: `test_${Date.now()}`,
        customer_details: {
            customer_id: "test_user",
            customer_phone: "9999999999"
        },
        order_meta: {
            return_url: "https://example.com"
        }
    };

    console.log("Attempting PGCreateOrder...");
    Cashfree.PGCreateOrder("2023-08-01", testOrder)
        .then(res => console.log("SUCCESS:", res.data))
        .catch(e => {
            console.error("FAILURE:");
            console.error("Message:", e.message);
            if (e.response) {
                console.error("Status:", e.response.status);
                console.error("Data:", JSON.stringify(e.response.data, null, 2));
            }
        });

} catch (e) {
    console.error("Configuration Error:", e);
}
