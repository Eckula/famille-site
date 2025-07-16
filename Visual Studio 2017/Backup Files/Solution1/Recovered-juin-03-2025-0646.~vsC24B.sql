SELECT TOP 50
  ListId,
  AskInterview,
  AskType,
  LastResult,
  AskState,
  AskEndState
FROM [LISTE_UTILISEES]
WHERE AskType > 0
ORDER BY AskDate DESC;  -- ou tout autre champ de date pertinent
