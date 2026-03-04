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
Sends a Java code block with a desired target language to get the translation payload.
- **Request Headers**: `Content-Type: application/json`
- **Request JSON Body**:
  ```json
  {
    "javaCode": "public class Main { ... }",
    "targetLanguage": "python"
  }
  ```
- **Response JSON**:
  - `translatedCode`: An array containing string components of the translated code.
  - `debuggingSteps`: An array containing string components representing steps to take to trace line-by-line.
  - `algorithm`: High-level pseudocode array.
  - `fallback`: Optional boolean marking an error state fallback response.
  - `error`: Optional string.

### 4. `POST /upload`
Uploads an image containing a code snippet which will be extracted using Google Gemini and returned in JSON. Max file size: `5MB`. Supported MIME types prefixed with `image/`. Form data is expected.
- **Request Type**: `multipart/form-data`
- **Form Data**:
  - `image`: Binary file
- **Response JSON**:
  - `javaCode`: The extracted plain text Java script from the image.
  - `extractedText`: Raw extracted text on error.
  - `error`: Text payload describing an image processing error.
