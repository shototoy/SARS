import { Capacitor } from '@capacitor/core';
import { LocalNotifications as LocalNotificationsPlugin } from '@capacitor/local-notifications';
import dayjs from 'dayjs';

const OVERDUE_DAILY_ID = 2_000_001;
const OVERDUE_DAILY_HOUR = 9;
const OVERDUE_DAILY_MINUTE = 0;
const ALARM_BURST_COUNT = 6;
const ALARM_BURST_STEP_SECONDS = 5;
const UPCOMING_SLOT_ID_STRIDE = 10;
const UPCOMING_SLOT_ID_CAPACITY = 100;

const REMINDER_CHANNEL_ID = 'campusconnect-reminders-v3';
const ALARM_CHANNEL_ID = 'campusconnect-alarms-v1';
const TEST_NOTIFICATION_BASE_ID = 9_999_900;

function loadPlugin() {
  if (!Capacitor.isPluginAvailable('LocalNotifications')) return null;
  return LocalNotificationsPlugin;
}

function withTimeout(promise, ms, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`Timeout: ${label} (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

async function ensureNotificationChannels(plugin) {

  try {
    await withTimeout(
      plugin.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: 'Reminders',
        description: 'CampusConnect assignment reminders',
        importance: 5,
        sound: 'beep',
        vibration: true,
        lights: true,
        visibility: 1,
      }),
      4000,
      'create reminders channel'
    );
  } catch {

  }

  try {
    await withTimeout(
      plugin.createChannel({
        id: ALARM_CHANNEL_ID,
        name: 'Alarms',
        description: 'Urgent due and overdue assignment alarms',
        importance: 5,
        sound: 'beep',
        vibration: true,
        lights: true,
        visibility: 1,
      }),
      4000,
      'create alarms channel'
    );
  } catch {

  }
}

function addBurstCancelIds(toCancel, baseId, burstCount) {
  for (let i = 0; i < burstCount; i += 1) {
    toCancel.push({ id: baseId + i });
  }
}

function buildBurstNotifications({
  baseId,
  at,
  title,
  body,
  extra,
  burstCount,
  stepSeconds,
  channelId,
  ongoingFirst = false,
}) {
  const firstAt = at instanceof Date ? at.getTime() : new Date(at).getTime();
  const notifications = [];
  for (let i = 0; i < burstCount; i += 1) {
    notifications.push({
      id: baseId + i,
      title,
      body,
      schedule: { at: new Date(firstAt + i * stepSeconds * 1000), allowWhileIdle: true },
      channelId,
      ongoing: ongoingFirst && i === 0,
      autoCancel: true,
      extra: { ...(extra || {}), burstIndex: i, burstCount },
    });
  }
  return notifications;
}

function reminderProfile(kind) {
  switch (kind) {
    case 't-3d':
      return { burstCount: 1, stepSeconds: 1, channelId: REMINDER_CHANNEL_ID, title: 'Upcoming in 3 days' };
    case 't-2d':
      return { burstCount: 1, stepSeconds: 1, channelId: REMINDER_CHANNEL_ID, title: 'Upcoming in 2 days' };
    case 't-1d':
      return { burstCount: 2, stepSeconds: 8, channelId: REMINDER_CHANNEL_ID, title: 'Due tomorrow' };
    case 't-0d':
      return { burstCount: 3, stepSeconds: 6, channelId: REMINDER_CHANNEL_ID, title: 'Due today' };
    case 't-12h':
      return { burstCount: 3, stepSeconds: 6, channelId: ALARM_CHANNEL_ID, title: 'Due in 12 hours' };
    case 't-6h':
      return { burstCount: 4, stepSeconds: 5, channelId: ALARM_CHANNEL_ID, title: 'Due in 6 hours' };
    case 't-1h':
      return { burstCount: 5, stepSeconds: 5, channelId: ALARM_CHANNEL_ID, title: 'Due in 1 hour' };
    default:
      return { burstCount: 2, stepSeconds: 6, channelId: REMINDER_CHANNEL_ID, title: 'Upcoming reminder' };
  }
}

export async function testLocalNotifications({ secondsFromNow = 5 } = {}) {
  const platform = typeof Capacitor.getPlatform === 'function' ? Capacitor.getPlatform() : 'unknown';
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      message: 'Local notifications require a native Android/iOS build (not the web dev server).',
      details: { native: false, platform },
    };
  }

  const plugin = loadPlugin();
  if (!plugin) {
    return {
      ok: false,
      message: 'LocalNotifications plugin is unavailable in this build.',
      details: { plugin: false, platform },
    };
  }

  let permission = null;
  try {
    permission = await withTimeout(plugin.checkPermissions(), 4000, 'checkPermissions');
  } catch {

  }

  const beforeDisplay =
    permission?.display ?? permission?.notifications ?? permission?.receive ?? permission?.result ?? null;
  if (!beforeDisplay || beforeDisplay !== 'granted') {
    permission = await withTimeout(plugin.requestPermissions(), 10_000, 'requestPermissions');
  }

  const display =
    permission?.display ?? permission?.notifications ?? permission?.receive ?? permission?.result ?? null;
  if (display && display !== 'granted') {
    return {
      ok: false,
      message: `Notifications permission not granted (${display}).`,
      details: { permission, platform },
    };
  }

  await ensureNotificationChannels(plugin);

  const at = new Date(Date.now() + Math.max(1, secondsFromNow) * 1000);
  try {
    const toCancel = [];
    addBurstCancelIds(toCancel, TEST_NOTIFICATION_BASE_ID, ALARM_BURST_COUNT);
    await withTimeout(plugin.cancel({ notifications: toCancel }), 4000, 'cancel test');
  } catch {

  }

  try {
    await withTimeout(
      plugin.schedule({
        notifications: buildBurstNotifications({
          baseId: TEST_NOTIFICATION_BASE_ID,
          at,
          title: 'CampusConnect test notification',
          body: 'Urgent test alarm. Tap to open and clear.',
          extra: { kind: 'test' },
          burstCount: ALARM_BURST_COUNT,
          stepSeconds: ALARM_BURST_STEP_SECONDS,
          channelId: ALARM_CHANNEL_ID,
          ongoingFirst: true,
        }),
      }),
      6000,
      'schedule test'
    );
  } catch (e) {
    return {
      ok: false,
      message: 'Failed to schedule test notification.',
      details: { error: String(e?.message || e), permission, platform },
    };
  }

  let pending = null;
  try {
    const res = await withTimeout(plugin.getPending(), 4000, 'getPending');
    pending = res?.notifications?.length ?? null;
  } catch {

  }

  return {
    ok: true,
    message: `Scheduled. You should get a notification in ~${Math.max(1, secondsFromNow)}s.`,
    details: {
      permission,
      platform,
      scheduledAt: at.toISOString(),
      pending,
      reminderChannelId: REMINDER_CHANNEL_ID,
      alarmChannelId: ALARM_CHANNEL_ID,
    },
  };
}

function legacyReminderIdForAssignment(assignmentId) {

  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 1_000_000 + Math.abs(Math.trunc(numeric));
}

function dueNotificationIdForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 3_000_000 + Math.abs(Math.trunc(numeric)) * 10;
}

function overdueNotificationIdForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 6_000_000 + Math.abs(Math.trunc(numeric)) * 10;
}

function legacySingleDueNotificationIdForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 3_000_000 + Math.abs(Math.trunc(numeric));
}

function legacySingleOverdueNotificationIdForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 6_000_000 + Math.abs(Math.trunc(numeric));
}

function slotBaseForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 4_000_000 + Math.abs(Math.trunc(numeric)) * UPCOMING_SLOT_ID_CAPACITY;
}

function legacySlotBaseForAssignment(assignmentId) {
  const numeric = Number(assignmentId);
  if (!Number.isFinite(numeric)) return null;
  return 4_000_000 + Math.abs(Math.trunc(numeric)) * 10;
}

function upcomingReminderSlots(assignment) {
  const deadline = assignment?.deadline ? dayjs(assignment.deadline) : null;
  if (!deadline || !deadline.isValid()) return [];
  if (assignment?.status === 'Completed') return [];
  if (!deadline.isAfter(dayjs())) return [];

  const now = dayjs();
  const soon = now.add(30, 'second');

  const threeDaysMorning = deadline.subtract(3, 'day').hour(9).minute(0).second(0).millisecond(0);
  const twoDaysMorning = deadline.subtract(2, 'day').hour(9).minute(0).second(0).millisecond(0);
  const oneDayMorning = deadline.subtract(1, 'day').hour(9).minute(0).second(0).millisecond(0);
  const dayOfMorning = deadline.hour(9).minute(0).second(0).millisecond(0);
  const twelveHours = deadline.subtract(12, 'hour');
  const sixHours = deadline.subtract(6, 'hour');
  const oneHour = deadline.subtract(1, 'hour');

  const candidates = [
    { kind: 't-3d', at: threeDaysMorning },
    { kind: 't-2d', at: twoDaysMorning },
    { kind: 't-1d', at: oneDayMorning },
    { kind: 't-0d', at: dayOfMorning },
    { kind: 't-12h', at: twelveHours },
    { kind: 't-6h', at: sixHours },
    { kind: 't-1h', at: oneHour },
  ];

  return candidates
    .filter((c) => c.at.isValid() && c.at.isAfter(soon) && c.at.isBefore(deadline))
    .sort((a, b) => a.at.valueOf() - b.at.valueOf());
}

function shouldScheduleDueNow(assignment) {
  if (!assignment?.deadline) return false;
  if (assignment?.status === 'Completed') return false;
  const deadline = dayjs(assignment.deadline);
  return deadline.isValid() && deadline.isAfter(dayjs());
}

function shouldScheduleOverdueNudge(assignment) {
  if (!assignment?.deadline) return false;
  if (assignment?.status === 'Completed') return false;
  const deadline = dayjs(assignment.deadline);
  if (!deadline.isValid()) return false;

  if (!deadline.isAfter(dayjs())) return false;
  return true;
}

function countOverdue(assignments) {
  const now = dayjs();
  let overdue = 0;
  for (const a of assignments) {
    if (a?.status === 'Completed') continue;
    if (!a?.deadline) continue;
    const d = dayjs(a.deadline);
    if (!d.isValid()) continue;
    if (d.isBefore(now)) overdue += 1;
  }
  return overdue;
}

function nextOverdueDailyAt() {
  const now = dayjs();
  const todayAt = now.hour(OVERDUE_DAILY_HOUR).minute(OVERDUE_DAILY_MINUTE).second(0).millisecond(0);
  if (todayAt.isAfter(now)) return todayAt;
  return todayAt.add(1, 'day');
}

export async function syncAssignmentReminders(assignments, previousAssignmentIds) {
  if (!Capacitor.isNativePlatform()) return;

  const plugin = loadPlugin();
  if (!plugin) return;

  const permission = await plugin.requestPermissions();

  const display = permission?.display ?? permission?.notifications ?? permission?.receive;
  if (display && display !== 'granted') return;

  await ensureNotificationChannels(plugin);

  const currentIds = new Set(assignments.map((a) => a.id));

  const toCancel = [];
  for (const oldId of previousAssignmentIds) {
    if (!currentIds.has(oldId)) {
      const legacyId = legacyReminderIdForAssignment(oldId);
      if (legacyId != null) toCancel.push({ id: legacyId });

      const base = slotBaseForAssignment(oldId);
      if (base != null) {
        for (let i = 0; i < UPCOMING_SLOT_ID_CAPACITY; i += 1) toCancel.push({ id: base + i });
      }
      const legacyBase = legacySlotBaseForAssignment(oldId);
      if (legacyBase != null) {
        for (let i = 0; i < 10; i += 1) toCancel.push({ id: legacyBase + i });
      }
      const dueId = dueNotificationIdForAssignment(oldId);
      if (dueId != null) addBurstCancelIds(toCancel, dueId, ALARM_BURST_COUNT);
      const legacyDueId = legacySingleDueNotificationIdForAssignment(oldId);
      if (legacyDueId != null) toCancel.push({ id: legacyDueId });
      const overdueId = overdueNotificationIdForAssignment(oldId);
      if (overdueId != null) addBurstCancelIds(toCancel, overdueId, ALARM_BURST_COUNT);
      const legacyOverdueId = legacySingleOverdueNotificationIdForAssignment(oldId);
      if (legacyOverdueId != null) toCancel.push({ id: legacyOverdueId });
    }
  }

  for (const a of assignments) {
    const legacyId = legacyReminderIdForAssignment(a.id);
    if (legacyId != null) toCancel.push({ id: legacyId });

    const base = slotBaseForAssignment(a.id);
    if (base != null) {

      for (let i = 0; i < UPCOMING_SLOT_ID_CAPACITY; i += 1) toCancel.push({ id: base + i });
    }
    const legacyBase = legacySlotBaseForAssignment(a.id);
    if (legacyBase != null) {
      for (let i = 0; i < 10; i += 1) toCancel.push({ id: legacyBase + i });
    }

    const dueId = dueNotificationIdForAssignment(a.id);
    if (dueId == null) continue;
    if (!shouldScheduleDueNow(a)) addBurstCancelIds(toCancel, dueId, ALARM_BURST_COUNT);
    const legacyDueId = legacySingleDueNotificationIdForAssignment(a.id);
    if (legacyDueId != null) toCancel.push({ id: legacyDueId });

    const overdueId = overdueNotificationIdForAssignment(a.id);
    if (overdueId == null) continue;
    if (!shouldScheduleOverdueNudge(a)) addBurstCancelIds(toCancel, overdueId, ALARM_BURST_COUNT);
    const legacyOverdueId = legacySingleOverdueNotificationIdForAssignment(a.id);
    if (legacyOverdueId != null) toCancel.push({ id: legacyOverdueId });
  }

  const overdueCount = countOverdue(assignments);
  if (overdueCount === 0) toCancel.push({ id: OVERDUE_DAILY_ID });

  if (toCancel.length) {
    try {
      await plugin.cancel({ notifications: toCancel });
    } catch {

    }
  }

  const toSchedule = [];
  for (const a of assignments) {
    const base = slotBaseForAssignment(a.id);
    if (base == null) continue;

    const slots = upcomingReminderSlots(a);
    if (!slots.length) continue;

    const deadline = dayjs(a.deadline);
    const when = deadline.format('MMM D, h:mm A');
    const bodyBase = a.subject ? `${a.subject} - Due ${when}` : `Due ${when}`;

    slots.forEach((slot, index) => {
      const profile = reminderProfile(slot.kind);
      const slotBaseId = base + index * UPCOMING_SLOT_ID_STRIDE;
      const label = profile.title;
      const title = `${label}: ${a.title}`;
      const body = profile.channelId === ALARM_CHANNEL_ID ? `Urgent reminder - ${bodyBase}` : bodyBase;
      toSchedule.push(
        ...buildBurstNotifications({
          baseId: slotBaseId,
          at: slot.at.toDate(),
          title,
          body,
          extra: { assignmentId: a.id, kind: slot.kind, intensity: profile.burstCount },
          burstCount: profile.burstCount,
          stepSeconds: profile.stepSeconds,
          channelId: profile.channelId,
          ongoingFirst: profile.channelId === ALARM_CHANNEL_ID && profile.burstCount >= 4,
        })
      );
    });
  }

  for (const a of assignments) {
    if (!shouldScheduleDueNow(a)) continue;
    const deadline = dayjs(a.deadline);
    const dueId = dueNotificationIdForAssignment(a.id);
    if (dueId == null) continue;

    toSchedule.push(
      ...buildBurstNotifications({
        baseId: dueId,
        at: deadline.toDate(),
        title: 'Assignment due now',
        body: a.subject ? `${a.title} - ${a.subject}` : a.title,
        extra: { assignmentId: a.id, kind: 'due' },
        burstCount: ALARM_BURST_COUNT,
        stepSeconds: ALARM_BURST_STEP_SECONDS,
        channelId: ALARM_CHANNEL_ID,
        ongoingFirst: true,
      })
    );
  }

  for (const a of assignments) {
    if (!shouldScheduleOverdueNudge(a)) continue;
    const deadline = dayjs(a.deadline);
    const overdueAt = deadline.add(1, 'minute');
    if (!overdueAt.isAfter(dayjs())) continue;

    const overdueId = overdueNotificationIdForAssignment(a.id);
    if (overdueId == null) continue;

    toSchedule.push(
      ...buildBurstNotifications({
        baseId: overdueId,
        at: overdueAt.toDate(),
        title: 'Assignment overdue',
        body: a.subject ? `${a.title} - ${a.subject}` : a.title,
        extra: { assignmentId: a.id, kind: 'overdue' },
        burstCount: ALARM_BURST_COUNT,
        stepSeconds: ALARM_BURST_STEP_SECONDS,
        channelId: ALARM_CHANNEL_ID,
        ongoingFirst: true,
      })
    );
  }

  if (toSchedule.length) {
    try {
      await plugin.schedule({ notifications: toSchedule });
    } catch {

    }
  }

  if (overdueCount > 0) {
    const at = nextOverdueDailyAt();
    try {
      await plugin.schedule({
        notifications: [
          {
            id: OVERDUE_DAILY_ID,
            title: 'Overdue assignments',
            body: overdueCount === 1 ? 'You have 1 overdue task.' : `You have ${overdueCount} overdue tasks.`,
            schedule: { at: at.toDate(), repeats: true, allowWhileIdle: true },
            channelId: ALARM_CHANNEL_ID,
            ongoing: true,
            autoCancel: true,
          },
        ],
      });
    } catch {

    }
  }
}
