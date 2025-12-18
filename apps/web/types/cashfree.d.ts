declare module '@cashfreepayments/cashfree-js' {
    export function load(options: { mode: "sandbox" | "production" }): Promise<Cashfree>;

    interface Cashfree {
        checkout(options: { paymentSessionId: string, returnUrl?: string, redirectTarget?: "_self" | "_blank" | "_modal" }): Promise<void>;
    }
}
