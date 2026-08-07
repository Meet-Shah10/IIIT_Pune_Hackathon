function buildTimelineEvent(event, memory) {
  const memoryContent = memory?.content || event?.memoryContent || 'Unknown memory';
  const reason = memory?.reasoning || event?.reason || event?.detail || 'No reason provided';
  const savedAt = memory?.createdAt || event?.createdAt;

  return {
    ...event,
    memoryContent,
    memoryCategory: memory?.category || 'general',
    memorySensitivity: memory?.sensitivity || 'low',
    reason,
    savedAt,
    detail: event?.detail || `Saved memory: ${memoryContent}`,
    memory: memory ? {
      _id: memory._id,
      content: memory.content,
      category: memory.category,
      sensitivity: memory.sensitivity,
      reasoning: memory.reasoning,
      status: memory.status,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    } : null,
  };
}

function serializeTimelineEvents(events, memoriesById) {
  return events.map((event) => {
    const memory = memoriesById.get(String(event.memoryId)) || null;
    return buildTimelineEvent(event, memory);
  });
}

module.exports = {
  buildTimelineEvent,
  serializeTimelineEvents,
};
