// TODO: Phase 1 — MemoryEvent.js Mongoose schema (append-only audit log)
// { _id, memoryId, userId, action, detail, createdAt }
// action: "proposed" | "accepted" | "declined" | "updated" | "expired" | "forgotten"
// Rule: NEVER written without a corresponding Memory write in the same transaction
