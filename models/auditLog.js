const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auditLogSchema = new Schema(
    {
        actor: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        actorUsername: {
            type: String,
            default: "System",
        },
        action: {
            type: String,
            required: true,
        },
        entityType: {
            type: String,
            required: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
        },
        details: {
            type: String,
            default: "",
        },
        ip: {
            type: String,
            default: "127.0.0.1",
        },
    },
    { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
