# MongoDB Atlas Vector Search Setup

To enable RAG features, you must configure a Vector Search Index in MongoDB Atlas.

1.  **Create a Cluster**: Ensure you have an Atlas cluster (M0, M2, M5, or higher).
2.  **Create Database & Collection**:
    *   Database Name: `cv_database`
    *   Collection Name: `embeddings`
3.  **Create Search Index**:
    *   Go to the "Atlas Search" tab in your cluster view.
    *   Click "Create Search Index".
    *   Select "JSON Editor" (or "Configuration Editor").
    *   Select the `cv_database.embeddings` collection.
    *   Name the index: `default` (IMPORTANT: Must match `indexName` in `iaService.js`).
    *   Use the following configuration JSON:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "text",
      "type": "filter"
    }
  ]
}
```
*   **Note**: `numDimensions: 768` matches Google's `embedding-001`.

4.  **Wait for Indexing**: The index creation might take a minute.
