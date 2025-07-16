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
  FROM [Askia_Lists].[dbo].[AskEmail12345]


  SELECT*
  FROM [Askia_Lists].[dbo].[AskEmail12345]