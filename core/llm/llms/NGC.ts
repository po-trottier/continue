import { BaseLLM } from "..";
import { ChatMessage, CompletionOptions, LLMOptions, ModelProvider } from "../..";
import { stripImages } from "../countTokens";
import { streamSse } from "../stream";

class NGC extends BaseLLM {
  static providerName: ModelProvider = "ngc";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions",
    model: "codellama-70b",
  };

  private function_id_lookup: { [key: string]: string } = {
    "codellama-13b": "f6a96af4-8bf9-4294-96d6-d71aa787612e",
    "codellama-34b": "df2bee43-fb69-42b9-9ee5-f4eabbeaf3a8",
    "codellama-70b": "2ae529dc-f728-4a46-9b8d-2697213666d8",
  }

  private _convertArgs(options: CompletionOptions) {
    return {
      temperature: options.temperature,
      top_p: options.topP,
      max_tokens: options.maxTokens,
    };
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions
  ): AsyncGenerator<string> {
    for await (const message of this._streamChat(
      [{ content: prompt, role: "user" }],
      options
    )) {
      yield stripImages(message.content);
    }
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions
  ): AsyncGenerator<ChatMessage> {
    for await (const message of this.steamNGC(messages, options)) {
      yield message;
    }
  }

  private async *steamNGC(
    messages: ChatMessage[],
    options: CompletionOptions
  ): AsyncGenerator<ChatMessage> {
    const messageList = [];
    for (const message of messages) {
      messageList.push({ content: message.content, role: message.role });
    }

    const apiUrl = `${this.apiBase}/${this.function_id_lookup[this.model]}`
    const headers = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      Authorization: `Bearer ${this.apiKey}`,
      ...this.requestOptions?.headers,
    };

    const response = await this.fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: messageList,
        stream: true,
        ...this._convertArgs(options),
      }),
    });

    for await (const value of streamSse(response)) {
      if (value.choices?.[0]?.delta?.content) {
        yield value.choices[0].delta;
      }
    }
  }


}

export default NGC;
