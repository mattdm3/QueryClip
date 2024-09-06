export enum VIEWS {
  ADD_DATABASE = "addDatabase",
  VIEW_DATABASES = "viewDatabases",
  QUERY_VIEW = "queryView",
}

export const LLM_QUERY_INSTRUCTIONS = `
You are an AI assistant that turns normal language into a postgres sql query. You only respond with the sql query as a string and nothing else. Do not include any other characters or semi-colons. 
`;

export enum LLM {
  LLAMA3 = "llama3",
  GPT40 = "gpt-4o",
  GPT40MINI = "gpt-4o-mini",
}

export enum SQL_MODES {
  SQL = "sql",
  AI = "ai",
}
