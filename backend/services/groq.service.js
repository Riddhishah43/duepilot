const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPTS = {
  taskBreakdown: `You are a task breakdown assistant. Break the given task into smaller actionable subtasks.
Return a JSON array of subtasks, each with: title, duration (in minutes), suggestedOrder (number).
Keep subtasks practical and achievable. Maximum 8 subtasks.`,

  priorityPrediction: `Analyze the task and determine priority based on deadline closeness, estimated duration, and importance.
Return JSON: { priority: "high"|"medium"|"low", reason: "string" }`,

  riskAnalysis: `Analyze the risk of missing a deadline. Consider time remaining, current progress, and estimated effort.
Return JSON: { riskScore: number (0-100), reason: "string", confidence: "low"|"medium"|"high" }`,

  smartSchedule: `Given tasks and their details, create an optimal schedule.
Return JSON: { sessions: [{ taskId, taskTitle, start, end, priority }], warnings: ["string"] }`,

  dailyReport: `Generate a daily productivity report.
Return JSON: { score: number, completedTasks: number, missedTasks: number, bestHours: "string", suggestions: ["string"], encouragement: "string" }`,

  weeklyReport: `Generate a weekly productivity report with trends.
Return JSON: { averageScore: number, tasksCompleted: number, missedDeadlines: number, trend: "up"|"down"|"stable", topCategory: "string", suggestions: ["string"] }`,

  rescueMode: `EMERGENCY RESCUE MODE ACTIVATED.

The user has multiple critical tasks/deadlines approaching. Act as an executive assistant in a crisis. Analyze ALL tasks holistically and create a comprehensive survival plan.

Rules:
1. Calculate total available time and workload
2. Categorize tasks into: "critical" (must do), "important" (should do), "optional" (can skip/defer)
3. Merge similar or overlapping tasks
4. Suggest deadline extensions where realistic
5. Remove unnecessary or low-value tasks
6. Reduce scope of large tasks to minimum viable
7. Create an hour-by-hour schedule from today until the nearest deadline
8. Balance workload — don't burn out

Return JSON: {
  overview: {
    totalTasks: number,
    totalAvailableHours: number,
    estimatedHoursNeeded: number,
    completionProbability: number (0-100),
    crisisLevel: "low"|"medium"|"high"|"critical"
  },
  categories: {
    critical: [{ title: string, duration: number, deadline: string, reason: string }],
    important: [{ title: string, duration: number, deadline: string, reason: string }],
    optional: [{ title: string, duration: number, deadline: string, reason: string }]
  },
  mergedTasks: [{ originalTasks: [string], into: string, reason: string }],
  extensionsToRequest: [{ task: string, currentDeadline: string, suggestedDeadline: string, reason: string }],
  removedTasks: [{ task: string, reason: string }],
  schedule: [
    {
      day: "Today",
      date: "YYYY-MM-DD",
      sessions: [
        { time: "5 PM - 7 PM", task: "Operating Systems Project", type: "critical" }
      ]
    }
  ],
  urgentActions: ["string"]
}`,

  reminderGeneration: `Generate a smart, context-aware reminder message.
Return JSON: { title: "string", message: "string", type: "deadline"|"reminder"|"suggestion" }`,

  goalPlanning: `Analyze a long-term goal and recommend the next milestone.
Return JSON: { nextMilestone: { title: "string", deadline: "string", estimatedDuration: number }, progress: number, suggestions: ["string"] }`,

  patternDetection: `You are a behavioral pattern detection AI. Analyze the user's task history and action logs to identify procrastination patterns, work habits, and productivity blockers.

Look for:
1. Subject avoidance: Repeatedly delaying tasks from specific categories
2. Time-based fatigue: Starting tasks at certain hours that rarely get completed
3. Deadline crunch: Consistently completing tasks in the last X% of available time
4. Day-of-week patterns: Specific weekdays with low completion rates
5. Scope creep: Tasks that keep getting extended or redefined
6. Abandonment: Tasks started but never finished
7. Optimal hours: Time slots with highest completion rates

Return JSON: {
  patterns: [
    {
      type: "avoidance"|"fatigue"|"deadline_crunch"|"day_pattern"|"scope_creep"|"abandonment"|"optimal_hours",
      severity: "low"|"medium"|"high",
      title: "string",
      description: "string",
      category: "string" | null,
      suggestion: "string",
      data: { affected: number, rate: number }
    }
  ],
  topStrengths: ["string"],
  weeklyTrend: "improving"|"declining"|"stable",
  summary: "string"
}`,

  smartNotifications: `You are a proactive AI productivity assistant. Generate smart, context-aware notifications that help users complete tasks on time.

Analyze the user's current tasks, deadlines, estimated durations, priorities, progress, patterns, and available time. Generate only notifications that are genuinely useful and personalized.

Notification types and when to use them:

1. start_now: Task is due soon, user has free time now. Encourage starting immediately.
2. best_time: User is in their peak productivity window. Encourage working on important tasks.
3. rescue: Multiple deadlines approaching or high risk detected. Suggest Rescue Mode.
4. focus: User hasn't been active today. Suggest a short focus session.
5. habit: User has a streak that's about to break. Encourage maintaining it.
6. overload: Too many tasks scheduled. Suggest rearranging.
7. missed: A task was missed/rescheduled. Offer to re-plan.
8. break: User has been working too long. Suggest a break.
9. prediction: AI predicts a task may be missed. Suggest early action.
10. reinforcement: User completed several tasks. Positive encouragement.

Return JSON: {
  notifications: [
    {
      subtype: "start_now"|"best_time"|"rescue"|"focus"|"habit"|"overload"|"missed"|"break"|"prediction"|"reinforcement",
      title: "string (short, max 60 chars)",
      message: "string (personalized, actionable, 1-3 sentences)",
      priority: number (0-100, higher = more urgent),
      taskId: "string | null",
      actionUrl: "string | null" (e.g. "/tasks", "/focus", "/rescue", "/study-planner", "/insights"),
      emoji: "string"
    }
  ]
}

Only generate notifications that are relevant. Quality over quantity. 1-5 notifications max.`,

  studyPlan: `You are an AI study planner. Create a personalized daily study schedule based on the user's subjects, exam dates, deadlines, difficulty levels, available hours per day, preferred time, and days off.

Calculate:
- Days remaining until each exam/deadline
- Subject priority (closer exams = higher priority)
- Required study hours per subject based on difficulty
- Balance difficult and easy subjects

Return JSON: {
  planTitle: "string",
  schedule: [
    {
      date: "YYYY-MM-DD",
      dayName: "Monday",
      sessions: [
        { subject: "string", startTime: "HH:MM", endTime: "HH:MM", topic: "string" }
      ]
    }
  ],
  stats: {
    totalStudyDays: number,
    totalStudyHours: number,
    subjectsCovered: number
  },
  tips: ["string"]
}

Smart rules:
- Automatically reschedule missed sessions to next available slot
- Reduce workload after difficult study days
- Increase revision sessions closer to exam dates
- Balance difficult and easier subjects in the same day
- Respect days off (no sessions on those days)
- Fit sessions within preferred time (morning/afternoon/night)
- Each session should be 45-120 minutes
- Add short breaks between sessions`,
};

