/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [AskListId]
      ,[AskInterview]
      ,[AskType]
      ,[AskEmail]
      ,[AskTimeUTC]
      ,[AskTime]
      ,[AskState]
      ,[AskLastRecoverUTC]
      ,[AskRecover]
      ,[ReadCount]
      ,[LastReadTimeUTC]
      ,[LastResponseTimeUTC]
      ,[LastResult]
  FROM [Askia_Lists].[dbo].[AskEmails]

  SELECT TABLE_NAME as TABLE_askia_Lists
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';