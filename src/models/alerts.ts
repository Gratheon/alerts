import { sql } from "@databases/mysql";
import sha1 from 'sha1';

import { storage } from "../storage";

export const alertModel = {
	getAlerts: async function (user_id) {
		return await storage().query(
			sql`SELECT id, text, date_added, hive_id, metric_type, metric_value, delivered 
			    FROM alerts 
			    WHERE user_id=${user_id} 
			    ORDER BY date_added DESC 
			    LIMIT 100`
		);
	},

	createAlert: async function (user_id, { text, hive_id = null, metric_type = null, metric_value = null, alert_rule_id = null }) {
		const result = await storage().query(sql`
			INSERT INTO alerts (user_id, text, hive_id, metric_type, metric_value, alert_rule_id)
			VALUES (${user_id}, ${text}, ${hive_id}, ${metric_type}, ${metric_value}, ${alert_rule_id})
		`);
		return result.insertId;
	},

	markAsDelivered: async function (alert_id) {
		await storage().query(sql`
			UPDATE alerts 
			SET delivered=true, delivery_attempts=delivery_attempts+1 
			WHERE id=${alert_id}
		`);
	},
}
