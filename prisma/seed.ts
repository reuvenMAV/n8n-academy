import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function validationRule(
  id: string,
  type: string,
  params: Record<string, unknown>,
  errorHe: string,
  errorEn: string,
  hintHe?: string,
  hintEn?: string
) {
  return { id, type, params, errorMessageHe: errorHe, errorMessageEn: errorEn, hintHe, hintEn };
}

const flashcardDataBySlug: Record<string, { front: string; frontEn: string; back: string; backEn: string; type: string }[]> = {
  'automation-101': [
    { front: 'מה זה Workflow באוטומציה?', frontEn: 'What is a Workflow in automation?', back: 'חיבור בין אפליקציות, אתרים ושירותים לביצוע תהליך שלם.', backEn: 'Connecting apps, websites and services to run a complete process.', type: 'concept' },
    { front: 'מה ההבדל בין Node ל-Trigger?', frontEn: 'What is the difference between a Node and a Trigger?', back: 'Node – אבן בניין שמייצגת פעולה אחת. Trigger – האירוע שמתניע את התהליך (למשל מייל חדש, תזמון).', backEn: 'Node – a building block representing one action. Trigger – the event that starts the process (e.g. new email, schedule).', type: 'concept' },
    { front: 'מה היתרון העסקי המרכזי של אוטומציה?', frontEn: 'What is a key business benefit of automation?', back: 'שיפור פרודוקטיביות (20%–30%), עלייה ברווחיות, חיסכון בזמן וצמצום טעויות אנוש.', backEn: 'Higher productivity (20–30%), increased profitability, time savings, and fewer human errors.', type: 'concept' },
  ],
  'intro-video': [
    { front: 'מה ההבדל העיקרי בין N8N ל-Zapier?', frontEn: 'What is the main difference between N8N and Zapier?', back: 'N8N היא פלטפורמה open-source שניתן לאחסן בעצמך (Self-host), בעוד Zapier היא שירות ענן בלבד. N8N מאפשרת גמישות מלאה וקוד מותאם אישית.', backEn: 'N8N is open-source and self-hostable, while Zapier is cloud-only. N8N allows full flexibility and custom code.', type: 'concept' },
    { front: 'מה זה Workflow באוטומציה?', frontEn: 'What is a Workflow in automation?', back: 'רצף של צעדים (נודים) שמתבצעים אחד אחרי השני, מעבירים נתונים ביניהם ומבצעים פעולות אוטומטיות.', backEn: 'A sequence of steps (nodes) that run one after another, passing data between them and performing automated actions.', type: 'concept' },
    { front: 'איזה סוג רישיון ל-N8N?', frontEn: 'What type of license does N8N use?', back: 'N8N היא Fair-code (תת-רישיון Apache 2.0 עם Commons Clause) – קוד פתוח עם אפשרות שימוש מסחרי.', backEn: 'N8N is Fair-code (sublicense Apache 2.0 with Commons Clause) – open source with commercial use allowed.', type: 'concept' },
  ],
  'first-trigger': [
    { front: 'מה עושה נוד Manual Trigger?', frontEn: 'What does the Manual Trigger node do?', back: 'מפעיל את ה-workflow ידנית בלחיצה על "Execute Workflow". מתאים לבדיקות והרצה לפי דרישה.', backEn: 'Starts the workflow manually when you click "Execute Workflow". Good for testing and on-demand runs.', type: 'node' },
    { front: 'מה עושה נוד Set?', frontEn: 'What does the Set node do?', back: 'מגדיר או מעדכן שדות על הנתונים (JSON). מאפשר להוסיף, למזג או להחליף ערכים לפני המעבר לנוד הבא.', backEn: 'Sets or updates fields on the data (JSON). Lets you add, merge or replace values before the next node.', type: 'node' },
    { front: 'איך מחברים בין שני נודים בקנבס?', frontEn: 'How do you connect two nodes on the canvas?', back: 'גוררים מהנקודה (handle) של נוד אחד לנקודה של הנוד השני. נוצר Edge שמעביר את הפלט כקלט.', backEn: 'Drag from one node\'s handle to another node\'s handle. An Edge is created that passes output as input.', type: 'concept' },
  ],
  'http-request': [
    { front: 'מה עושה ה-HTTP Request Node ב-N8N?', frontEn: 'What does the HTTP Request Node do in N8N?', back: 'שולח קריאה HTTP לכל API חיצוני. תומך ב-GET, POST, PUT, DELETE. מחזיר את התגובה כ-JSON לשלב הבא ב-Workflow.', backEn: 'Sends an HTTP call to any external API. Supports GET, POST, PUT, DELETE. Returns the response as JSON to the next node.', type: 'node' },
    { front: 'איזה שדות חיוניים יש ב-HTTP Request?', frontEn: 'What are the essential fields in HTTP Request?', back: 'URL (כתובת ה-API), Method (GET/POST וכו\'), ויכול להוסיף Headers ו-Body בבקשות POST.', backEn: 'URL (API address), Method (GET/POST etc.), and you can add Headers and Body for POST requests.', type: 'node' },
    { front: 'מה מוחזר מהנוד אחרי קריאת API מוצלחת?', frontEn: 'What is returned from the node after a successful API call?', back: 'התגובה כ-JSON – בדרך כלל מערך של items, כשכל item הוא אובייקט עם השדות מה-API.', backEn: 'The response as JSON – usually an array of items, each item being an object with the API fields.', type: 'concept' },
  ],
  'if-condition': [
    { front: 'מה קורה אם התנאי ב-IF Node הוא False ואין חיבור לענף False?', frontEn: 'What happens if the IF Node condition is False and there\'s no connection on the False branch?', back: 'ה-Workflow פשוט עוצר עבור אותו Item. לא נוצרת שגיאה.', backEn: 'The workflow simply stops for that item. No error is thrown.', type: 'concept' },
    { front: 'איך כותבים תנאי "גדול מ-10" בביטוי N8N?', frontEn: 'How do you write "greater than 10" in an N8N expression?', back: '{{ $json.value > 10 }} או בשדה Condition: $json.value > 10', backEn: '{{ $json.value > 10 }} or in Condition field: $json.value > 10', type: 'expression' },
    { front: 'מה ההבדל בין חיבור True ל-False ב-IF?', frontEn: 'What is the difference between True and False connections on IF?', back: 'True – הנתונים עוברים לנוד הבא רק כשהתנאי מתקיים. False – כשהתנאי לא מתקיים.', backEn: 'True – data goes to the next node only when the condition holds. False – when the condition does not hold.', type: 'concept' },
    { front: 'מה עושה נוד IF?', frontEn: 'What does the IF node do?', back: 'מפצל את הזרימה לפי תנאי בוליאני. יש שני פלטים: True ו-False, לפי תוצאת התנאי.', backEn: 'Splits the flow by a boolean condition. Two outputs: True and False, based on the condition result.', type: 'node' },
  ],
  'code-node': [
    { front: 'איך ניגשים לנתונים מהנוד הקודם בקוד?', frontEn: 'How do you access data from the previous node in code?', back: 'items – מערך כל הפריטים; $input.first() – הפריט הראשון; $json – הנתונים של הפריט הנוכחי.', backEn: 'items – array of all items; $input.first() – first item; $json – current item data.', type: 'code' },
    { front: 'מה חייב להחזיר נוד Code?', frontEn: 'What must the Code node return?', back: 'מערך של אובייקטים (array of items). כל אובייקט יעבור לנוד הבא. return [{ key: value }];', backEn: 'An array of objects (array of items). Each object goes to the next node. return [{ key: value }];', type: 'code' },
    { front: 'מה עושה {{ $json.value * 2 }}?', frontEn: 'What does {{ $json.value * 2 }} do?', back: 'לוקח את השדה value מהפריט הנוכחי ומכפיל ב-2. ב-N8N משתמשים ב-$json לגישה לנתוני הפריט.', backEn: 'Takes the value field from the current item and doubles it. In N8N $json is used to access item data.', type: 'expression' },
  ],
  'gmail-send': [
    { front: 'מה עושה נוד Gmail ב-N8N?', frontEn: 'What does the Gmail node do in N8N?', back: 'מתחבר ל-Gmail API – שולח קורא ומנהל מיילים. פעולות: Send, Read, Delete וכו\'.', backEn: 'Connects to Gmail API – sends, reads, manages emails. Operations: Send, Read, Delete, etc.', type: 'node' },
    { front: 'אילו שדות נדרשים לשליחת מייל?', frontEn: 'What fields are required to send an email?', back: 'To (נמען), Subject (נושא), ו-Message / Body (תוכן ההודעה).', backEn: 'To (recipient), Subject (subject line), and Message/Body (content).', type: 'concept' },
    { front: 'האם N8N Academy מריץ Gmail אמיתי?', frontEn: 'Does N8N Academy run real Gmail?', back: 'לא – בסימולטור משתמשים ב-mock. ב-N8N אמיתי צריך OAuth עם חשבון Google.', backEn: 'No – the simulator uses mocks. In real N8N you need OAuth with a Google account.', type: 'concept' },
  ],
  'slack-message': [
    { front: 'מה עושה נוד Slack?', frontEn: 'What does the Slack node do?', back: 'שולח וקורא הודעות בערוצי Slack. תומך בהודעות לערוץ, ל-DM, קבצים ותגובות.', backEn: 'Sends and reads messages in Slack channels. Supports channel messages, DMs, files and replies.', type: 'node' },
    { front: 'איזה שדות נדרשים לשליחת הודעה ל-Slack?', frontEn: 'What fields are needed to send a message to Slack?', back: 'Channel (שם הערוץ, למשל #general) ו-Text (תוכן ההודעה).', backEn: 'Channel (channel name, e.g. #general) and Text (message content).', type: 'concept' },
    { front: 'איך מקבלים גישה לערוץ Slack ב-N8N?', frontEn: 'How do you get access to a Slack channel in N8N?', back: 'מתחברים עם OAuth ל-Slack workspace; ב-Academy משתמשים ב-mock.', backEn: 'Connect via OAuth to your Slack workspace; in Academy we use mocks.', type: 'concept' },
  ],
  'sheets-read': [
    { front: 'מה עושה נוד Google Sheets?', frontEn: 'What does the Google Sheets node do?', back: 'קורא וכותב לגיליונות Google Sheets. פעולות: Read, Append, Update. מזהה לפי Sheet ID.', backEn: 'Reads and writes to Google Sheets. Operations: Read, Append, Update. Identified by Sheet ID.', type: 'node' },
    { front: 'מה מוחזר כשקוראים שורות מ-Sheet?', frontEn: 'What is returned when reading rows from a Sheet?', back: 'מערך של אובייקטים – כל שורה כ-item עם שמות עמודות כשמות שדות.', backEn: 'An array of objects – each row as an item with column names as field names.', type: 'concept' },
    { front: 'איך ניגשים לשדה email מהNode הקודם ב-Expression?', frontEn: 'How do you access the email field from the previous node in an Expression?', back: '{{ $json.email }}', backEn: '{{ $json.email }}', type: 'expression' },
  ],
  'openai-chat': [
    { front: 'מה עושה נוד OpenAI ב-N8N?', frontEn: 'What does the OpenAI node do in N8N?', back: 'שולח prompt למודל (GPT וכו\') ומקבל תשובה טקסטואלית. תומך ב-Chat ו-Completion.', backEn: 'Sends a prompt to the model (GPT etc.) and gets a text response. Supports Chat and Completion.', type: 'node' },
    { front: 'מה השדה העיקרי להזנת שאלה ל-OpenAI?', frontEn: 'What is the main field to send a question to OpenAI?', back: 'Prompt / Message – הטקסט שהמשתמש שולח למודל. יכול להכיל ביטויים כמו {{ $json.question }}.', backEn: 'Prompt/Message – the text sent to the model. Can include expressions like {{ $json.question }}.', type: 'concept' },
    { front: 'מה מוחזר מתגובת OpenAI בנוד?', frontEn: 'What is returned from the OpenAI node response?', back: 'בדרך כלל שדה content עם טקסט התשובה, בתוך choices[0].message או דומה.', backEn: 'Usually a content field with the reply text, inside choices[0].message or similar.', type: 'concept' },
  ],
  'ai-pipeline': [
    { front: 'מה עושה {{ $items().length }}?', frontEn: 'What does {{ $items().length }} do?', back: 'מחזיר את מספר הפריטים (Items) שהגיעו מהNode הקודם.', backEn: 'Returns the number of items received from the previous node.', type: 'expression' },
    { front: 'למה משמש Set לפני OpenAI ב-pipeline?', frontEn: 'Why use Set before OpenAI in a pipeline?', back: 'להכין את הנתונים בפורמט שהמודל מצפה – למשל שדה prompt או message מהמשתמש.', backEn: 'To prepare data in the format the model expects – e.g. a prompt or message field from the user.', type: 'concept' },
    { front: 'איך מעבירים פלט של נוד אחד כקלט לנוד הבא?', frontEn: 'How do you pass one node\'s output as input to the next?', back: 'מחברים ב-Edge. הנתונים זורמים אוטומטית; בנוד הבא משתמשים ב-$json או items.', backEn: 'Connect with an Edge. Data flows automatically; in the next node use $json or items.', type: 'concept' },
  ],
};

