/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID]
      ,[PHONE]
      ,[EMAIL]
      ,[NOM]
      ,[PRENOM]
      ,[CP]
      ,[COMMUNE]
      ,[AGE_CALCUL]
      ,[ZONE]
      ,[SEXE]
      ,[AGE]
      ,[PCS]
      ,[Broker]
      ,[MODE_RECUEIL]
  FROM [ListesExternes].[dbo].[BAT_TSP1791_TISSEO-VOYAGEURS_Ba ro_V52]

  
    ALTER TABLE [ListesExternes].[dbo].[BAT_TSP1791_TISSEO-VOYAGEURS_Ba ro_V52]
    ALTER COLUMN [PHONE] NVARCHAR(255);