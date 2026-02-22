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
      slug: 'n8n-fundamentals',
      titleHe: 'יסודות N8N',
      titleEn: 'N8N Fundamentals',
      descHe: 'לומדים את הבסיס של אוטומציה עם N8N',
      descEn: 'Learn the basics of automation with N8N',
      level: 'beginner',
      order: 1,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      slug: 'integrations',
      titleHe: 'אינטגרציות מתקדמות',
      titleEn: 'Advanced Integrations',
      descHe: 'חיבור שירותים חיצוניים',
      descEn: 'Connecting external services',
      level: 'intermediate',
      order: 2,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      slug: 'ai-with-n8n',
      titleHe: 'AI עם N8N',
      titleEn: 'AI with N8N',
      descHe: 'שילוב מודלים של AI ב-workflows',
      descEn: 'Integrating AI models in workflows',
      level: 'advanced',
      order: 3,
    },
  });

  const mod1c1 = await prisma.module.create({
    data: { courseId: course1.id, titleHe: 'התחלה', titleEn: 'Getting Started', order: 1 },
  });
  const mod2c1 = await prisma.module.create({
    data: { courseId: course1.id, titleHe: 'נודים ועריכה', titleEn: 'Nodes and Editing', order: 2 },
  });
  const mod1c2 = await prisma.module.create({
    data: { courseId: course2.id, titleHe: 'שירותי ענן', titleEn: 'Cloud Services', order: 1 },
  });
  const mod1c3 = await prisma.module.create({
    data: { courseId: course3.id, titleHe: 'OpenAI ו-N8N', titleEn: 'OpenAI and N8N', order: 1 },
  });

  const lessonsData = [
    {
      moduleId: mod1c1.id,
      slug: 'intro-video',
      titleHe: 'מה זה N8N?',
      titleEn: 'What is N8N?',
      type: 'video',
      xpReward: 50,
      order: 1,
      estimatedMin: 10,
      content: {
        instructionsHe: 'צפה בסרטון ההקדמה על N8N.',
        instructionsEn: 'Watch the intro video about N8N.',
        videoUrl: 'https://www.youtube.com/embed/RpjQTGKm-ok',
      },
      validationRules: [
        validationRule('intro_watched', 'node_exists', { nodeType: 'manualTrigger' }, 'לא רלוונטי – שיעור וידאו', 'N/A – video lesson', undefined, undefined),
      ] as unknown[],
      hints: [] as string[],
      starterTemplate: null,
      solution: null,
    },
    {
      moduleId: mod1c1.id,
      slug: 'first-trigger',
      titleHe: 'הטריגר הראשון',
      titleEn: 'First Trigger',
      type: 'interactive',
      xpReward: 50,
      order: 2,
      estimatedMin: 10,
      content: {
        instructionsHe: 'גרור Manual Trigger לקנבס וחבר אותו לנוד Set. הגדר בשדה value את המחרוזת "hello".',
        instructionsEn: 'Drag Manual Trigger to the canvas and connect it to a Set node. Set the value field to "hello".',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'manualTrigger' }, 'חסר נוד הפעלה ידנית', 'Missing Manual Trigger node', 'גרור מהסרגל משמאל', 'Drag from the left sidebar'),
        validationRule('r2', 'node_exists', { nodeType: 'set' }, 'חסר נוד Set', 'Missing Set node', 'חפש Set בקטגוריית Core', 'Find Set under Core'),
        validationRule('r3', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'Set' }, 'חבר בין Trigger ל-Set', 'Connect Trigger to Set'),
      ],
      hints: ['גרור Manual Trigger מהסרגל השמאלי', 'הוסף נוד Set וחבר את שני הנודים'],
      starterTemplate: { nodes: [], edges: [] },
      solution: { nodes: [{ type: 'manualTrigger' }, { type: 'set' }], edges: [{ from: 'manualTrigger', to: 'set' }] },
    },
    {
      moduleId: mod2c1.id,
      slug: 'http-request',
      titleHe: 'בקשת HTTP',
      titleEn: 'HTTP Request',
      type: 'interactive',
      xpReward: 50,
      order: 3,
      estimatedMin: 15,
      content: {
        instructionsHe: 'צור workflow עם Manual Trigger המחובר ל-HTTP Request. הגדר URL ל-https://api.example.com/data.',
        instructionsEn: 'Create a workflow with Manual Trigger connected to HTTP Request. Set URL to https://api.example.com/data.',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'manualTrigger' }, 'חסר Manual Trigger', 'Missing Manual Trigger', undefined, undefined),
        validationRule('r2', 'node_exists', { nodeType: 'httpRequest' }, 'חסר HTTP Request', 'Missing HTTP Request', undefined, undefined),
        validationRule('r3', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'HTTP Request' }, 'חבר Trigger ל-HTTP Request', 'Connect Trigger to HTTP Request'),
        validationRule('r4', 'node_config', { nodeLabel: 'HTTP Request', field: 'url', contains: 'example.com' }, 'הגדר URL עם example.com', 'Set URL to contain example.com'),
      ],
      hints: ['הוסף נוד HTTP Request מקטגוריית Core', 'לחץ על הנוד והגדר את שדה URL'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod2c1.id,
      slug: 'if-condition',
      titleHe: 'תנאי IF',
      titleEn: 'IF Condition',
      type: 'challenge',
      xpReward: 100,
      order: 4,
      estimatedMin: 20,
      content: {
        instructionsHe: 'בנה workflow: Manual Trigger -> Set (value: 15) -> IF (condition: value > 10). חבר את ה-true branch ל-Set אחר עם message: "גדול מ-10".',
        instructionsEn: 'Build workflow: Manual Trigger -> Set (value: 15) -> IF (condition: value > 10). Connect the true branch to another Set with message "greater than 10".',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'manualTrigger' }, 'חסר Manual Trigger', 'Missing Manual Trigger', undefined, undefined),
        validationRule('r2', 'node_exists', { nodeType: 'if' }, 'חסר נוד IF', 'Missing IF node', undefined, undefined),
        validationRule('r3', 'node_count', { nodeType: 'set', min: 2 }, 'נדרשים לפחות 2 נודי Set', 'Need at least 2 Set nodes', undefined, undefined),
        validationRule('r4', 'no_errors', {}, 'הרץ את ה-workflow ללא שגיאות', 'Run the workflow with no errors', undefined, undefined),
      ],
      hints: ['השתמש בביטוי $json.value > 10 בתנאי IF', 'חבר את ה-output של IF לשתי ענפים'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod2c1.id,
      slug: 'code-node',
      titleHe: 'נוד קוד',
      titleEn: 'Code Node',
      type: 'challenge',
      xpReward: 100,
      order: 5,
      estimatedMin: 15,
      content: {
        instructionsHe: 'הוסף Manual Trigger, Set (value: 5), ו-Code node שמחזיר את הכפולה של $json.value (כלומר 10).',
        instructionsEn: 'Add Manual Trigger, Set (value: 5), and a Code node that returns double $json.value (i.e. 10).',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'code' }, 'חסר נוד Code', 'Missing Code node', undefined, undefined),
        validationRule('r2', 'connection_exists', { fromLabel: 'Set', toLabel: 'Code' }, 'חבר Set ל-Code', 'Connect Set to Code'),
        validationRule('r3', 'output_key_exists', { nodeLabel: 'Code', key: 'result' }, 'הנוד Code צריך להחזיר result', 'Code node should return result', undefined, undefined),
      ],
      hints: ['בנוד Code השתמש ב-return [{ result: $json.value * 2 }];', 'חבר את Set ל-Code'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod1c2.id,
      slug: 'gmail-send',
      titleHe: 'שליחת Gmail',
      titleEn: 'Send Gmail',
      type: 'interactive',
      xpReward: 50,
      order: 1,
      estimatedMin: 10,
      content: {
        instructionsHe: 'צור workflow עם Manual Trigger ו-Gmail node לשליחת הודעה. השתמש בנתונים mock.',
        instructionsEn: 'Create a workflow with Manual Trigger and Gmail node to send a message. Use mock data.',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'manualTrigger' }, 'חסר Manual Trigger', 'Missing Manual Trigger', undefined, undefined),
        validationRule('r2', 'node_exists', { nodeType: 'gmail' }, 'חסר נוד Gmail', 'Missing Gmail node', undefined, undefined),
        validationRule('r3', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'Gmail' }, 'חבר Trigger ל-Gmail', 'Connect Trigger to Gmail'),
      ],
      hints: ['גרור Gmail מקטגוריית Integrations', 'הגדר to, subject, message בנוד'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod1c2.id,
      slug: 'slack-message',
      titleHe: 'הודעת Slack',
      titleEn: 'Slack Message',
      type: 'interactive',
      xpReward: 50,
      order: 2,
      estimatedMin: 10,
      content: {
        instructionsHe: 'חבר Manual Trigger ל-Slack node ושל הודעה לערוץ.',
        instructionsEn: 'Connect Manual Trigger to Slack node and send a message to a channel.',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'slack' }, 'חסר נוד Slack', 'Missing Slack node', undefined, undefined),
        validationRule('r2', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'Slack' }, 'חבר Trigger ל-Slack', 'Connect Trigger to Slack'),
      ],
      hints: ['הוסף Slack מקטגוריית Integrations', 'הגדר channel ו-text'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod1c2.id,
      slug: 'sheets-read',
      titleHe: 'קריאת Google Sheets',
      titleEn: 'Read Google Sheets',
      type: 'interactive',
      xpReward: 50,
      order: 3,
      estimatedMin: 10,
      content: {
        instructionsHe: 'Manual Trigger -> Google Sheets (operation: Read).',
        instructionsEn: 'Manual Trigger -> Google Sheets (operation: Read).',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'googleSheets' }, 'חסר Google Sheets', 'Missing Google Sheets node', undefined, undefined),
        validationRule('r2', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'Google Sheets' }, 'חבר Trigger ל-Google Sheets', 'Connect Trigger to Google Sheets'),
      ],
      hints: ['בחר operation: read', 'חבר Manual Trigger ל-Google Sheets'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod1c3.id,
      slug: 'openai-chat',
      titleHe: 'OpenAI צ\'אט',
      titleEn: 'OpenAI Chat',
      type: 'interactive',
      xpReward: 50,
      order: 1,
      estimatedMin: 10,
      content: {
        instructionsHe: 'צור workflow: Manual Trigger -> OpenAI. הגדר prompt והוסף את הנוד ל-workflow.',
        instructionsEn: 'Create workflow: Manual Trigger -> OpenAI. Set prompt and add the node to the workflow.',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'openAI' }, 'חסר נוד OpenAI', 'Missing OpenAI node', undefined, undefined),
        validationRule('r2', 'connection_exists', { fromLabel: 'Manual Trigger', toLabel: 'OpenAI' }, 'חבר Trigger ל-OpenAI', 'Connect Trigger to OpenAI'),
      ],
      hints: ['הוסף OpenAI מקטגוריית AI', 'הגדר שדה prompt'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
    {
      moduleId: mod1c3.id,
      slug: 'ai-pipeline',
      titleHe: 'צינור AI',
      titleEn: 'AI Pipeline',
      type: 'challenge',
      xpReward: 100,
      order: 2,
      estimatedMin: 20,
      content: {
        instructionsHe: 'בנה pipeline: Trigger -> Set (userInput) -> OpenAI -> Set (תגובה).',
        instructionsEn: 'Build pipeline: Trigger -> Set (userInput) -> OpenAI -> Set (response).',
      },
      validationRules: [
        validationRule('r1', 'node_exists', { nodeType: 'openAI' }, 'חסר נוד OpenAI', 'Missing OpenAI node', undefined, undefined),
        validationRule('r2', 'node_count', { nodeType: 'set', min: 2 }, 'נדרשים לפחות 2 נודי Set', 'Need at least 2 Set nodes', undefined, undefined),
        validationRule('r3', 'connection_exists', { fromLabel: 'Set', toLabel: 'OpenAI' }, 'חבר Set ל-OpenAI', 'Connect Set to OpenAI'),
      ],
      hints: ['השתמש ב-Set כדי להעביר טקסט ל-OpenAI', 'חבר את פלט OpenAI ל-Set שני'],
      starterTemplate: { nodes: [], edges: [] },
      solution: null,
    },
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
        starterTemplate: lesson.starterTemplate as object | undefined,
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