async function main() {
  await prisma.progress.deleteMany();
  await prisma.mistakeLog.deleteMany();
  await prisma.flashcardReview.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();

  const course1 = await prisma.course.create({
    data: {
      slug: 'foundations',
      titleHe: 'מסלול 1 – מתחילים',
      titleEn: 'Foundations',
      descHe: 'יסודות N8N ואוטומציה',
      descEn: 'N8N and automation basics',
      level: 'beginner',
      order: 1,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      slug: 'intermediate',
      titleHe: 'מסלול 2 – בינוני',
      titleEn: 'Intermediate',
      descHe: 'אינטגרציות, טיפול בשגיאות ולולאות',
      descEn: 'Integrations, error handling, loops',
      level: 'intermediate',
      order: 2,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      slug: 'advanced',
      titleHe: 'מסלול 3 – מתקדם',
      titleEn: 'Advanced',
      descHe: 'קוד, AI, Production ופרויקטים',
      descEn: 'Code, AI, production and projects',
      level: 'advanced',
      order: 3,
    },
  });

  const courseCustom = await prisma.course.create({
    data: {
      slug: 'custom-lead-systems',
      titleHe: 'קורס מותאם אישית – מערכות לידים למכירה',
      titleEn: 'Custom – Lead Systems to Sell',
      descHe: 'בנה מערכת אמיתית שאפשר למכור. הבנה עמוקה + צ\'ק ליסט + מבחן ידע לכל מודול.',
      descEn: 'Build real sellable systems. Deep understanding, practical checklist, knowledge test per module.',
      level: 'intermediate',
      order: 4,
    },
  });

  const customMod1 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 1: מערכת קליטת לידים אחידה (Lead Capture Hub)', titleEn: 'Module 1: Lead Capture Hub', order: 1 } });
  const customMod2 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 2: אוטומציית WhatsApp עסקית', titleEn: 'Module 2: WhatsApp Business Automation', order: 2 } });
  const customMod3 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 3: CRM אוטומטי', titleEn: 'Module 3: Automated CRM', order: 3 } });
  const customMod4 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 4: Follow-Up אוטומטי', titleEn: 'Module 4: Automated Follow-Up', order: 4 } });
  const customMod5 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 5: אוטומציית תורים ופגישות', titleEn: 'Module 5: Appointments & Calendly', order: 5 } });
  const customMod6 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 6: יציבות מערכת (Production)', titleEn: 'Module 6: Production Stability', order: 6 } });
  const customMod7 = await prisma.module.create({ data: { courseId: courseCustom.id, titleHe: 'מודול 7: מערכות מוכנות למכירה', titleEn: 'Module 7: Systems Ready to Sell', order: 7 } });

  const mod1 = await prisma.module.create({ data: { courseId: course1.id, titleHe: 'מה זה N8N?', titleEn: 'What is N8N?', order: 1 } });
  const mod2 = await prisma.module.create({ data: { courseId: course1.id, titleHe: 'Nodes בסיסיים', titleEn: 'Basic Nodes', order: 2 } });
  const mod3 = await prisma.module.create({ data: { courseId: course1.id, titleHe: 'Data & JSON', titleEn: 'Data & JSON', order: 3 } });
  const mod4 = await prisma.module.create({ data: { courseId: course2.id, titleHe: 'Integrations', titleEn: 'Integrations', order: 1 } });
  const mod5 = await prisma.module.create({ data: { courseId: course2.id, titleHe: 'Error Handling', titleEn: 'Error Handling', order: 2 } });
  const mod6 = await prisma.module.create({ data: { courseId: course2.id, titleHe: 'Loops & Batching', titleEn: 'Loops & Batching', order: 3 } });
  const mod7 = await prisma.module.create({ data: { courseId: course3.id, titleHe: 'Code & Custom Nodes', titleEn: 'Code & Custom Nodes', order: 1 } });
  const mod8 = await prisma.module.create({ data: { courseId: course3.id, titleHe: 'AI & LLM Integrations', titleEn: 'AI & LLM Integrations', order: 2 } });
  const mod9 = await prisma.module.create({ data: { courseId: course3.id, titleHe: 'Production & DevOps', titleEn: 'Production & DevOps', order: 3 } });
  const mod10 = await prisma.module.create({ data: { courseId: course3.id, titleHe: 'Projects אמיתיים', titleEn: 'Real Projects', order: 4 } });
  const mod11 = await prisma.module.create({ data: { courseId: course3.id, titleHe: 'ארכיטקטורת אוטומציה', titleEn: 'Automation Architecture', order: 5 } });

  const placeholderRule = [validationRule('placeholder', 'node_exists', { nodeType: 'manualTrigger' }, 'שיעור תוכן – אימות לא רלוונטי', 'Content lesson – no validation', undefined, undefined)] as unknown[];
  const mk = (moduleId: string, slug: string, titleHe: string, titleEn: string, order: number, type: string = 'content', xp = 50, min = 10) => ({
    moduleId,
    slug,
    titleHe,
    titleEn,
    type,
    xpReward: xp,
    order,
    estimatedMin: min,
    content: { instructionsHe: `שיעור: ${titleHe}. תוכן מפורט יוגדר בהמשך.`, instructionsEn: `Lesson: ${titleEn}. Detailed content to be added.` },
    validationRules: placeholderRule,
    hints: [] as string[],
    starterTemplate: undefined as object | undefined,
    solution: undefined as object | undefined,
  });

  const moduleIntro = (emphasis: string, sources?: string) =>
    `דגש מהמקורות:\n${emphasis}${sources ? `\n\nמקורות מומלצים (מדויקים):\n${sources}` : ''}`;

  const intros: Record<string, { emphasis: string; sources?: string }> = {
    mod1: {
      emphasis: 'הבנה ארכיטקטונית – לא רק סקירה. להוסיף: Execution Flow, Queue, Webhooks.\n\nלמה זה קריטי: בלי להבין איך n8n מריץ Workflows קשה לדבג אוטומציות מורכבות.',
      sources: '• n8n Academy – Beginner + Data Flow (לא כל הקורס)\n• n8n YouTube: Execution Order, Webhook workflows',
    },
    mod2: {
      emphasis: 'הבחנה: Trigger Nodes, Action Nodes, Core Nodes (IF, Set).\n\nלהוסיף עומק: Set Node מתקדם, Function/Code Node, HTTP Request (קריטי ל-APIs כמו Green API).',
      sources: '• Docs רשמי – Core Nodes באתר n8n\n• תיעוד HTTP Request Node (חובה לעבודה עם APIs)',
    },
    mod3: {
      emphasis: 'מושג Item – כל Node מוציא מערך; הצמתים הבאים רצים על כל פריט (לופ אוטומטי). ביטויים {{ }} ועורך ביטויים מורחב.\n\nלהוסיף ליתרון מקצועי: Expressions Engine, Binary Data, Item Linking.\n\nטיפ: 80% מהטעויות ב-n8n הן בעיות JSON ולא Nodes.',
      sources: '• MDN Web Docs – JSON + JavaScript Objects\n• n8n Academy – פרק Expressions + Data Structure',
    },
    mod4: {
      emphasis: 'דגש API אמיתי. להוסיף: API Debugging & Webhooks. שימוש עמוק ב-HTTP Node ולא רק Nodes מוכנים.\n\nלמה קריטי: רוב המערכות = חיבור בין שירותים.',
      sources: '• תיעוד API: Google APIs, Airtable API, Green API\n• שימוש מתקדם ב-HTTP Node',
    },
    mod5: {
      emphasis: 'גרסת Production. להוסיף: Retry Logic, Dead Letter Flows, Logging. Error Trigger Node – Workflow ייעודי לטיפול בשגיאות רוחבי.\n\nרמת מומחה: Workflow שממשיך לעבוד גם אם API נופל.',
      sources: '• Error Workflows Docs של n8n\n• community.n8n.io – חיפוש: "production workflows", "retry strategy"',
    },
    mod6: {
      emphasis: 'Split In Batches (לא רק Split Out), Pagination APIs, Memory Optimization.\n\nחיוני לעיבוד כמויות דאטה גדולות בלי לחרוג ממגבלות זיכרון.',
      sources: '• סרטונים רשמיים n8n: Item Lists, Merge Node, Batch Processing',
    },
    mod7: {
      emphasis: 'חובה לאוטומציות מורכבות. להוסיף: JavaScript async/await, Axios/Fetch APIs, Data transformation pipelines.',
      sources: '• תיעוד Node.js\n• n8n Developer Docs',
    },
    mod8: {
      emphasis: 'לא רק LangChain – AI Agents בתוך n8n, LLM + CRM workflows, WhatsApp AI Automation (יתרון שיווקי).',
      sources: '• AI Course ב-n8n Academy\n• תיעוד LangChain',
    },
    mod9: {
      emphasis: 'החלק הכי חשוב ל-Production. להוסיף: Queue Mode (Redis), Scaling Workers, Backups של n8n DB, Monitoring (Logs + Failures).\n\nבמיוחד רלוונטי לשרת Ubuntu – מודול חובה.',
      sources: '• Self-Hosting Guide של n8n\n• תיעוד Docker – Production deployment',
    },
    mod10: {
      emphasis: 'סדר פרויקטים לפי ROI עסקי (לא תבניות אקראיות):\n1. מערכת לידים מלאה (טופס → CRM → WhatsApp)\n2. מערכת תזכורות אוטומטיות\n3. מערכת ניוזלטר (n8n + Email)\n4. מערכת אנליטיקה ללידים',
      sources: '• Templates Library של n8n\n• GitHub Automation Repos',
    },
    mod11: {
      emphasis: 'מה שמבדיל "בונה אוטומציות" מ"מהנדס אוטומציה".\n\nנושאים: Design Patterns לאוטומציה, Webhook vs Cron, State Management, Idempotency (קריטי ללידים ו-CRM).',
      sources: '• תיעוד n8n – Workflow design\n• קהילה ופרקטיקות Production',
    },
  };

  const introLesson = (moduleId: string, modKey: string, order: number) => {
    const { emphasis, sources } = intros[modKey];
    return {
      moduleId,
      slug: `${modKey}-intro`,
      titleHe: 'מבוא למודול',
      titleEn: 'Module intro',
      type: 'content' as const,
      xpReward: 25,
      order,
      estimatedMin: 5,
      content: {
        instructionsHe: moduleIntro(emphasis, sources),
        instructionsEn: 'Key focus and recommended sources for this module.',
      },
      validationRules: placeholderRule,
      hints: [] as string[],
      starterTemplate: undefined,
      solution: undefined,
    };
  };

  const automation101InstructionsHe = `מערך שיעור: Automation 101 – למה אוטומציה?

1. מטרות השיעור
• הבנת החשיבות הכלכלית והתפעולית של אוטומציה בעולם העסקי המודרני.
• הכרת היתרונות המרכזיים של הטמעת תהליכים אוטומטיים בארגון.
• סקירה ראשונית של המונחים הבסיסיים בעולם האוטומציה (Nodes, Triggers, Workflows).

2. מבוא: עולם האוטומציה בשנת 2026
• המגמה בשוק: יותר מ-65% מהארגונים מתכננים להגדיל את ההשקעה ב-AI ובאוטומציה כדי להתמודד עם אתגרי פרודוקטיביות.
• צמיחה כלכלית: שוק האוטומציה התעשייתית צפוי להגיע השנה ל-226.8 מיליארד דולר.
• שינוי תפיסתי: אוטומציה אינה עוד כלי עזר בלבד, אלא רכיב חיוני המאפשר לעסקים לצמוח ולהתייעל תוך חיסכון במשאבים.

3. למה בכלל לעשות אוטומציה? (הערך העסקי)
• שיפור הפרודוקטיביות: שימוש בכלי אוטומציה ו-AI יכול להגביר את הפרודוקטיביות ב-20% עד 30%.
• עלייה ברווחיות: כ-42% מהעסקים המאמצים אוטומציה מדווחים על עלייה של 20% ברווחיות.
• חיסכון בזמן: אוטומציה של ניהול לידים או תהליכי שיווק יכולה לחסוך עשרות שעות עבודה שבועיות (למשל, חיסכון של 30 שעות שבועיות בניהול לידים מפייסבוק).
• צמצום טעויות אנוש: אוטומציה של תהליכי רישום מפחיתה טעויות בשיעור של כ-25%.
• שיפור שירות לקוחות: חיבור אוטומטי בין מערכת ה-CRM לוואטסאפ מאפשר מענה מהיר יותר ושיפור הקשר עם הלקוח.

4. מושגי יסוד: איך זה עובד?
• Workflow (זרימת עבודה): חיבור בין אפליקציות, אתרים ושירותים לביצוע תהליך שלם.
• Node (נוד/צומת): אבן הבניין הבסיסית של האוטומציה; כל נוד מייצג פעולה אחת (שליחת מייל, קריאה ל-API, עיבוד נתון).
• Trigger (טריגר): האירוע שמתניע את התהליך (למשל: מילוי טופס, הגעה של מייל חדש או תזמון קבוע).
• Action (פעולה): השלב שבו המערכת מבצעת את העבודה בפועל.

5. המהפכה הבאה: סוכני AI ואוטומציה "עם מוח"
• מהפכת ה-AI: כיום האוטומציה כוללת סוכני AI (Agents) שאינם רק מבצעים פעולות טכניות, אלא מסוגלים לנתח מידע, לשאול שאלות הבהרה ולקבל החלטות בזמן אמת.
• אינטגרציה חכמה: כלים כמו MCP (Model Context Protocol) מאפשרים למודלי בינה מלאכותית "לדבר" ישירות עם מערכות האוטומציה ולהפעיל תהליכים מורכבים מתוך שיחה פשוטה.

6. סיכום ומסקנות
• הבחירה בפלטפורמה הנכונה (כמו Zapier לפשטות, Make לתהליכים ויזואליים מורכבים, או n8n לשליטה טכנית וגמישות) היא קריטית להצלחת התהליך.
• אוטומציה היא לא רק חיסכון בכסף – היא הדרך של העסק המודרני לעבוד בצורה יצירתית, חופשית ומקצועית יותר.`;

  const contentLesson = (
    moduleId: string,
    slug: string,
    titleHe: string,
    titleEn: string,
    order: number,
    instructionsHe: string,
    instructionsEn: string,
    estimatedMin = 15
  ) => ({
    moduleId,
    slug,
    titleHe,
    titleEn,
    type: 'content' as const,
    xpReward: 50,
    order,
    estimatedMin,
    content: { instructionsHe, instructionsEn },
    validationRules: placeholderRule,
    hints: [] as string[],
    starterTemplate: undefined,
    solution: undefined,
  });

  const lesson1Interface = `1. מבנה הממשק – שלושת החלקים העיקריים ב-n8n

שאלה: מהם שלושת החלקים העיקריים של ממשק המשתמש ב-n8n ומה תפקידו של כל אחד?

תשובה:
• Canvas (קנבס) – האזור המרכזי שבו בונים את ה-Workflow. כאן מושכים צמתים (Nodes), מחברים ביניהם בקווים (Connections/Edges), ומארגנים את זרימת העבודה משמאל לימין. הקנבס הוא "המגרש" של האוטומציה.
• Sidebar / Node Panel (סרגל צד / פאנל צמתים) – מתחת או לצד הקנבס, מכיל את רשימת כל סוגי הצמתים הזמינים (Triggers, Core, Integrations, AI וכו'). גרירת צומת מהפאנל לקנבס יוצרת מופע של הצומת ב-Workflow.
• Executions / Run History (היסטוריית הרצות) – ממשק לצפייה בתוצאות הרצות קודמות: אילו נתונים עברו, היכן הייתה שגיאה, ולוגים. קריטי לדיבוג ולווידואליזציה של נתונים בין צמתים.`;

  const lesson2TriggerVsAction = `2. סוגי צמתים – Trigger לעומת Action

שאלה: מה ההבדל העקרוני בין Trigger Node ל-Action Node?

תשובה:
• Trigger Node (צומת טריגר) – מתניע את ה-Workflow. הוא לא מבצע "משימה" על נתונים קיימים, אלא מחכה לאירוע (לחיצה ידנית, זמן, Webhook, מייל חדש וכו') ומתחיל ריצה. תמיד מופיע בהתחלת שרשרת. דוגמאות: Manual Trigger, Schedule Trigger, Webhook.
• Action Node (צומת פעולה) – מבצע פעולה על הנתונים שהגיעו מהצומת הקודם: שליחת מייל, קריאת API, עיבוד, כתיבה ל-CRM וכו'. מקבל קלט (Items) ומוציא פלט (Items) לשלב הבא. רוב הצמתים ב-Workflow הם Action Nodes.
בקצרה: Trigger = "מתי מתחילים"; Action = "מה עושים".`;

  const lesson3PlatformComparison = `3. השוואת פלטפורמות – מתי להעדיף n8n

שאלה: מדוע עסק בעל נפח עבודה גבוה (מיליוני הרצות) עשוי להעדיף את n8n על פני Zapier או Make?

תשובה:
• עלות צפויה (Cost) – ב-Zapier ו-Make התמחור מבוסס על מספר ההרצות או המשימות לחודש. בנפחים של מיליונים, העלות עולה מאוד. ב-n8n עם אירוח עצמי (Self-Hosting) משלמים על התשתית (שרת/ענן) בלבד, ללא תמחור per-run – יתרון עצום בנפחים גבוהים.
• שליטה וגמישות – n8n הוא קוד פתוח; ניתן להריץ על השרת שלך, להגדיר Workers, Queue (Redis), ולהתאים לקנה מידה. Zapier ו-Make מוגבלים למה שהפלטפורמה מספקת.
• אין "תקרה" של הרצות – בפלטפורמות מנוהלות יש מגבלות חודשיות. ב-n8n Self-Hosted המגבלה היא כוח המחשוב שלך.
לכן: לעסק עם נפח גבוה, n8n מפחית עלויות ונותן שליטה מלאה.`;

  const lesson4ItemConcept = `4. עבודה עם נתונים – המושג "Item"

שאלה: מהו המושג "Item" ב-n8n, וכיצד הצמתים מבצעים את הפעולות על רשימת הפריטים?

תשובה:
• Item (פריט) – יחידת הנתונים הבסיסית שעוברת בין צמתים. כל Item הוא אובייקט JSON (זוגות שדה–ערך). צומת יכול להחזיר פריט אחד או רבים.
• רשימת פריטים (Items) – כל צומת מקבל כקלט מערך (Array) של Items מהצומת הקודם, ומחזיר מערך של Items לפלט. גם אם יש רק פריט אחד, הוא עטוף במערך.
• ביצוע על כל פריט – ברוב הצמתים, הפעולה מתבצעת על כל פריט בנפרד (לופ פנימי): אם נכנסו 10 פריטים, הצומת רץ 10 "פעמים" לוגיות (או במקביל, תלוי בהגדרות) ומוציא 10 פריטים. כך עיבוד נתונים הוא תמיד "לפי שורה" או "לפי רשומה".`;

  const lesson5SwitchNode = `5. לוגיקה – פיצול ליותר משני נתיבים

שאלה: אם ברצונך לפצל את זרימת העבודה ליותר משני נתיבים (מעבר ל-True/False), באיזה Node תשתמש?

תשובה:
• Node בשם Switch – צומת Switch מאפשר לנתב את הזרימה לפי ערך או תנאי ליותר משני מוצאים (Output 1, Output 2, Output 3 וכו'), בניגוד ל-IF שמפצל רק ל-True ו-False.
• שימוש – מגדירים כללים (Rules): אם שדה X שווה ל-A → יציאה 1; אם שווה ל-B → יציאה 2; אחרת → יציאה default. מתאים לקטגוריזציה, routing לפי סוג רשומה, או בחירה בין מספר תהליכים.
• IF vs Switch – IF מתאים להחלטה בינארית (כן/לא). Switch מתאים להחלטה עם מספר אפשרויות.`;

  const lesson6PinData = `6. בדיקות (Testing) – Pin Data

שאלה: מהי היכולת של Pin Data, ומתי מומלץ להשתמש בה במהלך פיתוח ה-Workflow?

תשובה:
• Pin Data – "נעיצת" נתונים: מאפשרים לצומת מסוים להשתמש בפלט של הרצה קודמת (נתונים "מצורפים") במקום להריץ את הצמתים שלפניו שוב. בעצם קופאים (freeze) את הקלט של צומת לנתונים ששמרת.
• מתי להשתמש – במהלך פיתוח: אחרי שהרצת פעם אחת ויש לך נתוני בדיקה טובים, אתה "נוע" אותם. כך אפשר להריץ שוב ושוב רק מהצומת הזה ואילך בלי לקרוא שוב ל-API, לשלוח מיילים או להמתין ל-Webhook – חוסך זמן ומונע "רעש" במערכות חיצוניות.
• יתרון – דיבוג מהיר, פיתוח יציב, ובדיקת לוגיקה על נתונים ריאליסטיים ללא תלות בהרצה מלאה.`;

  const lesson7ExpressionSevenDays = `7. ביטויים (Expressions) – הוספת 7 ימים לזמן

שאלה: כיצד תכתוב ביטוי שמוסיף 7 ימים לזמן הנוכחי (למשל לצורך הגדרת תאריך התחלה)?

תשובה:
• זמן נוכחי – ב-n8n יש פונקציות כמו $now או $today. לניפולציה על תאריכים משתמשים ב-JavaScript או בביטויים.
• דוגמה עם $now:
  {{ $now.plus(7, 'days') }}
  או בגישה מילולית: לוקחים את התאריך הנוכחי ומוסיפים 7 ימים.
• אם יש שדה תאריך קיים (למשל מ-NASA Node):
  {{ $json.startDate ? new Date($json.startDate).plus(7, 'days') : $now.plus(7, 'days') }}
• בעורך הביטויים המורחב – בוחרים בפונקציות Date, מזינים את הערך הבסיסי ו-7 ימים. הפורמט המדויק תלוי בגרסת n8n (למשל $now.plus(7, 'days') או שימוש ב-Moment/Date מובנה).`;

  const lesson8MCP = `8. בינה מלאכותית – פרוטוקול MCP

שאלה: מהו פרוטוקול MCP (Model Context Protocol) וכיצד הוא מאפשר למודלים כמו Claude או ChatGPT לתקשר עם n8n?

תשובה:
• MCP (Model Context Protocol) – פרוטוקול סטנדרטי שמאפשר למודלי שפה (Claude, ChatGPT וכו') "לדבר" עם כלים חיצוניים ומערכות. ב-n8n, MCP מאפשר למודל לגשת ל-Workflows, להפעיל צמתים, ולקבל תוצאות – הכל מתוך שיחה.
• איך זה עובד – n8n חושף את ה-Workflows והפעולות כ-"Tools" (כלים) שהמודל יכול לקרוא להם. המשתמש כותב בטבעי ("שלח מייל ל-X") והמודל ממיר את זה לקריאה ל-Workflow או לצומת מתאים, מריץ, ומחזיר את התוצאה לשיחה.
• יתרון – אינטגרציה של AI עם אוטומציה: המשתמש לא צריך לדעת איך ה-Workflow בנוי; המודל מתווך בין השפה הטבעית ל-n8n.`;

  const lesson9N8NTables = `9. ניהול נתונים פנימי – n8n Tables

שאלה: מהו היתרון המרכזי של n8n Tables על פני שימוש ב-Google Sheets או Airtable בתוך האוטומציה?

תשובה:
• n8n Tables – טבלאות נתונים מובנות בתוך n8n עצמו (סביבת ה-Workflow). הנתונים נשמרים במסד הנתונים של n8n ולא בשירות חיצוני.
• יתרונות מרכזיים:
  – מהירות ואמינות – אין קריאות רשת חיצוניות; גישה מקומית לנתונים מפחיתה latency וכשלונות.
  – פרטיות ושליטה – הנתונים לא יוצאים לספק צד שלישי (Google, Airtable); חשוב ל-GDPR ולמידע רגיש.
  – פשטות – לא צריך OAuth, API keys או מגבלות rate של שירות חיצוני. אידיאלי state קטן, cache, או טבלאות עזר בתוך ה-Workflow.
• מתי עדיין להשתמש ב-Sheets/Airtable – כשצריך שיתוף עם צוות, עריכת ידנית, או דוחות ויזואליים; n8n Tables מתאימים לנתונים "פנימיים" לאוטומציה.`;

  const lesson10SelfHosting = `10. אבטחה ופריסה – Self-Hosting ב-n8n

שאלה: מהו היתרון של Self-Hosting (אירוח עצמי) ב-n8n מבחינת פרטיות נתונים ושליטה בעלויות?

תשובה:
• פרטיות נתונים – באירוח עצמי כל הנתונים (Workflows, Executions, credentials מוצפנים) נשארים על התשתית שלך (שרת פרטי או VPS). אף ספק לא רואה את התוכן; מתאים לתעשיות רגולטוריות ולמידע רגיש.
• שליטה בעלויות – אין תמחור per execution או per task. משלמים רק על השרת (חומרה/ענן). בנפחי הרצה גבוהים זה זול בהרבה מ-Zapier/Make. בנוסף, שליטה על גרסאות, שדרוגים ותשתית (Redis, Workers) לפי הצורך.
• יתרונות נוספים – התאמה ל-Compliance (GDPR, SOC2), אינטגרציה עם הרשת הפנימית, וגיבויים עצמאיים. החיסרון: אחריות על אבטחה, גיבויים ותחזוקה.`;

  const custom2FullGuideHe = `מדריך מלא – מודול 2: WhatsApp Automation

🎯 מה נבנה
ליד שולח הודעה → זיהוי כוונה → תיוג → תגובה אוטומטית → קישור לפגישה

——— שלב 1: תשתית Green API (45 דק) ———
• הרשמה ב-Green API, חשבון, tariff (מתחילים בחינם), חיבור מספר WhatsApp.
• תקבל: idInstance, apiTokenInstance.
• הגדרת Webhook: Settings → Notifications → Outgoing Webhook. URL = ה-URL מ-n8n. Events: incomingMessageReceived, outgoingMessageStatus.

——— שלב 2: קבלת הודעות ב-n8n (45 דק) ———
• Webhook node: Name WhatsApp Incoming, Method POST, Path whatsapp-incoming, Response Last Node.
• JSON מ-Green API: typeWebhook, instanceData, senderData (chatId, senderName), messageData.textMessageData.textMessage.
• Code node "Parse WhatsApp Message": חילוץ chatId, phone (ניקוי), senderName, messageText, messageId, timestamp. אם typeWebhook !== incomingMessageReceived להחזיר skip: true. פלט: chatId, phone, senderName, messageText, intent: 'unknown', tags: [], requiresResponse: true.

——— שלב 3: זיהוי כוונה – Intent Detection (60 דק) ———
• Code node "Detect Intent": מילות מפתח לפי כוונה:
  pricing: מחיר, עלות, כמה עולה, תעריף, price, cost → תגובה עם טווח מחירים + טופס.
  meeting: פגישה, לדבר, שיחה, ייעוץ, meeting, call → תגובה + קישור Calendly.
  info: מידע, פרטים, מה זה, איך עובד → תגובה הסבר שירותים.
  urgent: דחוף, היום, מיידי → תגובה "חוזר תוך שעה" + טלפון.
  negative: לא מעוניין, הסר, stop, unsubscribe → תגובה הסרה + action: 'unsubscribe'.
• תגובה כללית אם לא זוהתה. כל תגובה מתחילה "הי {name}! 👋". להחזיר: ...msg, detectedIntent, confidence, responseText, action, tags.

——— שלב 4: שליחת תגובה (45 דק) ———
• אם action === 'unsubscribe' — לא שולחים, להחזיר sent: false.
• HTTP Request: POST ל-https://api.green-api.com/waInstance{{instance}}/sendMessage/{{token}}, Body: chatId, message (responseText). או Code node עם $httpRequest וא env: GREEN_API_INSTANCE, GREEN_API_TOKEN.
• Environment: export GREEN_API_INSTANCE="12345", export GREEN_API_TOKEN="your-token". או ב-docker-compose environment.

——— שלב 5: תיוג ועדכון CRM (60 דק) ———
• Airtable Search: Table Leads, Field Phone, Value {{ $json.phone }}.
• IF: נמצא / לא נמצא.
• לא נמצא: Airtable Create – Name, Phone, Source WhatsApp, Status new, Priority לפי intent (urgent=high), WhatsApp Chat ID.
• נמצא: Airtable Update – Last Contact, Status contacted, Notes "הודעה WhatsApp: ...".
• טבלת Interactions: Related Lead, Type whatsapp_incoming, Content messageText, Timestamp, Intent. ואם נשלחה תשובה: Type whatsapp_outgoing, Content responseText.

——— שלב 6: קישור לפגישה (30 דק) ———
• בתגובת meeting להוסיף לינק Calendly. אופציונלי: "היום"/"מחר"/"שבוע הבא" — לשלב מתקדם (מודול 5).

——— שלב 7: הגבלת תדירות – Rate Limiting (45 דק) ———
• Code לפני שליחה: בדיקת שעות (Israel timezone). אם 22:00–08:00 → blocked: true, reason 'Outside business hours', retryAt '08:00'; או תגובה "אחזור מחר בבוקר".
• אופציונלי: מקסימום X הודעות אוטומטיות ללקוח (בדיקה ב-Airtable count).
• ב-Detect Intent: שימוש ב-timezone Asia/Jerusalem; אם מחוץ לשעות — responseText "קיבלתי. זמין 08:00–22:00. אחזור מחר." delayed: true.`;

  const custom3FullGuideHe = `מדריך מלא – מודול 3: CRM אוטומטי מלא

🎯 מה נבנה
מערכת CRM שמנהלת מחזור חיים של ליד: קליטה, זיהוי כפילויות, עדכון סטטוס, היסטוריית מגעים מלאה.

——— שלב 1: עיצוב בסיס נתונים (60 דק) ———
טבלת Leads: Lead ID (Primary), Full Name, Phone (IL), Email, Source (Website/WhatsApp/Facebook/Referral/Manual), Status (New→Contacted→Qualified→Proposal→Negotiation→Closed Won/Lost), Priority (Hot/Warm/Cold), Assigned To, Created At, Last Contact, Next Action, Next Action Type (Call/WhatsApp/Email/Meeting), Estimated Value, Notes, Tags, WhatsApp Chat ID, Email Sent, WhatsApp Sent, Meetings Held.
טבלת Interactions: Interaction ID, Related Lead (Link to Leads), Type (form_in, whatsapp_in/out, email_out, call_out, meeting, note), Direction (incoming/outgoing), Content, Sent At, Status, Intent Detected, Automation Triggered.
Views: Grid (default), Kanban לפי Status, Calendar לפי Next Action, Gallery לידים חמים; Filters: Hot Leads, Today's Actions.

——— שלב 2: זיהוי כפילויות (90 דק) ———
Code "Duplicate Detection": ניקוי טלפון, וריאנטים (0/972/+972), email lowercase. פלט: searchCriteria (phoneVariants, email), potentialDuplicate.
Airtable Search by Phone (וריאנט ראשון); אם לא נמצא – Search by Email.
Code "Merge or Create Decision": אם נמצאו records – חישוב confidence (טלפון 0.5, אימייל 0.5, שם 0.2). confidence > 0.8 → action 'merge', אחרת 'create'.
Code "Merge Leads": אם merge – מיזוג: שדות ריקים מתעדכנים, Source מצטבר, Notes + "--- New Contact ---", Tags + Re-engaged. פלט: action update, leadId, data, newInteraction.

——— שלב 3: Lead Pipeline אוטומטי (60 דק) ———
Code "Auto Status Update": לפי currentStatus ו-daysSinceContact. New + interactions>=1 → Contacted, nextAction Call יום; Contacted + ימים>3 + responseReceived → Qualified; Contacted + ימים>7 → Cold + alert; Qualified + meetingScheduled → Proposal; Proposal + ימים>5 → Negotiation. פלט: status, previousStatus, statusChanged, nextAction, nextActionDate, alert, daysSinceContact.
Airtable Update: Status, Next Action, Next Action Type, Notes + "Status changed to ...".

——— שלב 4: מעקב אינטראקציות (45 דק) ———
Airtable Create ב-Interactions: Related Lead, Type, Direction, Content, Sent At, Status, Intent Detected, Automation Triggered.
Code "Update Lead Stats": עדכון counters (emailSent, whatsappSent, whatsappReceived, meetingsHeld) לפי lastInteractionType; חישוב totalInteractions ו-engagementScore (נוסחה: whatsappReceived*2 + meetingsHeld*5 + emailSent) / 10.

——— שלב 5: אוטומציות CRM (90 דק) ———
תזכורת פעולות: Schedule 08:00 יומי. Airtable Search/Filter: Next Action = TODAY(). שליחת תזכורת (Gmail/WhatsApp) עם רשימת פעולות.
התראות לידים חמים: Schedule שעתי. Filter: Priority=Hot, Last Contact > 2 שעות, Status != Closed. פעולה: Telegram/Email אליך.
דוח יומי: Schedule 18:00. Code איסוף סטטיסטיקות (newLeads, contacted, qualified, meetingsScheduled, closed, conversionRate, actionsCompleted/Pending). Gmail – דוח עם סיכום ורשימת לידים חמים.

——— שלב 6: אינטגרציה עם WhatsApp (45 דק) ———
ב-workflow WhatsApp: אחרי Detect Intent – חיפוש ליד לפי טלפון, עדכון Last Contact, הוספת אינטראקציה (whatsapp_in, content, intent).
לפני שליחת תשובה: Code "Enrich with CRM Data" – חיפוש ב-Airtable לפי טלפון, isExistingCustomer, previousInteractions, lastTopic. אם לקוח קיים – personalizedGreeting "שמח לשמוע שוב ממך".`;

  const custom4FullGuideHe = `מדריך מלא – מודול 4: Follow-Up Automation

🎯 מה נבנה
סדרת 7 מגעים אוטומטית לאורך 14 ימים: תוכן משתנה, זיהוי תגובה, עצירה חכמה.

——— שלב 1: אסטרטגיית 7 מגעים (30 דק) ———
מבנה: 1 מיידי WhatsApp (אישור+ציפיות), 2 +2 שעות WhatsApp (מידע+שאלה), 3 +24 שעות Email (case study), 4 +3 ימים WhatsApp (הצעה), 5 +5 ימים Email (תזכורת+FOMO), 6 +7 ימים WhatsApp ("עדיין מעוניין?"), 7 +14 ימים Email ("לפני שאנחנו מוותרים"). יציאה: responded, meetingScheduled, converted, optedOut, noInterest.

——— שלב 2: תשתית נתונים (45 דק) ———
טבלת Follow-Up Sequences: Sequence ID, Related Lead, Status (Active/Paused/Completed/Cancelled), Current Step (0-7), Started At, Last Sent At, Next Send At, Exit Reason, Response Received, Meeting Booked. טבלת Sequence Templates: Step Number, Channel (WhatsApp/Email), Delay Hours, Subject, Body Template ({{name}}, {{fullName}}, {{daysSinceStart}}, {{source}}), Condition.

——— שלב 3: מנוע הסדרה (90 דק) ———
Schedule Trigger: Every 15 minutes. Airtable: Follow-Up Sequences, Filter Status=Active AND Next Send At ≤ NOW(). Code "Check Send Conditions": אם Response Received או Meeting Booked → action complete. אם שעה ישראלית < 8 או >= 21 → action delay (retryAt 08:00). אם יום 5/6 (שישי-שבת) → action delay (retryAt Sunday 09:00). אחרת → action send, currentStep. Airtable Sequence Templates: Filter Step Number = currentStep + 1. Code "Personalize Message": שליפת Related Lead, החלפת {{name}}, {{fullName}}, {{daysSinceStart}}, {{source}} בתבנית. אם Email – הוספת "הסר" בתחתית.

——— שלב 4: שליחת המגע (60 דק) ———
WhatsApp: HTTP Request POST ל-Green API, chatId leadPhone@c.us, message. Email: Gmail To leadEmail, Subject, Body. Airtable Interactions Create: Related Lead, Type whatsapp_out/email_out, Direction outgoing, Content, Sent At, Automation Triggered true, Sequence Step.

——— שלב 5: עדכון סדרה והמתנה (45 דק) ———
Code "Calculate Next Step": nextStepNumber = stepNumber + 1. אם > 7 → action complete. delays: 2→2h, 3→24h, 4→72h, 5→48h, 6→48h, 7→168h. nextSendAt = now + delayHours. Airtable Update Follow-Up Sequences: Current Step, Last Sent At, Next Send At, Status (Completed אם nextStep>7).

——— שלב 6: זיהוי תגובה ועצירה (90 דק) ———
Webhook followup-response. Code "Detect Response": חילוץ phone, messageText; isOptOut (הסר/stop/לא מעוניין), isPositive (כן/מעוניין/בוא נדבר), needsHuman (שאלה/?). Airtable Search: Follow-Up Sequences, Related Lead Phone = phone, Status = Active. Code "Stop Sequence": אם isOptOut → exitReason Opted Out, status Cancelled; אם isPositive → Paused - Awaiting Manual Follow-up; אחרת Responded. Airtable Update: Status, Exit Reason, Response Received true. התראה Gmail/Telegram: "סדרת Follow-Up נעצרה", ליד, סיבה, תוכן תגובה.

——— שלב 7: תוכן מתקדם ו-A/B (60 דק) ———
Templates עם Variants A/B לכל שלב. Code "Select Variant": leadNumber % 2 → A או B. שדות ב-Sequences: Variant Used, Opened, Clicked, Replied, Converted.`;

  const custom5FullGuideHe = `מדריך מלא – מודול 5: Meeting Automation

🎯 מה נבנה
אישור אוטומטי → תזכורות → מעקב הגעה → עדכון CRM → הצעה חדשה אם לא הגיע.

——— שלב 1: תשתית Calendly + Webhooks (45 דק) ———
Calendly: Settings → Integrations → Webhooks. URL: .../calendly-webhook. Events: invitee.created, invitee.canceled, invitee.no_show (Pro).
מבנה payload: event, payload.event_type (name, duration), payload.invitee (name, email, timezone, uuid), payload.event (start_time, end_time, location.join_url), payload.questions_and_answers (טלפון, תחום עסק), payload.tracking.utm_source.

——— שלב 2: עיבוד פגישה חדשה (60 דק) ———
Webhook Path: calendly-webhook. Code "Parse Calendly Event": חילוץ eventType, calendlyUuid, name, email, phone (מ-questions_and_answers, ניקוי), businessType, meetingTitle, startTime, endTime, reminders.reminder24h ו-reminder1h (Date -24h / -1h), zoomLink, status scheduled/canceled.
Airtable Search Leads by Email. If לא נמצא – Create (Full Name, Email, Phone, Source, Status meeting_scheduled, Tags). If נמצא – Update: Status meeting_scheduled, Next Action, Next Action Type Meeting, Meeting Booked true.

——— שלב 3: אישור אוטומטי (45 דק) ———
Code "Confirmation Message": פורמט תאריך/שעה עברי, טקסט עם 📅 ⏰ 🔗 zoomLink, "נשלח תזכורת יום לפני ושעה לפני".
HTTP Request ל-Green API: chatId phone@c.us, message confirmationMessage. Gmail גיבוי: To email, Subject "פגישה נקבעה", Body אותו תוכן.

——— שלב 4: תזכורות חכמה (90 דק) ———
טבלת Reminders: Related Lead, Related Meeting, Reminder Type (24h_before / 1h_before / post_meeting), Scheduled Time, Status Pending, Channel. Code "Create Reminders": 3 רשומות – 24h (תזכורת מחר), 1h (עוד שעה + zoom), post_meeting (לאחר סיום). Schedule כל 10 דק: Airtable Search Reminders WHERE Status=Pending AND Scheduled Time ≤ NOW(). שליחת WhatsApp, עדכון Status=Sent, רישום ב-Interactions.

——— שלב 5: ביטולים (45 דק) ———
Webhook invitee.canceled. Code "Handle Cancellation": calendlyUuid, canceledAt, cancelReason, status canceled. Airtable Update Lead: Status meeting_canceled, Notes "בוטל: ...", Next Action. WhatsApp: "שמעתי שצריך לבטל — בסדר. רוצה לקבוע מחדש? {{calendlyLink}}".

——— שלב 6: No-Show ו-Recovery (90 דק) ———
Schedule כל שעה. Airtable Search Meetings: End Time < NOW()-15 דק AND Attendance = Unknown. Code "Detect No-Show": אם minutesSinceEnd > 15 ו-Attendance !== Attended → attendance no_show, action send_recovery. סדרת Recovery: הודעה מיידית ("לא הצלחת להגיע — רוצה לקבוע שוב?"), 24h ("שווה 30 דק שיחה"), 48h ("שיחת 10 דק לשאלות"). Airtable Update: Attendance No-Show, Recovery Sequence Active, Status needs_re_engagement, Priority Hot.

——— שלב 7: טבלת Meetings (30 דק) ———
שדות: Meeting ID, Related Lead, Calendly UUID, Title, Scheduled Start/End, Actual Start/End, Status (Scheduled/Completed/Canceled/No-Show/Rescheduled), Attendance (Unknown/Attended/No-Show/Late), Location Type, Zoom Link, Pre-Meeting Notes, Post-Meeting Summary, Follow-Up Required, Next Steps, Value Estimated.`;

  const custom6FullGuideHe = `מדריך מלא – מודול 6: Production & Stability

🎯 מה נבנה
מערכת חסינה: הגנה על לידים, תיעוד כשלים, גיבויים אוטומטיים, התראות בזמן אמת.

——— שלב 1: Error Handling מקיף (90 דק) ———
Workflow נפרד: Global Error Handler. Trigger: Error Trigger.
Code "Parse Error": חילוץ workflowName, nodeName, nodeType, errorMessage, executionId, runMode. קטגוריזציה: credential/auth → severity critical; timeout/rate limit → high; אחרת medium. פלט: severity, requiresImmediate.
טבלת Airtable Error Logs: Error ID, Timestamp, Workflow, Node, Severity (Low/Medium/High/Critical), Message, Resolved, Resolution Notes.
התראות: Critical → Telegram + Email מיידי (POST ל-Telegram API עם TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). High → Email ל-ALERT_EMAIL. Medium/Low → רישום בלבד.

——— שלב 2: לוג מקיף לכל ליד (60 דק) ———
טבלת Lead Journey Logs: Log ID, Related Lead, Stage (Entry/Processing/Success/Failed/Retry), Service, Timestamp, Input Data (JSON), Output Data, Error, Execution Time (ms).
Code "Log Entry" בתחילת workflow: _logMeta.entryTime, startTime, stage: 'entry'.
Code "Log Exit" בסוף: duration, שליחה ל-Airtable או HTTP.

——— שלב 3: גיבויים אוטומטיים (90 דק) ———
Schedule: כל יום 02:00. HTTP GET ל-n8n: /rest/workflows עם X-N8N-API-KEY. Code "Backup Workflows": לכל workflow – GET /rest/workflows/:id, שמירת json + backedUpAt. אופציה A: GitHub PUT ל-repo (GITHUB_TOKEN). אופציה B: שמירה ל-volume /backup/n8n. גיבוי Airtable: ייצוא CSV שבועי ל-Google Drive/Dropbox.

——— שלב 4: Environment Variables & Security (60 דק) ———
העברת כל Secrets ל-Env: N8N_BASIC_AUTH_*, N8N_ENCRYPTION_KEY, GREEN_API_*, AIRTABLE_API_KEY, GMAIL_*, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, DB_*, GITHUB_TOKEN, BACKUP_EMAIL.
docker-compose: environment מהמשתנים, volumes ל-~/.n8n ו-/backup. Script security-check.sh: בדיקת required_vars וזכויות ~/.n8n.

——— שלב 5: ניטור בריאות שרת (60 דק) ———
Schedule: כל 5 דקות. Code "Health Check": GET /healthz ל-n8n (timeout 5000), בדיקת דיסק וזיכרון (דרך Execute Command או API). If: disk.free < 10% או memory.free < 500MB → Alert Critical ב-Telegram.

——— שלב 6: תיעוד ו-Runbook (45 דק) ———
Comment node בתחילת כל workflow: שם, תאריך, מטרה, Inputs/Outputs, Dependencies, Error Handling, Last Updated.
קובץ /docs/runbook.md: שרת לא מגיב (SSH, docker ps, restart, logs); לידים לא נכנסים (Webhook, Executions, Error Logs); WhatsApp לא נשלח (Token, rate limits, חסימה); Airtable לא מתעדכן (API key, quota, 422); שחזור מגיבוי (stop, cp, start); איש קשר.`;

  const custom7FullGuideHe = `מדריך מלא – מודול 7: Sellable Systems (5 תבניות זהב)

🎯 מה נבנה
5 מערכות מוצריות למכירה כ"קופסא שחורה" + מדריך מכירה + חבילת ZIP.

——— תבנית 1: Lead Capture Pro — ₪1,500 ———
רכיבים: טופס אתר (Elementor/CF7) → Webhook → Parse Lead (Code) → Airtable Leads (Create) → WhatsApp אישור. Email אישור + תזכורת 24h. Dashboard: 3 views (חדשים, חמים, סגורים). JSON workflow מנוקה: webhook lead-capture-client, Parse (fields name/email/phone/source/timestamp), Airtable base CLIENT_BASE_ID, HTTP Green API. מדריך התקנה: Airtable 10 דק, טופס 10 דק, WhatsApp 5 דק, n8n 5 דק. הצעת ערך: "40% לידים אבודים → CRM + אישור מיידי. מחיר ₪1,500, כולל התקנה + הדרכה 30 דק + תמיכה 30 יום."

——— תבנית 2: WhatsApp Auto-Reply — ₪2,000 ———
בוט 5 כוונות (pricing, support, hours, general), תיוג חם/קר, שעות פעילות. intents: pricing → מחירים + tag_hot; support → מספר פנייה + create_ticket; hours → שעות + כתובת. JSON: Webhook wa-bot-client, Detect Intent (typeWebhook, text, phone), Build Response (responses לפי intent), Send Reply. הצעת ערך: "90% פתיחה ב-WA. בוט עונה מיידית — מחיר/תמיכה/שעות. +₪500 לחיבור CRM."

——— תבנית 3: Meeting Master — ₪1,800 ———
Calendly Webhook, 3 תזכורות (אישור, -24h, -1h), CRM, no-show + שחזור. תזמון: מיידי WA אישור+זום; -24h WA+Email; -1h WA זום; +15 דק "לא הצלחת?" + קישור. JSON: Calendly Hook, Parse Booking (questions טלפון, reminders r24/r1), Confirm (Green API). הצעת ערך: פגישות לא נשכחות, no-show יורד.

——— תבנית 4: Follow-Up Machine — ₪2,500 ———
7 מגעים ב-14 ימים, יציאה אוטומטית אם הגיב, A/B, דוח המרות. מפת מגעים: יום 0 מיידי + +2h, יום 1 אימייל, יום 3 WA, יום 5 אימייל, יום 7 WA, יום 14 אימייל. הצעת ערך: "60–80% לידים נמחקים בלי מעקב. 7 מגעים אוטומטיים, עוצרת אם הגיב. ROI: לקוח אחד ביום 7 = ₪3,000+."

——— תבנית 5: Complete Business OS — ₪5,000+ ———
כל 4 התבניות + Dashboard מנהלים + אוטומציות לענף + תמיכה 90 יום + שדרוגים שנתיים. חבילות: Starter (1+2) ₪3,000; Professional (1+2+3+4) ₪5,000; Enterprise (הכל + API) ₪8,000+.

——— מדריך מכירה ———
גילוי צרכים (15 דק): איך לקוחות מגיעים? כמה זמן להגיב? איך עוקבים אחרי לידים? no-shows? משימות חוזרות? הדגמה (10 דק): טופס בדיקה → אישור WA → ליד ב-CRM. הצעת מחיר "או/או": Lead Capture ₪1,500 או Complete OS ₪5,000 + תמיכה 3 חודשים. התנגדויות: "יקר" → כמה לידים מפסידים; "אחשוב" → פגישת ייעוץ חינם; "יש מערכת" → משלים; "לא טכנולוגי" → התקנה 30 דק.

——— חבילת מכירה ———
ZIP: workflow.json, airtable-base-structure.json, setup-guide.pdf, video-tutorial.mp4, support-contact.txt לכל תבנית. מחירי שדרוג: התקנה מרחוק +₪500; התאמה לענף +₪1,000–3,000; תמיכה חודשית ₪300; שדרוגים שנתיים ₪500. צ'ק ליסט שיווק: 5 תבניות, PDF+סרטון לכל אחת, דף נחיתה, 3 המלצות, תשקיף מחירים, חוזה, onboarding, תמיכה, דף תשלום.`;

  const lessonsData = [
    introLesson(mod1.id, 'mod1', 1),
    {
      moduleId: mod1.id,
      slug: 'automation-101',
      titleHe: 'Automation 101: למה אוטומציה?',
      titleEn: 'Automation 101: Why Automation?',
      type: 'content',
      xpReward: 50,
      order: 2,
      estimatedMin: 15,
      content: {
        instructionsHe: automation101InstructionsHe,
        instructionsEn: 'Understand the business value of automation, key terms (Workflow, Node, Trigger, Action), and how AI agents are changing the field.',
      },
      validationRules: placeholderRule,
      hints: [] as string[],
      starterTemplate: undefined,
      solution: undefined,
    },
    contentLesson(mod1.id, 'n8n-vs-zapier-make', 'N8N vs Zapier vs Make – השוואה', 'N8N vs Zapier vs Make – Comparison', 3, lesson3PlatformComparison, 'Why high-volume businesses may prefer n8n over Zapier/Make: cost, control, no execution caps.'),
    contentLesson(mod1.id, 'n8n-interface', 'מבנה הממשק: Canvas, Nodes, Executions', 'Interface: Canvas, Nodes, Executions', 4, lesson1Interface, 'The three main UI parts in n8n: Canvas (build workflows), Node panel (drag nodes), Executions (run history and debugging).'),
    mk(mod1.id, 'first-workflow', 'הרצת Workflow ראשון (Hello World)', 'First Workflow Run (Hello World)', 5, 'interactive'),
    mk(mod1.id, 'exercise-hello-n8n', 'תרגיל: בנה Workflow שמדפיס "Hello N8N"', 'Exercise: Build a Workflow that prints "Hello N8N"', 6, 'challenge', 100, 15),
    introLesson(mod2.id, 'mod2', 1),
    mk(mod2.id, 'trigger-nodes', 'Trigger Nodes (Manual, Schedule, Webhook)', 'Trigger Nodes (Manual, Schedule, Webhook)', 2),
    mk(mod2.id, 'http-request', 'HTTP Request Node', 'HTTP Request Node', 3, 'interactive', 50, 15),
    mk(mod2.id, 'set-node', 'Set Node + עיבוד Data', 'Set Node + Data Processing', 4, 'interactive'),
    mk(mod2.id, 'if-node', 'IF Node (תנאים)', 'IF Node (Conditions)', 5, 'challenge', 100, 20),
    contentLesson(mod2.id, 'switch-node', 'Switch Node – פיצול ליותר משני נתיבים', 'Switch Node – Multiple output paths', 6, lesson5SwitchNode, 'Use Switch (not IF) when you need more than True/False branches.'),
    contentLesson(mod2.id, 'pin-data-testing', 'Pin Data ובדיקות', 'Pin Data and Testing', 7, lesson6PinData, 'Pin Data: freeze node input from a previous run for faster debugging without re-running external APIs.'),
    mk(mod2.id, 'exercise-weather', 'תרגיל: Workflow שמושך מזג אוויר ומחליט מה ללבוש', 'Exercise: Weather workflow – what to wear', 8, 'challenge', 100, 20),
    introLesson(mod3.id, 'mod3', 1),
    contentLesson(mod3.id, 'json-structure', 'מושג Item ועבודה עם רשימת פריטים', 'Item concept and item lists', 2, lesson4ItemConcept, 'Items are JSON objects; nodes receive and output arrays of items and run on each item.'),
    contentLesson(mod3.id, 'expressions-json', 'ביטויים: דוגמה – הוספת 7 ימים לתאריך', 'Expressions: adding 7 days to date', 3, lesson7ExpressionSevenDays, 'Use $now.plus(7, \'days\') or Date functions in the expression editor.'),
    mk(mod3.id, 'items-node-workflow', '$items, $node, $workflow', '$items, $node, $workflow', 4),
    mk(mod3.id, 'function-node', 'Function Node: JavaScript בסיסי', 'Function Node: Basic JavaScript', 5),
    mk(mod3.id, 'exercise-data-api', 'תרגיל: מניפולציות על Data מ-API', 'Exercise: Data manipulations from API', 6, 'challenge', 100, 15),
    introLesson(mod4.id, 'mod4', 1),
    contentLesson(mod4.id, 'n8n-tables', 'n8n Tables מול גיליונות חיצוניים', 'n8n Tables vs external sheets', 2, lesson9N8NTables, 'n8n Tables: data stays inside n8n – faster, private, no external API.'),
    mk(mod4.id, 'google-sheets', 'Google Sheets Integration', 'Google Sheets Integration', 3, 'interactive'),
    mk(mod4.id, 'gmail-slack-telegram', 'Gmail / Slack / Telegram', 'Gmail / Slack / Telegram', 4, 'interactive'),
    mk(mod4.id, 'notion-integration', 'Notion Integration', 'Notion Integration', 5),
    mk(mod4.id, 'airtable-integration', 'Airtable Integration', 'Airtable Integration', 6),
    mk(mod4.id, 'webhooks-advanced', 'Webhooks מתקדמים', 'Advanced Webhooks', 7),
    mk(mod4.id, 'exercise-lead-management', 'תרגיל: Lead Management System', 'Exercise: Lead Management System', 8, 'challenge', 100, 25),
    introLesson(mod5.id, 'mod5', 1),
    mk(mod5.id, 'error-trigger', 'Error Trigger Node', 'Error Trigger Node', 2),
    mk(mod5.id, 'try-catch', 'Try/Catch patterns', 'Try/Catch patterns', 3),
    mk(mod5.id, 'retry-mechanism', 'Retry מנגנון', 'Retry Mechanism', 4),
    mk(mod5.id, 'alerting-errors', 'Alerting על שגיאות', 'Error Alerting', 5),
    mk(mod5.id, 'exercise-error-handling', 'תרגיל: Workflow עם Error Handling מלא', 'Exercise: Workflow with full Error Handling', 6, 'challenge', 100, 20),
    introLesson(mod6.id, 'mod6', 1),
    mk(mod6.id, 'split-in-batches', 'SplitInBatches Node', 'SplitInBatches Node', 2),
    mk(mod6.id, 'loop-over-items', 'Loop over Items', 'Loop over Items', 3),
    mk(mod6.id, 'merge-node', 'Merge Node', 'Merge Node', 4),
    mk(mod6.id, 'wait-node', 'Wait Node', 'Wait Node', 5),
    mk(mod6.id, 'exercise-1000-customers', 'תרגיל: עיבוד רשימה של 1000 לקוחות', 'Exercise: Process a list of 1000 customers', 6, 'challenge', 100, 25),
    introLesson(mod7.id, 'mod7', 1),
    mk(mod7.id, 'code-node', 'Code Node (Python/JS)', 'Code Node (Python/JS)', 2, 'challenge', 100, 15),
    mk(mod7.id, 'sub-workflows', 'Sub-Workflows', 'Sub-Workflows', 3),
    mk(mod7.id, 'custom-node', 'בניית Custom Node', 'Building a Custom Node', 4),
    mk(mod7.id, 'npm-packages', 'npm Packages ב-N8N', 'npm Packages in N8N', 5),
    introLesson(mod8.id, 'mod8', 1),
    mk(mod8.id, 'openai-node', 'OpenAI Node', 'OpenAI Node', 2, 'interactive'),
    mk(mod8.id, 'langchain', 'LangChain ב-N8N', 'LangChain in N8N', 3),
    contentLesson(mod8.id, 'ai-agent-workflow', 'MCP – פרוטוקול לחיבור AI ל-n8n', 'MCP – AI and n8n', 4, lesson8MCP, 'MCP (Model Context Protocol) lets models like Claude/ChatGPT call n8n workflows as tools.'),
    mk(mod8.id, 'rag-pipeline', 'RAG Pipeline עם N8N', 'RAG Pipeline with N8N', 5),
    mk(mod8.id, 'exercise-ai-support-bot', 'תרגיל: בנה AI Customer Support Bot', 'Exercise: Build an AI Customer Support Bot', 6, 'challenge', 100, 30),
    introLesson(mod9.id, 'mod9', 1),
    contentLesson(mod9.id, 'self-hosting-docker', 'Self-Hosting – יתרונות פרטיות ועלויות', 'Self-Hosting – Privacy and cost', 2, lesson10SelfHosting, 'Self-hosting: data stays on your infra, no per-run pricing, full control.'),
    mk(mod9.id, 'env-secrets', 'Environment Variables & Secrets', 'Environment Variables & Secrets', 3),
    mk(mod9.id, 'versioning-git', 'Versioning ו-Git Integration', 'Versioning and Git Integration', 4),
    mk(mod9.id, 'monitoring-logging', 'Monitoring & Logging', 'Monitoring & Logging', 5),
    mk(mod9.id, 'performance-optimization', 'Performance Optimization', 'Performance Optimization', 6),
    introLesson(mod10.id, 'mod10', 1),
    mk(mod10.id, 'project-leads', 'פרויקט 1: מערכת לידים מלאה (טופס → CRM → WhatsApp)', 'Project 1: Full leads system (Form → CRM → WhatsApp)', 2, 'challenge', 150, 60),
    mk(mod10.id, 'project-reminders', 'פרויקט 2: מערכת תזכורות אוטומטיות', 'Project 2: Automated reminders system', 3, 'challenge', 150, 60),
    mk(mod10.id, 'project-newsletter', 'פרויקט 3: מערכת ניוזלטר (n8n + Email)', 'Project 3: Newsletter system (n8n + Email)', 4, 'challenge', 150, 60),
    mk(mod10.id, 'project-analytics', 'פרויקט 4: מערכת אנליטיקה ללידים', 'Project 4: Leads analytics system', 5, 'challenge', 150, 60),
    introLesson(mod11.id, 'mod11', 1),
    mk(mod11.id, 'design-patterns', 'Design Patterns לאוטומציה', 'Automation Design Patterns', 2),
    mk(mod11.id, 'webhook-vs-cron', 'Webhook vs Cron', 'Webhook vs Cron', 3),
    mk(mod11.id, 'state-management', 'State Management', 'State Management', 4),
    mk(mod11.id, 'idempotency', 'Idempotency (קריטי ללידים ו-CRM)', 'Idempotency (critical for leads & CRM)', 5),
    // ========== קורס מותאם אישית – מערכות לידים למכירה ==========
    contentLesson(customMod1.id, 'custom1-understanding', '📚 הבנה עמוקה – Lead Capture', 'Deep understanding – Lead Capture', 1, `למה עסקים קטנים צריכים: 70% מהלידים נעלמים כי לא מתועדים; כל ליד שנופל = כסף אבוד.\n\nמה להבין: Webhook vs API Polling (למה Webhook עדיף); Data Mapping – JSON לליד מובנה; Error Handling בסיסי.\n\nמקורות: n8n Webhook Docs, Data Structure in n8n.`, 'Why lead capture: 70% of leads lost without one place. Webhook vs Polling, Data Mapping, basic Error Handling.', 180),
    contentLesson(customMod1.id, 'custom1-checklist', '🔧 בנייה מעשית – צ\'ק ליסט', 'Practical build – Checklist', 2, `□ יצירת Webhook URL ב-n8n\n□ חיבור טופס Elementor/Contact Form 7 ל-Webhook\n□ בדיקה שהנתונים מגיעים (לוגים)\n□ Mapping: name, phone, email, source\n□ הוספת timestamp אוטומטי\n□ שמירה ל-Google Sheets (גיבוי)\n□ טיפול בשגיאות – טלפון ריק?\n□ בדיקת קצה-לקצה: טופס → Sheets\n\nמערכת: טופס אתר → Webhook → n8n → Sheets + Airtable`, 'Create Webhook, connect form, mapping, Sheets, error handling, end-to-end test.', 300),
    contentLesson(customMod1.id, 'custom1-test', '✅ מבחן ידע – מודול 1', 'Knowledge test – Module 1', 3, `אתה שולט כשאתה יכול:\n[ ] להסביר למה Webhook טוב מ-Polling\n[ ] לקחת JSON מורכב ולשלוף נתונים\n[ ] לטפל בשגיאה כששדה חסר בלי קריסה\n[ ] להראות ללקוח איך הליד נכנס בזמן אמת`, 'Explain Webhook vs Polling; map JSON; handle missing field; demo live lead.', 15),
    contentLesson(customMod1.id, 'custom1-full-guide', 'מדריך מלא – קוד והתקנה', 'Full guide – Code & setup', 4, `שלב 1: Webhook ב-n8n – POST, Path: lead-capture.\nשלב 2: Data Mapping – Code node לחילוץ name, email, phone, message מ-Elementor (input.fields.*.value). ניקוי טלפון, leadId ייחודי.\nשלב 3: Google Sheets – Append, עמודות lead_id, timestamp, name, email, phone, message, source, status, priority.\nשלב 4: Airtable – Create record ב-Leads; טבלאות Leads + Interactions.\nשלב 5: Error Handling – Continue On Fail; Error Trigger workflow נפרד.\nשלב 6: חיבור טופס – Elementor: Actions After Submit → Webhook, URL מ-n8n.`, 'Steps: Webhook, Code mapping, Sheets, Airtable, Error handling, Form webhook.', 60),
    contentLesson(customMod2.id, 'custom2-understanding', '📚 הבנה עמוקה – WhatsApp', 'Deep understanding – WhatsApp', 1, `למה הכסף: 90% פתיחה ב-WhatsApp vs 20% באימייל; תגובה תוך 5 דקות = +400% המרה.\n\nמה להבין: Green API – Webhook inbound vs HTTP outbound; Rate Limiting; Message Templates vs Free Text; איך לא לחסום (Spam policies).\n\nמקורות: Green API Docs, n8n HTTP Request Node.`, '90% open rate; Green API inbound/outbound; rate limits; templates.', 240),
    contentLesson(customMod2.id, 'custom2-checklist', '🔧 בנייה מעשית – WhatsApp', 'Practical – WhatsApp', 2, `□ רישום Green API + Token\n□ שליחת הודעה לעצמך (בדיקה)\n□ Webhook לקבלת הודעות נכנסות\n□ תיוג: חדש/מתעניין/חום (IF)\n□ תגובה אוטומטית לפי מילות מפתח\n□ קישור Calendly אוטומטי\n□ הגבלת תדירות – לא יותר מ-X/שעה\n□ טיפול ב"לא מעוניין" – הסרה\n\nמערכת: הודעה נכנסת → זיהוי כוונה → תיוג → תגובה → קישור פגישה`, 'Green API, webhook, tagging, keyword reply, rate limit, opt-out.', 420),
    contentLesson(customMod2.id, 'custom2-test', '✅ מבחן ידע – מודול 2', 'Knowledge test – Module 2', 3, `[ ] להסביר inbound webhook vs outbound HTTP\n[ ] תרחיש: "מחיר" → מחירון אוטומטי\n[ ] לטפל ב-rate limit בלי לאבד הודעות\n[ ] להדגים זיהוי לקוח קיים vs חדש`, 'Inbound vs outbound; keyword reply; rate limit; new vs existing.', 15),
    contentLesson(customMod2.id, 'custom2-full-guide', 'מדריך מלא – WhatsApp Automation', 'Full guide – WhatsApp Automation', 4, custom2FullGuideHe, 'Green API setup, Webhook, Parse message, Intent detection (keywords), Send response, Airtable CRM, Rate limit, Business hours.', 330),
    contentLesson(customMod3.id, 'custom3-understanding', '📚 הבנה עמוקה – CRM', 'Deep understanding – CRM', 1, `למה Airtable: Views שונים, אוטומציות, API נוח.\n\nמה להבין: Relational DB (לא הכל בטבלה אחת); Unique IDs – כפילויות; Status Machines – ליד בין שלבים.\n\nמקורות: Airtable API Docs, n8n Airtable Node.`, 'Airtable vs Excel; relations; dedup; status flow.', 180),
    contentLesson(customMod3.id, 'custom3-checklist', '🔧 בנייה מעשית – CRM', 'Practical – CRM', 2, `□ Airtable: Leads, Contacts, Interactions\n□ חיבור n8n ל-Airtable\n□ יצירת ליד חדש אוטומטית\n□ בדיקת כפילות טלפון/אימייל\n□ עדכון סטטוס לפי פעולות\n□ רשומת אינטראקציה לכל מגע\n□ View: "לידים חמים היום"\n□ גיבוי יומי ל-Sheets\n\nמערכת: כל מגע → עדכון CRM → היסטוריה → תזכורות`, 'Airtable tables, create lead, dedup, status, interactions, backup.', 360),
    contentLesson(customMod3.id, 'custom3-test', '✅ מבחן ידע – מודול 3', 'Knowledge test – Module 3', 3, `[ ] למה מפרידים Leads מ-Contacts\n[ ] זיהוי "לקוח חוזר" vs "ליד חדש"\n[ ] דשבורד – לידים לפי סטטוס\n[ ] חיפוש היסטוריית מגעים מלאה`, 'Leads vs Contacts; returning vs new; dashboard; history.', 15),
    contentLesson(customMod3.id, 'custom3-full-guide', 'מדריך מלא – CRM אוטומטי', 'Full guide – Automated CRM', 4, custom3FullGuideHe, 'Airtable schema (Leads, Interactions), duplicate detection & merge, Lead Pipeline status automation, interaction tracking, daily reminders & reports, WhatsApp integration.', 390),
    contentLesson(customMod4.id, 'custom4-understanding', '📚 הבנה עמוקה – Follow-Up', 'Deep understanding – Follow-Up', 1, `הנתון: 80% מהמכירות דורשות 5+ מגעים; רוב העסקים מוותרים אחרי 1–2.\n\nמה להבין: Wait Nodes – תזמון; Timezone (קריטי לישראל); Exit conditions – להפסיק כשהלקוח הגיב.\n\nמקורות: Wait Node Docs, Scheduling in n8n.`, '5+ touches; Wait node; timezone; exit when replied.', 180),
    contentLesson(customMod4.id, 'custom4-checklist', '🔧 בנייה מעשית – Follow-Up', 'Practical – Follow-Up', 2, `□ 5 מגעים: 0 דקות, 2 שעות, יום, 3 ימים, שבוע\n□ בדיקת "האם הגיב" לפני שליחה\n□ שעות שליחה (לא בלילה)\n□ תוכן שונה לכל שלב\n□ כפתור "הסרה" שעוצר סדרה\n□ לוג כל ניסיון מגע\n□ טיפול ב"נכשל" / חסימה\n\nמערכת: ליד חדש → 5 הודעות → עצירה אם הגיב → דיווח המרות`, '5 touches, check reply, timezone, different content, opt-out, log.', 420),
    contentLesson(customMod4.id, 'custom4-test', '✅ מבחן ידע – מודול 4', 'Knowledge test – Module 4', 3, `[ ] למה לא שולחים הכל בבת אחת\n[ ] לוגיקה: הגיב ביום 2 → דלג על 3\n[ ] timezone – חו"ל vs ישראל\n[ ] מדידת המרה לפי שלב`, 'Spacing; skip if replied; timezone; conversion by step.', 15),
    contentLesson(customMod4.id, 'custom4-full-guide', 'מדריך מלא – Follow-Up Automation', 'Full guide – Follow-Up Automation', 4, custom4FullGuideHe, '7-touch sequence over 14 days, Sequences + Templates in Airtable, Schedule engine, personalization, WhatsApp/Email send, next step calculation, response detection & stop, A/B variants.', 420),
    contentLesson(customMod5.id, 'custom5-understanding', '📚 הבנה עמוקה – תורים', 'Deep understanding – Appointments', 1, `Calendly שולח תזכורות אבל לא מותאם; חיבור ל-CRM = תמונה מלאה.\n\nמה להבין: Calendly Webhooks (invitee.created, invitee.canceled); Time buffer; No-show detection.\n\nמקורות: Calendly API Docs, n8n Calendly Node.`, 'Calendly webhooks; buffer; no-show.', 180),
    contentLesson(customMod5.id, 'custom5-checklist', '🔧 בנייה מעשית – תורים', 'Practical – Appointments', 2, `□ Calendly Webhook ל-n8n\n□ עדכון CRM כשנקבעה פגישה\n□ אישור ב-WhatsApp\n□ תזכורת 24 שעות + 1 שעה לפני\n□ עדכון אם בוטל\n□ מעקב הגיע/לא הגיע\n□ דוח שבועי: פגישות, no-shows\n\nמערכת: קביעה → אישור → תזכורות → CRM → מעקב`, 'Webhook, CRM update, WhatsApp confirm, reminders, cancel, no-show report.', 300),
    contentLesson(customMod5.id, 'custom5-test', '✅ מבחן ידע – מודול 5', 'Knowledge test – Module 5', 3, `[ ] זרימת נתונים Calendly → CRM\n[ ] טיפול בביטול אוטומטי\n[ ] זיהוי no-show + הצעה חדשה\n[ ] יעילות תזכורות`, 'Data flow; cancel; no-show; reminder effectiveness.', 15),
    contentLesson(customMod5.id, 'custom5-full-guide', 'מדריך מלא – Meeting Automation', 'Full guide – Meeting Automation', 4, custom5FullGuideHe, 'Calendly webhooks (invitee.created/canceled/no_show), Parse event, CRM search/create, confirmation WhatsApp+Email, Reminders table + Schedule, cancellation flow, no-show detection + recovery sequence, Meetings table.', 405),
    contentLesson(customMod6.id, 'custom6-understanding', '📚 הבנה עמוקה – Production', 'Deep understanding – Production', 1, `לקוח לא סולח על איבוד לידים; שרת שלך = אחריות שלך.\n\nמה להבין: Error Workflows; Logging; Environment Variables (לא סיסמאות ב-workflow!); Backup ו-Version Control.\n\nמקורות: n8n Error Handling, Self-hosting Security.`, 'Error workflows; logging; env vars; backup.', 240),
    contentLesson(customMod6.id, 'custom6-checklist', '🔧 בנייה מעשית – Production', 'Practical – Production', 2, `□ Error Workflow גלובלי\n□ לוג כל ליד (לפני עיבוד)\n□ Secrets → Environment Variables\n□ Backup אוטומטי ל-workflows\n□ התראות (אימייל/Telegram) על שגיאות\n□ בדיקת בריאות שרת (דיסק, זיכרון)\n□ תיעוד כל workflow\n\nמערכת: שגיאה → לוג → התראה → גיבוי → תיעוד`, 'Error workflow, log leads, env vars, backup, alerts, health check, docs.', 360),
    contentLesson(customMod6.id, 'custom6-test', '✅ מבחן ידע – מודול 6', 'Knowledge test – Module 6', 3, `[ ] למה לא API Keys ב-workflow\n[ ] Error Workflow שתופס כשל\n[ ] שחזור מ-backup\n[ ] דוח שגיאות שבועי`, 'No keys in workflow; error workflow; restore; weekly error report.', 15),
    contentLesson(customMod6.id, 'custom6-full-guide', 'מדריך מלא – Production & Stability', 'Full guide – Production & Stability', 4, custom6FullGuideHe, 'Global Error Handler, Parse Error, Airtable Error Logs, alerts by severity, Lead Journey Logs, workflow backup (n8n API/GitHub), env vars, docker-compose, health check, runbook.', 405),
    contentLesson(customMod7.id, 'custom7-understanding', '📚 הבנה עמוקה – מוצר למכירה', 'Deep understanding – Productize', 1, `תבניות = זמן מכירה קצר, מחיר קבוע, שדרוג בהדרגה.\n\nמה להבין: Productization – שירות למוצר; Pricing (חד פעמי vs חודשי); Onboarding אוטומטי.\n\n5 תבניות: Lead Capture Pro ₪1,500 | WhatsApp Auto-Reply ₪2,000 | Meeting Master ₪1,800 | Follow-Up Machine ₪2,500 | Complete Business OS ₪5,000+`, 'Productize; pricing; onboarding; 5 templates with prices.', 180),
    contentLesson(customMod7.id, 'custom7-checklist', '🔧 בנייה מעשית – תבניות', 'Practical – Templates', 2, `לכל תבנית:\n□ מינימום VIABLE – מה חייב לעבוד\n□ תיעוד התקנה (5 דקות)\n□ סרטון הדרכה 3–5 דקות\n□ Pricing Sheet\n□ חוזה שירות בסיסי\n□ מערכת תמיכה (אימייל/Telegram)\n□ אפשרויות שדרוג\n\nמפת לימוד 8 שבועות: שבוע 1 Lead Capture, 2+3 WhatsApp, 4 CRM, 5 Follow-Up, 6 Calendly, 7 Production, 8 שתי תבניות + הצעת מחיר.`, 'Per template: MVP, docs, video, pricing, contract, support, upgrades. 8-week map.', 600),
    contentLesson(customMod7.id, 'custom7-test', '✅ מבחן ידע – מודול 7', 'Knowledge test – Module 7', 3, `[ ] Demo שלם ב-10 דקות\n[ ] ערך כספי ללקוח (ROI)\n[ ] התנגדויות נפוצות\n[ ] לסגור עסקה / לקבוע פגישה`, '10-min demo; ROI; objections; close deal.', 15),
    contentLesson(customMod7.id, 'custom7-full-guide', 'מדריך מלא – Sellable Systems', 'Full guide – Sellable Systems', 4, custom7FullGuideHe, '5 templates (Lead Capture Pro ₪1,500, WhatsApp Auto-Reply ₪2,000, Meeting Master ₪1,800, Follow-Up Machine ₪2,500, Complete OS ₪5,000+), JSON workflows, setup PDFs, value props, sales script, objections, ZIP package, upgrade pricing, marketing checklist.', 540),
  ];

  const createdLessons: { id: string; slug: string }[] = [];
  for (const lesson of lessonsData) {
    const created = await prisma.lesson.create({
      data: {
        moduleId: lesson.moduleId,
        slug: lesson.slug,
        titleHe: lesson.titleHe,
        titleEn: lesson.titleEn,
        type: lesson.type,
        xpReward: lesson.xpReward,
        order: lesson.order,
        estimatedMin: lesson.estimatedMin,
        content: lesson.content as object,
        validationRules: lesson.validationRules as object,
        hints: lesson.hints as object,
        starterTemplate: lesson.starterTemplate == null ? undefined : (lesson.starterTemplate as object),
        solution: lesson.solution == null ? undefined : (lesson.solution as object),
      },
    });
    createdLessons.push({ id: created.id, slug: created.slug });
  }

  for (const lesson of createdLessons) {
    const cards = flashcardDataBySlug[lesson.slug];
    if (cards) {
      for (const c of cards) {
        await prisma.flashcard.create({
          data: {
            lessonId: lesson.id,
            front: c.front,
            frontEn: c.frontEn,
            back: c.back,
            backEn: c.backEn,
            type: c.type,
          },
        });
      }
    }
  }

  const badgesData = [
    { key: 'first_workflow', titleHe: 'Workflow ראשון', titleEn: 'First Workflow', descHe: 'השלמת workflow ראשון', descEn: 'Complete first workflow', icon: '🎯', xpThreshold: 100 },
    { key: 'api_whisperer', titleHe: 'לחש API', titleEn: 'API Whisperer', descHe: 'השתמשת ב-Http Request בהצלחה', descEn: 'Used HTTP Request successfully', icon: '🌐', xpThreshold: 500 },
    { key: 'error_handler', titleHe: 'מטפל בשגיאות', titleEn: 'Error Handler', descHe: 'תיקנת שגיאה ב-workflow', descEn: 'Fixed an error in a workflow', icon: '🛠️', xpThreshold: 300 },
    { key: 'ai_builder', titleHe: 'בונה AI', titleEn: 'AI Builder', descHe: 'שילבת OpenAI ב-workflow', descEn: 'Integrated OpenAI in a workflow', icon: '🤖', xpThreshold: 1000 },
    { key: 'streak_7', titleHe: 'שבוע רצוף', titleEn: '7 Day Streak', descHe: '7 ימים ברציפות', descEn: '7 days in a row', icon: '🔥', xpThreshold: null },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {},
      create: b,
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
