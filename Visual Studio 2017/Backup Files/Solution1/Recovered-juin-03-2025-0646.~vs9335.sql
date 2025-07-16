/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [AskInterview]
      ,[AskType]
      ,[AskEmail]
      ,[AskTimeUTC]
      ,[AskState]
      ,[AskLastRecoverUTC]
      ,[ReadCount]
      ,[LastReadTimeUTC]
      ,[LastResponseTimeUTC]
      ,[LastResponseUTCOffsetRespondent]
      ,[LastResult]
      ,[listId]
  FROM [Askia_Lists].[dbo].[LISTE_UTILISEES]



