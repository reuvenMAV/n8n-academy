/**
 * Mock engine: returns realistic mock JSON for HTTP, Gmail, Slack, OpenAI nodes.
 * HTTP: URL-based mocks (openweathermap, github, etc.). No real API calls.
 */

export interface MockHttpOptions {
  url: string;
  method?: string;
  body?: unknown;
}

export function mockHttpRequest(options: MockHttpOptions): Record<string, unknown> {
  const { url, method = 'GET' } = options;
  const u = url.toLowerCase();

  if (u.includes('api.openweathermap.org')) {
    return {
      status: 200,
      data: {
        weather: [{ main: 'Clear', description: 'sunny', icon: '01d' }],
        main: { temp: 28, pressure: 1013, humidity: 65 },
        name: 'Tel Aviv',
      },
      url,
      method,
    };
  }
  if (u.includes('api.github.com/users/')) {
    const login = url.split('/users/')[1]?.split('/')[0] || 'octocat';
    return {
      status: 200,
      data: {
        login,
        public_repos: 42,
        followers: 128,
        following: 20,
        avatar_url: `https://github.com/${login}.png`,
      },
      url,
      method,
    };
  }
  if (u.includes('api.github.com')) {
    return {
      status: 200,
      data: { message: 'Mock GitHub response', url },
      url,
      method,
    };
  }
  // Any unknown URL
  return {
    status: 200,
    data: {
      message: 'Mock response',
      timestamp: Date.now(),
    },
    url,
    method,
  };
}

export interface MockGmailOptions {
  operation: string;
  to?: string;
  subject?: string;
  message?: string;
}

export function mockGmail(options: MockGmailOptions): Record<string, unknown> {
  const { to = '', subject = '', message = '' } = options;
  return {
    messageId: `mock_${Date.now()}`,
    status: 'sent',
    to,
    subject,
    snippet: message.slice(0, 100),
  };
}

export interface MockSlackOptions {
  channel?: string;
  text?: string;
}

export function mockSlack(options: MockSlackOptions): Record<string, unknown> {
  const { channel = '#general', text = '' } = options;
  return {
    ok: true,
    channel,
    ts: `${Date.now() / 1000}.123`,
    message: { type: 'message', text, user: 'U_MOCK', ts: `${Date.now() / 1000}.123` },
  };
}

export interface MockOpenAIOptions {
  model?: string;
  prompt?: string;
  systemPrompt?: string;
}

export function mockOpenAI(options: MockOpenAIOptions): Record<string, unknown> {
  const { model = 'gpt-3.5-turbo', prompt = '' } = options;
  const content =
    prompt && prompt.length > 0
      ? `Mock AI response to: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"`
      : 'This is a mock AI response.';
  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content,
        },
      },
    ],
    model,
  };
}

export interface MockGoogleSheetsOptions {
  operation?: string;
  sheetId?: string;
  range?: string;
}

export function mockGoogleSheets(options: MockGoogleSheetsOptions): Record<string, unknown> {
  const { operation = 'read' } = options;
  if (operation === 'read') {
    return {
      range: 'Sheet1!A1:D10',
      majorDimension: 'ROWS',
      values: [
        ['Name', 'Email', 'Status', 'Date'],
        ['Alice', 'alice@example.com', 'Active', '2024-01-15'],
        ['Bob', 'bob@example.com', 'Pending', '2024-01-16'],
      ],
    };
  }
  return { updatedRange: 'Sheet1!A1', updatedRows: 1, updatedColumns: 1, updatedCells: 1 };
}

export interface MockNotionOptions {
  operation?: string;
  databaseId?: string;
}

export function mockNotion(options: MockNotionOptions): Record<string, unknown> {
  const { operation = 'create' } = options;
  return {
    id: `mock-page-${Date.now()}`,
    url: 'https://www.notion.so/mock-page',
    created_time: new Date().toISOString(),
    last_edited_time: new Date().toISOString(),
    object: 'page',
    parent: { type: 'database_id', database_id: options.databaseId ?? 'mock-db-id' },
    properties: {},
    archived: false,
    operation,
  };
}

/** Single entry point for executor: handle(service, operation, config) */
export const mockEngine = {
  handle(
    service: string,
    operation: string,
    config: Record<string, unknown>
  ): Record<string, unknown> {
    if (service === 'httpRequest' || (service === 'http' && operation === 'request')) {
      return mockHttpRequest({
        url: (config.url as string) || 'https://api.example.com',
        method: (config.method as string) || 'GET',
        body: config.body,
      });
    }
    if (service === 'gmail') return mockGmail({ operation, ...config } as MockGmailOptions);
    if (service === 'slack') return mockSlack({ ...config } as MockSlackOptions);
    if (service === 'openai') return mockOpenAI({ ...config } as MockOpenAIOptions);
    if (service === 'googleSheets') return mockGoogleSheets({ ...config } as MockGoogleSheetsOptions);
    if (service === 'notion') return mockNotion({ ...config } as MockNotionOptions);
    return { status: 'ok', message: 'Mock response' };
  },
};
