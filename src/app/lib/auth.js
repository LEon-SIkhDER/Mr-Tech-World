import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Fixes Windows / ISP MongoDB SRV DNS lookup

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("Mr_Tech_World");

export const auth = betterAuth({
    emailAndPassword: { // [!code highlight]
        enabled: true, // [!code highlight]
    }, // [!code highlight]
    database: mongodbAdapter(db, {
        client,
    }),
});