# NGC

Interact with the latest state-of-the-art AI model APIs optimized on the NVIDIA accelerated computing stack using [NVIDIA AI Foundation Endpoints](https://catalog.ngc.nvidia.com/ai-foundation-models). After you obtain your API key [here](https://catalog.ngc.nvidia.com/orgs/nvidia/teams/ai-foundation/models/codellama-70b/api), Continue can be configured as shown here:

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
