async function fetchDataThroughOpenAI(apiKey, prompt) {
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const reqBody = {
    temperature: 0.7,

    frequency_penalty: 0.8,
    presence_penalty: 1.0,
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(reqBody),
  });

  const data = await response.json();

  // Check for empty, null, or undefined data
  if (!data) {
    return {
      error: {
        status: 500,
        json: {
          message: "Unable to get response from OpenAI",
          errorCode: "SYSTEM_OPENAI_ERROR",
        },
      },
    };
  }

  if (data.error) {
    let statusCode = 500;
    let errorCode = "SYSTEM_OPENAI_ERROR";
    switch (data.error.type) {
      case "insufficient_quota":
        errorCode = "SYSTEM_OPENAI_ERROR_INSUFFICENT_QUOTA";
        break;
      case "invalid_request_error":
        errorCode = "SYSTEM_OPENAI_INVALID_KEY";
        break;
      default:
        errorCode = "SYSTEM_OPENAI_ERROR";
    }

    return {
      error: {
        status: statusCode,
        json: {
          message: "OpenAI error: " + (data.error.message || data.error.code),
          errorCode: errorCode,
        },
      },
    };
  }

  let promptResponse = "";
  let originalPromptResponse = "";

  // Process the response based on the chosen model

  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    originalPromptResponse = data.choices[0].message.content;
    promptResponse = data.choices[0].message.content
      .trim()
      .replace(/\n+/g, "")
      .replace(/\s+/g, " ")
      .replace(/```/g, "")
      .trim();
  }

  return {
    originalPromptResponse,
    promptResponse,
    usage: data.usage,
  };
}

const generateWithOpenAI = async (req, res) => {
  const { apiKey, prompt } = req.body;

  try {
    const {
      originalPromptResponse,
      promptResponse,
      usage,
      error: openAIResponseError,
    } = await fetchDataThroughOpenAI(apiKey, prompt);
    if (openAIResponseError) {
      return res
        .status(openAIResponseError.error.status)
        .json(openAIResponseError.error.json);
    }

    if (!promptResponse) {
      return res.status(500).json({
        message: `An error occurred.`,
        errorCode: "NO_PROMPT_IN_RESPONSE",
      });
    }
    // FINAL SUCCESS SEND
    return res.status(200).json({
      // completePromptResponse: data,
      promptResponse,
      originalPromptResponse,
      tokens: usage,
    });
  } catch (error) {
    console.log("error in open ai", error);
    return res.status(500).json({
      message: `An error occurred.`,
      errorCode: "SYSTEM_OPENAI_ERROR",
    });
  }
};

export default generateWithOpenAI;