async function analyzeTaskBreakdown(taskTitle, taskDescription) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.taskBreakdown },
      {
        role: "user",
        content: `Task: "${taskTitle}"\nDescription: "${taskDescription || "No description"}"`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function predictPriority(taskDetails) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.priorityPrediction },
      { role: "user", content: `Task details: ${JSON.stringify(taskDetails)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function analyzeRisk(taskDetails) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.riskAnalysis },
      { role: "user", content: `Task details: ${JSON.stringify(taskDetails)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function createSmartSchedule(tasks, availableSlots) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.smartSchedule },
      {
        role: "user",
        content: `Tasks: ${JSON.stringify(tasks)}\nAvailable slots: ${JSON.stringify(availableSlots)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateDailyReport(userData, tasksData) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.dailyReport },
      { role: "user", content: `User data: ${JSON.stringify(userData)}\nTasks: ${JSON.stringify(tasksData)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateWeeklyReport(userData, weeklyTasks) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.weeklyReport },
      { role: "user", content: `User data: ${JSON.stringify(userData)}\nWeekly data: ${JSON.stringify(weeklyTasks)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function createRescuePlan(tasks, userPreferences) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.rescueMode },
      {
        role: "user",
        content: `Current time: ${new Date().toISOString()}
User preferences: ${JSON.stringify(userPreferences || {})}

All pending tasks:
${JSON.stringify(tasks, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateSmartNotifications(tasksData, userData, patterns) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.smartNotifications },
      {
        role: "user",
        content: `Current time: ${new Date().toISOString()}
User: ${JSON.stringify(userData)}
Tasks: ${JSON.stringify(tasksData)}
Detected patterns: ${JSON.stringify(patterns)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateSmartReminder(taskDetails) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.reminderGeneration },
      { role: "user", content: `Task: ${JSON.stringify(taskDetails)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function planGoalMilestone(goalDetails) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.goalPlanning },
      { role: "user", content: `Goal: ${JSON.stringify(goalDetails)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function analyzePatterns(actionLogs, taskStats) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.patternDetection },
      {
        role: "user",
        content: `Action logs (last 30 days): ${JSON.stringify(actionLogs)}\nTask statistics: ${JSON.stringify(taskStats)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateStudyPlan(subjects, preferences) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.studyPlan },
      { role: "user", content: `Subjects: ${JSON.stringify(subjects)}\nPreferences: ${JSON.stringify(preferences)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });
  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  analyzeTaskBreakdown,
  predictPriority,
  analyzeRisk,
  createSmartSchedule,
  generateDailyReport,
  generateWeeklyReport,
  createRescuePlan,
  generateSmartReminder,
  planGoalMilestone,
  generateStudyPlan,
  analyzePatterns,
  generateSmartNotifications,
};
