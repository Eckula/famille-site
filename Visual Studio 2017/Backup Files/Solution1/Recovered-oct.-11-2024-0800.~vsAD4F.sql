/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (70000) [NoABONNE]
      ,[EMAIL]
      ,[SOCIETE]
      ,[TYPOLOGIE]
      ,[TYPE_OFFRE]
      ,[PAYS]
      ,[TYPOLOGIE_TRANSACTION]
      ,[ANCIENNETE]
      ,[CANAL_VENTE]
      ,[CANAL_VENTE_ANCIENNETE]
      ,[LANGUE]
      ,[Sexe]
      ,[Age]
      ,[Departement]
      ,[Region]
      ,[SOCIETE_LIB]
  FROM [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI]

   
CODE]
SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE 'BFA0121_MGEN_Baro_sat_global_avril2024';
CODE]