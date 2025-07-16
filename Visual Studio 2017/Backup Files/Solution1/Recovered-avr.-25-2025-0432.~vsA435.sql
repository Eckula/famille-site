/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [NUM]
      ,[ID]
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
  FROM [ListesExternes].[dbo].[TSP1864_TISSEO-VOYAGEURS_Baro_v53]


  
     ALTER TABLE  [ListesExternes].[dbo].[TSP1864_TISSEO-VOYAGEURS_Baro_v53]
     ALTER COLUMN [NUM] bigint;

	  ALTER TABLE  [ListesExternes].[dbo].[TSP1864_TISSEO-VOYAGEURS_Baro_v53]
     ALTER COLUMN [ID] nvarchar (200) null;