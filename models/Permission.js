import mongoose from "mongoose";

/*User types:
superadmin: CRUD access for all tables
admin: CRUD access to limited tables
subcontractor: RU to limited tables
customer: RU to limited tables
*/

const permissionSchema = new mongoose.Schema({
  permissionDescription: { type: String, required: true },
  tableName: { type: String },
  permission: { type: String },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Permission", permissionSchema);
