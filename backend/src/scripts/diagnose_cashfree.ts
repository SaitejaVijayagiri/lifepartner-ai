import { Cashfree } from "cashfree-pg";
import dotenv from 'dotenv';
dotenv.config();

console.log("--- CASHFREE DIAGNOSTICS ---");
console.log("App ID:", process.env.CASHFREE_APP_ID);
console.log("Environment Var:", process.env.CASHFREE_ENV);

// 1. Check SDK Environment
try {
    console.log("Cashfree.Environment:", Cashfree.Environment);
    console.log("Cashfree.Environment.SANDBOX:", Cashfree.Environment?.SANDBOX);
} catch (e) {
    console.log("Error Accessing Cashfree.Environment:", e);
}

// 2. Configure
// @ts-ignore
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
// @ts-ignore
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// @ts-ignore
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

async function test() {
    try {
        console.log("Attempting PGCreateOrder...");
        // @ts-ignore
        const res = await Cashfree.PGCreateOrder("2023-08-01", testOrder);
        console.log("SUCCESS:", res.data);
    } catch (e: any) {
        console.error("FAILURE:");
        console.error("Message:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

test();
