import { Capacitor } from '@capacitor/core';
import dayjs from 'dayjs';

let LocalNotifications;

async function loadPlugin() {
  if (LocalNotifications) return LocalNotifications;
  try {
    const mod = await import('@capacitor/local-notifications');
    LocalNotifications = mod.LocalNotifications;
  } catch {
    LocalNotifications = null;
  }
  return LocalNotifications;
}

function notificationIdForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 1_000_000 + Math.abs(Math.trunc(numeric));
}

function reminderTime(assignment) {
  if (!assignment?.deadline) return null;
  const deadline = dayjs(assignment.deadline);
  if (!deadline.isValid()) return null;
  const minutes = Number.isFinite(Number(assignment.remindBeforeMinutes))
    ? Number(assignment.remindBeforeMinutes)
    : 1440;
  return deadline.subtract(minutes, 'minute');
}

function shouldScheduleReminder(assignment) {
  if (!assignment?.reminderEnabled) return false;
  if (assignment.status === 'Completed') return false;
  const at = reminderTime(assignment);
  if (!at) return false;
  return at.isAfter(dayjs());
}

export async function syncAssignmentReminders(assignments, previousAssignmentIds) {
  if (!Capacitor.isNativePlatform()) return;

  const plugin = await loadPlugin();
  if (!plugin) return;

  const permission = await plugin.requestPermissions();
  if (permission?.display !== 'granted') return;

  const currentIds = new Set(assignments.map((a) => a.id));

  const toCancel = [];
  for (const oldId of previousAssignmentIds) {
    if (!currentIds.has(oldId)) {
      const nId = notificationIdForAssignment(oldId);
      if (nId != null) toCancel.push({ id: nId });
    }
  }

  for (const a of assignments) {
    const nId = notificationIdForAssignment(a.id);
    if (nId == null) continue;
    if (!shouldScheduleReminder(a)) toCancel.push({ id: nId });
  }

  if (toCancel.length) {
    try {
      await plugin.cancel({ notifications: toCancel });
    } catch {
      // ignore
    }
  }

  const toSchedule = [];
  for (const a of assignments) {
    if (!shouldScheduleReminder(a)) continue;
    const nId = notificationIdForAssignment(a.id);
    if (nId == null) continue;

    const at = reminderTime(a);
    if (!at) continue;

    toSchedule.push({
      id: nId,
      title: `Assignment due: ${a.title}`,
      body: a.subject ? `${a.subject} • Due ${dayjs(a.deadline).format('MMM D, h:mm A')}` : `Due ${dayjs(a.deadline).format('MMM D, h:mm A')}`,
      schedule: { at: at.toDate(), allowWhileIdle: true },
      extra: { assignmentId: a.id },
    });
  }

  if (toSchedule.length) {
    try {
      await plugin.schedule({ notifications: toSchedule });
    } catch {
      // ignore
    }
  }
}

