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

  rescueMode: `Emergency mode! A deadline is extremely close. Create an urgent rescue plan.
Return JSON: { essentialTasks: [{ title: string, duration: number }], estimatedCompletionProbability: number (0-100), urgentActions: ["string"], optimizedSchedule: [{ time: string, action: string }] }`,

  reminderGeneration: `Generate a smart, context-aware reminder message.
Return JSON: { title: "string", message: "string", type: "deadline"|"reminder"|"suggestion" }`,

  goalPlanning: `Analyze a long-term goal and recommend the next milestone.
Return JSON: { nextMilestone: { title: "string", deadline: "string", estimatedDuration: number }, progress: number, suggestions: ["string"] }`,
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

async function createRescuePlan(taskDetails) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.rescueMode },
      { role: "user", content: `Task details: ${JSON.stringify(taskDetails)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
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
};
