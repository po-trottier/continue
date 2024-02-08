# NGC

The [NGC](https://ngc.nvidia.com) API provides hosted access to some open-source models. After you obtain your API key [here](https://catalog.ngc.nvidia.com/orgs/nvidia/teams/ai-foundation/models/codellama-70b/api), Continue can be configured as shown here:

```json title="~/.continue/config.json"
{
  "models": [
    {
      "provider": "ngc",
      "title": "Code Llama 70B",
      "model": "codellama-70b",
      "apiKey": "<API_KEY>"
    }
  ]
}
```

[View the source](https://github.com/continuedev/continue/blob/main/core/llm/llms/NGC.ts)
