import { BaseLLM } from "..";
import { ChatMessage, CompletionOptions, LLMOptions, ModelProvider } from "../..";
import { stripImages } from "../countTokens";
import { streamSse } from "../stream";

class NGC extends BaseLLM {
  static providerName: ModelProvider = "ngc";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions",
    model: "codellama-70b",
    completionOptions: {
      model: "codellama-70b",
      maxTokens: 1024,
      temperature: 0.2,
      topP: 0.7
    },
  };

  private static MODEL_IDS: { [name: string]: string } = {
    "codellama-13b": "f6a96af4-8bf9-4294-96d6-d71aa787612e",
    "codellama-34b": "df2bee43-fb69-42b9-9ee5-f4eabbeaf3a8",
    "codellama-70b": "2ae529dc-f728-4a46-9b8d-2697213666d8",
    "llama2-13b": "e0bb7fb9-5333-4a27-8534-c6288f921d3f",
    "llama2-70b": "0e349b44-440a-44e1-93e9-abe8dcb27158",
    "mistral-7b": "35ec3354-2681-4d0e-a8dd-80325dcf7c63",
    "mistral-8x7b": "8f4118ba-60a8-4e6b-8574-e38a4067a4a3",
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
    const apiUrl = `${this.apiBase}/${NGC.MODEL_IDS[this.model]}`
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
        messages: messages,
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
