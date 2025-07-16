/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (20000) [NoABONNE]
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
  FROM [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI_V3_FR]

  SELECT *
FROM [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI_V3_FR]
WHERE [NoABONNE] IS NULL;


DELETE 
  FROM [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI_V3_FR]
WHERE [NoABONNE] IS NULL;


  ALTER TABLE [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI_V3_FR]
  ALTER COLUMN [Departement] NVARCHAR(255);

  select* from [ListesExternes].[dbo].[Lists].[TSP1822_APRR_SatisfactionFULLI_V3_FR]

  SELECT * FROM [ListesExternes].[dbo].[Lists].[TSP1822_APRR_SatisfactionFULLI_V3_FR]


  SELECT ListID, SurveyID FROM [ListesExternes].[dbo].[TSP1822_APRR_SatisfactionFULLI_V3_FR]


SELECT SurveyID
FROM [dbo].[Lists]
WHERE [ListID] = '4372';


SELECT SurveyID
FROM [NomBaseDeDonnées].[dbo].[Lists]
WHERE [ListID] = '4372';


