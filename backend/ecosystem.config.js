module.exports = {
    apps: [{
        name: "life-partner-backend",
        script: "./dist/server.js", // Points to compiled JS
        instances: "max", // Utilization: 100% of CPU Cores
        exec_mode: "cluster", // Enable Load Balancing
        env: {
            NODE_ENV: "development",
            PORT: 4000
        },
        env_production: {
            NODE_ENV: "production",
            PORT: 4000
        },
        // Reliability Features
        watch: false, // Don't restart on file change in prod
        max_memory_restart: '1G', // Anti-Memory Leak: Restart if >1GB
        restart_delay: 3000, // Wait 3s before restart (prevent spiral)
        exp_backoff_restart_delay: 100 // Progressive delay if crashing repeatedly
    }]
};
