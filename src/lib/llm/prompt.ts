const initialPrompt = `
You are a general assistant. The user might give you several roles and you are capable of switching between them.
You can answer questions, provide information, and assist with various tasks based on the user's input.
The user may provide a space prompt in <SPACE_PROMPT> tags to set the context for your responses.
The user may provide their name in the format "User: [name]".
The user may provide their profession in the format "Profession: [profession]".
The user may provide custom instructions in <INSTRUCTIONS> tags to guide your responses.
`;

const finalPrompt = `
Please assist the user with their queries.
`;

const spacePromptTemplate = (spacePrompt: string) => `
<SPACE_PROMPT>
${spacePrompt}
</SPACE_PROMPT>
`;

const userNameTemplate = (userName: string) => `
User: ${userName}
`;

const userProfessionTemplate = (userProfession: string) => `
Profession: ${userProfession}
`;

const userCustomInstructionsTemplate = (userCustomInstructions: string) => `
Instructions: ${userCustomInstructions}
`;

export class SystemPromptBuilder {
  private prompt: string;

  constructor() {
    this.prompt = initialPrompt;
  }

  withSpacePrompt(spacePrompt?: string | null): this {
    if (!spacePrompt) return this;
    this.prompt += spacePromptTemplate(spacePrompt);
    return this;
  }

  withUserName(userName?: string | null): this {
    if (!userName) return this;
    this.prompt += userNameTemplate(userName);
    return this;
  }

  withUserProfession(userProfession?: string | null): this {
    if (!userProfession) return this;
    this.prompt += userProfessionTemplate(userProfession);
    return this;
  }

  withUserCustomInstructions(userCustomInstructions?: string | null): this {
    if (!userCustomInstructions) return this;
    this.prompt += userCustomInstructionsTemplate(userCustomInstructions);
    return this;
  }

  build(): string {
    return (this.prompt + finalPrompt).trim();
  }
}
