/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (60000) [Id]
      ,[Date]
      ,[Tel]
      ,[Email]
      ,[Raison]
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison] LIKE 'Désinscription BFA0121';