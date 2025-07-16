/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (6000) [ID]
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
  FROM [ListesExternes].[dbo].['TSP1791_TISSEO-VOYAGEURS_Baro_v51']

  select*  FROM [ListesExternes].[dbo].[TSP1791_TISSEO-VOYAGEURS_Baro_v51]
  where [Broker] like '1';	


SELECT *
  FROM [Enov].[dbo].[ListeNoire]
 WHERE [Raison]  LIKE 'TSP1791_TISSEO-VOYAGEURS_Baro_v50';
