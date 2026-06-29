function getAgeScore(ticket, hoursSinceTouched) {
  const status = ticket.status;

  if (status === "closed") return 0;

  if (status === "new") {
    if (hoursSinceTouched >= 24) return 60;
    if (hoursSinceTouched >= 4) return 25;
    return 0;
  }

  if (status === "waiting_technicia") {
    if (hoursSinceTouched >= 24) return 50;
    if (hoursSinceTouched >= 4) return 25;
    return 10;
  }

  if (status === "open") {
    if (hoursSinceTouched >= 72) return 40; //3 days
    if (hoursSinceTouched >= 24) return 20;
    return 5;
  }

  if (status === "in_progress") {
    if (hoursSinceTouched >= 168) return 35; // week
    if (hoursSinceTouched >= 48) return 20;
    return 5;
  }

  if (status === "waiting_customer") {
    if (hoursSinceTouched >= 168) return 15; // week
    if (hoursSinceTouched >= 72) return 8;
    return 0;
  }

  return 0;
}

function calculateUrgencyScore(call) {
  if (ticket.status === "סגורה") {
    return 0;
  }

  const STATUS_SCORE = {
    "closed": 0,
    "waiting_customer": 10,
    "in_progress": 35,
    "open": 45,
    "new": 55,
    "waiting_technician": 70,
  };

  const PRIORITY_SCORE = {
    "low": 0,
    "min": 15,
    "high": 35,
    "urgent": 70,
  };

  const TYPE_SCORE = {
    "question": 5,
    "billing": 10,
    "maintenance": 15,
    "installation": 20,
    "updrade": 15,
    "warranty": 20,
    "fault": 30,
    "complaint": 40,
    "emergency": 90,
    "other": 5,
  };

  const touchedAt = new Date(call.updated_at);
  const now = new Date();

  const hoursSinceTouched =
    (now.getTime() - touchedAt.getTime()) / 1000 / 60 / 60;

  const statusScore = STATUS_SCORE[ticket.status] ?? 0;
  const priorityScore = PRIORITY_SCORE[ticket.priority] ?? 0;
  const typeScore = TYPE_SCORE[call.type] ?? 0;
  const ageScore = getAgeScore(call, hoursSinceTouched);

  return statusScore + priorityScore + typeScore + ageScore;
}