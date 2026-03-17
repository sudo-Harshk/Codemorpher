# Codemorpher API Reference

The backend uses a standard REST API over HTTP to interact with the frontend. The server runs by default on `http://localhost:5000`.

---

## Endpoints

### 1. `GET /ping`
A simple health-check endpoint to verify if the server is running.
- **Request Parameters**: None
- **Response**: `✅ Codemorpher backend is running!`

### 2. `GET /history`
Fetches the last 50 translations stored in the local SQLite database.
- **Request Parameters**: None
- **Response Structure (JSON Array)**:
  - `id`: Internal translation ID
  - `sessionId`: The session generated internally
  - `targetLanguage`: The language translated into
  - `status`: Expected string `'success'` or error code
  - `engineUsed`: The translation provider used (e.g., `'openrouter'` or `'mock'`)
  - `timestamp`: Date recorded
  - `javaCode`: Input original script
  - `translatedCode`: JSON serialized outcome
  - `error`: Nullable error message
  
### 3. `POST /translate`
Sends a Java code block with a desired target language to get the translation payload. Input is validated with a three-layer Java validator before translation.

- **Request Headers**: `Content-Type: application/json`
- **Request JSON Body**:
  ```json
  {
    "javaCode": "public class Main { ... }",
    "targetLanguage": "python"
  }
  ```
- **Success Response (200)**:
  - `translatedCode`: An array containing string components of the translated code.
  - `debuggingSteps`: An array containing string components representing steps to take to trace line-by-line.
  - `algorithm`: High-level pseudocode array.
  - `fallback`: Optional boolean marking an error state fallback response.
  - `error`: Optional string.
- **Validation Error (400)**: When input is not valid Java (wrong language, invalid syntax, etc.):
  ```json
  {
    "error": "This looks like Python, not Java. Codemorpher translates Java only—paste Java code.",
    "code": "WRONG_LANGUAGE",
    "detectedLanguage": "Python"
  }
  ```
  - `error`: User-friendly rejection message.
  - `code`: Error code (`EMPTY_INPUT`, `TOO_SHORT`, `NOT_CODE_LIKE`, `NON_CODE_FORMAT`, `WRONG_LANGUAGE`, `INVALID_JAVA_SYNTAX`, `PARSE_FAILED`).
  - `detectedLanguage`: Present when Layer 2 rejects (e.g., `"Python"`, `"JavaScript"`).

### 4. `POST /upload`
Uploads an image containing a code snippet which will be extracted using Google Gemini, validated as Java, and returned in JSON. Max file size: `5MB`. Supported MIME types prefixed with `image/`. Form data is expected.

- **Request Type**: `multipart/form-data`
- **Form Data**:
  - `image`: Binary file
- **Success Response (200)**:
  - `javaCode`: The extracted plain text Java script from the image.
- **Error Response (400)**:
  - When no code is found: `{ "error": "No valid Java code found in image.", "extractedText": "..." }`
  - When extracted code is not Java (e.g., Python image): Same structure as `/translate` validation errors:
    ```json
    {
      "error": "This looks like Python, not Java. Codemorpher translates Java only—paste Java code.",
      "code": "WRONG_LANGUAGE",
      "detectedLanguage": "Python"
    }
    ```
