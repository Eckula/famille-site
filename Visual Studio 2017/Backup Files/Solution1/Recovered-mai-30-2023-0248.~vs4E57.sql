/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID]
      ,[ADHERENT]
      ,[RAISON_SOCIALE]
      ,[EMAIL]
      ,[FIXE]
      ,[MOBILE]
      ,[NOM]
      ,[TAILLE_SALARIALE]
      ,[SECTEUR_ACTIVITE]
      ,[CA_2022]
      ,[CIBLE]
  FROM [ListesExternes].[dbo].[RET2463_BigMat_Strategie_MDD]

  ORDER BY ID