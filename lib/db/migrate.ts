import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless"

import * as dotenv from "dotenv" ;

dotenv.config();
if(!process.env.DATABASE_URL) {
    throw new Error("Database url is not set in .env")
}

async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URL!) ;
        const db = drizzle(sql) //initialize the connection
        await migrate(db,{migrationsFolder: "./drizzle"}) ;
        console.log("All migration are successfully done") ;
    } catch (error: any) {
        console.log(error.message);
        process.exit(1) ;
    }
}

runMigration() ;