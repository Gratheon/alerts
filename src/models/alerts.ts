import { sql } from "@databases/mysql";
import sha1 from 'sha1';

import { storage } from "../storage";

export const alertModel = {
	getAlerts: async function (user_id) {
		return await storage().query(
			sql`SELECT id, text, date_added FROM alerts WHERE user_id=${user_id}`
		);
	},
}
