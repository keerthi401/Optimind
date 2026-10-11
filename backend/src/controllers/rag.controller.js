import { queryDocumentRAG } from '../services/rag.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const askDocumentRAG = asyncHandler(async (req, res) => {
  const { question, documentId } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Question text is required.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const result = await queryDocumentRAG({
    userId,
    question,
    documentId: documentId || null,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
