-- Make embedding column nullable in vector_content
ALTER TABLE vector_content ALTER COLUMN embedding DROP NOT NULL;

-- Make embedding column nullable in conversation_context
ALTER TABLE conversation_context ALTER COLUMN embedding DROP NOT NULL;
